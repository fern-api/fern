package generator

import (
	_ "embed"
	"fmt"
	"path"
	"sort"
	"strings"

	"github.com/fern-api/fern-go/internal/ast"
	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/gospec"
	generatorexec "github.com/fern-api/generator-exec-go"
)

// goLanguageHeader is the identifier used for the X-Fern-Language platform header.
const goLanguageHeader = "Go"

var (
	//go:embed sdk/client/client_test.go.tmpl
	clientTestFile string

	//go:embed sdk/core/core.go
	coreFile string

	//go:embed sdk/core/core_test.go
	coreTestFile string

	//go:embed sdk/core/optional.go
	optionalFile string

	//go:embed sdk/core/optional_test.go
	optionalTestFile string

	//go:embed sdk/core/page.go
	pageFile string

	//go:embed sdk/core/pager.go
	pagerFile string

	//go:embed sdk/core/pointer.go
	pointerFile string

	//go:embed sdk/core/stream.go
	streamFile string

	//go:embed sdk/core/retrier.go
	retrierFile string

	//go:embed sdk/core/query.go
	queryFile string

	//go:embed sdk/core/query_test.go
	queryTestFile string
)

// WriteOptionalHelpers writes the Optional[T] helper functions.
// The name of the helpers will change if the functions are
// generated in the core package (to avoid naming collisions).
func (f *fileWriter) WriteOptionalHelpers(useCore bool) error {
	var (
		typeName        = "core.Optional"
		constructorName = "Optional"
	)
	if useCore {
		typeName = "Optional"
		constructorName = "NewOptional"
	}
	f.P("// ", constructorName, " initializes an optional field.")
	f.P("func ", constructorName, "[T any](value T) *", typeName, "[T] {")
	f.P("return &", typeName, "[T]{")
	f.P("Value: value,")
	f.P("}")
	f.P("}")
	f.P()

	f.P("// Null initializes an optional field that will be sent as")
	f.P("// an explicit null value.")
	f.P("func Null[T any]() *", typeName, "[T] {")
	f.P("return &", typeName, "[T]{")
	f.P("Null: true,")
	f.P("}")
	f.P("}")
	f.P()

	return nil
}

// WriteLegacyClientOptions writes option functions in the client package, which
// is where they were previously deposited in earlier versions of the generator.
func (f *fileWriter) WriteLegacyClientOptions(
	auth *ir.ApiAuth,
	headers []*ir.HttpHeader,
	idempotencyHeaders []*ir.HttpHeader,
) error {
	f.P("// WithBaseURL sets the base URL, overriding the default")
	f.P("// environment, if any.")
	f.P("func WithBaseURL(baseURL string) *core.BaseURLOption {")
	f.P("return option.WithBaseURL(baseURL)")
	f.P("}")
	f.P()
	f.P("// WithHTTPClient uses the given HTTPClient to issue the request.")
	f.P("func WithHTTPClient(httpClient core.HTTPClient) *core.HTTPClientOption {")
	f.P("return option.WithHTTPClient(httpClient)")
	f.P("}")
	f.P()
	f.P("// WithHTTPHeader adds the given http.Header to the request.")
	f.P("func WithHTTPHeader(httpHeader http.Header) *core.HTTPHeaderOption {")
	f.P("return option.WithHTTPHeader(httpHeader)")
	f.P("}")
	f.P()
	f.P("// WithMaxAttempts configures the maximum number of retry attempts.")
	f.P("func WithMaxAttempts(attempts uint) *core.MaxAttemptsOption {")
	f.P("return option.WithMaxAttempts(attempts)")
	f.P("}")
	f.P()

	includeCustomAuthDocs := auth.Docs != nil && len(*auth.Docs) > 0

	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			var (
				pascalCase = authScheme.Bearer.Token.PascalCase.UnsafeName
				camelCase  = authScheme.Bearer.Token.CamelCase.SafeName
				optionName = fmt.Sprintf("With%s", pascalCase)
				typeName   = "*core." + pascalCase + "Option"
			)
			f.P("// ", optionName, " sets the 'Authorization: Bearer <", camelCase, ">' request header.")
			f.P("func ", optionName, "(", camelCase, " string ) ", typeName, " {")
			f.P("return option.", optionName, "(", camelCase, ")")
			f.P("}")
		}
		if authScheme.Basic != nil {
			f.P("// WithBasicAuth sets the 'Authorization: Basic <base64>' request header.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			f.P("func WithBasicAuth(username string, password string) *core.BasicAuthOption {")
			f.P("return option.WithBasicAuth(username, password)")
			f.P("}")
		}
		if authScheme.Header != nil {
			if authScheme.Header.ValueType.Container != nil && authScheme.Header.ValueType.Container.Literal != nil {
				// We don't want to generate a request option for literal values.
				continue
			}
			var (
				pascalCase = authScheme.Header.Name.Name.PascalCase.UnsafeName
				camelCase  = authScheme.Header.Name.Name.CamelCase.SafeName
				optionName = fmt.Sprintf("With%s", pascalCase)
				goType     = typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.scope, f.baseImportPath, "", false)
				typeName   = "*core." + pascalCase + "Option"
			)
			f.P("// ", optionName, " sets the ", camelCase, " auth request header.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			f.P("func ", optionName, "(", camelCase, " ", goType, ") ", typeName, " {")
			f.P("return option.", optionName, "(", camelCase, ")")
			f.P("}")
			f.P()
		}
	}

	for _, header := range append(headers, idempotencyHeaders...) {
		// TODO: We should remove these guards.
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			// We don't want to generate a request option for literal values.
			continue
		}
		var (
			pascalCase = header.Name.Name.PascalCase.UnsafeName
			camelCase  = header.Name.Name.CamelCase.SafeName
			optionName = fmt.Sprintf("With%s", pascalCase)
			goType     = typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, "", false)
			typeName   = "*core." + pascalCase + "Option"
		)
		f.P("// ", optionName, " sets the ", camelCase, " request header.")
		if header.Docs != nil && len(*header.Docs) > 0 {
			// If the header has any custom documentation, include it immediately below the standard
			// option signature comment.
			f.P("//")
			f.WriteDocs(header.Docs)
		}
		f.P("func ", optionName, "(", camelCase, " ", goType, ") ", typeName, " {")
		f.P("return option.", optionName, "(", camelCase, ")")
		f.P("}")
		f.P()
	}

	return nil
}

// WriteIdempotentRequestOptionsDefinition writes the IdempotentRequestOption
// interface and *IdempotentRequestOptions type. These types are always deposited
// in the core package to prevent import cycles in the generated SDK.
func (f *fileWriter) WriteIdempotentRequestOptionsDefinition(idempotencyHeaders []*ir.HttpHeader) error {
	importPath := path.Join(f.baseImportPath, "core")
	f.P("// IdempotentRequestOption adapts the behavior of an individual request.")
	f.P("type IdempotentRequestOption interface {")
	f.P("applyIdempotentRequestOptions(*IdempotentRequestOptions)")
	f.P("}")
	f.P()

	f.P("// IdempotentRequestOptions defines all of the possible idempotent request options.")
	f.P("//")
	f.P("// This type is primarily used by the generated code and is not meant")
	f.P("// to be used directly; use the option package instead.")
	f.P("type IdempotentRequestOptions struct {")
	f.P("*RequestOptions")
	f.P()

	for _, header := range idempotencyHeaders {
		f.P(
			header.Name.Name.PascalCase.UnsafeName,
			" ",
			typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false),
		)
	}

	f.P("}")
	f.P()

	// Generate the constructor.
	f.P("// NewIdempotentRequestOptions returns a new *IdempotentRequestOptions value.")
	f.P("//")
	f.P("// This function is primarily used by the generated code and is not meant")
	f.P("// to be used directly; use IdempotentRequestOption instead.")
	f.P("func NewIdempotentRequestOptions(opts ...IdempotentRequestOption) *IdempotentRequestOptions {")
	f.P("options := &IdempotentRequestOptions{")
	f.P("RequestOptions: NewRequestOptions(),")
	f.P("}")
	f.P("for _, opt := range opts {")
	f.P("if requestOption, ok := opt.(RequestOption); ok {")
	f.P("requestOption.applyRequestOptions(options.RequestOptions)")
	f.P("}")
	f.P("opt.applyIdempotentRequestOptions(options)")
	f.P("}")
	f.P("return options")
	f.P("}")
	f.P()

	for _, header := range idempotencyHeaders {
		var (
			pascalCase = header.Name.Name.PascalCase.UnsafeName
			goType     = typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
		)
		if err := f.writeOptionStruct(pascalCase, goType, false, true); err != nil {
			return err
		}
	}

	// Generate the ToHeader method.
	f.P("// ToHeader maps the configured request options into a http.Header used")
	f.P("// for the request.")
	f.P("func (i *IdempotentRequestOptions) ToHeader() http.Header {")
	f.P("header := i.RequestOptions.ToHeader()")
	for _, header := range idempotencyHeaders {
		valueTypeFormat := formatForValueType(header.ValueType, f.types)
		value := valueTypeFormat.Prefix + "i." + header.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
		f.P("if i.", header.Name.Name.PascalCase.UnsafeName, " != ", valueTypeFormat.ZeroValue, " {")
		f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("`, valueTypeFormat.Prefix, `%v",`, value, "))")
		f.P("}")
	}
	f.P("return header")
	f.P("}")

	return nil
}

// WriteRequestOptionsDefinition writes the RequestOption interface and
// *RequestOptions type. These types are always deposited in the core
// package to prevent import cycles in the generated SDK.
func (f *fileWriter) WriteRequestOptionsDefinition(
	auth *ir.ApiAuth,
	headers []*ir.HttpHeader,
	idempotencyHeaders []*ir.HttpHeader,
	sdkConfig *ir.SdkConfig,
	moduleConfig *ModuleConfig,
	sdkVersion string,
) error {
	importPath := path.Join(f.baseImportPath, "core")
	f.P("// RequestOption adapts the behavior of the client or an individual request.")
	f.P("type RequestOption interface {")
	f.P("applyRequestOptions(*RequestOptions)")
	f.P("}")
	f.P()

	f.P("// RequestOptions defines all of the possible request options.")
	f.P("//")
	f.P("// This type is primarily used by the generated code and is not meant")
	f.P("// to be used directly; use the option package instead.")
	f.P("type RequestOptions struct {")
	f.P("BaseURL string")
	f.P("HTTPClient HTTPClient")
	f.P("HTTPHeader http.Header")
	f.P("MaxAttempts uint")

	// Generate the exported RequestOptions type that all clients can act upon.
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
				// We don't want to generate a request option for literal values.
				continue
			}
			f.P(
				authScheme.Header.Name.Name.PascalCase.UnsafeName,
				" ",
				typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false),
			)
		}
	}
	for _, header := range headers {
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			// We don't want to generate a request option for literal values.
			continue
		}
		f.P(
			header.Name.Name.PascalCase.UnsafeName,
			" ",
			typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false),
		)
	}
	f.P("}")
	f.P()

	// Generate the constructor.
	f.P("// NewRequestOptions returns a new *RequestOptions value.")
	f.P("//")
	f.P("// This function is primarily used by the generated code and is not meant")
	f.P("// to be used directly; use RequestOption instead.")
	f.P("func NewRequestOptions(opts ...RequestOption) *RequestOptions {")
	f.P("options := &RequestOptions{")
	f.P("HTTPHeader: make(http.Header),")
	f.P("}")
	f.P("for _, opt := range opts {")
	f.P("opt.applyRequestOptions(options)")
	f.P("}")
	f.P("return options")
	f.P("}")
	f.P()

	if (auth == nil || len(auth.Schemes) == 0) && (headers == nil || len(headers) == 0) {
		f.P("// ToHeader maps the configured request options into a http.Header used")
		f.P("// for the request(s).")
		f.P("func (r *RequestOptions) ToHeader() http.Header { return r.cloneHeader() }")
		f.P()
		if err := f.writePlatformHeaders(sdkConfig, moduleConfig, sdkVersion); err != nil {
			return err
		}
		f.P()
		return f.writeRequestOptionStructs(auth, headers, len(idempotencyHeaders) > 0)
	}

	// Generate the ToHeader method.
	f.P("// ToHeader maps the configured request options into a http.Header used")
	f.P("// for the request(s).")
	f.P("func (r *RequestOptions) ToHeader() http.Header {")
	f.P("header := r.cloneHeader()")
	for _, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			f.P("if r.", authScheme.Bearer.Token.PascalCase.UnsafeName, ` != "" { `)
			f.P(`header.Set("Authorization", `, `"Bearer " + r.`, authScheme.Bearer.Token.PascalCase.UnsafeName, ")")
			f.P("}")
		}
		if authScheme.Basic != nil {
			f.P(`if r.Username != "" && r.Password != "" {`)
			f.P(`header.Set("Authorization", `, `"Basic " + base64.StdEncoding.EncodeToString([]byte(r.Username + ": " + r.Password)))`)
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
			valueTypeFormat := formatForValueType(header.ValueType, f.types)
			value := valueTypeFormat.Prefix + "r." + header.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
			f.P("if r.", header.Name.Name.PascalCase.UnsafeName, " != ", valueTypeFormat.ZeroValue, " {")
			f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("`, prefix, `%v",`, value, "))")
			f.P("}")
		}
	}
	for _, header := range headers {
		if isLiteral := (header.ValueType.Container != nil && header.ValueType.Container.Literal != nil); isLiteral {
			f.P(`header.Set("`, header.Name.WireValue, `", fmt.Sprintf("%v",`, literalToValue(header.ValueType.Container.Literal), "))")
			continue
		}
		valueTypeFormat := formatForValueType(header.ValueType, f.types)
		value := valueTypeFormat.Prefix + "r." + header.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix
		if valueTypeFormat.IsOptional {
			f.P("if r.", header.Name.Name.PascalCase.UnsafeName, " != nil {")
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

	f.P()

	if err := f.writeRequestOptionStructs(auth, headers, len(idempotencyHeaders) > 0); err != nil {
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
		f.P("func (r *RequestOptions) cloneHeader() http.Header {")
		f.P("return r.HTTPHeader.Clone()")
		f.P("}")
		return nil
	}
	if sdkConfig.PlatformHeaders != nil {
		f.P("func (r *RequestOptions) cloneHeader() http.Header {")
		f.P("headers := r.HTTPHeader.Clone()")
		f.P(fmt.Sprintf("headers.Set(%q, %q)", sdkConfig.PlatformHeaders.Language, goLanguageHeader))
		f.P(fmt.Sprintf("headers.Set(%q, %q)", sdkConfig.PlatformHeaders.SdkName, moduleConfig.Path))
		f.P(fmt.Sprintf("headers.Set(%q, %q)", sdkConfig.PlatformHeaders.SdkVersion, sdkVersion))
		f.P("return headers")
		f.P("}")
	}
	return nil
}

func (f *fileWriter) writeRequestOptionStructs(
	auth *ir.ApiAuth,
	headers []*ir.HttpHeader,
	asIdempotentRequestOption bool,
) error {
	if err := f.writeOptionStruct("BaseURL", "string", true, asIdempotentRequestOption); err != nil {
		return err
	}
	if err := f.writeOptionStruct("HTTPClient", "HTTPClient", true, asIdempotentRequestOption); err != nil {
		return err
	}
	if err := f.writeOptionStruct("HTTPHeader", "http.Header", true, asIdempotentRequestOption); err != nil {
		return err
	}
	if err := f.writeOptionStruct("MaxAttempts", "uint", true, asIdempotentRequestOption); err != nil {
		return err
	}

	if auth != nil {
		for _, authScheme := range auth.Schemes {
			if authScheme.Bearer != nil {
				var (
					pascalCase = authScheme.Bearer.Token.PascalCase.UnsafeName
					goType     = "string"
				)
				if err := f.writeOptionStruct(pascalCase, goType, true, asIdempotentRequestOption); err != nil {
					return err
				}
			}
			if authScheme.Basic != nil {
				// The basic auth option requires special care because it requires
				// two parameters.
				f.P("// BasicAuthOption implements the RequestOption interface.")
				f.P("type BasicAuthOption struct {")
				f.P("Username string")
				f.P("Password string")
				f.P("}")
				f.P()

				f.P("func (b *BasicAuthOption) applyRequestOptions(opts *RequestOptions) {")
				f.P("opts.Username = b.Username")
				f.P("opts.Password = b.Password")
				f.P("}")
				f.P()
			}
			if authScheme.Header != nil {
				if authScheme.Header.ValueType.Container != nil && authScheme.Header.ValueType.Container.Literal != nil {
					// We don't want to generate a request option for literal values.
					continue
				}
				var (
					pascalCase = authScheme.Header.Name.Name.PascalCase.UnsafeName
					goType     = typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.scope, f.baseImportPath, "" /* The type is always imported */, false)
				)
				if err := f.writeOptionStruct(pascalCase, goType, true, asIdempotentRequestOption); err != nil {
					return err
				}
			}
		}
	}

	for _, header := range headers {
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			// We don't want to generate a request option for literal values.
			continue
		}
		var (
			pascalCase = header.Name.Name.PascalCase.UnsafeName
			goType     = typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, "" /* The type is always imported */, false)
		)
		if err := f.writeOptionStruct(pascalCase, goType, true, asIdempotentRequestOption); err != nil {
			return err
		}
	}

	return nil
}

