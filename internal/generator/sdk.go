package generator

import (
	"fmt"
	"strings"

	"github.com/fern-api/fern-go/internal/fern/ir"
)

// WriteClient writes a client for interacting with the given service.
func (f *fileWriter) WriteClient(service *ir.HttpService) error {
	f.P("type ", service.Name.FernFilepath.File.PascalCase.UnsafeName, "Client interface {}")
	return nil
}

// WriteRequestType writes a type dedicated to the in-lined request (if any).
func (f *fileWriter) WriteRequestType(fernFilepath *ir.FernFilepath, endpoint *ir.HttpEndpoint) error {
	// At this point, we've already verified that the given endpoint's request
	// is a wrapper, so we can safely access it without any nil-checks.
	var (
		typeName = endpoint.SdkRequest.Shape.Wrapper.WrapperName.PascalCase.UnsafeName
		// receiver   = typeNameToReceiver(typeName)
		importPath = fernFilepathToImportPath(f.baseImportPath, fernFilepath)
	)

	f.P("type ", typeName, " struct {")
	for _, header := range endpoint.Headers {
		f.P(header.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(header.ValueType, f.types, f.imports, f.baseImportPath, importPath), "`json:\"-\"`")
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
		f.P(queryParam.Name.Name.PascalCase.UnsafeName, " ", value, "`json:\"-\"`")
	}
	// TODO: Write the body parameters, if any.
	f.P("}")
	f.P()
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
