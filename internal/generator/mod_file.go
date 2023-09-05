package generator

import (
	"bytes"
	"fmt"

	"github.com/fern-api/fern-go/internal/coordinator"
)

const (
	// minimumGoVersion specifies the minimum Go version required to
	// use this library. We require at least 1.13, which is when
	// modules were officially introduced.
	minimumGoVersion = "1.13"

	// minimumGoGenericsVersion specifies the minimum Go version if
	// the user requires generics (i.e. *Optional[T]).
	minimumGoGenericsVersion = "1.18"

	// modFilename is the default name of a Go module file.
	modFilename = "go.mod"
)

// NewModFile returns a new *File for a go.mod.
//
// For example,
//
// module github.com/fern-api/fern-go
//
// go 1.13
//
// require github.com/google/uuid v1.3.1
func NewModFile(coordinator *coordinator.Client, c *ModuleConfig, enableExplicitNull bool) (*File, string, error) {
	if c.Path == "" {
		return nil, "", fmt.Errorf("module path is required")
	}

	buffer := bytes.NewBuffer(nil)

	// Write the module path.
	fmt.Fprintf(buffer, "module %s\n", c.Path)
	fmt.Fprintln(buffer)

	// Write the go version.
	version := c.Version
	if version == "" {
		if enableExplicitNull {
			version = minimumGoGenericsVersion
		} else {
			version = minimumGoVersion
		}
	}
	fmt.Fprintf(buffer, "go %s\n", version)
	fmt.Fprintln(buffer)

	// Write all of the imports in a single require block.
	fmt.Fprint(buffer, "require (\n")
	for path, version := range c.Imports {
		fmt.Fprintf(buffer, "\t%s %s\n", path, version)
	}
	fmt.Fprint(buffer, ")\n")
	fmt.Fprintln(buffer)

	return NewFile(
		coordinator,
		modFilename,
		buffer.Bytes(),
	), version, nil
}
