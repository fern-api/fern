package gospec

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

// invalidIdentifier matches invalid identifier characters
// according to the Go language spec.
var invalidIdentifierChar = regexp.MustCompile("[^[:digit:][:alpha:]_]")

// Scope tracks all the identifiers used in the current scope, including
// import paths and their aliases.
type Scope struct {
	Imports     *Imports
	identifiers map[string]struct{}
}

// NewScope constructs a new Scope type.
func NewScope() *Scope {
	return &Scope{
		Imports:     NewImports(),
		identifiers: make(map[string]struct{}),
	}
}

// Child returns a new child scope, inheriting the values tracked
// on the parent.
//
// Note that the imports are passed by reference so they are mutated
// between children (i.e. for all the individual scopes in a file).
func (s *Scope) Child() *Scope {
	identifiers := make(map[string]struct{})
	for ident := range s.identifiers {
		identifiers[ident] = struct{}{}
	}
	return &Scope{
		Imports:     s.Imports,
		identifiers: identifiers,
	}
}

// Add adds the given identifier to the scope, preventing it
// from being used by another identifier, or an import alias.
func (s *Scope) Add(ident string) string {
	if ident == "" {
		return ""
	}
	if !s.isValid(ident) {
		// Pre-process the identifier to ensure it's valid.
		ident = newIdent(ident)
	}
	if _, ok := s.identifiers[ident]; !ok && !s.Imports.InUse(ident) {
		return s.add(ident)
	}
	for !s.isValid(ident) {
		ident = fmt.Sprintf("_%s", ident)
	}
	return s.add(ident)
}

// AddImport adds the path to the imports map, initially using the
// base directory as the package alias. If this alias is
// already in use, we continue to prepend the remaining filepath
// elements until we have receive a unique alias. If all of the
// path elements are exhausted, an '_' is continually used
// until we create a unique alias.
//
//	scope := NewScope("json")
//	scope.AddImport("encoding/json") -> "encodingjson"
//	scope.AddImport("encodingjson")  -> "_encodingjson"
func (s *Scope) AddImport(path string) string {
	if path == "" || path == "." || path == "/" {
		return ""
	}
	if alias, ok := s.Imports.Values[path]; ok {
		return alias
	}
	var (
		alias string
		elems = strings.Split(path, "/")
	)
	for i := 1; i <= len(elems); i++ {
		alias = newIdent(elems[len(elems)-i:]...)
		if s.isValid(alias) {
			return s.addImport(alias, path)
		}
	}
	for !s.isValid(alias) {
		alias = fmt.Sprintf("_%s", alias)
	}
	return s.addImport(alias, path)
}

// add adds the given identifier to the current scope,
// and reserves it so that it can't be used in the
// import map.
func (s *Scope) add(ident string) string {
	s.Imports.Reserve(ident)
	s.identifiers[ident] = struct{}{}
	return ident
}

// addImport adds the given alias and path to the current scope,
// and includes it in the chain of parent scopes.
func (s *Scope) addImport(alias, path string) string {
	s.Imports.Add(alias, path)
	s.identifiers[alias] = struct{}{}
	return alias
}

// isValid determines whether the given identifier is invalid, or
// already registered in the scope.
func (s *Scope) isValid(ident string) bool {
	if len(ident) == 0 || ident == "_" || isKeyword(ident) {
		return false
	}
	for _, r := range ident {
		// We use a range loop here so that we guarantee that we
		// select the first rune (and not arbitrary bytes).
		//
		// For details, see https://blog.golang.org/strings.
		if !unicode.IsLetter(r) && r != '_' {
			return false
		}
		break
	}
	if s.Imports.Exists(ident) {
		return false
	}
	for s := range s.identifiers {
		if s == ident {
			return false
		}
	}
	return true
}

// newIdent returns an ident for the given set of elements.
// We explicitly remove all characters that are not included
// in the identifier grammar.
//
// For details, see https://golang.org/ref/spec#Identifiers.
func newIdent(elems ...string) string {
	return invalidIdentifierChar.ReplaceAllString(strings.Join(elems, ""), "")
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
