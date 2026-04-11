package generator

import (
	"bytes"
	"fmt"
	"sort"

	"github.com/fern-api/fern-go/internal/coordinator"
)

const (
	// minimumGoVersion specifies the minimum Go version required to
	// use this library. We require at least 1.18, which is when
	// generics were officially introduced.
	minimumGoVersion = "1.18"

	// modFilename is the default name of a Go module file.
	modFilename = "go.mod"
)

// NewModFile returns a new *File for a go.mod.
//
// For example,
//
// module github.com/fern-api/fern-go
//
// go 1.18
//
// require github.com/google/uuid v1.4.0
func NewModFile(coordinator *coordinator.Client, c *ModuleConfig) (*File, string, error) {
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
		version = minimumGoVersion
	}
	fmt.Fprintf(buffer, "go %s\n", version)
	fmt.Fprintln(buffer)

	// Write all of the imports in a single require block (sorted for determinism).
	paths := make([]string, 0, len(c.Imports))
	for p := range c.Imports {
		paths = append(paths, p)
	}
	sort.Strings(paths)
	fmt.Fprint(buffer, "require (\n")
	for _, p := range paths {
		fmt.Fprintf(buffer, "\t%s %s\n", p, c.Imports[p])
	}
	fmt.Fprint(buffer, ")\n")
	fmt.Fprintln(buffer)

	return NewFile(
		coordinator,
		modFilename,
		buffer.Bytes(),
	), version, nil
}
