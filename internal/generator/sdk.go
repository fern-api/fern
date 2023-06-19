package generator

import (
	_ "embed"
	"errors"
	"fmt"
	"path"
	"strings"

	"github.com/fern-api/fern-go/internal/fern/ir"
)

//go:embed sdk/core/core.go
var coreFile string

// WriteCore writes the core utilities required by the generated
// service code. This includes the ClientOption type, auth options,
// and HTTPClient interface declaration.
func (f *fileWriter) WriteCoreClientOptions(auth *ir.ApiAuth) error {
	importPath := path.Join(f.baseImportPath, "core")

	// We have at least one auth scheme, so we need to generate the ClientOption.
	f.P("type ClientOption func(*ClientOptions)")
	f.P()

	if auth == nil || len(auth.Schemes) == 0 {
		// We don't have any auth options to write, but we still generate
		// the ClientOptions structure for the endpoints to act upon.
		f.P("type ClientOptions struct {}")
		f.P()

		f.P("func (c *ClientOptions) ToHeader() http.Header { return nil }")
		f.P()
		return nil
	}

	// Generate the exported ClientOptions type that all clients can act upon.
	f.P("type ClientOptions struct {")
	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			f.P("Bearer string")
		}
		if authScheme.Basic != nil {
			f.P("Username string")
			f.P("Password string")
		}
		if authScheme.Header != nil {
			f.P(
				authScheme.Header.Name.Name.PascalCase.UnsafeName,
				" ",
				typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.imports, f.baseImportPath, importPath),
			)
		}
	}
	f.P("}")
	f.P()

	// Generat the authorization functional options.
	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			f.P("func ClientWithAuthBearer(bearer string) ClientOption {")
			f.P("return func(opts *ClientOptions) {")
			f.P("opts.Bearer = bearer")
			f.P("}")
			f.P("}")
			f.P()
		}
		if authScheme.Basic != nil {
			f.P("func ClientWithAuthBasic(username, password string) ClientOption {")
			f.P("return func(opts *ClientOptions) {")
			f.P("opts.Username = username")
			f.P("opts.Password = password")
			f.P("}")
			f.P("}")
			f.P()
		}
		if authScheme.Header != nil {
			var (
				optionName = fmt.Sprintf("ClientWithAuth%s", authScheme.Header.Name.Name.PascalCase.UnsafeName)
				field      = authScheme.Header.Name.Name.PascalCase.UnsafeName
				param      = authScheme.Header.Name.Name.CamelCase.SafeName
				value      = typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.imports, f.baseImportPath, importPath)
			)
			f.P("func ", optionName, "(", param, " ", value, ") ClientOption {")
			f.P("return func(opts *ClientOptions) {")
			f.P("opts.", field, " = ", param)
			f.P("}")
			f.P("}")
			f.P()
		}
	}

	// Generate the ToHeader method.
	f.P("func (c *ClientOptions) ToHeader() http.Header {")
	f.P("header := make(http.Header)")
	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			f.P(`if c.Bearer != "" { `)
			f.P(`header.Set("Authorization", `, `"Bearer " + c.Bearer)`)
			f.P("}")
		}
		if authScheme.Basic != nil {
			f.P(`if c.Username != "" && c.Password != "" {`)
			f.P(`header.Set("Authorization", `, `"Basic " + base64.StdEncoding.EncodeToString([]byte(c.Username + ": " + c.Password)))`)
			f.P("}")
		}
		if header := authScheme.Header; header != nil {
			var prefix string
			if header.Prefix != nil {
				prefix = *header.Prefix + " "
			}
			f.P("var value ", typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.imports, f.baseImportPath, importPath))
			f.P("if c.", header.Name.Name.PascalCase.UnsafeName, " != value {")
			f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("`, prefix, `%v", c.`, header.Name.Name.PascalCase.UnsafeName, "))")
			f.P("}")
		}
	}
	f.P("return header")
	f.P("}")
	f.P()

	return nil
}

// WriteClient writes a client for interacting with the given service.
// This file includes all of the service's endpoints so that their
// implementation(s) are visible within the same file.
//
// TODO: Remove separate endpoint types; consolidate all logic
// in the client's implementation.
func (f *fileWriter) WriteClient(signatures []*signature) error {
	// Generate the service interface definition.
	serviceName := "Service"
	f.P("type ", serviceName, " interface {")
	for _, signature := range signatures {
		f.P(fmt.Sprintf("%s(%s) %s", signature.Name.PascalCase.UnsafeName, signature.Parameters, signature.ReturnValues))
	}
	f.P("}")
	f.P()

	// Generate the client constructor.
	// TODO: Call the nested client constructors (e.g. user.NewClient)
	f.P("func NewClient(baseURL string, httpClient core.HTTPClient, opts ...core.ClientOption) (", serviceName, ", error) {")
	f.P("options := new(core.ClientOptions)")
	f.P("for _, opt := range opts {")
	f.P("opt(options)")
	f.P("}")
	f.P("return &client{")
	for _, signature := range signatures {
		urlFormat := "baseURL"
		if signature.PathSuffix != "" {
			urlFormat = fmt.Sprintf("path.Join(baseURL, %q)", signature.PathSuffix)
		}
		f.P(signature.EndpointTypeName, " : new", signature.Name.PascalCase.UnsafeName, "Endpoint(", urlFormat, ", httpClient, options),")
	}
	f.P("}, nil")
	f.P("}")
	f.P()

	// Generate the client implementation.
	f.P("type client struct {")
	for _, signature := range signatures {
		f.P(signature.EndpointTypeName, " *", signature.EndpointTypeName)
	}
	f.P("}")
	f.P()

	// Implement the Service interface.
	for _, signature := range signatures {
		receiver := typeNameToReceiver(signature.Name.CamelCase.UnsafeName)
		f.P("func (", receiver, " *client) ", signature.Name.PascalCase.UnsafeName, "(", signature.Parameters, ") ", signature.ReturnValues, " {")
		f.P("return ", receiver, ".", signature.EndpointTypeName, ".Call(", signature.ParameterNames, ")")
		f.P("}")
		f.P()
	}

	return nil
}

// signature holds the fields required to generate a signautre used by the generated client.
type signature struct {
	Name             *ir.Name
	EndpointTypeName string
	Parameters       string
	ParameterNames   string
	ReturnValues     string
	PathSuffix       string
}

// WriteEndpoint writes the endpoint type, which includes its error decoder and call methods.
func (f *fileWriter) WriteEndpoint(fernFilepath *ir.FernFilepath, endpoint *ir.HttpEndpoint) (*signature, error) {
	// Generate the type definition.
	var (
		typeName   = fmt.Sprintf("%sEndpoint", endpoint.Name.CamelCase.UnsafeName)
		receiver   = typeNameToReceiver(typeName)
		importPath = fernFilepathToImportPath(f.baseImportPath, fernFilepath)
	)
	f.P("type ", typeName, " struct {")
	f.P("url string")
	f.P("httpClient core.HTTPClient")
	f.P("header http.Header")
	f.P("}")
	f.P()

	// Generate the constructor.
	f.P("func new", endpoint.Name.PascalCase.UnsafeName, "Endpoint(url string, httpClient core.HTTPClient, clientOptions *core.ClientOptions) *", typeName, " {")
	f.P("return &", typeName, "{")
	f.P("url: url,")
	f.P("httpClient: httpClient,")
	f.P("header: clientOptions.ToHeader(),")
	f.P("}")
	f.P("}")
	f.P()

	// Generate the error decoder.
	// TODO: Make sure that we preserve the status code from every
	// error returned from this function.
	f.P("func (", receiver, "*", typeName, ") decodeError(statusCode int, body io.Reader) error {")
	if len(endpoint.Errors) > 0 {
		f.P("decoder := json.NewDecoder(body)")
		f.P("switch statusCode {")
		for _, responseError := range endpoint.Errors {
			errorDeclaration := f.errors[responseError.Error.ErrorId]
			f.P("case ", errorDeclaration.StatusCode, ":")
			f.P("value := new(", errorDeclaration.Name.Name.PascalCase.UnsafeName, ")")
			f.P("if err := decoder.Decode(value); err != nil {")
			f.P("return err")
			f.P("}")
			f.P("value.StatusCode = statusCode")
			f.P("return value")
		}
		// Close the switch statement.
		f.P("}")
	}
	f.P("bytes, err := io.ReadAll(body)")
	f.P("if err != nil {")
	f.P("return err")
	f.P("}")
	f.P("return errors.New(string(bytes))")
	f.P("}")
	f.P()

	// Generate the Call method.
	var (
		responseType              string
		responseParameter         string
		responseInitializerFormat string
		signatureReturnValues     string
		successfulReturnValues    string
		errorReturnValues         string
	)
	if endpoint.Response != nil {
		if endpoint.Response.Json == nil {
			return nil, fmt.Errorf("the SDK generator only supports JSON-based responses, but found %q", endpoint.Response.Type)
		}
		responseType = typeReferenceToGoType(endpoint.Response.Json.ResponseBodyType, f.types, f.imports, f.baseImportPath, importPath)
		responseInitializerFormat = "var response %s"
		if named := endpoint.Response.Json.ResponseBodyType.Named; named != nil && isPointer(f.types[named.TypeId]) {
			responseInitializerFormat = "response := new(%s)"
		}
		responseParameter = "response"
		signatureReturnValues = fmt.Sprintf("(%s, error)", responseType)
		successfulReturnValues = "response, nil"
		errorReturnValues = "response, err"
	} else {
		responseParameter = "nil"
		signatureReturnValues = "error"
		successfulReturnValues = "nil"
		errorReturnValues = "err"
	}

	// Add path parameters and request body, if any.
	parameters := "ctx context.Context"
	var parameterNames []string
	for _, pathParameter := range endpoint.AllPathParameters {
		parameterName := pathParameter.Name.CamelCase.SafeName
		parameterType := typeReferenceToGoType(pathParameter.ValueType, f.types, f.imports, f.baseImportPath, importPath)
		parameters += fmt.Sprintf(", %s %s", parameterName, parameterType)
		parameterNames = append(parameterNames, parameterName)
	}

	requestParameter := "nil"
	if endpoint.SdkRequest != nil {
		var requestType string
		if requestBody := endpoint.SdkRequest.Shape.JustRequestBody; requestBody != nil {
			requestType = typeReferenceToGoType(requestBody.RequestBodyType, f.types, f.imports, f.baseImportPath, importPath)
		}
		if endpoint.SdkRequest.Shape.Wrapper != nil {
			// If this is a wrapper type, it's guaranteed to be generated in the same package,
			// so we don't need to consult its Fern filepath.
			requestType = fmt.Sprintf("*%s", endpoint.SdkRequest.Shape.Wrapper.WrapperName.PascalCase.UnsafeName)
		}
		requestParameter = endpoint.SdkRequest.RequestParameterName.CamelCase.SafeName
		parameters += fmt.Sprintf(", %s %s", requestParameter, requestType)
	}

	// Consolidate the endpoint's full path into a path suffix that
	// can be applied to the endpoint at construction time.
	var pathSuffix string
	if endpoint.FullPath != nil {
		if endpoint.FullPath.Head != "/" {
			pathSuffix = endpoint.FullPath.Head
		}
		for _, part := range endpoint.FullPath.Parts {
			if part.PathParameter != "" {
				pathSuffix += "%v"
			}
			if part.Tail != "" {
				pathSuffix += part.Tail
			}
		}
	}

	urlStatement := fmt.Sprintf("endpointURL := %s.url", receiver)
	if len(parameterNames) > 0 {
		urlStatement = "endpointURL := fmt.Sprintf(" + receiver + ".url, " + strings.Join(parameterNames, ", ") + ")"
	}

	// TODO: Add query parameters from request, if any.
	// TODO: Add headers from request, if any.

	f.P("func (", receiver, "*", typeName, ") Call(", parameters, ")", signatureReturnValues, " {")
	f.P(urlStatement)
	if responseType != "" {
		f.P(fmt.Sprintf(responseInitializerFormat, strings.TrimLeft(responseType, "*")))
	}
	f.P("if err := core.DoRequest(")
	f.P("ctx,")
	f.P(receiver, ".httpClient,")
	f.P("endpointURL, ")
	f.P(irMethodToMethodEnum(endpoint.Method), ",")
	f.P(requestParameter, ",")
	f.P(responseParameter, ",")
	f.P(receiver, ".header,")
	f.P(receiver, ".decodeError,")
	f.P("); err != nil {")
	f.P("return ", errorReturnValues)
	f.P("}")
	f.P("return ", successfulReturnValues)
	f.P("}")

	// Reformat the parameter names so that they're suitable for
	// the client method call.
	parameterNames = append([]string{"ctx"}, parameterNames...)
	if requestParameter != "nil" {
		parameterNames = append(parameterNames, requestParameter)
	}

	return &signature{
		Name:             endpoint.Name,
		EndpointTypeName: typeName,
		Parameters:       parameters,
		ParameterNames:   strings.Join(parameterNames, ", "),
		ReturnValues:     signatureReturnValues,
		PathSuffix:       pathSuffix,
	}, nil
}

// WriteError writes the structured error types.
func (f *fileWriter) WriteError(errorDeclaration *ir.ErrorDeclaration) error {
	var (
		typeName   = errorDeclaration.Name.Name.PascalCase.UnsafeName
		receiver   = typeNameToReceiver(typeName)
		importPath = fernFilepathToImportPath(f.baseImportPath, errorDeclaration.Name.FernFilepath)
		value      = typeReferenceToGoType(errorDeclaration.Type, f.types, f.imports, f.baseImportPath, importPath)
	)
	var literal string
	isLiteral := errorDeclaration.Type.Container != nil && errorDeclaration.Type.Container.Literal != nil
	if isLiteral {
		literal = literalToValue(errorDeclaration.Type.Container.Literal)
	}

	// Generate the error type declaration.
	f.P("type ", typeName, " struct {")
	f.P("StatusCode int")
	if errorDeclaration.Type == nil {
		// This error doesn't have a body, so we only need to include the status code.
		f.P("}")
		f.P()
		return nil
	}
	f.P("Body ", value)
	f.P("}")
	f.P()

	// Implement the error interface.
	f.P("func (", receiver, "*", typeName, ") Error() string {")
	f.P(`return fmt.Sprintf("`, errorDeclaration.StatusCode, `: %+v", *`, receiver, ")")
	f.P("}")
	f.P()

	// Implement the json.Unmarshaler.
	format := "var body %s"
	if errorDeclaration.Type.Named != nil && isPointer(f.types[errorDeclaration.Type.Named.TypeId]) {
		format = "body := new(%s)"
		value = strings.TrimLeft(value, "*")
	}
	f.P("func (", receiver, "*", typeName, ") UnmarshalJSON(data []byte) error {")
	f.P(fmt.Sprintf(format, value))
	f.P("if err := json.Unmarshal(data, &body); err != nil {")
	f.P("return err")
	f.P("}")
	if isLiteral {
		// If the error specifies a literal, it will only succeed if the literal matches exactly.
		f.P("if body != ", literal, " {")
		f.P(`return fmt.Errorf("expected literal %q, but found %q", `, literal, ", body)")
		f.P("}")
	}
	f.P(receiver, ".StatusCode = ", errorDeclaration.StatusCode)
	f.P(receiver, ".Body = body")
	f.P("return nil")
	f.P("}")
	f.P()

	// Implement the json.Marshaler.
	f.P("func (", receiver, "*", typeName, ") MarshalJSON() ([]byte, error) {")
	if isLiteral {
		f.P("return json.Marshal(", literal, ")")
	} else {
		f.P("return json.Marshal(", receiver, ".Body)")
	}
	f.P("}")
	f.P()
	return nil
}

// WriteRequestType writes a type dedicated to the in-lined request (if any).
func (f *fileWriter) WriteRequestType(fernFilepath *ir.FernFilepath, endpoint *ir.HttpEndpoint) error {
	var (
		// At this point, we've already verified that the given endpoint's request
		// is a wrapper, so we can safely access it without any nil-checks.
		bodyField  = endpoint.SdkRequest.Shape.Wrapper.BodyKey.PascalCase.UnsafeName
		typeName   = endpoint.SdkRequest.Shape.Wrapper.WrapperName.PascalCase.UnsafeName
		receiver   = typeNameToReceiver(typeName)
		importPath = fernFilepathToImportPath(f.baseImportPath, fernFilepath)
	)

	f.P("type ", typeName, " struct {")
	for _, header := range endpoint.Headers {
		f.P(header.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(header.ValueType, f.types, f.imports, f.baseImportPath, importPath), " `json:\"-\"`")
	}
	for _, queryParam := range endpoint.QueryParameters {
		value := typeReferenceToGoType(queryParam.ValueType, f.types, f.imports, f.baseImportPath, importPath)
		if queryParam.AllowMultiple {
			// TODO: If the query parameter can be specified multiple times, it's not enough to just define it
			// as a list. Otherwise, it's indistinguishable from a single query parameter with a list value.
			//
			// We'll need to track how the query parameter is applied at the call-site.
			value = fmt.Sprintf("[]%s", value)
		}
		f.P(queryParam.Name.Name.PascalCase.UnsafeName, " ", value, " `json:\"-\"`")
	}
	if endpoint.RequestBody == nil {
		// If the request doesn't have a body, we don't need any custom [de]serialization logic.
		f.P("}")
		f.P()
		return nil
	}
	literals, err := requestBodyToFieldDeclaration(endpoint.RequestBody, f, importPath, bodyField)
	if err != nil {
		return err
	}
	f.P("}")
	f.P()

	// Implement the getter methods.
	for _, literal := range literals {
		f.P("func (", receiver, " *", typeName, ") ", literal.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
		f.P("return ", receiver, ".", literal.Name.CamelCase.SafeName)
		f.P("}")
		f.P()
	}

	var referenceType string
	var referenceIsPointer bool
	var referenceLiteral string
	if reference := endpoint.RequestBody.Reference; reference != nil {
		referenceType = strings.TrimPrefix(
			typeReferenceToGoType(reference.RequestBodyType, f.types, f.imports, f.baseImportPath, importPath),
			"*",
		)
		referenceIsPointer = reference.RequestBodyType.Named != nil && isPointer(f.types[reference.RequestBodyType.Named.TypeId])
		if reference.RequestBodyType.Container != nil && reference.RequestBodyType.Container.Literal != nil {
			referenceLiteral = literalToValue(reference.RequestBodyType.Container.Literal)
		}
	}

	if len(literals) == 0 && len(referenceType) == 0 {
		// If the request doesn't specify any literals or a reference type,
		// we don't need to customize the [de]serialization logic at all.
		return nil
	}

	// Implement the json.Unmarshaler interface.
	f.P("func (", receiver, " *", typeName, ") UnmarshalJSON(data []byte) error {")
	if len(referenceType) > 0 {
		if referenceIsPointer {
			f.P("body := new(", referenceType, ")")
		} else {
			f.P("var body ", referenceType)
		}
	} else {
		f.P("type unmarshaler ", typeName)
		f.P("var body unmarshaler")
	}
	f.P("if err := json.Unmarshal(data, &body); err != nil {")
	f.P("return err")
	f.P("}")
	if len(referenceType) > 0 {
		if len(referenceLiteral) > 0 {
			f.P("if body != ", referenceLiteral, "{")
			f.P(`return fmt.Errorf("expected literal %q, but found %q", `, referenceLiteral, ", body)")
			f.P("}")
		}
		f.P(receiver, ".", bodyField, " = body")
	} else {
		f.P("*", receiver, " = ", typeName, "(body)")
	}
	for _, literal := range literals {
		f.P(receiver, ".", literal.Name.CamelCase.SafeName, " = ", literalToValue(literal.Value))
	}
	f.P("return nil")
	f.P("}")
	f.P()

	// Implement the json.Marshaler interface.
	f.P("func (", receiver, " *", typeName, ") MarshalJSON() ([]byte, error) {")
	if len(referenceType) > 0 {
		// If the request body is a reference type, we only need to marshal the body.
		value := fmt.Sprintf("%s.%s", receiver, bodyField)
		if len(referenceLiteral) > 0 {
			value = referenceLiteral
		}
		f.P("return json.Marshal(", value, ")")
	} else {
		f.P("type embed ", typeName)
		f.P("var marshaler = struct{")
		f.P("embed")
		for _, literal := range literals {
			f.P(literal.Name.PascalCase.UnsafeName, " ", literalToGoType(literal.Value), " `json:\"", literal.Name.OriginalName, "\"`")
		}
		f.P("}{")
		f.P("embed: embed(*", receiver, "),")
		for _, literal := range literals {
			f.P(literal.Name.PascalCase.UnsafeName, ": ", literalToValue(literal.Value), ",")
		}
		f.P("}")
		f.P("return json.Marshal(marshaler)")
	}
	f.P("}")
	f.P()

	return nil
}

func requestBodyToFieldDeclaration(
	requestBody *ir.HttpRequestBody,
	writer *fileWriter,
	importPath string,
	bodyField string,
) ([]*literal, error) {
	visitor := &requestBodyVisitor{
		bodyField:      bodyField,
		baseImportPath: writer.baseImportPath,
		importPath:     importPath,
		imports:        writer.imports,
		types:          writer.types,
		writer:         writer,
	}
	if err := requestBody.Accept(visitor); err != nil {
		return nil, err
	}
	return visitor.literals, nil
}

type requestBodyVisitor struct {
	literals       []*literal
	bodyField      string
	baseImportPath string
	importPath     string
	imports        imports
	types          map[ir.TypeId]*ir.TypeDeclaration
	writer         *fileWriter
}

func (r *requestBodyVisitor) VisitInlinedRequestBody(inlinedRequestBody *ir.InlinedRequestBody) error {
	typeVisitor := &typeVisitor{
		typeName:       inlinedRequestBody.Name.PascalCase.UnsafeName,
		baseImportPath: r.baseImportPath,
		importPath:     r.importPath,
		writer:         r.writer,
	}
	objectTypeDeclaration := inlinedRequestBodyToObjectTypeDeclaration(inlinedRequestBody)
	_, literals := typeVisitor.visitObjectProperties(objectTypeDeclaration, true /* includeTags */)
	r.literals = literals
	return nil
}

func (r *requestBodyVisitor) VisitReference(reference *ir.HttpRequestBodyReference) error {
	// For references, we include the type in a field that matches the configured body key.
	r.writer.P(
		r.bodyField,
		" ",
		typeReferenceToGoType(reference.RequestBodyType, r.types, r.imports, r.baseImportPath, r.importPath),
		" `json:\"-\"`",
	)
	return nil
}

func (r *requestBodyVisitor) VisitFileUpload(fileUpload *ir.FileUploadRequest) error {
	return errors.New("file upload requests are not yet supported")
}

// inlinedRequestBodyToObjectTypeDeclaration maps the given inlined request body
// into an object type declaration so that we can reuse the functionality required
// to write object properties for a generated object.
func inlinedRequestBodyToObjectTypeDeclaration(inlinedRequestBody *ir.InlinedRequestBody) *ir.ObjectTypeDeclaration {
	properties := make([]*ir.ObjectProperty, len(inlinedRequestBody.Properties))
	for i, property := range inlinedRequestBody.Properties {
		properties[i] = &ir.ObjectProperty{
			Docs:      property.Docs,
			Name:      property.Name,
			ValueType: property.ValueType,
		}
	}
	return &ir.ObjectTypeDeclaration{
		Extends:    inlinedRequestBody.Extends,
		Properties: properties,
	}
}

// irMethodToMethodEnum maps the given ir.HttpMethod to the net/http equivalent.
// Note this returns the string representation of the net/http constant (e.g.
// "http.MethodGet"), not the value the constant points to (e.g. "GET").
func irMethodToMethodEnum(method ir.HttpMethod) string {
	switch method {
	case ir.HttpMethodGet:
		return "http.MethodGet"
	case ir.HttpMethodPost:
		return "http.MethodPost"
	case ir.HttpMethodPut:
		return "http.MethodPut"
	case ir.HttpMethodPatch:
		return "http.MethodPatch"
	case ir.HttpMethodDelete:
		return "http.MethodDelete"
	}
	return ""
}
