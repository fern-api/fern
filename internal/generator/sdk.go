package generator

import (
	_ "embed"
	"fmt"
	"path"
	"sort"
	"strconv"
	"strings"

	"github.com/fern-api/fern-go/internal/fern/ir"
)

// goLanguageHeader is the identifier used for the X-Fern-Language platform header.
const goLanguageHeader = "Go"

var (
	//go:embed sdk/client/client_test.go
	clientTestFile string

	//go:embed sdk/core/core.go
	coreFile string

	//go:embed sdk/core/core_test.go
	coreTestFile string

	//go:embed sdk/core/pointer.go
	pointerFile string
)

// WriteClientOptionsDefinition writes the ClientOption interface and
// *ClientOptions type. These types are always deposited in the core
// package to prevent import cycles in the generated SDK.
func (f *fileWriter) WriteClientOptionsDefinition(
	auth *ir.ApiAuth,
	headers []*ir.HttpHeader,
	sdkConfig *ir.SdkConfig,
	moduleConfig *ModuleConfig,
	sdkVersion string,
) error {
	importPath := path.Join(f.baseImportPath, "core")
	f.P("// ClientOption adapts the behavior of the generated client.")
	f.P("type ClientOption func(*ClientOptions)")
	f.P()

	f.P("// ClientOptions defines all of the possible client options.")
	f.P("// This type is primarily used by the generated code and is")
	f.P("// not meant to be used directly; use ClientOption instead.")
	f.P("type ClientOptions struct {")
	f.P("BaseURL string")
	f.P("HTTPClient HTTPClient")
	f.P("HTTPHeader http.Header")

	// Generate the exported ClientOptions type that all clients can act upon.
	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			f.P(authScheme.Bearer.Token.PascalCase.UnsafeName, " string")
		}
		if authScheme.Basic != nil {
			f.P("Username string")
			f.P("Password string")
		}
		if authScheme.Header != nil {
			if authScheme.Header.ValueType.Container != nil && authScheme.Header.ValueType.Container.Literal != nil {
				// We don't want to generate a client option for literal values.
				continue
			}
			f.P(
				authScheme.Header.Name.Name.PascalCase.UnsafeName,
				" ",
				typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.imports, f.baseImportPath, importPath),
			)
		}
	}
	for _, header := range headers {
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			// We don't want to generate a client option for literal values.
			continue
		}
		f.P(
			header.Name.Name.PascalCase.UnsafeName,
			" ",
			typeReferenceToGoType(header.ValueType, f.types, f.imports, f.baseImportPath, importPath),
		)
	}
	f.P("}")
	f.P()

	// Generate the constructor.
	f.P("// NewClientOptions returns a new *ClientOptions value.")
	f.P("// This function is primarily used by the generated code and is")
	f.P("// not meant to be used directly; use ClientOption instead.")
	f.P("func NewClientOptions() *ClientOptions {")
	f.P("return &ClientOptions{")
	f.P("HTTPClient: http.DefaultClient,")
	f.P("HTTPHeader: make(http.Header),")
	f.P("}")
	f.P("}")
	f.P()

	if (auth == nil || len(auth.Schemes) == 0) && (headers == nil || len(headers) == 0) {
		f.P("// ToHeader maps the configured client options into a http.Header issued")
		f.P("// on every request.")
		f.P("func (c *ClientOptions) ToHeader() http.Header { return c.cloneHeader() }")
		f.P()
		return f.writePlatformHeaders(sdkConfig, moduleConfig, sdkVersion)
	}

	// Generate the ToHeader method.
	f.P("// ToHeader maps the configured client options into a http.Header issued")
	f.P("// on every request.")
	f.P("func (c *ClientOptions) ToHeader() http.Header {")
	f.P("header := c.cloneHeader()")
	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			f.P("if c.", authScheme.Bearer.Token.PascalCase.UnsafeName, ` != "" { `)
			f.P(`header.Set("Authorization", `, `"Bearer " + c.`, authScheme.Bearer.Token.PascalCase.UnsafeName, ")")
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
			if isLiteral := (header.ValueType.Container != nil && header.ValueType.Container.Literal != nil); isLiteral {
				f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("`, prefix, `%v",`, literalToValue(header.ValueType.Container.Literal), "))")
				continue
			}
			valueTypeFormat := formatForValueType(header.ValueType)
			value := valueTypeFormat.Prefix + "c." + header.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
			if valueTypeFormat.IsOptional {
				f.P("if c.", header.Name.Name.PascalCase.UnsafeName, " != nil {")
				f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("`, prefix, `%v",`, value, "))")
				f.P("}")
			} else {
				f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("`, prefix, `%v",`, value, "))")
			}
		}
	}
	for _, header := range headers {
		if isLiteral := (header.ValueType.Container != nil && header.ValueType.Container.Literal != nil); isLiteral {
			f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("%v",`, literalToValue(header.ValueType.Container.Literal), "))")
			continue
		}
		valueTypeFormat := formatForValueType(header.ValueType)
		value := valueTypeFormat.Prefix + "c." + header.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
		if valueTypeFormat.IsOptional {
			f.P("if c.", header.Name.Name.PascalCase.UnsafeName, " != nil {")
			f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("%v", `, value, "))")
			f.P("}")
		} else {
			f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("%v", `, value, "))")
		}
	}
	f.P("return header")
	f.P("}")
	f.P()

	if err := f.writePlatformHeaders(sdkConfig, moduleConfig, sdkVersion); err != nil {
		return err
	}

	return nil
}

