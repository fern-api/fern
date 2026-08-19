package gospec

import (
	"fmt"
	"go/format"
	"sort"
)

// Imports is a map from import paths to aliases.
// A separate set of reserved aliases are tracked
// to prevent naming collisions with identifiers
// used within the same scope.
//
// Note this type should primarily be used via the
// Scope type; it's public so that it's easy to
// access the import values directly.
type Imports struct {
	Values map[string]string

	reserved map[string]struct{}
}

func NewImports() *Imports {
	return &Imports{
		Values:   make(map[string]string),
		reserved: make(map[string]struct{}),
	}
}

func (i *Imports) Add(alias string, path string) {
	i.Values[path] = alias
}

func (i *Imports) InUse(alias string) bool {
	for _, s := range i.Values {
		if s == alias {
			return true
		}
	}
	return false
}

func (i *Imports) Reserve(alias string) {
	i.reserved[alias] = struct{}{}
}

func (i *Imports) Exists(alias string) bool {
	if _, ok := i.reserved[alias]; ok {
		return ok
	}
	return i.InUse(alias)
}

func (i *Imports) String() string {
	if len(i.Values) == 0 {
		return ""
	}
	if len(i.Values) == 1 {
		for path, alias := range i.Values {
			return fmt.Sprintf("import %s %q\n", alias, path)
		}
	}

	// Sort the import statements for deterministic results.
	type statement struct {
		Alias string
		Path  string
	}
	var statements []statement
	for path, alias := range i.Values {
		statements = append(statements, statement{Alias: alias, Path: path})
	}
	sort.Slice(statements, func(j, k int) bool { return statements[j].Alias < statements[k].Alias })

	importBlock := "import (\n"
	for _, statement := range statements {
		importBlock += fmt.Sprintf("\t%s %q\n", statement.Alias, statement.Path)
	}
	importBlock += ")\n"

	bytes, err := format.Source([]byte(importBlock))
	if err != nil {
		// Best effort.
		return importBlock
	}

	return string(bytes)
}
