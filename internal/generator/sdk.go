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
	var (
		authSchemes = auth.Schemes
		importPath  = path.Join(f.baseImportPath, "core")
	)

	// We have at least one auth scheme, so we need to generate the ClientOption.
	f.P("type ClientOption func(*ClientOptions)")
	f.P()

	// Generate the exported ClientOptions type that all clients can act upon.
	f.P("type ClientOptions struct {")
	for _, authScheme := range authSchemes {
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
	for _, authScheme := range authSchemes {
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
	return nil
}

// WriteClient writes a client for interacting with the given service.
// This file includes all of the service's endpoints so that their
// implementation(s) are visible within the same file.
func (f *fileWriter) WriteClient(service *ir.HttpService) error {
	f.P("type ", service.Name.FernFilepath.File.PascalCase.UnsafeName, "Client interface {}")
	f.P()

	for _, endpoint := range service.Endpoints {
		if err := f.writeEndpoint(service.Name.FernFilepath, endpoint); err != nil {
			return err
		}
	}
	return nil
}

// writeEndpoint writes the endpoint type, which includes its error decoder and call methods.
func (f *fileWriter) writeEndpoint(fernFilepath *ir.FernFilepath, endpoint *ir.HttpEndpoint) error {
	// Generate the type definition.
	var (
		typeName   = fmt.Sprintf("%sEndpoint", endpoint.Name.CamelCase.UnsafeName)
		receiver   = typeNameToReceiver(typeName)
		importPath = fernFilepathToImportPath(f.baseImportPath, fernFilepath)
	)
	f.P("type ", typeName, " struct {")
	f.P("url string")
	f.P("client core.HTTPClient")
	f.P("}")
	f.P()

	// Generate the constructor.
	f.P("func new", typeName, "(url string, client core.HTTPClient) *", typeName, " {")
	f.P("return &", typeName, "{")
	f.P("url: url,")
	f.P("client: client,")
	f.P("}")
	f.P("}")
	f.P()

	// Generate the error decoder.
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
	var responseType string
	if endpoint.Response != nil {
		if endpoint.Response.Json == nil {
			return fmt.Errorf("the SDK generator only supports JSON-based responses, but found %q", endpoint.Response.Type)
		}
		responseType = typeReferenceToGoType(endpoint.Response.Json.ResponseBodyType, f.types, f.imports, f.baseImportPath, importPath)
	}

	// TODO: Add path parameters and request body, if any.
	parameters := "ctx context.Context"

	// TODO: What about endpoints without a response value?
	responseInitializerFormat := "var response %s"
	if named := endpoint.Response.Json.ResponseBodyType.Named; named != nil && isPointer(f.types[named.TypeId]) {
		responseInitializerFormat = "response := new(%s)"
	}

	f.P("func (", receiver, "*", typeName, ") Call(", parameters, ") (", responseType, ", error) {")
	f.P(fmt.Sprintf(responseInitializerFormat, strings.TrimLeft(responseType, "*")))
	f.P("if err := core.DoRequest(")
	f.P("ctx,")
	f.P(receiver, ".client,")
	f.P(receiver, ".url,")
	f.P("http.MethodGet,") // TODO: Support all other HTTP method types.
	f.P("nil,")            // TODO: Support request body, if any.
	f.P("response,")
	f.P("nil,") // TODO: Support request's http.Headers, if any.
	f.P(receiver, ".decodeError,")
	f.P("); err != nil {")
	f.P("return response, err")
	f.P("}")
	f.P("return response, nil")
	f.P("}")

	return nil
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