// writeOptionStruct writes an individual option struct, like the following:
//
//	type BaseURLOption struct {
//	  BaseURL string
//	}
func (f *fileWriter) writeOptionStruct(
	pascalCase string,
	goType string,
	asRequestOption bool,
	asIdempotentRequestOption bool,
) error {
	var (
		typeName = pascalCase + "Option"
		receiver = typeNameToReceiver(typeName)
	)
	f.P("// ", typeName, " implements the RequestOption interface.")
	f.P("type ", typeName, " struct {")
	f.P(pascalCase, " ", goType)
	f.P("}")
	f.P()

	if asRequestOption {
		f.P("func (", receiver, " *", typeName, ") applyRequestOptions(opts *RequestOptions) {")
		f.P("opts.", pascalCase, " = ", receiver, ".", pascalCase)
		f.P("}")
		f.P()
	}

	if asIdempotentRequestOption {
		f.P("func (", receiver, " *", typeName, ") applyIdempotentRequestOptions(opts *IdempotentRequestOptions) {")
		f.P("opts.", pascalCase, " = ", receiver, ".", pascalCase)
		f.P("}")
		f.P()
	}

	return nil
}

type GeneratedAuth struct {
	Option          ast.Expr // e.g. acmeclient.WithAuthToken("<YOUR_AUTH_TOKEN>")
	EnvironmentVars []string // e.g. ACME_API_KEY
}

// WriteIdempotentRequestOptions writes the idempotent request options available to the
// user.
func (f *fileWriter) WriteIdempotentRequestOptions(
	idempotencyHeaders []*ir.HttpHeader,
) error {
	importPath := path.Join(f.baseImportPath, "option")

	// Generate the option.RequestOption type alias.
	f.P("// IdempotentRequestOption adapts the behavior of an indivdual request.")
	f.P("type IdempotentRequestOption = core.IdempotentRequestOption")

	for _, header := range idempotencyHeaders {
		var (
			pascalCase = header.Name.Name.PascalCase.UnsafeName
			camelCase  = header.Name.Name.CamelCase.SafeName
			optionName = fmt.Sprintf("With%s", pascalCase)
			goType     = typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
		)
		f.P("// ", optionName, " sets the ", camelCase, " request header.")
		if header.Docs != nil && len(*header.Docs) > 0 {
			// If the header has any custom documentation, include it immediately below the standard
			// option signature comment.
			f.P("//")
			f.WriteDocs(header.Docs)
		}
		typeName := "core." + pascalCase + "Option"
		f.P("func ", optionName, "(", camelCase, " ", goType, ") *", typeName, " {")
		f.P("return &", typeName, "{")
		f.P(pascalCase, ": ", camelCase, ",")
		f.P("}")
		f.P("}")
	}

	return nil
}

