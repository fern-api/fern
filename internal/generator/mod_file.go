package generator

import (
	"bytes"
	"fmt"
)

// modFilename is the default name of a Go module file.
const modFilename = "go.mod"

// NewModFile returns a new *File for a go.mod.
//
// For example,
//
// module github.com/fern-api/fern-go
//
// go 1.19
//
// require github.com/gofrs/uuid/v5 v5.0.0
func NewModFile(c *ModuleConfig) (*File, error) {
	if c.Path == "" {
		return nil, fmt.Errorf("module path is required")
	}

	buffer := bytes.NewBuffer(nil)

	// Write the module path.
	fmt.Fprintf(buffer, "module %s\n", c.Path)
	fmt.Fprintln(buffer)

	// Write the go version.
	if c.Version != "" {
		fmt.Fprintf(buffer, "go %s\n", c.Version)
		fmt.Fprintln(buffer)
	}

	// Write all of the imports in a single require block.
	fmt.Fprint(buffer, "require (\n")
	for path, version := range c.Imports {
		fmt.Fprintf(buffer, "\t%s %s\n", path, version)
	}
	fmt.Fprint(buffer, ")\n")
	fmt.Fprintln(buffer)

	return &File{
		Path:    modFilename,
		Content: buffer.Bytes(),
	}, nil
}