// writePlatformHeaders generates the platform headers.
func (f *fileWriter) writePlatformHeaders(
	sdkConfig *ir.SdkConfig,
	moduleConfig *ModuleConfig,
	sdkVersion string,
) error {
	if sdkVersion == "" {
		f.P("func (c *ClientOptions) cloneHeader() http.Header {")
		f.P("return c.HTTPHeader.Clone()")
		f.P("}")
		return nil
	}
	if sdkConfig.PlatformHeaders != nil {
		f.P("func (c *ClientOptions) cloneHeader() http.Header {")
		f.P("headers := c.HTTPHeader.Clone()")
		f.P(fmt.Sprintf("headers.Set(%q, %q)", sdkConfig.PlatformHeaders.Language, goLanguageHeader))
		f.P(fmt.Sprintf("headers.Set(%q, %q)", sdkConfig.PlatformHeaders.SdkName, moduleConfig.Path))
		f.P(fmt.Sprintf("headers.Set(%q, %q)", sdkConfig.PlatformHeaders.SdkVersion, sdkVersion))
		f.P("return headers")
		f.P("}")
	}
	return nil
}

// WriteClientOptions writes the client options available to the generated
// client code.
func (f *fileWriter) WriteClientOptions(auth *ir.ApiAuth, headers []*ir.HttpHeader) error {
	// Now that we know where the types will be generated, format the generated type names as needed.
	var (
		importPath        = f.baseImportPath
		httpClientType    = "core.HTTPClient"
		clientOptionType  = "core.ClientOption"
		clientOptionsType = "*core.ClientOptions"
	)
	// Generate the options for setting the base URL and HTTP client.
	f.P("// ClientWithBaseURL sets the client's base URL, overriding the")
	f.P("// default environment, if any.")
	f.P("func ClientWithBaseURL(baseURL string) ", clientOptionType, " {")
	f.P("return func(opts ", clientOptionsType, ") {")
	f.P("opts.BaseURL = baseURL")
	f.P("}")
	f.P("}")
	f.P()
	f.P("// ClientWithHTTPClient uses the given HTTPClient to issue all HTTP requests.")
	f.P("func ClientWithHTTPClient(httpClient ", httpClientType, ") ", clientOptionType, " {")
	f.P("return func(opts ", clientOptionsType, ") {")
	f.P("opts.HTTPClient = httpClient")
	f.P("}")
	f.P("}")
	f.P()
	f.P("// ClientWithHTTPHeader adds the given http.Header to all requests")
	f.P("// issued by the client.")
	f.P("func ClientWithHTTPHeader(httpHeader http.Header) ", clientOptionType, " {")
	f.P("return func(opts ", clientOptionsType, ") {")
	f.P("// Clone the headers so they can't be modified after the option call.")
	f.P("opts.HTTPHeader = httpHeader.Clone()")
	f.P("}")
	f.P("}")
	f.P()

	// Generat the authorization functional options.
	includeCustomAuthDocs := auth.Docs != nil && len(*auth.Docs) > 0
	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			var (
				pascalCase = authScheme.Bearer.Token.PascalCase.UnsafeName
				camelCase  = authScheme.Bearer.Token.CamelCase.SafeName
			)
			f.P("// ClientWithAuth", pascalCase, " sets the 'Authorization: Bearer <", camelCase, ">' header on every request.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			f.P("func ClientWithAuth", pascalCase, "(", camelCase, " string) ", clientOptionType, " {")
			f.P("return func(opts ", clientOptionsType, ") {")
			f.P("opts.", pascalCase, " = ", camelCase)
			f.P("}")
			f.P("}")
			f.P()
		}
		if authScheme.Basic != nil {
			f.P("// ClientWithAuthBasic sets the 'Authorization: Basic <base64>' header on every request.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			f.P("func ClientWithAuthBasic(username, password string) ", clientOptionType, " {")
			f.P("return func(opts ", clientOptionsType, ") {")
			f.P("opts.Username = username")
			f.P("opts.Password = password")
			f.P("}")
			f.P("}")
			f.P()
		}
		if authScheme.Header != nil {
			if authScheme.Header.ValueType.Container != nil && authScheme.Header.ValueType.Container.Literal != nil {
				// We don't want to generate a client option for literal values.
				continue
			}
			var (
				optionName = fmt.Sprintf("ClientWithAuth%s", authScheme.Header.Name.Name.PascalCase.UnsafeName)
				field      = authScheme.Header.Name.Name.PascalCase.UnsafeName
				param      = authScheme.Header.Name.Name.CamelCase.SafeName
				value      = typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.imports, f.baseImportPath, importPath)
			)
			f.P("// ", optionName, " sets the ", param, " auth header on every request.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			f.P("func ", optionName, "(", param, " ", value, ") ", clientOptionType, " {")
			f.P("return func(opts ", clientOptionsType, ") {")
			f.P("opts.", field, " = ", param)
			f.P("}")
			f.P("}")
			f.P()
		}
	}

	for _, header := range headers {
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			// We don't want to generate a client option for literal values.
			continue
		}
		var (
			optionName = fmt.Sprintf("ClientWithHeader%s", header.Name.Name.PascalCase.UnsafeName)
			field      = header.Name.Name.PascalCase.UnsafeName
			param      = header.Name.Name.CamelCase.SafeName
			value      = typeReferenceToGoType(header.ValueType, f.types, f.imports, f.baseImportPath, importPath)
		)
		f.P("// ", optionName, " sets the ", param, " header on every request.")
		if header.Docs != nil && len(*header.Docs) > 0 {
			// If the header has any custom documentation, include it immediately below the standard
			// option signature comment.
			f.P("//")
			f.WriteDocs(header.Docs)
		}
		f.P("func ", optionName, "(", param, " ", value, ") ", clientOptionType, " {")
		f.P("return func(opts ", clientOptionsType, ") {")
		f.P("opts.", field, " = ", param)
		f.P("}")
		f.P("}")
		f.P()
	}

	return nil
}

// WriteClient writes a client for interacting with the given service.
func (f *fileWriter) WriteClient(
	irEndpoints []*ir.HttpEndpoint,
	subpackages []*ir.Subpackage,
	environmentsConfig *ir.EnvironmentsConfig,
	errorDiscriminationStrategy *ir.ErrorDiscriminationStrategy,
	fernFilepath *ir.FernFilepath,
) error {
	var (
		clientName = "Client"
		receiver   = "c"
	)
	var errorDiscriminationByPropertyStrategy *ir.ErrorDiscriminationByPropertyStrategy
	if errorDiscriminationStrategy != nil && errorDiscriminationStrategy.Property != nil {
		errorDiscriminationByPropertyStrategy = errorDiscriminationStrategy.Property
	}
	// Reformat the endpoint data into a structure that's suitable for code generation.
	var endpoints []*endpoint
	for _, irEndpoint := range irEndpoints {
		endpoint, err := f.endpointFromIR(fernFilepath, irEndpoint, environmentsConfig, receiver)
		if err != nil {
			return err
		}
		endpoints = append(endpoints, endpoint)
	}

	// Generate the client implementation.
	f.P("type ", clientName, " struct {")
	f.P("baseURL string")
	f.P("httpClient core.HTTPClient")
	f.P("header http.Header")
	f.P()
	for _, subpackage := range subpackages {
		var (
			importPath     = packagePathToImportPath(f.baseImportPath, packagePathForClient(subpackage.FernFilepath))
			clientTypeName = f.imports.Add(importPath) + "." + clientName
		)
		f.P(subpackage.Name.PascalCase.UnsafeName, " *", clientTypeName)
	}
	f.P("}")
	f.P()

	// Generate the client constructor.
	f.P("func New", clientName, "(opts ...core.ClientOption) *", clientName, " {")
	f.P("options := core.NewClientOptions()")
	f.P("for _, opt := range opts {")
	f.P("opt(options)")
	f.P("}")
	f.P("return &", clientName, "{")
	f.P(`baseURL: options.BaseURL,`)
	f.P("httpClient: options.HTTPClient,")
	f.P("header: options.ToHeader(),")
	for _, subpackage := range subpackages {
		var (
			importPath        = packagePathToImportPath(f.baseImportPath, packagePathForClient(subpackage.FernFilepath))
			clientConstructor = f.imports.Add(importPath) + ".NewClient(opts...),"
		)
		f.P(subpackage.Name.PascalCase.UnsafeName, ": ", clientConstructor)
	}
	f.P("}")
	f.P("}")
	f.P()

	// Implement this service's methods.
	for _, endpoint := range endpoints {
		f.WriteDocs(endpoint.Docs)
		if endpoint.Docs != nil && len(*endpoint.Docs) > 0 {
			// Include a separator between the endpoint-level docs, and
			// the path parameter-specific docs.
			f.P("//")
		}
		if len(endpoint.PathParameterDocs) > 0 {
			for _, pathParameterDoc := range endpoint.PathParameterDocs {
				f.WriteDocs(pathParameterDoc)
			}
		}
		f.P("func (", receiver, " *", clientName, ") ", endpoint.Name.PascalCase.UnsafeName, "(", endpoint.SignatureParameters, ") ", endpoint.ReturnValues, " {")
		// Compose the URL, including any query parameters.
		f.P(fmt.Sprintf("baseURL := %q", endpoint.BaseURL))
		f.P("if ", fmt.Sprintf("%s.baseURL", receiver), ` != "" {`)
		f.P("baseURL = ", fmt.Sprintf("%s.baseURL", receiver))
		f.P("}")
		baseURLVariable := "baseURL"
		if len(endpoint.PathSuffix) > 0 {
			baseURLVariable = `baseURL + "/" + ` + fmt.Sprintf("%q", endpoint.PathSuffix)
		}
		urlStatement := fmt.Sprintf("endpointURL := %s", baseURLVariable)
		if len(endpoint.PathParameterNames) > 0 {
			urlStatement = "endpointURL := fmt.Sprintf(" + baseURLVariable + ", " + endpoint.PathParameterNames + ")"
		}
		f.P(urlStatement)
		if len(endpoint.QueryParameters) > 0 {
			f.P()
			f.P("queryParams := make(url.Values)")
			for _, queryParameter := range endpoint.QueryParameters {
				valueTypeFormat := formatForValueType(queryParameter.ValueType)
				if queryParameter.AllowMultiple {
					requestField := valueTypeFormat.Prefix + "value" + valueTypeFormat.Suffix
					f.P("for _, value := range ", endpoint.RequestParameterName, ".", queryParameter.Name.Name.PascalCase.UnsafeName, "{")
					f.P(`queryParams.Add("`, queryParameter.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, "))")
					f.P("}")
				} else if isLiteral := (queryParameter.ValueType.Container != nil && queryParameter.ValueType.Container.Literal != nil); isLiteral {
					f.P(`queryParams.Add("`, queryParameter.Name.WireValue, `", fmt.Sprintf("%v", `, literalToValue(queryParameter.ValueType.Container.Literal), "))")
				} else {
					requestField := valueTypeFormat.Prefix + endpoint.RequestParameterName + "." + queryParameter.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
					if valueTypeFormat.IsOptional {
						// The only query parameter that can't use the default value approach is base64 (aka a []byte).
						f.P("if ", endpoint.RequestParameterName, ".", queryParameter.Name.Name.PascalCase.UnsafeName, "!= nil {")
						f.P(`queryParams.Add("`, queryParameter.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, "))")
						f.P("}")
					} else {
						f.P(`queryParams.Add("`, queryParameter.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, "))")
					}
				}
			}
			f.P("if len(queryParams) > 0 {")
			f.P(`endpointURL += "?" + queryParams.Encode()`)
			f.P("}")
		}
		// Add endpoint-specific headers from the request, if any.
		headersParameter := fmt.Sprintf("%s.header", receiver)
		if len(endpoint.Headers) > 0 {
			f.P()
			f.P("headers := ", receiver, ".header.Clone()")
			for _, header := range endpoint.Headers {
				valueTypeFormat := formatForValueType(header.ValueType)
				requestField := valueTypeFormat.Prefix + endpoint.RequestParameterName + "." + header.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
				if valueTypeFormat.IsOptional {
					f.P("if ", endpoint.RequestParameterName, ".", header.Name.Name.PascalCase.UnsafeName, "!= nil {")
					f.P(`headers.Add("`, header.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, "))")
					f.P("}")
				} else if isLiteral := (header.ValueType.Container != nil && header.ValueType.Container.Literal != nil); isLiteral {
					f.P(`headers.Add("`, header.Name.WireValue, `", fmt.Sprintf("%v", `, literalToValue(header.ValueType.Container.Literal), "))")
				} else {
					f.P(`headers.Add("`, header.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, "))")
				}
			}
			headersParameter = "headers"
		}
		f.P()

		// Include the error decoder, if any.
		if len(endpoint.Errors) > 0 {
			f.P("errorDecoder := func(statusCode int, body io.Reader) error {")
			f.P("raw, err := io.ReadAll(body)")
			f.P("if err != nil {")
			f.P("return err")
			f.P("}")
			f.P("apiError := core.NewAPIError(statusCode, errors.New(string(raw)))")
			f.P("decoder := json.NewDecoder(bytes.NewReader(raw))")
			var (
				switchValue              = "statusCode"
				discriminantContentField = ""
			)
			if errorDiscriminationByPropertyStrategy != nil {
				var (
					discriminant = errorDiscriminationByPropertyStrategy.Discriminant
					content      = errorDiscriminationByPropertyStrategy.ContentProperty
				)
				switchValue = fmt.Sprintf("discriminant.%s", discriminant.Name.PascalCase.UnsafeName)
				discriminantContentField = fmt.Sprintf("discriminant.%s", content.Name.PascalCase.UnsafeName)
				f.P("var discriminant struct {")
				f.P(discriminant.Name.PascalCase.UnsafeName, " string `json:\"", discriminant.WireValue, "\"`")
				f.P(content.Name.PascalCase.UnsafeName, " json.RawMessage `json:\"", content.WireValue, "\"`")
				f.P("}")
				f.P("if err := decoder.Decode(&discriminant); err != nil {")
				f.P("return err")
				f.P("}")
			}
			f.P("switch ", switchValue, " {")
			for _, responseError := range endpoint.Errors {
				var (
					errorDeclaration = f.errors[responseError.Error.ErrorId]
					errorImportPath  = fernFilepathToImportPath(f.baseImportPath, errorDeclaration.Name.FernFilepath)
					errorType        = f.imports.Add(errorImportPath) + "." + errorDeclaration.Name.Name.PascalCase.UnsafeName
				)
				if errorDiscriminationByPropertyStrategy != nil {
					f.P(`case "`, errorDeclaration.DiscriminantValue.WireValue, `":`)
				} else {
					f.P("case ", errorDeclaration.StatusCode, ":")
				}
				f.P("value := new(", errorType, ")")
				f.P("value.APIError = apiError")
				if discriminantContentField != "" {
					f.P("if err := json.Unmarshal(", discriminantContentField, ", value); err != nil {")
				} else {
					f.P("if err := decoder.Decode(value); err != nil {")
				}
				f.P("return err")
				f.P("}")
				f.P("return value")
			}
			// Close the switch statement.
			f.P("}")
			f.P("return apiError")
			f.P("}")
			f.P()
		}

		// Prepare a response variable.
		if endpoint.ResponseType != "" {
			f.P(fmt.Sprintf(endpoint.ResponseInitializerFormat, endpoint.ResponseType))
		}

		if len(endpoint.FileProperties) > 0 || len(endpoint.FileBodyProperties) > 0 {
			f.P("requestBuffer := bytes.NewBuffer(nil)")
			f.P("writer := multipart.NewWriter(requestBuffer)")
			for _, fileProperty := range endpoint.FileProperties {
				var (
					fileVariable     = fileProperty.Key.Name.CamelCase.SafeName
					filenameVariable = fileProperty.Key.Name.CamelCase.UnsafeName + "Filename"
					filenameValue    = fileProperty.Key.Name.CamelCase.UnsafeName + "_filename"
					partVariable     = fileProperty.Key.Name.CamelCase.UnsafeName + "Part"
				)
				if fileProperty.IsOptional {
					f.P("if ", fileVariable, " != nil {")
				}
				f.P(fmt.Sprintf("%s := %q", filenameVariable, filenameValue))
				f.P("if named, ok := ", fileVariable, ".(interface{ Name() string }); ok {")
				f.P(fmt.Sprintf("%s = named.Name()", filenameVariable))
				f.P("}")
				f.P(partVariable, `, err := writer.CreateFormFile("`, fileProperty.Key.WireValue, `", `, filenameVariable, ")")
				f.P("if err != nil {")
				f.P("return ", endpoint.ErrorReturnValues)
				f.P("}")
				f.P("if _, err := io.Copy(", partVariable, ", ", fileVariable, "); err != nil {")
				f.P("return ", endpoint.ErrorReturnValues)
				f.P("}")
				if fileProperty.IsOptional {
					f.P("}")
				}
			}

			for _, fileBodyProperty := range endpoint.FileBodyProperties {
				if isLiteral := (fileBodyProperty.ValueType.Container != nil && fileBodyProperty.ValueType.Container.Literal != nil); isLiteral {
					f.P(`if err := writer.WriteField("`, fileBodyProperty.Name.WireValue, `", fmt.Sprintf("%v", `, literalToValue(fileBodyProperty.ValueType.Container.Literal), ")); err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
					continue
				}
				valueTypeFormat := formatForValueType(fileBodyProperty.ValueType)
				requestField := valueTypeFormat.Prefix + endpoint.RequestParameterName + "." + fileBodyProperty.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
				if valueTypeFormat.IsOptional {
					f.P("if ", endpoint.RequestParameterName, ".", fileBodyProperty.Name.Name.PascalCase.UnsafeName, "!= nil {")
					f.P(`if err := writer.WriteField("`, fileBodyProperty.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, ")); err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
					f.P("}")
				} else {
					f.P(`if err := writer.WriteField("`, fileBodyProperty.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, ")); err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
				}
			}
			f.P("if err := writer.Close(); err != nil {")
			f.P("return ", endpoint.ErrorReturnValues)
			f.P("}")
			f.P(headersParameter, `.Set("Content-Type", writer.FormDataContentType())`)
			f.P()
		}

		// Issue the request.
		f.P("if err := core.DoRequest(")
		f.P("ctx,")
		f.P(receiver, ".httpClient,")
		f.P("endpointURL, ")
		f.P(endpoint.Method, ",")
		f.P(endpoint.RequestValueName, ",")
		f.P(endpoint.ResponseParameterName, ",")
		f.P(strconv.FormatBool(endpoint.ResponseIsOptionalParameter), ",")
		f.P(headersParameter, ",")
		f.P(endpoint.ErrorDecoderParameterName, ",")
		f.P("); err != nil {")
		f.P("return ", endpoint.ErrorReturnValues)
		f.P("}")
		f.P("return ", endpoint.SuccessfulReturnValues)
		f.P("}")
		f.P()
	}

	return nil
}

// endpoint holds the fields required to generate a client endpoint.
//
// All of the fields are pre-formatted so that they can all be simple
// strings.
type endpoint struct {
	Name                        *ir.Name
	Docs                        *string
	PathParameterDocs           []*string
	ImportPath                  string
	RequestParameterName        string
	RequestValueName            string
	ResponseType                string
	ResponseParameterName       string
	ResponseInitializerFormat   string
	ResponseIsOptionalParameter bool
	PathParameterNames          string
	SignatureParameters         string
	ReturnValues                string
	SuccessfulReturnValues      string
	ErrorReturnValues           string
	BaseURL                     string
	PathSuffix                  string
	Method                      string
	ErrorDecoderParameterName   string
	Errors                      ir.ResponseErrors
	QueryParameters             []*ir.QueryParameter
	Headers                     []*ir.HttpHeader
	FileProperties              []*ir.FileProperty
	FileBodyProperties          []*ir.InlinedRequestBodyProperty
}

// signatureForEndpoint returns a signature template for the given endpoint.
func (f *fileWriter) endpointFromIR(
	fernFilepath *ir.FernFilepath,
	irEndpoint *ir.HttpEndpoint,
	irEnvironmentsConfig *ir.EnvironmentsConfig,
	receiver string,
) (*endpoint, error) {
	importPath := fernFilepathToImportPath(f.baseImportPath, fernFilepath)

	// Add path parameters and request body, if any.
	signatureParameters := "ctx context.Context"
	var pathParameterNames []string
	for _, pathParameter := range irEndpoint.AllPathParameters {
		pathParameterName := pathParameter.Name.CamelCase.SafeName
		parameterType := typeReferenceToGoType(pathParameter.ValueType, f.types, f.imports, f.baseImportPath, "" /* The type is always imported */)
		signatureParameters += fmt.Sprintf(", %s %s", pathParameterName, parameterType)
		pathParameterNames = append(pathParameterNames, pathParameterName)
	}

	// Add the file parameter(s) after the path parameters, if any.
	var (
		fileProperties     []*ir.FileProperty
		fileBodyProperties []*ir.InlinedRequestBodyProperty
	)
	if irEndpoint.RequestBody != nil && irEndpoint.RequestBody.FileUpload != nil {
		for _, fileUploadProperty := range irEndpoint.RequestBody.FileUpload.Properties {
			if fileUploadProperty.File != nil {
				parameterName := fileUploadProperty.File.Key.Name.CamelCase.SafeName
				parameterType := "io.Reader"
				signatureParameters += fmt.Sprintf(", %s %s", parameterName, parameterType)
				fileProperties = append(fileProperties, fileUploadProperty.File)
			}
			if fileUploadProperty.BodyProperty != nil {
				fileBodyProperties = append(fileBodyProperties, fileUploadProperty.BodyProperty)
			}
		}
	}

	// Format the rest of the request parameters.
	var (
		requestParameterName = ""
		requestValueName     = "nil"
	)
	if irEndpoint.SdkRequest != nil {
		if needsRequestParameter(irEndpoint) {
			var requestType string
			if requestBody := irEndpoint.SdkRequest.Shape.JustRequestBody; requestBody != nil {
				requestType = typeReferenceToGoType(requestBody.RequestBodyType, f.types, f.imports, f.baseImportPath, "" /* The type is always imported */)
			}
			if irEndpoint.SdkRequest.Shape.Wrapper != nil {
				requestImportPath := fernFilepathToImportPath(f.baseImportPath, fernFilepath)
				requestType = fmt.Sprintf("*%s.%s", f.imports.Add(requestImportPath), irEndpoint.SdkRequest.Shape.Wrapper.WrapperName.PascalCase.UnsafeName)
			}
			requestParameterName = irEndpoint.SdkRequest.RequestParameterName.CamelCase.SafeName
			requestValueName = requestParameterName
			signatureParameters += fmt.Sprintf(", %s %s", requestParameterName, requestType)
		}
		if irEndpoint.RequestBody != nil && irEndpoint.RequestBody.FileUpload != nil {
			// This is a file upload request, so we prepare a buffer for the request body
			// instead of just using the request specified by the function signature.
			requestValueName = "requestBuffer"
		}
	}

	// Format all of the response values.
	var (
		responseType              string
		responseParameterName     string
		responseInitializerFormat string
		signatureReturnValues     string
		successfulReturnValues    string
		errorReturnValues         string
	)
	var responseIsOptionalParameter bool
	if irEndpoint.Response != nil {
		if irEndpoint.Response.Json != nil {
			responseType = typeReferenceToGoType(irEndpoint.Response.Json.ResponseBodyType, f.types, f.imports, f.baseImportPath, "" /* The type is always imported */)
			responseInitializerFormat = "var response %s"
			responseIsOptionalParameter = irEndpoint.Response.Json.ResponseBodyType.Container != nil && irEndpoint.Response.Json.ResponseBodyType.Container.Optional != nil
			responseParameterName = "&response"
			signatureReturnValues = fmt.Sprintf("(%s, error)", responseType)
			successfulReturnValues = "response, nil"
			errorReturnValues = "response, err"
		}
		if irEndpoint.Response.FileDownload != nil {
			responseType = "bytes.NewBuffer(nil)"
			responseInitializerFormat = "response := %s"
			responseParameterName = "response"
			signatureReturnValues = "(io.Reader, error)"
			successfulReturnValues = "response, nil"
			errorReturnValues = "nil, err"
		}
	} else {
		responseParameterName = "nil"
		signatureReturnValues = "error"
		successfulReturnValues = "nil"
		errorReturnValues = "err"
	}

	// Determine this endpoint's base URL based on the environment, if any.
	var environmentID string
	if irEnvironmentsConfig != nil && irEnvironmentsConfig.DefaultEnvironment != nil {
		environmentID = *irEnvironmentsConfig.DefaultEnvironment
	}
	if irEndpoint.BaseUrl != nil {
		environmentID = *irEndpoint.BaseUrl
	}
	baseURL, err := environmentURLFromID(irEnvironmentsConfig, environmentID)
	if err != nil {
		return nil, err
	}

	// Consolidate the irEndpoint's full path into a path suffix that
	// can be applied to the irEndpoint at construction time.
	var pathSuffix string
	if irEndpoint.FullPath != nil {
		if irEndpoint.FullPath.Head != "/" {
			pathSuffix = irEndpoint.FullPath.Head
		}
		for _, part := range irEndpoint.FullPath.Parts {
			if part.PathParameter != "" {
				pathSuffix += "%v"
			}
			if part.Tail != "" {
				pathSuffix += part.Tail
			}
		}
		pathSuffix = strings.TrimLeft(pathSuffix, "/")
	}

	// An error decoder is required when there are endpoint-specific errors.
	errorDecoderParameterName := "nil"
	if len(irEndpoint.Errors) > 0 {
		errorDecoderParameterName = "errorDecoder"
	}

	var pathParameterDocs []*string
	for _, pathParam := range irEndpoint.AllPathParameters {
		if pathParam.Docs != nil && len(*pathParam.Docs) > 0 {
			pathParameterDocs = append(pathParameterDocs, pathParam.Docs)
		}
	}

	return &endpoint{
		Name:                        irEndpoint.Name,
		Docs:                        irEndpoint.Docs,
		PathParameterDocs:           pathParameterDocs,
		ImportPath:                  importPath,
		RequestParameterName:        requestParameterName,
		RequestValueName:            requestValueName,
		ResponseType:                responseType,
		ResponseParameterName:       responseParameterName,
		ResponseInitializerFormat:   responseInitializerFormat,
		ResponseIsOptionalParameter: responseIsOptionalParameter,
		PathParameterNames:          strings.Join(pathParameterNames, ", "),
		SignatureParameters:         signatureParameters,
		ReturnValues:                signatureReturnValues,
		SuccessfulReturnValues:      successfulReturnValues,
		ErrorReturnValues:           errorReturnValues,
		BaseURL:                     baseURL,
		PathSuffix:                  pathSuffix,
		Method:                      irMethodToMethodEnum(irEndpoint.Method),
		ErrorDecoderParameterName:   errorDecoderParameterName,
		Errors:                      irEndpoint.Errors,
		QueryParameters:             irEndpoint.QueryParameters,
		Headers:                     irEndpoint.Headers,
		FileProperties:              fileProperties,
		FileBodyProperties:          fileBodyProperties,
	}, nil
}

// WriteEnvironments writes the environment constants.
func (f *fileWriter) WriteEnvironments(environmentsConfig *ir.EnvironmentsConfig) error {
	return environmentsToEnvironmentsVariable(environmentsConfig.Environments, f)
}

// WriteError writes the structured error types.
func (f *fileWriter) WriteError(errorDeclaration *ir.ErrorDeclaration) error {
	// Generate the error type declaration.
	var (
		typeName = errorDeclaration.Name.Name.PascalCase.UnsafeName
		receiver = typeNameToReceiver(typeName)
	)
	f.WriteDocs(errorDeclaration.Docs)
	f.P("type ", typeName, " struct {")
	f.P("*core.APIError")
	if errorDeclaration.Type == nil {
		// This error doesn't have a body, so we only need to include the status code.
		// We still needto implement the json.Unmarshaler and json.Marshaler though.
		f.P("}")
		f.P()
		f.P("func (", receiver, "*", typeName, ") UnmarshalJSON(data []byte) error {")
		f.P(receiver, ".StatusCode = ", errorDeclaration.StatusCode)
		f.P("return nil")
		f.P("}")
		f.P()
		f.P("func (", receiver, "*", typeName, ") MarshalJSON() ([]byte, error) {")
		f.P("return nil, nil")
		f.P("}")
		f.P()
		return nil
	}
	var (
		importPath = fernFilepathToImportPath(f.baseImportPath, errorDeclaration.Name.FernFilepath)
		value      = typeReferenceToGoType(errorDeclaration.Type, f.types, f.imports, f.baseImportPath, importPath)
	)
	var literal string
	if errorDeclaration.Type.Container != nil && errorDeclaration.Type.Container.Literal != nil {
		literal = literalToValue(errorDeclaration.Type.Container.Literal)
	}
	f.P("Body ", value)
	f.P("}")
	f.P()

	// Implement the json.Unmarshaler.
	isOptional := errorDeclaration.Type.Container != nil && errorDeclaration.Type.Container.Optional != nil
	f.P("func (", receiver, "*", typeName, ") UnmarshalJSON(data []byte) error {")
	if isOptional {
		f.P("if len(data) == 0 {")
		f.P(receiver, ".StatusCode = ", errorDeclaration.StatusCode)
		f.P("return nil")
		f.P("}")
	}
	f.P(fmt.Sprintf("var body %s", value))
	f.P("if err := json.Unmarshal(data, &body); err != nil {")
	f.P("return err")
	f.P("}")
	if literal != "" {
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
	if literal != "" {
		f.P("return json.Marshal(", literal, ")")
	} else if isOptional {
		f.P("if ", receiver, ".Body == nil {")
		f.P("return nil, nil")
		f.P("}")
		f.P("return json.Marshal(", receiver, ".Body)")
	} else {
		f.P("return json.Marshal(", receiver, ".Body)")
	}
	f.P("}")
	f.P()

	// Implement the error unwrapper interface.
	f.P("func (", receiver, "*", typeName, ") Unwrap() error {")
	f.P("return ", receiver, ".APIError")
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

	var literals []*literal
	f.P("type ", typeName, " struct {")
	for _, header := range endpoint.Headers {
		f.WriteDocs(header.Docs)
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			literals = append(
				literals,
				&literal{
					Name:  header.Name.Name,
					Value: header.ValueType.Container.Literal,
				},
			)
			continue
		}
		f.P(header.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(header.ValueType, f.types, f.imports, f.baseImportPath, importPath), " `json:\"-\"`")
	}
	for _, queryParam := range endpoint.QueryParameters {
		value := typeReferenceToGoType(queryParam.ValueType, f.types, f.imports, f.baseImportPath, importPath)
		if queryParam.AllowMultiple {
			value = fmt.Sprintf("[]%s", value)
		}
		f.WriteDocs(queryParam.Docs)
		if queryParam.ValueType.Container != nil && queryParam.ValueType.Container.Literal != nil {
			literals = append(
				literals,
				&literal{
					Name:  queryParam.Name.Name,
					Value: queryParam.ValueType.Container.Literal,
				},
			)
			continue
		}
		f.P(queryParam.Name.Name.PascalCase.UnsafeName, " ", value, " `json:\"-\"`")
	}
	if endpoint.RequestBody == nil {
		// If the request doesn't have a body, we don't need any custom [de]serialization logic.
		for _, literal := range literals {
			f.P(literal.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
		}
		f.P("}")
		f.P()
		for _, literal := range literals {
			f.P("func (", receiver, " *", typeName, ") ", literal.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
			f.P("return ", receiver, ".", literal.Name.CamelCase.SafeName)
			f.P("}")
			f.P()
		}
		return nil
	}
	fieldLiterals, err := requestBodyToFieldDeclaration(endpoint.RequestBody, f, importPath, bodyField)
	if err != nil {
		return err
	}
	literals = append(literals, fieldLiterals...)
	for _, literal := range literals {
		f.P(literal.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
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

	var (
		referenceType      string
		referenceIsPointer bool
		referenceLiteral   string
	)
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

func environmentsToEnvironmentsVariable(
	environments *ir.Environments,
	writer *fileWriter,
) error {
	writer.P("// Environments defines all of the API environments.")
	writer.P("// These values can be used with the ClientWithBaseURL")
	writer.P("// ClientOption to override the client's default environment,")
	writer.P("// if any.")
	writer.P("var Environments = struct {")
	declarationVisitor := &environmentsDeclarationVisitor{
		types:  writer.types,
		writer: writer,
	}
	if err := environments.Accept(declarationVisitor); err != nil {
		return err
	}
	writer.P("}{")
	valueVisitor := &environmentsValueVisitor{
		types:  writer.types,
		writer: writer,
	}
	if err := environments.Accept(valueVisitor); err != nil {
		return err
	}
	writer.P("}")
	return nil
}

// environmentURL is used to generate deterministic results (i.e. by iterating
// over a sorted list rather than a map).
type environmentURL struct {
	ID  ir.EnvironmentBaseUrlId
	URL ir.EnvironmentUrl
}

func environmentURLMapToSortedSlice(urls map[ir.EnvironmentBaseUrlId]ir.EnvironmentUrl) []*environmentURL {
	result := make([]*environmentURL, 0, len(urls))
	for id, url := range urls {
		result = append(
			result,
			&environmentURL{
				ID:  id,
				URL: url,
			},
		)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].ID < result[j].ID })
	return result
}

type environmentsDeclarationVisitor struct {
	types  map[ir.TypeId]*ir.TypeDeclaration
	writer *fileWriter
}

func (e *environmentsDeclarationVisitor) VisitSingleBaseUrl(url *ir.SingleBaseUrlEnvironments) error {
	for _, environment := range url.Environments {
		e.writer.WriteDocs(environment.Docs)
		e.writer.P(environment.Name.PascalCase.UnsafeName, " string")
	}
	return nil
}

func (e *environmentsDeclarationVisitor) VisitMultipleBaseUrls(url *ir.MultipleBaseUrlsEnvironments) error {
	baseURLs := make(map[ir.EnvironmentBaseUrlId]string)
	for _, baseURL := range url.BaseUrls {
		baseURLs[baseURL.Id] = baseURL.Name.PascalCase.UnsafeName
	}
	for _, environment := range url.Environments {
		e.writer.WriteDocs(environment.Docs)
		e.writer.P(environment.Name.PascalCase.UnsafeName, " struct {")
		for _, environmentURL := range environmentURLMapToSortedSlice(environment.Urls) {
			e.writer.P(baseURLs[environmentURL.ID], " string")
		}
		e.writer.P("}")
	}
	return nil
}

type environmentsValueVisitor struct {
	types  map[ir.TypeId]*ir.TypeDeclaration
	writer *fileWriter
}

func (e *environmentsValueVisitor) VisitSingleBaseUrl(url *ir.SingleBaseUrlEnvironments) error {
	for _, environment := range url.Environments {
		e.writer.P(environment.Name.PascalCase.UnsafeName, fmt.Sprintf(": %q,", environment.Url))
	}
	return nil
}

func (e *environmentsValueVisitor) VisitMultipleBaseUrls(url *ir.MultipleBaseUrlsEnvironments) error {
	baseURLs := make(map[ir.EnvironmentBaseUrlId]string)
	for _, baseURL := range url.BaseUrls {
		baseURLs[baseURL.Id] = baseURL.Name.PascalCase.UnsafeName
	}
	for _, environment := range url.Environments {
		environmentURLs := environmentURLMapToSortedSlice(environment.Urls)
		e.writer.P(environment.Name.PascalCase.UnsafeName, ": struct {")
		for _, environmentURL := range environmentURLs {
			e.writer.P(baseURLs[environmentURL.ID], " string")
		}
		e.writer.P("}{")
		for _, environmentURL := range environmentURLs {
			e.writer.P(baseURLs[environmentURL.ID], fmt.Sprintf(": %q,", environmentURL.URL))
		}
		e.writer.P("},")
	}
	return nil
}

func environmentURLFromID(environmentsConfig *ir.EnvironmentsConfig, id ir.EnvironmentBaseUrlId) (ir.EnvironmentUrl, error) {
	if environmentsConfig == nil {
		return "", nil
	}
	urlVisitor := &environmentsURLVisitor{
		id: id,
	}
	if err := environmentsConfig.Environments.Accept(urlVisitor); err != nil {
		return "", err
	}
	return urlVisitor.value, nil
}

type environmentsURLVisitor struct {
	value ir.EnvironmentUrl
	id    ir.EnvironmentBaseUrlId
}

func (e *environmentsURLVisitor) VisitSingleBaseUrl(url *ir.SingleBaseUrlEnvironments) error {
	for _, environment := range url.Environments {
		if environment.Id == e.id {
			e.value = environment.Url
			return nil
		}
	}
	return nil
}

func (e *environmentsURLVisitor) VisitMultipleBaseUrls(url *ir.MultipleBaseUrlsEnvironments) error {
	for _, environment := range url.Environments {
		for id, environmentURL := range environment.Urls {
			if id == e.id {
				e.value = environmentURL
				return nil
			}
		}
	}
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
	var bodyProperties []*ir.InlinedRequestBodyProperty
	for _, property := range fileUpload.Properties {
		if bodyProperty := property.BodyProperty; bodyProperty != nil {
			bodyProperties = append(bodyProperties, bodyProperty)
		}
	}
	if len(bodyProperties) == 0 {
		// We only want to create a separate request type if the file upload request
		// has any body properties that aren't the file itself. The file is specified
		// as a positional parameter.
		return nil
	}
	typeVisitor := &typeVisitor{
		typeName:       fileUpload.Name.PascalCase.UnsafeName,
		baseImportPath: r.baseImportPath,
		importPath:     r.importPath,
		writer:         r.writer,
	}
	objectTypeDeclaration := inlinedRequestBodyPropertiesToObjectTypeDeclaration(bodyProperties)
	_, literals := typeVisitor.visitObjectProperties(objectTypeDeclaration, true /* includeTags */)
	r.literals = literals
	return nil
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

// inlinedRequestBodyPropertiesToObjectTypeDeclaration maps the given inlined request body
// properties into an object type declaration so that we can reuse the functionality required
// to write object properties for a generated object.
func inlinedRequestBodyPropertiesToObjectTypeDeclaration(bodyProperties []*ir.InlinedRequestBodyProperty) *ir.ObjectTypeDeclaration {
	properties := make([]*ir.ObjectProperty, len(bodyProperties))
	for i, property := range bodyProperties {
		properties[i] = &ir.ObjectProperty{
			Docs:      property.Docs,
			Name:      property.Name,
			ValueType: property.ValueType,
		}
	}
	return &ir.ObjectTypeDeclaration{
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

type valueTypeFormat struct {
	Prefix     string
	Suffix     string
	IsOptional bool
}

func formatForValueType(typeReference *ir.TypeReference) *valueTypeFormat {
	var (
		prefix     string
		suffix     string
		isOptional bool
	)
	if typeReference.Container != nil && typeReference.Container.Optional != nil {
		prefix = "*"
		isOptional = true
	}
	if primitive := maybePrimitive(typeReference); primitive != 0 {
		// Several of the primitive types require special handling for query parameter serialization.
		switch primitive {
		case ir.PrimitiveTypeDateTime:
			prefix = ""
			suffix = ".Format(time.RFC3339)"
		case ir.PrimitiveTypeDate:
			prefix = ""
			suffix = `.Format("2006-01-02")`
		case ir.PrimitiveTypeBase64:
			prefix = "base64.StdEncoding.EncodeToString(" + prefix
			suffix = ")"
		}
	}
	return &valueTypeFormat{
		Prefix:     prefix,
		Suffix:     suffix,
		IsOptional: isOptional,
	}
}

// needsRequestParameter returns true if the endpoint needs a request parameter in its
// function signature.
func needsRequestParameter(endpoint *ir.HttpEndpoint) bool {
	if endpoint.SdkRequest == nil {
		return false
	}
	if endpoint.RequestBody != nil {
		return endpoint.RequestBody.FileUpload == nil || fileUploadHasBodyProperties(endpoint.RequestBody.FileUpload)
	}
	return true
}

// maybePrimitive recurses into the given value type, returning its underlying primitive
// value, if any. Note that this only recurses through nested optional containers; all
// other container types are ignored.
func maybePrimitive(typeReference *ir.TypeReference) ir.PrimitiveType {
	if typeReference.Primitive != 0 {
		return typeReference.Primitive
	}
	if typeReference.Container != nil && typeReference.Container.Optional != nil {
		return maybePrimitive(typeReference.Container.Optional)
	}
	return 0
}