// WriteRequestOptions writes the request options available to the user.
func (f *fileWriter) WriteRequestOptions(
	auth *ir.ApiAuth,
	headers []*ir.HttpHeader,
) (*GeneratedAuth, error) {
	// Now that we know where the types will be generated, format the generated type names as needed.
	var (
		importPath     = path.Join(f.baseImportPath, "option")
		httpClientType = "core.HTTPClient"
	)

	// Generate the option.RequestOption type alias.
	f.P("// RequestOption adapts the behavior of an indivdual request.")
	f.P("type RequestOption = core.RequestOption")

	// Generate the options for setting the base URL and HTTP client.
	f.P("// WithBaseURL sets the base URL, overriding the default")
	f.P("// environment, if any.")
	f.P("func WithBaseURL(baseURL string) *core.BaseURLOption {")
	f.P("return &core.BaseURLOption{")
	f.P("BaseURL: baseURL,")
	f.P("}")
	f.P("}")
	f.P()
	f.P("// WithHTTPClient uses the given HTTPClient to issue the request.")
	f.P("func WithHTTPClient(httpClient ", httpClientType, ") *core.HTTPClientOption {")
	f.P("return &core.HTTPClientOption{")
	f.P("HTTPClient: httpClient,")
	f.P("}")
	f.P("}")
	f.P()
	f.P("// WithHTTPHeader adds the given http.Header to the request.")
	f.P("func WithHTTPHeader(httpHeader http.Header) *core.HTTPHeaderOption {")
	f.P("return &core.HTTPHeaderOption{")
	f.P("// Clone the headers so they can't be modified after the option call.")
	f.P("HTTPHeader: httpHeader.Clone(),")
	f.P("}")
	f.P("}")
	f.P()
	f.P("// WithMaxAttempts configures the maximum number of retry attempts.")
	f.P("func WithMaxAttempts(attempts uint) *core.MaxAttemptsOption {")
	f.P("return &core.MaxAttemptsOption{")
	f.P("MaxAttempts: attempts,")
	f.P("}")
	f.P("}")
	f.P()

	// Generate the auth functional options.
	includeCustomAuthDocs := auth.Docs != nil && len(*auth.Docs) > 0

	var (
		option          ast.Expr
		environmentVars []string
	)
	for i, authScheme := range auth.Schemes {
		if authScheme.Bearer != nil {
			var (
				pascalCase = authScheme.Bearer.Token.PascalCase.UnsafeName
				camelCase  = authScheme.Bearer.Token.CamelCase.SafeName
				optionName = fmt.Sprintf("With%s", pascalCase)
			)
			if i == 0 {
				option = ast.NewCallExpr(
					ast.NewImportedReference(
						optionName,
						importPath,
					),
					[]ast.Expr{
						ast.NewBasicLit(`"<YOUR_AUTH_TOKEN>"`),
					},
				)
				if authScheme.Bearer.TokenEnvVar != nil {
					environmentVars = append(environmentVars, *authScheme.Bearer.TokenEnvVar)
				}
			}
			f.P("// ", optionName, " sets the 'Authorization: Bearer <", camelCase, ">' request header.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			typeName := "core." + pascalCase + "Option"
			f.P("func ", optionName, "(", camelCase, " string) *", typeName, " {")
			f.P("return &", typeName, "{")
			f.P(pascalCase, ": ", camelCase, ",")
			f.P("}")
			f.P("}")
			f.P()
		}
		if authScheme.Basic != nil {
			if i == 0 {
				option = ast.NewCallExpr(
					ast.NewImportedReference(
						"WithBasicAuth",
						importPath,
					),
					[]ast.Expr{
						ast.NewBasicLit(`"<YOUR_USERNAME>"`),
						ast.NewBasicLit(`"<YOUR_PASSWORD>"`),
					},
				)
				if authScheme.Basic.UsernameEnvVar != nil && authScheme.Basic.PasswordEnvVar != nil {
					environmentVars = append(environmentVars, *authScheme.Basic.UsernameEnvVar)
					environmentVars = append(environmentVars, *authScheme.Basic.PasswordEnvVar)
				}
			}
			f.P("// WithBasicAuth sets the 'Authorization: Basic <base64>' request header.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			typeName := "core.BasicAuthOption"
			f.P("func WithBasicAuth(username, password string) *", typeName, " {")
			f.P("return &", typeName, "{")
			f.P("Username: username,")
			f.P("Password: password,")
			f.P("}")
			f.P("}")
			f.P()
		}
		if authScheme.Header != nil {
			if authScheme.Header.ValueType.Container != nil && authScheme.Header.ValueType.Container.Literal != nil {
				// We don't want to generate a request option for literal values.
				continue
			}
			var (
				pascalCase = authScheme.Header.Name.Name.PascalCase.UnsafeName
				optionName = fmt.Sprintf("With%s", pascalCase)
				field      = authScheme.Header.Name.Name.PascalCase.UnsafeName
				param      = authScheme.Header.Name.Name.CamelCase.SafeName
				value      = typeReferenceToGoType(authScheme.Header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
			)
			if i == 0 {
				option = ast.NewCallExpr(
					ast.NewImportedReference(
						optionName,
						importPath,
					),
					[]ast.Expr{
						ast.NewBasicLit(fmt.Sprintf(`"<YOUR_%s>"`, pascalCase)),
					},
				)
				if authScheme.Header.HeaderEnvVar != nil {
					environmentVars = append(environmentVars, *authScheme.Header.HeaderEnvVar)
				}
			}
			f.P("// ", optionName, " sets the ", param, " auth request header.")
			if includeCustomAuthDocs {
				f.P("//")
				f.WriteDocs(auth.Docs)
			}
			typeName := "core." + pascalCase + "Option"
			f.P("func ", optionName, "(", param, " ", value, ") *", typeName, " {")
			f.P("return &", typeName, "{")
			f.P(field, ": ", param, ",")
			f.P("}")
			f.P("}")
			f.P()
		}
	}

	for _, header := range headers {
		if header.ValueType.Container != nil && header.ValueType.Container.Literal != nil {
			// We don't want to generate a request option for literal values.
			continue
		}
		var (
			pascalCase = header.Name.Name.PascalCase.UnsafeName
			optionName = fmt.Sprintf("With%s", pascalCase)
			field      = header.Name.Name.PascalCase.UnsafeName
			param      = header.Name.Name.CamelCase.SafeName
			value      = typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
		)
		f.P("// ", optionName, " sets the ", param, " request header.")
		if header.Docs != nil && len(*header.Docs) > 0 {
			// If the header has any custom documentation, include it immediately below the standard
			// option signature comment.
			f.P("//")
			f.WriteDocs(header.Docs)
		}
		typeName := "core." + pascalCase + "Option"
		f.P("func ", optionName, "(", param, " ", value, ") *", typeName, " {")
		f.P("return &", typeName, "{")
		f.P(field, ": ", param, ",")
		f.P("}")
		f.P("}")
		f.P()
	}
	if option == nil {
		return nil, nil
	}
	return &GeneratedAuth{
		Option:          option,
		EnvironmentVars: environmentVars,
	}, nil
}

type GeneratedClient struct {
	Instantiation *ast.AssignStmt
	Endpoints     []*GeneratedEndpoint
}

type GeneratedEndpoint struct {
	Identifier *generatorexec.EndpointIdentifier
	Snippet    ast.Expr
}

// WriteClient writes a client for interacting with the given service.
func (f *fileWriter) WriteClient(
	irAuth *ir.ApiAuth,
	irEndpoints []*ir.HttpEndpoint,
	headers []*ir.HttpHeader,
	idempotencyHeaders []*ir.HttpHeader,
	subpackages []*ir.Subpackage,
	environmentsConfig *ir.EnvironmentsConfig,
	errorDiscriminationStrategy *ir.ErrorDiscriminationStrategy,
	fernFilepath *ir.FernFilepath,
	rootClientInstantiation *ast.AssignStmt,
) (*GeneratedClient, error) {
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
		endpoint, err := f.endpointFromIR(fernFilepath, irEndpoint, environmentsConfig, idempotencyHeaders, receiver)
		if err != nil {
			return nil, err
		}
		endpoints = append(endpoints, endpoint)
	}

	// Generate the client implementation.
	f.P("type ", clientName, " struct {")
	f.P("baseURL string")
	f.P("caller *core.Caller")
	f.P("header http.Header")
	f.P()
	for _, subpackage := range subpackages {
		var (
			importPath     = packagePathToImportPath(f.baseImportPath, packagePathForClient(subpackage.FernFilepath))
			clientTypeName = f.scope.AddImport(importPath) + "." + clientName
		)
		f.P(subpackage.Name.PascalCase.UnsafeName, " *", clientTypeName)
	}
	f.P("}")
	f.P()

	// Generate the client constructor.
	f.P("func New", clientName, "(opts ...option.RequestOption) *", clientName, " {")
	f.P("options := core.NewRequestOptions(opts...)")
	for _, authScheme := range irAuth.Schemes {
		if authScheme.Bearer != nil && authScheme.Bearer.TokenEnvVar != nil {
			f.P("if options.", authScheme.Bearer.Token.PascalCase.UnsafeName, ` == "" {`)
			f.P("options. ", authScheme.Bearer.Token.PascalCase.UnsafeName, ` = os.Getenv("`, *authScheme.Bearer.TokenEnvVar, `")`)
			f.P("}")
			continue
		}
		if authScheme.Basic != nil && authScheme.Basic.UsernameEnvVar != nil && authScheme.Basic.PasswordEnvVar != nil {
			f.P("if options.", authScheme.Basic.Username.PascalCase.UnsafeName, ` == "" {`)
			f.P("options. ", authScheme.Basic.Username.PascalCase.UnsafeName, ` = os.Getenv("`, *authScheme.Basic.UsernameEnvVar, `")`)
			f.P("}")
			f.P("if options.", authScheme.Basic.Password.PascalCase.UnsafeName, ` == "" {`)
			f.P("options. ", authScheme.Basic.Password.PascalCase.UnsafeName, ` = os.Getenv("`, *authScheme.Basic.PasswordEnvVar, `")`)
			f.P("}")
			continue
		}
		if header := authScheme.Header; header != nil && header.HeaderEnvVar != nil {
			f.P("if options.", header.Name.Name.PascalCase.UnsafeName, ` == "" {`)
			f.P("options. ", header.Name.Name.PascalCase.UnsafeName, ` = os.Getenv("`, *header.HeaderEnvVar, `")`)
			f.P("}")
			continue
		}
	}
	for _, header := range headers {
		if header.Env != nil {
			f.P("if options.", header.Name.Name.PascalCase.UnsafeName, ` == "" {`)
			f.P("options. ", header.Name.Name.PascalCase.UnsafeName, ` = os.Getenv("`, *header.Env, `")`)
			f.P("}")
			continue
		}
	}
	f.P("return &", clientName, "{")
	f.P(`baseURL: options.BaseURL,`)
	f.P("caller: core.NewCaller(")
	f.P("&core.CallerParams{")
	f.P("Client: options.HTTPClient,")
	f.P("MaxAttempts: options.MaxAttempts,")
	f.P("},")
	f.P("),")
	f.P("header: options.ToHeader(),")
	for _, subpackage := range subpackages {
		var (
			importPath        = packagePathToImportPath(f.baseImportPath, packagePathForClient(subpackage.FernFilepath))
			clientConstructor = f.scope.AddImport(importPath) + ".NewClient(opts...),"
		)
		f.P(subpackage.Name.PascalCase.UnsafeName, ": ", clientConstructor)
	}
	f.P("}")
	f.P("}")
	f.P()

	// Implement this service's methods.
	for _, endpoint := range endpoints {
		f.WriteDocs(endpoint.Docs)
		f.P("func (", receiver, " *", clientName, ") ", endpoint.Name.PascalCase.UnsafeName, "(")
		for _, signatureParameter := range endpoint.SignatureParameters {
			f.WriteDocs(signatureParameter.docs)
			f.P(signatureParameter.parameter, ",")
		}
		f.P(") ", endpoint.ReturnValues, " {")
		// Compose all the request options.
		f.P("options := ", endpoint.OptionConstructor)
		f.P()
		// Compose the URL, including any query parameters.
		f.P(fmt.Sprintf("baseURL := %q", endpoint.BaseURL))
		f.P("if ", fmt.Sprintf("%s.baseURL", receiver), ` != "" {`)
		f.P("baseURL = ", fmt.Sprintf("%s.baseURL", receiver))
		f.P("}")
		f.P(`if options.BaseURL != "" {`)
		f.P("baseURL = options.BaseURL")
		f.P("}")
		baseURLVariable := "baseURL"
		if len(endpoint.PathSuffix) > 0 {
			baseURLVariable = `baseURL + ` + fmt.Sprintf(`"/%s"`, endpoint.PathSuffix)
		}
		if len(endpoint.PathParameterNames) > 0 {
			if len(endpoint.PathParameterNames) == 1 {
				f.P("endpointURL := core.EncodeURL(", baseURLVariable, ", ", endpoint.PathParameterNames[0], ")")
			} else {
				f.P("endpointURL := core.EncodeURL(")
				f.P(baseURLVariable, ", ")
				for _, pathParameterName := range endpoint.PathParameterNames {
					f.P(pathParameterName, ",")
				}
				f.P(")")
			}
		} else {
			f.P(fmt.Sprintf("endpointURL := %s", baseURLVariable))
		}
		if len(endpoint.QueryParameters) > 0 {
			f.P()
			f.P("queryParams, err := core.QueryValues(", endpoint.RequestParameterName, ")")
			f.P("if err != nil {")
			f.P("return ", endpoint.ErrorReturnValues)
			f.P("}")
			for _, queryParameter := range endpoint.QueryParameters {
				if isLiteral := (queryParameter.ValueType.Container != nil && queryParameter.ValueType.Container.Literal != nil); isLiteral {
					f.P(`queryParams.Add("`, queryParameter.Name.WireValue, `", fmt.Sprintf("%v", `, literalToValue(queryParameter.ValueType.Container.Literal), "))")
				}
			}
			if endpoint.PaginationInfo == nil {
				f.P("if len(queryParams) > 0 {")
				f.P(`endpointURL += "?" + queryParams.Encode()`)
				f.P("}")
			}
		}

		headersParameter := "headers"
		f.P()
		f.P(headersParameter, " := core.MergeHeaders(", receiver, ".header.Clone(), options.ToHeader())")
		if len(endpoint.Headers) > 0 {
			// Add endpoint-specific headers from the request, if any.
			for _, header := range endpoint.Headers {
				valueTypeFormat := formatForValueType(header.ValueType, f.types)
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
		}
		if endpoint.ContentType != "" {
			f.P(fmt.Sprintf(`%s.Set("Content-Type", %q)`, headersParameter, endpoint.ContentType))
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
				f.P("return apiError")
				f.P("}")
			}
			f.P("switch ", switchValue, " {")
			for _, responseError := range endpoint.Errors {
				var (
					errorDeclaration = f.errors[responseError.Error.ErrorId]
					errorImportPath  = fernFilepathToImportPath(f.baseImportPath, errorDeclaration.Name.FernFilepath)
					errorType        = f.scope.AddImport(errorImportPath) + "." + errorDeclaration.Name.Name.PascalCase.UnsafeName
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
				f.P("return apiError")
				f.P("}")
				f.P("return value")
			}
			// Close the switch statement.
			f.P("}")
			f.P("return apiError")
			f.P("}")
			f.P()
		}

		if endpoint.RequestIsBytes {
			if endpoint.RequestIsOptional {
				f.P("var requestBuffer io.Reader")
				f.P("if ", endpoint.RequestBytesParameterName, " != nil {")
				f.P("requestBuffer = bytes.NewBuffer(", endpoint.RequestBytesParameterName, ")")
				f.P("}")
			} else {
				f.P("requestBuffer := bytes.NewBuffer(", endpoint.RequestBytesParameterName, ")")
			}
			f.P()
		}

		// Prepare a response variable.
		if endpoint.ResponseType != "" && !endpoint.IsStreaming && endpoint.PaginationInfo == nil {
			f.P(fmt.Sprintf(endpoint.ResponseInitializerFormat, endpoint.ResponseType))
		}

		if len(endpoint.FileProperties) > 0 || len(endpoint.FileBodyProperties) > 0 {
			f.P("requestBuffer := bytes.NewBuffer(nil)")
			f.P("writer := multipart.NewWriter(requestBuffer)")
			for _, fileProperty := range endpoint.FileProperties {
				filePropertyInfo, err := filePropertyToInfo(fileProperty)
				if err != nil {
					return nil, err
				}
				var (
					fileVariable     = filePropertyInfo.Key.Name.CamelCase.SafeName
					filenameVariable = filePropertyInfo.Key.Name.CamelCase.UnsafeName + "Filename"
					filenameValue    = filePropertyInfo.Key.Name.CamelCase.UnsafeName + "_filename"
					partVariable     = filePropertyInfo.Key.Name.CamelCase.UnsafeName + "Part"
				)
				if filePropertyInfo.IsArray {
					// We don't care whether the file array is optional or not; the range
					// handles that for us.
					f.P("for i, f := range ", fileVariable, "{")
					f.P(filenameVariable, ` := fmt.Sprintf("`, filenameValue, `_%d", i)`)
					f.P("if named, ok := f.(interface{ Name() string }); ok {")
					f.P(fmt.Sprintf("%s = named.Name()", filenameVariable))
					f.P("}")
					f.P(partVariable, `, err := writer.CreateFormFile("`, filePropertyInfo.Key.WireValue, `", `, filenameVariable, ")")
					f.P("if err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
					f.P("if _, err := io.Copy(", partVariable, ", f); err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
					f.P("}")
				} else {
					if filePropertyInfo.IsOptional {
						f.P("if ", fileVariable, " != nil {")
					}
					f.P(fmt.Sprintf("%s := %q", filenameVariable, filenameValue))
					f.P("if named, ok := ", fileVariable, ".(interface{ Name() string }); ok {")
					f.P(fmt.Sprintf("%s = named.Name()", filenameVariable))
					f.P("}")
					f.P(partVariable, `, err := writer.CreateFormFile("`, filePropertyInfo.Key.WireValue, `", `, filenameVariable, ")")
					f.P("if err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
					f.P("if _, err := io.Copy(", partVariable, ", ", fileVariable, "); err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
					if filePropertyInfo.IsOptional {
						f.P("}")
					}
				}
			}

			for _, fileBodyProperty := range endpoint.FileBodyProperties {
				if isLiteral := (fileBodyProperty.ValueType.Container != nil && fileBodyProperty.ValueType.Container.Literal != nil); isLiteral {
					f.P(`if err := writer.WriteField("`, fileBodyProperty.Name.WireValue, `", fmt.Sprintf("%v", `, literalToValue(fileBodyProperty.ValueType.Container.Literal), ")); err != nil {")
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
					continue
				}
				valueTypeFormat := formatForValueType(fileBodyProperty.ValueType, f.types)
				requestField := valueTypeFormat.Prefix + endpoint.RequestParameterName + "." + fileBodyProperty.Name.Name.PascalCase.UnsafeName + valueTypeFormat.Suffix

				// Encapsulate the multipart form WriteField in a closure so that we can easily
				// wrap it with an optional nil check below.
				writeField := func() {
					if !valueTypeFormat.IsPrimitive {
						// Non-primitive types need to be JSON-serialized (e.g. lists, objects, etc).
						f.P(`if err := core.WriteMultipartJSON(writer, "`, fileBodyProperty.Name.WireValue, `", `, requestField, "); err != nil {")
					} else {
						f.P(`if err := writer.WriteField("`, fileBodyProperty.Name.WireValue, `", fmt.Sprintf("%v", `, requestField, ")); err != nil {")
					}
					f.P("return ", endpoint.ErrorReturnValues)
					f.P("}")
				}

				if valueTypeFormat.IsOptional {
					f.P("if ", endpoint.RequestParameterName, ".", fileBodyProperty.Name.Name.PascalCase.UnsafeName, "!= nil {")
					writeField()
					f.P("}")
				} else {
					writeField()
				}
			}
			f.P("if err := writer.Close(); err != nil {")
			f.P("return ", endpoint.ErrorReturnValues)
			f.P("}")
			f.P(headersParameter, `.Set("Content-Type", writer.FormDataContentType())`)
			f.P()
		}

		// Issue the request.
		if endpoint.IsStreaming {
			f.P("streamer := core.NewStreamer[", endpoint.ResponseType, "](", receiver, ".caller)")
			f.P("return streamer.Stream(")
			f.P("ctx,")
			f.P("&core.StreamParams{")
			f.P("URL: endpointURL, ")
			f.P("Method:", endpoint.Method, ",")
			f.P("MaxAttempts: options.MaxAttempts,")
			f.P("Headers:", headersParameter, ",")
			f.P("Client: options.HTTPClient,")
			if endpoint.RequestValueName != "" {
				f.P("Request: ", endpoint.RequestValueName, ",")
			}
			if endpoint.ErrorDecoderParameterName != "" {
				f.P("ErrorDecoder:", endpoint.ErrorDecoderParameterName, ",")
			}
			if endpoint.StreamDelimiter != "" {
				f.P("Delimiter: ", endpoint.StreamDelimiter, ",")
			}
			f.P("},")
			f.P(")")
			f.P("}")
			f.P()
		} else if endpoint.PaginationInfo != nil {
			f.P("prepareCall := func(pageRequest *core.PageRequest[", endpoint.PaginationInfo.PageGoType, "]) *core.CallParams {")
			f.P("if pageRequest.Cursor != ", endpoint.PaginationInfo.PageZeroValue, " {")
			f.P(endpoint.PaginationInfo.SetPageRequestParameter)
			f.P("}")
			f.P("nextURL := endpointURL")
			f.P("if len(queryParams) > 0 {")
			f.P(`nextURL += "?" + queryParams.Encode()`)
			f.P("}")
			f.P("return &core.CallParams{")
			f.P("URL: nextURL, ")
			f.P("Method:", endpoint.Method, ",")
			f.P("MaxAttempts: options.MaxAttempts,")
			f.P("Headers:", headersParameter, ",")
			f.P("Client: options.HTTPClient,")
			if endpoint.RequestValueName != "" {
				f.P("Request: ", endpoint.RequestValueName, ",")
			}
			if endpoint.ResponseParameterName != "" {
				f.P("Response: ", endpoint.ResponseParameterName, ",")
			}
			if endpoint.ResponseIsOptionalParameter {
				f.P("ResponseIsOptional: true,")
			}
			if endpoint.ErrorDecoderParameterName != "" {
				f.P("ErrorDecoder:", endpoint.ErrorDecoderParameterName, ",")
			}
			f.P("}")
			f.P("}")

			var pagerConstructor string
			switch endpoint.PaginationInfo.Type {
			case "cursor":
				pagerConstructor = "core.NewCursorPager"

				f.P("readPageResponse := func(response ", endpoint.ResponseType, ") *core.PageResponse[", endpoint.PaginationInfo.PageGoType, ",", endpoint.PaginationInfo.ResultsSingleGoType, "] {")
				if len(endpoint.PaginationInfo.NextCursor.PropertyPath) > 0 {
					f.P("var next ", endpoint.PaginationInfo.NextCursorGoType)
					f.P(endpoint.PaginationInfo.NextCursorNilCheck)
					f.P("next = ", endpoint.PaginationInfo.NextCursorPropertyPath, endpoint.PaginationInfo.NextCursor.Property.Name.Name.PascalCase.UnsafeName)
					f.P("}")
				} else {
					f.P("next := ", endpoint.PaginationInfo.NextCursorPropertyPath, endpoint.PaginationInfo.NextCursor.Property.Name.Name.PascalCase.UnsafeName)
				}
				if len(endpoint.PaginationInfo.Results.PropertyPath) > 0 {
					f.P("var results ", endpoint.PaginationInfo.ResultsGoType)
					f.P(endpoint.PaginationInfo.ResultsNilCheck)
					f.P("results = ", endpoint.PaginationInfo.ResultsPropertyPath, endpoint.PaginationInfo.Results.Property.Name.Name.PascalCase.UnsafeName)
					f.P("}")
				} else {
					f.P("results := ", endpoint.PaginationInfo.ResultsPropertyPath, endpoint.PaginationInfo.Results.Property.Name.Name.PascalCase.UnsafeName)
				}

				if endpoint.PaginationInfo.NextCursorIsOptional && !endpoint.PaginationInfo.PageIsOptional {
					f.P("if next == nil {")
					f.P("return &core.PageResponse[", endpoint.PaginationInfo.PageGoType, ",", endpoint.PaginationInfo.ResultsSingleGoType, "]{")
					f.P("Results: results,")
					f.P("}")
					f.P("}")
				}

				f.P("return &core.PageResponse[", endpoint.PaginationInfo.PageGoType, ",", endpoint.PaginationInfo.ResultsSingleGoType, "]{")
				if endpoint.PaginationInfo.PageIsOptional != endpoint.PaginationInfo.NextCursorIsOptional {
					if endpoint.PaginationInfo.NextCursorIsOptional {
						f.P("Next: *next,")
					} else {
						f.P("Next: &next,")
					}
				} else {
					f.P("Next: next,")
				}
				f.P("Results: results,")
				f.P("}")
				f.P("}")
			case "offset":
				pagerConstructor = "core.NewOffsetPager"

				f.P("next := 1")
				if len(endpoint.PaginationInfo.PageNilCheck) > 0 {
					f.P(endpoint.PaginationInfo.PageNilCheck)
					if endpoint.PaginationInfo.PageIsOptional {
						f.P("next = *", endpoint.RequestParameterName, ".", endpoint.PaginationInfo.Page.Name.Name.PascalCase.UnsafeName)
					} else {
						f.P("next = ", endpoint.RequestParameterName, ".", endpoint.PaginationInfo.Page.Name.Name.PascalCase.UnsafeName)
					}
					f.P("}")
				}

				f.P("readPageResponse := func(response ", endpoint.ResponseType, ") *core.PageResponse[", endpoint.PaginationInfo.PageGoType, ",", endpoint.PaginationInfo.ResultsSingleGoType, "] {")
				f.P("next += 1")
				if len(endpoint.PaginationInfo.Results.PropertyPath) > 0 {
					f.P("var results ", endpoint.PaginationInfo.ResultsGoType)
					f.P(endpoint.PaginationInfo.ResultsNilCheck)
					f.P("results = ", endpoint.PaginationInfo.ResultsPropertyPath, endpoint.PaginationInfo.Results.Property.Name.Name.PascalCase.UnsafeName)
					f.P("}")
				} else {
					f.P("results := ", endpoint.PaginationInfo.ResultsPropertyPath, endpoint.PaginationInfo.Results.Property.Name.Name.PascalCase.UnsafeName)
				}

				f.P("return &core.PageResponse[", endpoint.PaginationInfo.PageGoType, ",", endpoint.PaginationInfo.ResultsSingleGoType, "]{")
				f.P("Next: ", endpoint.PaginationInfo.PageFirstRequestParameter, ",")
				f.P("Results: results,")
				f.P("}")
				f.P("}")
			}

			f.P("pager := ", pagerConstructor, "(")
			f.P(receiver, ".caller,")
			f.P("prepareCall,")
			f.P("readPageResponse,")
			f.P(")")

			f.P("return pager.GetPage(ctx, ", endpoint.PaginationInfo.PageFirstRequestParameter, ")")
			f.P("}")
			f.P()
		} else {
			f.P("if err := ", receiver, ".caller.Call(")
			f.P("ctx,")
			f.P("&core.CallParams{")
			f.P("URL: endpointURL, ")
			f.P("Method:", endpoint.Method, ",")
			f.P("MaxAttempts: options.MaxAttempts,")
			f.P("Headers:", headersParameter, ",")
			f.P("Client: options.HTTPClient,")
			if endpoint.RequestValueName != "" {
				f.P("Request: ", endpoint.RequestValueName, ",")
			}
			if endpoint.ResponseParameterName != "" {
				f.P("Response: ", endpoint.ResponseParameterName, ",")
			}
			if endpoint.ResponseIsOptionalParameter {
				f.P("ResponseIsOptional: true,")
			}
			if endpoint.ErrorDecoderParameterName != "" {
				f.P("ErrorDecoder:", endpoint.ErrorDecoderParameterName, ",")
			}
			f.P("},")
			f.P("); err != nil {")
			f.P("return ", endpoint.ErrorReturnValues)
			f.P("}")
			f.P("return ", endpoint.SuccessfulReturnValues)
			f.P("}")
			f.P()
		}
	}
	return NewGeneratedClient(
		f,
		fernFilepath,
		irEndpoints,
		rootClientInstantiation,
	)
}

type paginationInfo struct {
	Type                      string
	Page                      *ir.QueryParameter
	PageNilCheck              string
	PageGoType                string
	PageZeroValue             string
	PageFirstRequestParameter string
	PageIsOptional            bool
	SetPageRequestParameter   string
	Results                   *ir.ResponseProperty
	ResultsPropertyPath       string
	ResultsNilCheck           string
	ResultsGoType             string
	ResultsSingleGoType       string

	// NextCursor is only relevant for cursor pagination.
	NextCursor             *ir.ResponseProperty
	NextCursorPropertyPath string
	NextCursorNilCheck     string
	NextCursorGoType       string
	NextCursorIsOptional   bool
}

func (f *fileWriter) getPaginationInfo(
	irEndpoint *ir.HttpEndpoint,
	scope *gospec.Scope,
	requestParameterName string,
) (*paginationInfo, error) {
	if irEndpoint.Pagination == nil {
		return nil, nil
	}
	pagination := irEndpoint.Pagination
	switch t := pagination.Type; t {
	case "cursor":
		resultsSingleType, err := singleTypeReferenceFromResponseProperty(pagination.Cursor.Results)
		if err != nil {
			return nil, err
		}
		var (
			pageIsOptional       = pagination.Cursor.Page.ValueType.Container != nil && pagination.Cursor.Page.ValueType.Container.Optional != nil
			nextCursorIsOptional = pagination.Cursor.Next.Property.ValueType.Container != nil && pagination.Cursor.Next.Property.ValueType.Container.Optional != nil
			valueTypeFormat      = formatForValueType(pagination.Cursor.Page.ValueType, f.types)
			value                = valueTypeFormat.Prefix + "pageRequest.Cursor" + valueTypeFormat.Suffix
			wireValue            = pagination.Cursor.Page.Name.WireValue
		)
		return &paginationInfo{
			Type:                      t,
			Page:                      pagination.Cursor.Page,
			PageNilCheck:              fmt.Sprintf("if %s.%s != %s {", requestParameterName, pagination.Cursor.Page.Name.Name.PascalCase.UnsafeName, valueTypeFormat.ZeroValue),
			PageGoType:                typeReferenceToGoType(pagination.Cursor.Page.ValueType, f.types, scope, f.baseImportPath, "", false),
			PageZeroValue:             valueTypeFormat.ZeroValue,
			PageFirstRequestParameter: fmt.Sprintf("%s.%s", requestParameterName, pagination.Cursor.Page.Name.Name.PascalCase.UnsafeName),
			PageIsOptional:            pageIsOptional,
			SetPageRequestParameter:   `queryParams.Set("` + wireValue + `", fmt.Sprintf("%v", ` + value + `))`,
			Results:                   pagination.Cursor.Results,
			ResultsPropertyPath:       responsePropertyPathToFullPathString("response", pagination.Cursor.Results.PropertyPath),
			ResultsNilCheck:           responsePropertyPathToNilCheck("response", pagination.Cursor.Results.PropertyPath),
			ResultsSingleGoType:       typeReferenceToGoType(resultsSingleType, f.types, scope, f.baseImportPath, "", false),
			ResultsGoType:             typeReferenceToGoType(pagination.Cursor.Results.Property.ValueType, f.types, scope, f.baseImportPath, "", false),
			NextCursor:                pagination.Cursor.Next,
			NextCursorPropertyPath:    responsePropertyPathToFullPathString("response", pagination.Cursor.Next.PropertyPath),
			NextCursorNilCheck:        responsePropertyPathToNilCheck("response", pagination.Cursor.Next.PropertyPath),
			NextCursorGoType:          typeReferenceToGoType(pagination.Cursor.Next.Property.ValueType, f.types, scope, f.baseImportPath, "", false),
			NextCursorIsOptional:      nextCursorIsOptional,
		}, nil
	case "offset":
		resultsSingleType, err := singleTypeReferenceFromResponseProperty(pagination.Offset.Results)
		if err != nil {
			return nil, err
		}
		var (
			pageIsOptional  = pagination.Offset.Page.ValueType.Container != nil && pagination.Offset.Page.ValueType.Container.Optional != nil
			valueTypeFormat = formatForValueType(pagination.Offset.Page.ValueType, f.types)
			value           = valueTypeFormat.Prefix + "pageRequest.Cursor" + valueTypeFormat.Suffix
			wireValue       = pagination.Offset.Page.Name.WireValue
		)
		pageFirstRequestParameter := "next"
		if pageIsOptional {
			pageFirstRequestParameter = "&next"
		}
		return &paginationInfo{
			Type:                      t,
			Page:                      pagination.Offset.Page,
			PageNilCheck:              fmt.Sprintf("if %s.%s != %s {", requestParameterName, pagination.Offset.Page.Name.Name.PascalCase.UnsafeName, valueTypeFormat.ZeroValue),
			PageGoType:                typeReferenceToGoType(pagination.Offset.Page.ValueType, f.types, scope, f.baseImportPath, "", false),
			PageZeroValue:             valueTypeFormat.ZeroValue,
			PageFirstRequestParameter: pageFirstRequestParameter,
			PageIsOptional:            pageIsOptional,
			SetPageRequestParameter:   `queryParams.Set("` + wireValue + `", fmt.Sprintf("%v", ` + value + `))`,
			Results:                   pagination.Offset.Results,
			ResultsPropertyPath:       responsePropertyPathToFullPathString("response", pagination.Offset.Results.PropertyPath),
			ResultsNilCheck:           responsePropertyPathToNilCheck("response", pagination.Offset.Results.PropertyPath),
			ResultsGoType:             typeReferenceToGoType(pagination.Offset.Results.Property.ValueType, f.types, scope, f.baseImportPath, "", false),
			ResultsSingleGoType:       typeReferenceToGoType(resultsSingleType, f.types, scope, f.baseImportPath, "", false),
		}, nil
	default:
		return nil, fmt.Errorf("%s pagination is not supported yet", t)
	}
}

func singleTypeReferenceFromResponseProperty(responseProperty *ir.ResponseProperty) (*ir.TypeReference, error) {
	if responseProperty == nil {
		return nil, nil
	}
	property := responseProperty.Property
	if property != nil && property.ValueType != nil {
		valueType := property.ValueType
		if property.ValueType.Container != nil && property.ValueType.Container.Optional != nil {
			valueType = property.ValueType.Container.Optional
		}
		switch valueType.Type {
		case "container":
			switch valueType.Container.Type {
			case "list":
				return valueType.Container.List, nil
			case "set":
				return valueType.Container.Set, nil
			}
		}
		return nil, fmt.Errorf("unsupported pagination results type %q", valueType.Type)
	}
	return nil, nil
}

// responsePropertyPathToString returns if condition that ensures we don't accidentally
// cause a nil-dereference when accessing a response property path.
//
// Note that when we support method getters, we can simplify this.
func responsePropertyPathToNilCheck(variable string, propertyPath []*ir.Name) string {
	if len(propertyPath) == 0 {
		return ""
	}
	result := "if "
	var parts []string
	for i, part := range propertyPath {
		parts = append(parts, part.PascalCase.UnsafeName)
		result += fmt.Sprintf("%s.%s != nil", variable, strings.Join(parts, "."))
		if i < len(propertyPath)-1 {
			result += " && "
		}
	}
	result += " {"
	return result
}

// responsePropertyPathToFullPathString returns the string used to access the response property.
//
// Note that when we support method getters, we can simplify this.
func responsePropertyPathToFullPathString(variable string, propertyPath []*ir.Name) string {
	if len(propertyPath) == 0 {
		return variable + "."
	}
	var parts []string
	for _, part := range propertyPath {
		parts = append(parts, part.PascalCase.UnsafeName)
	}
	return variable + "." + strings.Join(parts, ".") + "."
}

// NewGeneratedClient constructs the snippets associated with the client's
// endpoints.
func NewGeneratedClient(
	f *fileWriter,
	fernFilepath *ir.FernFilepath,
	endpoints []*ir.HttpEndpoint,
	rootClientInstantiation *ast.AssignStmt,
) (*GeneratedClient, error) {
	var generatedEndpoints []*GeneratedEndpoint
	for _, endpoint := range endpoints {
		if len(endpoint.Examples) == 0 {
			continue
		}
		example := exampleEndpointCallFromEndpointExample(endpoint.Examples[0])
		if example == nil {
			continue
		}
		generatedEndpoints = append(
			generatedEndpoints,
			newGeneratedEndpoint(
				f,
				fernFilepath,
				rootClientInstantiation,
				endpoint,
				example,
			),
		)
	}
	return &GeneratedClient{
		Instantiation: rootClientInstantiation,
		Endpoints:     generatedEndpoints,
	}, nil
}

type exampleEndpointCallVisitor struct {
	value *ir.ExampleEndpointCall
}

func (e *exampleEndpointCallVisitor) VisitUserProvided(value *ir.ExampleEndpointCall) error {
	e.value = value
	return nil
}

func (e *exampleEndpointCallVisitor) VisitGenerated(value *ir.ExampleEndpointCall) error {
	e.value = value
	return nil
}

func exampleEndpointCallFromEndpointExample(example *ir.HttpEndpointExample) *ir.ExampleEndpointCall {
	visitor := new(exampleEndpointCallVisitor)
	example.Accept(visitor)
	return visitor.value
}

func newGeneratedEndpoint(
	f *fileWriter,
	fernFilepath *ir.FernFilepath,
	rootClientInstantiation *ast.AssignStmt,
	endpoint *ir.HttpEndpoint,
	example *ir.ExampleEndpointCall,
) *GeneratedEndpoint {
	return &GeneratedEndpoint{
		Identifier: endpointToIdentifier(endpoint),
		Snippet: newEndpointSnippet(
			f,
			fernFilepath,
			rootClientInstantiation,
			endpoint,
			example,
		),
	}
}

func endpointToIdentifier(endpoint *ir.HttpEndpoint) *generatorexec.EndpointIdentifier {
	return &generatorexec.EndpointIdentifier{
		Path:               fullPathForEndpoint(endpoint),
		Method:             irMethodToGeneratorExecMethod(endpoint.Method),
		IdentifierOverride: &endpoint.Id,
	}
}

func fullPathForEndpoint(endpoint *ir.HttpEndpoint) string {
	var components []string
	if head := strings.Trim(endpoint.FullPath.Head, "/"); len(head) > 0 {
		components = append(components, head)
	}
	for _, part := range endpoint.FullPath.Parts {
		components = append(components, fmt.Sprintf("{%s}", part.PathParameter))
		if tail := strings.Trim(part.Tail, "/"); len(tail) > 0 {
			components = append(components, tail)
		}
	}
	return fmt.Sprintf("/%s", strings.Join(components, "/"))
}

func irMethodToGeneratorExecMethod(method ir.HttpMethod) generatorexec.EndpointMethod {
	switch method {
	case ir.HttpMethodGet:
		return generatorexec.EndpointMethodGet
	case ir.HttpMethodPost:
		return generatorexec.EndpointMethodPost
	case ir.HttpMethodPut:
		return generatorexec.EndpointMethodPut
	case ir.HttpMethodPatch:
		return generatorexec.EndpointMethodPatch
	case ir.HttpMethodDelete:
		return generatorexec.EndpointMethodDelete
	}
	return 0
}

func newEndpointSnippet(
	f *fileWriter,
	fernFilepath *ir.FernFilepath,
	rootClientInstantiation *ast.AssignStmt,
	endpoint *ir.HttpEndpoint,
	example *ir.ExampleEndpointCall,
) *ast.Block {
	methodName := getEndpointMethodName(fernFilepath, endpoint)
	parameters := getEndpointParameters(
		f,
		fernFilepath,
		endpoint,
		example,
	)
	call := &ast.CallExpr{
		FunctionName: &ast.LocalReference{
			Name: fmt.Sprintf("client.%s", methodName),
		},
		Parameters: parameters,
	}
	returnValues := []ast.Expr{
		&ast.LocalReference{
			Name: "err",
		},
	}
	if endpoint.Response != nil {
		returnValues = append(
			[]ast.Expr{
				&ast.LocalReference{
					Name: "response",
				},
			},
			returnValues...,
		)
	}
	endpointCall := &ast.AssignStmt{
		Left: returnValues,
		Right: []ast.Expr{
			call,
		},
	}
	return &ast.Block{
		Exprs: []ast.Expr{
			rootClientInstantiation,
			endpointCall,
		},
	}
}

func getEndpointMethodName(
	fernFilepath *ir.FernFilepath,
	endpoint *ir.HttpEndpoint,
) string {
	var packageElements []string
	for _, packageElem := range fernFilepath.PackagePath {
		packageElements = append(packageElements, packageElem.PascalCase.UnsafeName)
	}
	if fernFilepath.File != nil {
		packageElements = append(packageElements, fernFilepath.File.PascalCase.UnsafeName)
	}
	methodName := endpoint.Name.PascalCase.UnsafeName
	if len(packageElements) == 0 {
		return methodName
	}
	return fmt.Sprintf("%s.%s", strings.Join(packageElements, "."), methodName)
}

func getEndpointParameters(
	f *fileWriter,
	fernFilepath *ir.FernFilepath,
	endpoint *ir.HttpEndpoint,
	example *ir.ExampleEndpointCall,
) []ast.Expr {
	parameters := []ast.Expr{
		&ast.CallExpr{
			FunctionName: &ast.ImportedReference{
				Name:       "TODO",
				ImportPath: "context",
			},
		},
	}

	allPathParameters := example.RootPathParameters
	allPathParameters = append(allPathParameters, example.ServicePathParameters...)
	allPathParameters = append(allPathParameters, example.EndpointPathParameters...)
	for _, pathParameter := range allPathParameters {
		parameters = append(
			parameters,
			f.snippetWriter.GetSnippetForExampleTypeReference(pathParameter.Value),
		)
	}

	var fields []*ast.Field
	for _, header := range append(example.ServiceHeaders, example.EndpointHeaders...) {
		if isHeaderLiteral(endpoint, header.Name.WireValue) {
			continue
		}
		fields = append(
			fields,
			&ast.Field{
				Key:   header.Name.Name.PascalCase.UnsafeName,
				Value: f.snippetWriter.GetSnippetForExampleTypeReference(header.Value),
			},
		)
	}

	for _, queryParameter := range example.QueryParameters {
		if isQueryParameterLiteral(endpoint, queryParameter.Name.WireValue) {
			continue
		}
		exampleValue := f.snippetWriter.GetSnippetForExampleTypeReference(queryParameter.Value)
		if isQueryParameterAllowMultiple(endpoint, queryParameter.Name.WireValue) {
			// This query parameter allows multiple elements, so we need to surround the example
			// value in an array.
			expr := exampleTypeReferenceShapeToGoType(
				queryParameter.Value.Shape,
				f.types,
				f.baseImportPath,
			)
			exampleValue = &ast.ArrayLit{
				Type: &ast.ArrayType{
					Expr: expr,
				},
				Values: []ast.Expr{
					exampleValue,
				},
			}
		}
		fields = append(
			fields,
			&ast.Field{
				Key:   queryParameter.Name.Name.PascalCase.UnsafeName,
				Value: exampleValue,
			},
		)
	}

	if !shouldSkipRequestType(endpoint) {
		fields = append(
			fields,
			exampleRequestBodyToFields(f, endpoint, example.Request)...,
		)
		parameters = append(
			parameters,
			&ast.StructType{
				Name: &ast.ImportedReference{
					Name:       endpoint.SdkRequest.Shape.Wrapper.WrapperName.PascalCase.UnsafeName,
					ImportPath: fernFilepathToImportPath(f.baseImportPath, fernFilepath),
				},
				Fields: fields,
			},
		)
		return parameters
	}

	if example.Request != nil && example.Request.Reference != nil {
		// Include the body as an ordinary parameter alongside the rest.
		parameters = append(
			parameters,
			f.snippetWriter.GetSnippetForExampleTypeReference(example.Request.Reference),
		)
	}
	return parameters
}

func exampleRequestBodyToFields(
	f *fileWriter,
	endpoint *ir.HttpEndpoint,
	exampleRequestBody *ir.ExampleRequestBody,
) []*ast.Field {
	if exampleRequestBody == nil {
		return nil
	}
	var fields []*ast.Field
	switch exampleRequestBody.Type {
	case "inlinedRequestBody":
		for _, property := range exampleRequestBody.InlinedRequestBody.Properties {
			if isExampleInlinedRequestBodyPropertyLiteral(endpoint, property) {
				return fields
			}
			fields = append(
				fields,
				&ast.Field{
					Key:   property.Name.Name.PascalCase.UnsafeName,
					Value: f.snippetWriter.GetSnippetForExampleTypeReference(property.Value),
				},
			)
		}
		return fields
	case "reference":
		if isExampleReferenceRequestBodyLiteral(endpoint) {
			return fields
		}
		fields = append(
			fields,
			&ast.Field{
				Key:   endpoint.SdkRequest.Shape.Wrapper.BodyKey.PascalCase.UnsafeName,
				Value: f.snippetWriter.GetSnippetForExampleTypeReference(exampleRequestBody.Reference),
			},
		)
	}
	return fields
}

func isHeaderLiteral(endpoint *ir.HttpEndpoint, wireValue string) bool {
	for _, header := range endpoint.Headers {
		if header.Name.WireValue == wireValue {
			return isTypeReferenceLiteral(header.ValueType)
		}
	}
	return false
}

func isQueryParameterLiteral(endpoint *ir.HttpEndpoint, wireValue string) bool {
	for _, queryParameter := range endpoint.QueryParameters {
		if queryParameter.Name.WireValue == wireValue {
			return isTypeReferenceLiteral(queryParameter.ValueType)
		}
	}
	return false
}

func isQueryParameterAllowMultiple(endpoint *ir.HttpEndpoint, wireValue string) bool {
	for _, queryParameter := range endpoint.QueryParameters {
		if queryParameter.Name.WireValue == wireValue {
			return queryParameter.AllowMultiple
		}
	}
	return false
}

func isExampleInlinedRequestBodyPropertyLiteral(
	endpoint *ir.HttpEndpoint,
	exampleInlinedRequestBodyProperty *ir.ExampleInlinedRequestBodyProperty,
) bool {
	if endpoint.RequestBody == nil || endpoint.RequestBody.InlinedRequestBody == nil {
		return false
	}
	wireValue := exampleInlinedRequestBodyProperty.Name.WireValue
	for _, property := range endpoint.RequestBody.InlinedRequestBody.Properties {
		if property.Name.WireValue == wireValue {
			return isTypeReferenceLiteral(property.ValueType)
		}
	}
	return false
}

func isExampleReferenceRequestBodyLiteral(
	endpoint *ir.HttpEndpoint,
) bool {
	if endpoint.RequestBody == nil || endpoint.RequestBody.Reference == nil {
		return false
	}
	return isTypeReferenceLiteral(endpoint.RequestBody.Reference.RequestBodyType)
}

// generatedClientInstantiation returns the AST expression associated with
// the client construction (including import statements and client options).
func generatedClientInstantiation(
	baseImportPath string,
	generatedAuth *GeneratedAuth,
	generatedEnvironment *GeneratedEnvironment,
) *ast.AssignStmt {
	var parameters []ast.Expr
	if generatedAuth != nil {
		parameters = append(parameters, generatedAuth.Option)
	}
	if generatedEnvironment != nil {
		parameters = append(parameters, generatedEnvironment.Option)
	}
	return &ast.AssignStmt{
		Left: []ast.Expr{
			ast.NewLocalReference("client"),
		},
		Right: []ast.Expr{
			ast.NewCallExpr(
				ast.NewImportedReference(
					"NewClient",
					packagePathToImportPath(baseImportPath, packagePathForClient(new(ir.FernFilepath))),
				),
				parameters,
			),
		},
	}
}

type filePropertyInfo struct {
	Key        *ir.NameAndWireValue
	IsOptional bool
	IsArray    bool
}

func filePropertyToInfo(fileProperty *ir.FileProperty) (*filePropertyInfo, error) {
	switch fileProperty.Type {
	case "file":
		return &filePropertyInfo{
			Key:        fileProperty.File.Key,
			IsOptional: fileProperty.File.IsOptional,
		}, nil
	case "fileArray":
		return &filePropertyInfo{
			Key:        fileProperty.FileArray.Key,
			IsOptional: fileProperty.FileArray.IsOptional,
			IsArray:    true,
		}, nil
	}
	return nil, fmt.Errorf("file property %s is not yet supported", fileProperty.Type)
}

// endpoint holds the fields required to generate a client endpoint.
//
// All of the fields are pre-formatted so that they can all be simple
// strings.
type endpoint struct {
	Name                        *ir.Name
	Docs                        *string
	ImportPath                  string
	OptionsParameterName        string
	RequestParameterName        string
	RequestBytesParameterName   string
	RequestValueName            string
	RequestIsBytes              bool
	RequestIsOptional           bool
	ResponseType                string
	ResponseParameterName       string
	ResponseInitializerFormat   string
	ResponseIsOptionalParameter bool
	PathParameterNames          []string
	SignatureParameters         []*signatureParameter
	ReturnValues                string
	SuccessfulReturnValues      string
	ErrorReturnValues           string
	BaseURL                     string
	OptionConstructor           string
	PathSuffix                  string
	Method                      string
	IsStreaming                 bool
	StreamDelimiter             string
	ErrorDecoderParameterName   string
	Idempotent                  bool
	ContentType                 string
	Errors                      ir.ResponseErrors
	QueryParameters             []*ir.QueryParameter
	Headers                     []*ir.HttpHeader
	IdempotencyHeaders          []*ir.HttpHeader
	FilePropertyInfo            *filePropertyInfo
	FileProperties              []*ir.FileProperty
	FileBodyProperties          []*ir.InlinedRequestBodyProperty
	PaginationInfo              *paginationInfo
}

type signatureParameter struct {
	docs      *string // e.g. "Identifies a single user."
	parameter string  // e.g. 'userId string'
}

// signatureForEndpoint returns a signature template for the given endpoint.
func (f *fileWriter) endpointFromIR(
	fernFilepath *ir.FernFilepath,
	irEndpoint *ir.HttpEndpoint,
	irEnvironmentsConfig *ir.EnvironmentsConfig,
	idempotencyHeaders []*ir.HttpHeader,
	receiver string,
) (*endpoint, error) {
	importPath := fernFilepathToImportPath(f.baseImportPath, fernFilepath)

	// Create a new child scope for this endpoint.
	scope := f.scope.Child()

	// Add path parameters and request body, if any.
	pathParameterToScopedName := make(map[string]string, len(irEndpoint.AllPathParameters))
	pathParamters := make(map[string]*ir.PathParameter, len(irEndpoint.AllPathParameters))
	for _, pathParameter := range irEndpoint.AllPathParameters {
		pathParamters[pathParameter.Name.OriginalName] = pathParameter
	}

	var pathParameterNames []string
	for _, part := range irEndpoint.FullPath.Parts {
		if part.PathParameter == "" {
			continue
		}
		pathParameter, ok := pathParamters[part.PathParameter]
		if !ok {
			return nil, fmt.Errorf("internal error: path parameter %s not found in endpoint %s", part.PathParameter, irEndpoint.Name.OriginalName)
		}
		pathParameterName := scope.Add(pathParameter.Name.CamelCase.SafeName)
		pathParameterNames = append(pathParameterNames, pathParameterName)
		pathParameterToScopedName[part.PathParameter] = pathParameterName
	}

	// Preserve the order of path parameters specified in the API in the function signature.
	signatureParameters := []*signatureParameter{{parameter: "ctx context.Context"}}
	for _, pathParameter := range irEndpoint.AllPathParameters {
		pathParameterName, ok := pathParameterToScopedName[pathParameter.Name.OriginalName]
		if !ok {
			return nil, fmt.Errorf("internal error: path parameter %s not found in endpoint %s", pathParameter.Name.OriginalName, irEndpoint.Name.OriginalName)
		}
		parameterType := typeReferenceToGoType(pathParameter.ValueType, f.types, scope, f.baseImportPath, "" /* The type is always imported */, false)
		signatureParameters = append(
			signatureParameters,
			&signatureParameter{
				docs:      pathParameter.Docs,
				parameter: fmt.Sprintf("%s %s", pathParameterName, parameterType),
			},
		)
	}

	// Add the file parameter(s) after the path parameters, if any.
	var (
		fileProperties     []*ir.FileProperty
		fileBodyProperties []*ir.InlinedRequestBodyProperty
		filePropertyInfo   *filePropertyInfo
	)
	if irEndpoint.RequestBody != nil && irEndpoint.RequestBody.FileUpload != nil {
		for _, fileUploadProperty := range irEndpoint.RequestBody.FileUpload.Properties {
			if fileUploadProperty.File != nil {
				filePropertyInfo, err := filePropertyToInfo(fileUploadProperty.File)
				if err != nil {
					return nil, err
				}
				parameterName := filePropertyInfo.Key.Name.CamelCase.SafeName
				parameterType := "io.Reader"
				if filePropertyInfo.IsArray {
					parameterType = "[]io.Reader"
				}
				signatureParameters = append(
					signatureParameters,
					&signatureParameter{
						parameter: fmt.Sprintf("%s %s", parameterName, parameterType),
					},
				)
				fileProperties = append(fileProperties, fileUploadProperty.File)
			}
			if fileUploadProperty.BodyProperty != nil {
				fileBodyProperties = append(fileBodyProperties, fileUploadProperty.BodyProperty)
			}
		}
	}

	// Format the rest of the request parameters.
	var (
		contentType               = ""
		requestParameterName      = ""
		requestBytesParameterName = ""
		requestValueName          = ""
		requestIsBytes            = false
		requestIsOptional         = false
	)
	if irEndpoint.SdkRequest != nil {
		if needsRequestParameter(irEndpoint) {
			var requestType string
			requestParameterName = irEndpoint.SdkRequest.RequestParameterName.CamelCase.SafeName
			if requestBody := irEndpoint.SdkRequest.Shape.JustRequestBody; requestBody != nil {
				switch requestBody.Type {
				case "typeReference":
					requestType = typeReferenceToGoType(requestBody.TypeReference.RequestBodyType, f.types, scope, f.baseImportPath, "" /* The type is always imported */, false)
				case "bytes":
					contentType = "application/octet-stream"
					if irEndpoint.RequestBody.Bytes.ContentType != nil {
						contentType = *irEndpoint.RequestBody.Bytes.ContentType
					}
					requestType = "[]byte"
					requestValueName = "requestBuffer"
					requestIsBytes = true
					requestIsOptional = requestBody.Bytes.IsOptional
					requestBytesParameterName = requestParameterName
				default:
					return nil, fmt.Errorf("%s requests are not supported yet", requestBody.Type)
				}
			}
			if irEndpoint.SdkRequest.Shape.Wrapper != nil {
				requestImportPath := fernFilepathToImportPath(f.baseImportPath, fernFilepath)
				requestType = fmt.Sprintf("*%s.%s", scope.AddImport(requestImportPath), irEndpoint.SdkRequest.Shape.Wrapper.WrapperName.PascalCase.UnsafeName)
				if irEndpoint.RequestBody != nil && irEndpoint.RequestBody.Bytes != nil {
					contentType = "application/octet-stream"
					if irEndpoint.RequestBody.Bytes.ContentType != nil {
						contentType = *irEndpoint.RequestBody.Bytes.ContentType
					}
					requestValueName = "requestBuffer"
					requestIsBytes = true
					requestIsOptional = irEndpoint.RequestBody.Bytes.IsOptional
					requestBytesParameterName = fmt.Sprintf(
						"%s.%s",
						requestParameterName,
						irEndpoint.SdkRequest.Shape.Wrapper.BodyKey.PascalCase.UnsafeName,
					)
				}
			}
			signatureParameters = append(
				signatureParameters,
				&signatureParameter{
					parameter: fmt.Sprintf("%s %s", requestParameterName, requestType),
				},
			)
			if irEndpoint.RequestBody != nil && requestValueName == "" {
				// Only send a request body if one is defined.
				requestValueName = requestParameterName
			}
		}
		if irEndpoint.RequestBody != nil && irEndpoint.RequestBody.FileUpload != nil {
			// This is a file upload request, so we prepare a buffer for the request body
			// instead of just using the request specified by the function signature.
			requestValueName = "requestBuffer"
		}
	}

	// The request options must always be the last parameter.
	optionType := "option.RequestOption"
	if irEndpoint.Idempotent {
		optionType = "option.IdempotentRequestOption"
	}
	signatureParameters = append(
		signatureParameters,
		&signatureParameter{
			parameter: fmt.Sprintf("opts ...%s", optionType),
		},
	)

	paginationInfo, err := f.getPaginationInfo(irEndpoint, scope, requestParameterName)
	if err != nil {
		return nil, err
	}

	// Format all of the response values.
	var (
		responseType              string
		responseParameterName     string
		responseInitializerFormat string
		signatureReturnValues     string
		successfulReturnValues    string
		errorReturnValues         string
		streamDelimiter           string
		isStreaming               bool
	)
	var responseIsOptionalParameter bool
	if irEndpoint.Response != nil {
		switch irEndpoint.Response.Type {
		case "json":
			typeReference := typeReferenceFromJsonResponse(irEndpoint.Response.Json)
			if typeReference == nil {
				return nil, fmt.Errorf("unsupported json response type: %s", irEndpoint.Response.Json.Type)
			}
			responseType = typeReferenceToGoType(typeReference, f.types, scope, f.baseImportPath, "" /* The type is always imported */, false)
			responseInitializerFormat = "var response %s"
			responseIsOptionalParameter = typeReference.Container != nil && typeReference.Container.Optional != nil
			responseParameterName = "&response"
			signatureReturnValues = fmt.Sprintf("(%s, error)", responseType)
			successfulReturnValues = "response, nil"
			errorReturnValues = fmt.Sprintf("%s, err", defaultValueForTypeReference(typeReference, f.types))

			if irEndpoint.Response.Json.NestedPropertyAsResponse != nil && irEndpoint.Response.Json.NestedPropertyAsResponse.ResponseProperty != nil {
				responseProperty := irEndpoint.Response.Json.NestedPropertyAsResponse.ResponseProperty
				responsePropertyTypeReference := responseProperty.ValueType
				responsePropertyType := typeReferenceToGoType(responsePropertyTypeReference, f.types, f.scope, f.baseImportPath, "" /* The type is always imported */, false)
				signatureReturnValues = fmt.Sprintf("(%s, error)", responsePropertyType)
				successfulReturnValues = fmt.Sprintf("response.%s, nil", responseProperty.Name.Name.PascalCase.UnsafeName)
				errorReturnValues = fmt.Sprintf("%s, err", defaultValueForTypeReference(responsePropertyTypeReference, f.types))
			}

			if paginationInfo != nil {
				responseInitializerFormat = ""
				responseParameterName = "pageRequest.Response"
				signatureReturnValues = fmt.Sprintf("(*core.Page[%s], error)", paginationInfo.ResultsSingleGoType)
				errorReturnValues = "nil, err"
			}
		case "fileDownload":
			responseType = "bytes.NewBuffer(nil)"
			responseInitializerFormat = "response := %s"
			responseParameterName = "response"
			signatureReturnValues = "(io.Reader, error)"
			successfulReturnValues = "response, nil"
			errorReturnValues = "nil, err"
		case "text":
			responseType = "bytes.NewBuffer(nil)"
			responseInitializerFormat = "response := %s"
			responseParameterName = "response"
			signatureReturnValues = "(string, error)"
			successfulReturnValues = "response.String(), nil"
			errorReturnValues = `"", err`
		case "streaming":
			if irEndpoint.Response.Streaming.Json == nil && irEndpoint.Response.Streaming.Text == nil {
				return nil, fmt.Errorf("unsupported streaming response type: %s", irEndpoint.Response.Streaming.Type)
			}
			if irEndpoint.Response.Streaming.Json != nil && irEndpoint.Response.Streaming.Json.Terminator != nil {
				streamDelimiter = *irEndpoint.Response.Streaming.Json.Terminator
			}
			typeReference, err := typeReferenceFromStreamingResponse(irEndpoint.Response.Streaming)
			if err != nil {
				return nil, err
			}
			responseType = strings.TrimPrefix(typeReferenceToGoType(typeReference, f.types, scope, f.baseImportPath, "" /* The type is always imported */, false), "*")
			responseParameterName = "response"
			signatureReturnValues = fmt.Sprintf("(*core.Stream[%s], error)", responseType)
			errorReturnValues = "nil, err"
			isStreaming = true
		default:
			return nil, fmt.Errorf("%s requests are not supported yet", irEndpoint.Response.Type)
		}
	} else {
		responseParameterName = ""
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
	errorDecoderParameterName := ""
	if len(irEndpoint.Errors) > 0 {
		errorDecoderParameterName = "errorDecoder"
	}

	var pathParameterDocs []*string
	for _, pathParam := range irEndpoint.AllPathParameters {
		if pathParam.Docs != nil && len(*pathParam.Docs) > 0 {
			pathParameterDocs = append(pathParameterDocs, pathParam.Docs)
		}
	}

	optionConstructor := "core.NewRequestOptions(opts...)"
	if irEndpoint.Idempotent {
		optionConstructor = "core.NewIdempotentRequestOptions(opts...)"
	}

	return &endpoint{
		Name:                        irEndpoint.Name,
		Docs:                        irEndpoint.Docs,
		ImportPath:                  importPath,
		OptionsParameterName:        "options",
		RequestParameterName:        requestParameterName,
		RequestBytesParameterName:   requestBytesParameterName,
		RequestValueName:            requestValueName,
		RequestIsBytes:              requestIsBytes,
		RequestIsOptional:           requestIsOptional,
		ResponseType:                responseType,
		ResponseParameterName:       responseParameterName,
		ResponseInitializerFormat:   responseInitializerFormat,
		ResponseIsOptionalParameter: responseIsOptionalParameter,
		PathParameterNames:          pathParameterNames,
		SignatureParameters:         signatureParameters,
		ReturnValues:                signatureReturnValues,
		SuccessfulReturnValues:      successfulReturnValues,
		ErrorReturnValues:           errorReturnValues,
		OptionConstructor:           optionConstructor,
		BaseURL:                     baseURL,
		PathSuffix:                  pathSuffix,
		Method:                      irMethodToMethodEnum(irEndpoint.Method),
		IsStreaming:                 isStreaming,
		StreamDelimiter:             streamDelimiter,
		ErrorDecoderParameterName:   errorDecoderParameterName,
		ContentType:                 contentType,
		Idempotent:                  irEndpoint.Idempotent,
		Errors:                      irEndpoint.Errors,
		QueryParameters:             irEndpoint.QueryParameters,
		Headers:                     irEndpoint.Headers,
		IdempotencyHeaders:          idempotencyHeaders,
		FilePropertyInfo:            filePropertyInfo,
		FileProperties:              fileProperties,
		FileBodyProperties:          fileBodyProperties,
		PaginationInfo:              paginationInfo,
	}, nil
}

// GeneratedEnvironment contains information about the environments that were generated.
type GeneratedEnvironment struct {
	Example ast.Expr // e.g. acme.Environments.Production
	Option  ast.Expr // e.g. option.WithBaseURL(acme.Environments.Production)
}

// WriteEnvironments writes the environment constants.
func (f *fileWriter) WriteEnvironments(environmentsConfig *ir.EnvironmentsConfig, useCore bool) (*GeneratedEnvironment, error) {
	return environmentsToEnvironmentsVariable(environmentsConfig, f, useCore)
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
		value      = typeReferenceToGoType(errorDeclaration.Type, f.types, f.scope, f.baseImportPath, importPath, false)
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
func (f *fileWriter) WriteRequestType(
	fernFilepath *ir.FernFilepath,
	endpoint *ir.HttpEndpoint,
	idempotencyHeaders []*ir.HttpHeader,
	includeGenericOptionals bool,
) error {
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
					Name:  header.Name,
					Value: header.ValueType.Container.Literal,
				},
			)
			continue
		}
		goType := typeReferenceToGoType(header.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
		f.P(header.Name.Name.PascalCase.UnsafeName, " ", goType, " `json:\"-\" url:\"-\"`")
	}
	for _, queryParam := range endpoint.QueryParameters {
		value := typeReferenceToGoType(queryParam.ValueType, f.types, f.scope, f.baseImportPath, importPath, false)
		if queryParam.AllowMultiple {
			value = fmt.Sprintf("[]%s", value)
		}
		f.WriteDocs(queryParam.Docs)
		if queryParam.ValueType.Container != nil && queryParam.ValueType.Container.Literal != nil {
			literals = append(
				literals,
				&literal{
					Name:  queryParam.Name,
					Value: queryParam.ValueType.Container.Literal,
				},
			)
			continue
		}
		f.P(queryParam.Name.Name.PascalCase.UnsafeName, " ", value, urlTagForType(queryParam.Name.WireValue, queryParam.ValueType, f.types))
	}
	if endpoint.RequestBody == nil {
		// If the request doesn't have a body, we don't need any custom [de]serialization logic.
		for _, literal := range literals {
			f.P(literal.Name.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
		}
		f.P("}")
		f.P()
		for _, literal := range literals {
			f.P("func (", receiver, " *", typeName, ") ", literal.Name.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
			f.P("return ", receiver, ".", literal.Name.Name.CamelCase.SafeName)
			f.P("}")
			f.P()
		}
		return nil
	}
	requestBody, err := requestBodyToFieldDeclaration(endpoint.RequestBody, f, importPath, bodyField, includeGenericOptionals)
	if err != nil {
		return err
	}
	literals = append(literals, requestBody.literals...)
	for _, literal := range literals {
		f.P(literal.Name.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
	}
	if requestBody.extraProperties {
		f.P()
		f.P("ExtraProperties map[string]interface{} `json:\"-\" url:\"-\"`")
	}
	f.P("}")
	f.P()
	// Implement the getter methods.
	for _, literal := range literals {
		f.P("func (", receiver, " *", typeName, ") ", literal.Name.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
		f.P("return ", receiver, ".", literal.Name.Name.CamelCase.SafeName)
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
			typeReferenceToGoType(reference.RequestBodyType, f.types, f.scope, f.baseImportPath, importPath, false),
			"*",
		)
		referenceIsPointer = reference.RequestBodyType.Named != nil && isPointer(f.types[reference.RequestBodyType.Named.TypeId])
		if reference.RequestBodyType.Container != nil && reference.RequestBodyType.Container.Literal != nil {
			referenceLiteral = literalToValue(reference.RequestBodyType.Container.Literal)
		}
	}

	if len(literals) == 0 && len(requestBody.dates) == 0 && len(referenceType) == 0 && !requestBody.extraProperties {
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
		f.P(receiver, ".", literal.Name.Name.CamelCase.SafeName, " = ", literalToValue(literal.Value))
	}
	if requestBody.extraProperties {
		f.P()
		writeExtractExtraProperties(f, literals, receiver, getExtraPropertiesFieldName(requestBody.extraProperties))
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
		for _, date := range requestBody.dates {
			f.P(date.Name.Name.PascalCase.UnsafeName, " ", date.TypeDeclaration, " ", date.StructTag)
		}
		for _, literal := range literals {
			f.P(literal.Name.Name.PascalCase.UnsafeName, " ", literalToGoType(literal.Value), " `json:\"", literal.Name.WireValue, "\"`")
		}
		f.P("}{")
		f.P("embed: embed(*", receiver, "),")
		for _, date := range requestBody.dates {
			f.P(date.Name.Name.PascalCase.UnsafeName, ": ", date.Constructor, "(", receiver, ".", date.Name.Name.PascalCase.UnsafeName, "),")
		}
		for _, literal := range literals {
			f.P(literal.Name.Name.PascalCase.UnsafeName, ": ", literalToValue(literal.Value), ",")
		}
		f.P("}")
		if requestBody.extraProperties {
			f.P("return core.MarshalJSONWithExtraProperties(marshaler, ", receiver, ".ExtraProperties)")
		} else {
			f.P("return json.Marshal(marshaler)")
		}
	}
	f.P("}")
	f.P()

	return nil
}

func environmentsToEnvironmentsVariable(
	environmentsConfig *ir.EnvironmentsConfig,
	writer *fileWriter,
	useCore bool,
) (*GeneratedEnvironment, error) {
	writer.P("// Environments defines all of the API environments.")
	writer.P("// These values can be used with the WithBaseURL")
	writer.P("// RequestOption to override the client's default environment,")
	writer.P("// if any.")
	writer.P("var Environments = struct {")
	importPath := writer.baseImportPath
	if useCore {
		importPath = path.Join(importPath, "core")
	}
	declarationVisitor := &environmentsDeclarationVisitor{
		types:      writer.types,
		writer:     writer,
		importPath: importPath,
	}
	if err := environmentsConfig.Environments.Accept(declarationVisitor); err != nil {
		return nil, err
	}
	writer.P("}{")
	valueVisitor := &environmentsValueVisitor{
		types:  writer.types,
		writer: writer,
	}
	if err := environmentsConfig.Environments.Accept(valueVisitor); err != nil {
		return nil, err
	}
	writer.P("}")
	if environmentsConfig.DefaultEnvironment != nil || declarationVisitor.value == nil {
		return nil, nil
	}
	return &GeneratedEnvironment{
		Example: declarationVisitor.value,
		Option: &ast.CallExpr{
			FunctionName: &ast.ImportedReference{
				Name:       "WithBaseURL",
				ImportPath: path.Join(writer.baseImportPath, "option"),
			},
			Parameters: []ast.Expr{
				declarationVisitor.value,
			},
		},
	}, nil
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
	value      ast.Expr
	types      map[ir.TypeId]*ir.TypeDeclaration
	writer     *fileWriter
	importPath string
}

func (e *environmentsDeclarationVisitor) VisitSingleBaseUrl(url *ir.SingleBaseUrlEnvironments) error {
	for i, environment := range url.Environments {
		if i == 0 {
			e.value = ast.NewImportedReference(
				fmt.Sprintf("Environments.%s", environment.Name.PascalCase.UnsafeName),
				e.importPath,
			)
		}
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
	for i, environment := range url.Environments {
		if i == 0 {
			e.value = ast.NewImportedReference(
				fmt.Sprintf("Environments.%s", environment.Name.PascalCase.UnsafeName),
				e.importPath,
			)
		}
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

type requestBody struct {
	dates           []*date
	literals        []*literal
	extraProperties bool
}

func requestBodyToFieldDeclaration(
	body *ir.HttpRequestBody,
	writer *fileWriter,
	importPath string,
	bodyField string,
	includeGenericOptionals bool,
) (*requestBody, error) {
	visitor := &requestBodyVisitor{
		bodyField:               bodyField,
		baseImportPath:          writer.baseImportPath,
		importPath:              importPath,
		scope:                   writer.scope,
		types:                   writer.types,
		writer:                  writer,
		includeGenericOptionals: includeGenericOptionals,
	}
	if err := body.Accept(visitor); err != nil {
		return nil, err
	}
	return &requestBody{
		dates:           visitor.dates,
		literals:        visitor.literals,
		extraProperties: visitor.extraProperties,
	}, nil
}

type requestBodyVisitor struct {
	dates           []*date
	literals        []*literal
	extraProperties bool

	bodyField      string
	baseImportPath string
	importPath     string
	scope          *gospec.Scope
	types          map[ir.TypeId]*ir.TypeDeclaration
	writer         *fileWriter

	// Configurable
	includeGenericOptionals bool
}

func (r *requestBodyVisitor) VisitInlinedRequestBody(inlinedRequestBody *ir.InlinedRequestBody) error {
	typeVisitor := &typeVisitor{
		typeName:       inlinedRequestBody.Name.PascalCase.UnsafeName,
		baseImportPath: r.baseImportPath,
		importPath:     r.importPath,
		writer:         r.writer,
	}
	objectTypeDeclaration := inlinedRequestBodyToObjectTypeDeclaration(inlinedRequestBody)
	objectProperties := typeVisitor.visitObjectProperties(
		objectTypeDeclaration,
		true,  // includeJSONTags
		false, // includeURLTags
		r.includeGenericOptionals,
	)
	r.dates = objectProperties.dates
	r.literals = objectProperties.literals
	r.extraProperties = objectTypeDeclaration.ExtraProperties
	return nil
}

func (r *requestBodyVisitor) VisitReference(reference *ir.HttpRequestBodyReference) error {
	// For references, we include the type in a field that matches the configured body key.
	r.writer.P(
		r.bodyField,
		" ",
		typeReferenceToGoType(reference.RequestBodyType, r.types, r.scope, r.baseImportPath, r.importPath, false),
		" `json:\"-\" url:\"-\"`",
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
	objectProperties := typeVisitor.visitObjectProperties(
		objectTypeDeclaration,
		true,  // includeJSONTags
		false, // includeURLTags
		r.includeGenericOptionals,
	)
	r.dates = objectProperties.dates
	r.literals = objectProperties.literals
	return nil
}

func (r *requestBodyVisitor) VisitBytes(bytes *ir.BytesRequest) error {
	r.writer.P(
		r.bodyField,
		" ",
		"[]byte",
		" `json:\"-\" url:\"-\"`",
	)
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
		Extends:         inlinedRequestBody.Extends,
		Properties:      properties,
		ExtraProperties: inlinedRequestBody.ExtraProperties,
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
	Prefix      string
	Suffix      string
	ZeroValue   string
	IsOptional  bool
	IsPrimitive bool
}

func formatForValueType(typeReference *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) *valueTypeFormat {
	var (
		prefix      string
		suffix      string
		isOptional  bool
		isPrimitive bool
	)
	if typeReference.Container != nil && typeReference.Container.Optional != nil {
		isOptional = true
		if needsOptionalDereference(typeReference.Container.Optional) {
			prefix = "*"
		}
	}
	if primitive := maybePrimitive(typeReference); primitive != "" {
		// Several of the primitive types require special handling for query parameter serialization.
		if isOptional {
			prefix = "*"
		}
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
		isPrimitive = true
	}
	return &valueTypeFormat{
		Prefix:      prefix,
		Suffix:      suffix,
		ZeroValue:   zeroValueForTypeReference(typeReference, types),
		IsOptional:  isOptional,
		IsPrimitive: isPrimitive,
	}
}

func typeReferenceFromJsonResponse(
	jsonResponse *ir.JsonResponse,
) *ir.TypeReference {
	if jsonResponse == nil {
		return nil
	}
	switch jsonResponse.Type {
	case "response":
		return jsonResponse.Response.ResponseBodyType
	case "nestedPropertyAsResponse":
		return jsonResponse.NestedPropertyAsResponse.ResponseBodyType
	}
	return nil
}

func typeReferenceFromStreamingResponse(
	streamingResponse *ir.StreamingResponse,
) (*ir.TypeReference, error) {
	if streamingResponse == nil {
		return nil, nil
	}
	switch streamingResponse.Type {
	case "json":
		return streamingResponse.Json.Payload, nil
	case "text":
		return ir.NewTypeReferenceFromPrimitive(ir.PrimitiveTypeString), nil
	}
	return nil, fmt.Errorf("unsupported streaming response type: %s", streamingResponse.Type)
}

// needsRequestParameter returns true if the endpoint needs a request parameter in its
// function signature.
func needsRequestParameter(endpoint *ir.HttpEndpoint) bool {
	if endpoint.SdkRequest == nil {
		return false
	}
	if len(endpoint.QueryParameters) > 0 {
		return true
	}
	if len(endpoint.Headers) > 0 {
		return true
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
	if typeReference.Primitive != "" {
		return typeReference.Primitive
	}
	if typeReference.Container != nil && typeReference.Container.Optional != nil {
		return maybePrimitive(typeReference.Container.Optional)
	}
	return ""
}

// isLiteralType returns true if the given type reference is a literal.
func isLiteralType(typeReference *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) bool {
	if typeReference.Named != nil {
		typeDeclaration := types[typeReference.Named.TypeId]
		return typeDeclaration.Shape.Alias != nil && isLiteralType(typeDeclaration.Shape.Alias.AliasOf, types)
	}
	if typeReference.Container != nil && typeReference.Container.Optional != nil {
		return isLiteralType(typeReference.Container.Optional, types)
	}
	return typeReference.Container != nil && typeReference.Container.Literal != nil
}

// isOptionalType returns true if the given type reference is an optional.
func isOptionalType(typeReference *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) bool {
	if typeReference.Named != nil {
		typeDeclaration := types[typeReference.Named.TypeId]
		return typeDeclaration.Shape.Alias != nil && isOptionalType(typeDeclaration.Shape.Alias.AliasOf, types)
	}
	return typeReference.Container != nil && typeReference.Container.Optional != nil
}

// needsOptionalDereference returns true if the optional type needs to be referenced.
//
// Container types like lists, maps, and sets are already nil-able, so they don't
// require a dereference prefix.
func needsOptionalDereference(optionalTypeReference *ir.TypeReference) bool {
	return optionalTypeReference.Container == nil
}
