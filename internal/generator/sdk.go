package generator

import "github.com/fern-api/fern-go/internal/fern/ir"

// WriteClient writes a client for interacting with the given service.
func (f *fileWriter) WriteClient(service *ir.HttpService) error {
	f.P("type ", service.Name.FernFilepath.File.PascalCase.UnsafeName, "Client interface {}")
	return nil
}
