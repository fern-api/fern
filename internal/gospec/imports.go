package gospec

import (
	"fmt"
	"go/format"
	"regexp"
	"sort"
	"strings"
	"unicode"
)

// invalidIdentifier matches invalid identifier characters
// according to the Go language spec.
var invalidIdentifierChar = regexp.MustCompile("[^[:digit:][:alpha:]_]")

// Imports maps a set of import paths to unique aliases.
type Imports map[string]string

// Add adds the path to the imports map, initially using the
// base directory as the package alias. If this alias is
// already in use, we continue to prepend the remaining filepath
// elements until we have receive a unique alias. If all of the
// path elements are exhausted, an 'x' is continually used
// until we create a unique alias.
//
//	imports := NewImports("json")
//	imports.Add("encoding/json") -> "encodingjson"
//	imports.Add("encodingjson")  -> "_encodingjson"
func (imp Imports) Add(path string) string {
	if path == "" || path == "." || path == "/" {
		return ""
	}
	if alias, ok := imp[path]; ok {
		return alias
	}
	var (
		alias string
		elems = strings.Split(path, "/")
	)
	for i := 1; i <= len(elems); i++ {
		alias = newAlias(elems[len(elems)-i:])
		if imp.isValid(alias) {
			imp[path] = alias
			return alias
		}
	}
	for !imp.isValid(alias) {
		alias = fmt.Sprintf("_%s", alias)
	}
	imp[path] = alias
	return alias
}

func (imp Imports) String() string {
	if len(imp) == 0 {
		return ""
	}
	if len(imp) == 1 {
		for path, alias := range imp {
			return fmt.Sprintf("import %s %q\n", alias, path)
		}
	}

	// Sort the import statments for deterministic results.
	type statement struct {
		Alias string
		Path  string
	}
	var statements []statement
	for path, alias := range imp {
		statements = append(statements, statement{Alias: alias, Path: path})
	}
	sort.Slice(statements, func(i, j int) bool { return statements[i].Alias < statements[j].Alias })

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

// newAlias returns an alias for the given set of filepath elements.
// We explicitly remove all characters that are not included in
// the identifier grammar.
// For details, see https://golang.org/ref/spec#Identifiers.
func newAlias(elems []string) string {
	alias := strings.Join(elems, "")
	return invalidIdentifierChar.ReplaceAllString(alias, "")
}

// isValid determines whether the given alias is an invalid identifier,
// a Go keyword, or already registered in the import map.
func (imp Imports) isValid(alias string) bool {
	if len(alias) == 0 || isKeyword(alias) {
		return false
	}
	for _, r := range alias {
		// We use a range loop here so that we guarantee that we
		// select the first rune (and not arbitrary bytes).
		// For details, see https://blog.golang.org/strings.
		if !unicode.IsLetter(r) {
			return false
		}
		break
	}
	for _, s := range imp {
		if s == alias {
			return false
		}
	}
	return true
}

// isKeyword returns whether the given string is a Go keyword.
func isKeyword(s string) bool {
	_, ok := _keywords[s]
	return ok
}

// _keywords is a set of the Go language keywords.
var _keywords = map[string]struct{}{
	"any":         struct{}{},
	"break":       struct{}{},
	"case":        struct{}{},
	"chan":        struct{}{},
	"client":      struct{}{}, // TODO: Temporarily added to prevent conflicts.
	"const":       struct{}{},
	"continue":    struct{}{},
	"default":     struct{}{},
	"defer":       struct{}{},
	"else":        struct{}{},
	"fallthrough": struct{}{},
	"for":         struct{}{},
	"func":        struct{}{},
	"go":          struct{}{},
	"goto":        struct{}{},
	"if":          struct{}{},
	"import":      struct{}{},
	"interface":   struct{}{},
	"map":         struct{}{},
	"package":     struct{}{},
	"range":       struct{}{},
	"return":      struct{}{},
	"select":      struct{}{},
	"struct":      struct{}{},
	"switch":      struct{}{},
	"type":        struct{}{},
	"var":         struct{}{},
}
