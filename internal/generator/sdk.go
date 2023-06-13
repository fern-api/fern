package generator

import "github.com/fern-api/fern-go/internal/fern/ir"

// WriteClient writes a client for interacting with the given service.
func (f *fileWriter) WriteClient(service *ir.HttpService) error {
	f.P("type ", service.Name.FernFilepath.File.PascalCase.UnsafeName, "Client interface {}")
	return nil
}

func (f *fileWriter) WriteError(errorDeclaration *ir.ErrorDeclaration) error {
	f.P("type ", errorDeclaration.Name.Name.PascalCase.UnsafeName, " struct {")
	f.P("StatusCode int `json:\"-\"`")
	if errorDeclaration.Type == nil {
		// This error doesn't have a body, so we only need to include the status code.
		f.P("}")
		f.P()
		return nil
	}
	if errorDeclaration.Type.Named != nil {
		// TODO: Write out the properties specified on the given type.
	}
	// TODO: Otherwise, need to use a [de]serialization strategy similar to undiscriminated unions
	// for the built-in types.
	f.P("}")
	f.P()
	return nil
}
