package generator

import (
	"bytes"
	"fmt"
	"go/format"
	"go/parser"
	"go/token"
	"path"
	"strconv"
	"strings"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/gospec"
	"golang.org/x/tools/go/ast/astutil"
)

// fileHeader is the comment included in every generated Go file.
const fileHeader = `// Code generated by Fern. DO NOT EDIT.

`

// fileHeader is the comment included in every generated Go file.
const whitelabelFileHeader = `// Code generated from our API definition. DO NOT EDIT.

`

// fileWriter wries and formats Go files.
type fileWriter struct {
	filename                     string
	packageName                  string
	baseImportPath               string
	whitelabel                   bool
	alwaysSendRequiredProperties bool
	inlinePathParameters         bool
	inlineFileProperties         bool
	useReaderForBytesRequest     bool
	unionVersion                 UnionVersion
	packageLayout                PackageLayout
	scope                        *gospec.Scope
	types                        map[ir.TypeId]*ir.TypeDeclaration
	errors                       map[ir.ErrorId]*ir.ErrorDeclaration
	coordinator                  *coordinator.Client
	snippetWriter                *SnippetWriter

	buffer *bytes.Buffer
}

func newFileWriter(
	filename string,
	packageName string,
	baseImportPath string,
	whitelabel bool,
	alwaysSendRequiredProperties bool,
	inlinePathParameters bool,
	inlineFileProperties bool,
	useReaderForBytesRequest bool,
	packageLayout PackageLayout,
	unionVersion UnionVersion,
	types map[ir.TypeId]*ir.TypeDeclaration,
	errors map[ir.ErrorId]*ir.ErrorDeclaration,
	coordinator *coordinator.Client,
) *fileWriter {
	// The default set of imports used in the generated output.
	// These imports are removed from the generated output if
	// they aren't used.
	scope := gospec.NewScope()
	scope.AddImport("bytes")
	scope.AddImport("context")
	scope.AddImport("encoding/base64")
	scope.AddImport("encoding/json")
	scope.AddImport("errors")
	scope.AddImport("fmt")
	scope.AddImport("io")
	scope.AddImport("mime/multipart")
	scope.AddImport("net/http")
	scope.AddImport("net/url")
	scope.AddImport("os")
	scope.AddImport("strconv")
	scope.AddImport("strings")
	scope.AddImport("testing")
	scope.AddImport("time")
	scope.AddImport("github.com/google/uuid")
	scope.AddImport("github.com/stretchr/testify/assert")
	scope.AddImport("github.com/stretchr/testify/require")

	// Add an import to the core utilities package generated for
	// the SDK.
	scope.AddImport(path.Join(baseImportPath, "core"))
	scope.AddImport(path.Join(baseImportPath, "internal"))
	scope.AddImport(path.Join(baseImportPath, "option"))

	f := &fileWriter{
		filename:                     filename,
		packageName:                  packageName,
		baseImportPath:               baseImportPath,
		whitelabel:                   whitelabel,
		alwaysSendRequiredProperties: alwaysSendRequiredProperties,
		inlinePathParameters:         inlinePathParameters,
		inlineFileProperties:         inlineFileProperties,
		useReaderForBytesRequest:     useReaderForBytesRequest,
		packageLayout:                packageLayout,
		unionVersion:                 unionVersion,
		scope:                        scope,
		types:                        types,
		errors:                       errors,
		coordinator:                  coordinator,
		buffer:                       new(bytes.Buffer),
	}
	f.snippetWriter = NewSnippetWriter(baseImportPath, unionVersion, types, f)
	return f
}

// P writes the given element into a single line, concluding with a newline.
func (f *fileWriter) P(elements ...any) {
	for _, element := range elements {
		fmt.Fprint(f.buffer, element)
	}
	fmt.Fprintln(f.buffer)
}

// File formats and writes the content stored in the writer's buffer into a *File.
func (f *fileWriter) File() (*File, error) {
	// Start with the package declaration and import statements.
	header := f.clone()
	if f.whitelabel {
		header.P(whitelabelFileHeader)
	} else {
		header.P(fileHeader)
	}
	header.P("package ", f.packageName)
	header.P("import (")
	for importDecl, importAlias := range f.scope.Imports.Values {
		header.P(fmt.Sprintf("%s %q", importAlias, importDecl))
	}
	header.P(")")

	formatted, err := removeUnusedImports(f.filename, append(header.buffer.Bytes(), f.buffer.Bytes()...))
	if err != nil {
		fmt.Println(string(append(header.buffer.Bytes(), f.buffer.Bytes()...)))
		return nil, err
	}

	return NewFile(f.coordinator, f.filename, formatted), nil
}

// DocsFile acts like File, but is tailored to write docs.go files.
func (f *fileWriter) DocsFile() *File {
	f.P("package ", f.packageName)
	return NewFile(f.coordinator, f.filename, append([]byte(fileHeader), f.buffer.Bytes()...))
}

// WriteDocs is a convenience function to writes the given documentation, if any.
// This prevents us from having to perform a nil check and length check at every
// call site.
func (f *fileWriter) WriteDocs(docs *string) {
	if docs == nil || len(*docs) == 0 {
		return
	}
	split := strings.Split(*docs, "\n")
	for _, line := range split {
		f.P("// " + line)
	}
}

// WriteRaw writes the raw string into the file.
func (f *fileWriter) WriteRaw(s string) {
	fmt.Fprint(f.buffer, s)
}

// clone returns a clone of this fileWriter.
func (f *fileWriter) clone() *fileWriter {
	return newFileWriter(
		f.filename,
		f.packageName,
		f.baseImportPath,
		f.whitelabel,
		f.alwaysSendRequiredProperties,
		f.inlinePathParameters,
		f.inlineFileProperties,
		f.useReaderForBytesRequest,
		f.packageLayout,
		f.unionVersion,
		f.types,
		f.errors,
		f.coordinator,
	)
}

// removeUnusedImports parses the buffer, interpreting it as Go code,
// and removes all unused imports. If successful, the result is then
// formatted.
func removeUnusedImports(filename string, buf []byte) ([]byte, error) {
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, filename, buf, parser.ParseComments)
	if err != nil {
		// Instead of returning an error, just return the original buffer unchanged.
		return buf, nil
	}

	imports := make(map[string]string)
	for _, route := range f.Imports {
		importPath, err := strconv.Unquote(route.Path.Value)
		if err != nil {
			// Unreachable. If the file parsed successfully,
			// the unquote will never fail.
			return nil, err
		}
		imports[route.Name.Name] = importPath
	}

	for name, path := range imports {
		if !astutil.UsesImport(f, path) {
			astutil.DeleteNamedImport(fset, f, name, path)
		}
	}

	var buffer bytes.Buffer
	if err := format.Node(&buffer, fset, f); err != nil {
		return nil, fmt.Errorf("failed to format Go code: %v", err)
	}

	return buffer.Bytes(), nil
}
