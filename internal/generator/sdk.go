package generator

import "github.com/fern-api/fern-go/internal/fern/ir"

// WriteClient writes a client for interacting with the given service.
func (f *fileWriter) WriteClient(service *ir.HttpService) error {
	f.P("type ", service.Name.FernFilepath.File.PascalCase.UnsafeName, "Client interface {}")
	return nil
}

func (f *fileWriter) WriteError(errorDeclaration *ir.ErrorDeclaration) error {
	f.P("type ", errorDeclaration.Name.Name.PascalCase.UnsafeName, " struct {")
	f.P("StatusCode int")
	if errorDeclaration.Type == nil {
		// This error doesn't have a body, so we only need to include the status code.
		f.P("}")
		f.P()
		return nil
	}
	importPath := fernFilepathToImportPath(f.baseImportPath, errorDeclaration.Name.FernFilepath)
	value := typeReferenceToGoType(errorDeclaration.Type, f.types, f.imports, f.baseImportPath, importPath)
	f.P("Body ", value)
	f.P("}")
	f.P()

	// TODO: Generate the [un]marshaler logic.
	// literal = literalToValue(unionMember.Type.Container.Literal)
	return nil
}
