package generator

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
	"github.com/stretchr/testify/require"
)

const errorGetBodyTestBaseImportPath = "github.com/acme/test"

// newErrorTestWriter builds a bare fileWriter suitable for exercising the
// emitted error types in the root package.
func newErrorTestWriter(types map[common.TypeId]*ir.TypeDeclaration) *fileWriter {
	f := newHeaderTestWriter(types)
	f.filename = "errors.go"
	f.packageName = "api"
	// File() logs to the coordinator; point it at a closed port so the log is dropped.
	f.coordinator = coordinator.NewClient("http://127.0.0.1:1", "test")
	return f
}

// newErrorDeclarationForTest builds an IR error declaration with the given
// name, status code, and (optional) body type.
func newErrorDeclarationForTest(name string, statusCode int, bodyType *ir.TypeReference) *ir.ErrorDeclaration {
	return &ir.ErrorDeclaration{
		Name: newDeclaredErrorNameForTest(name),
		DiscriminantValue: &common.NameAndWireValue{
			WireValue: name,
			Name: &common.Name{
				OriginalName: name,
				CamelCase:    &common.SafeAndUnsafeString{UnsafeName: name, SafeName: name},
				PascalCase:   &common.SafeAndUnsafeString{UnsafeName: name, SafeName: name},
			},
		},
		Type:       bodyType,
		StatusCode: statusCode,
	}
}

func newDeclaredErrorNameForTest(name string) *ir.DeclaredErrorName {
	return &ir.DeclaredErrorName{
		ErrorId:      ir.ErrorId("error_:" + name),
		FernFilepath: &common.FernFilepath{},
		Name: &common.Name{
			OriginalName: name,
			CamelCase:    &common.SafeAndUnsafeString{UnsafeName: name, SafeName: name},
			PascalCase:   &common.SafeAndUnsafeString{UnsafeName: name, SafeName: name},
		},
	}
}

func newObjectTypesForTest(typeId string) map[common.TypeId]*ir.TypeDeclaration {
	return map[common.TypeId]*ir.TypeDeclaration{
		common.TypeId(typeId): {
			Shape: &ir.Type{
				Type:   "object",
				Object: &ir.ObjectTypeDeclaration{},
			},
		},
	}
}

// errorsSourceForDeclarations emits the error types for the given declarations.
func errorsSourceForDeclarations(t *testing.T, types map[common.TypeId]*ir.TypeDeclaration, errorDeclarations ...*ir.ErrorDeclaration) *fileWriter {
	t.Helper()
	f := newErrorTestWriter(types)
	for _, errorDeclaration := range errorDeclarations {
		require.NoError(t, f.WriteError(errorDeclaration))
	}
	return f
}

// TestErrorGetBodyMatchesBodyFieldType asserts that GetBody's return type is
// exactly the Body field's type for object, optional, list, and primitive bodies,
// and that it is nil-safe on the receiver.
func TestErrorGetBodyMatchesBodyFieldType(t *testing.T) {
	objectTypeId := "type_:PlaidError"
	types := newObjectTypesForTest(objectTypeId)
	objectRef := newNamedTypeReferenceForTest(objectTypeId, "PlaidError")

	f := errorsSourceForDeclarations(
		t,
		types,
		newErrorDeclarationForTest("BadRequestError", 400, objectRef),
		newErrorDeclarationForTest("OptionalError", 401, newOptionalTypeReferenceForTest(objectRef)),
		newErrorDeclarationForTest("OptionalStringError", 402, newOptionalTypeReferenceForTest(newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String))),
		newErrorDeclarationForTest("ListError", 403, &ir.TypeReference{
			Type:      "container",
			Container: &ir.ContainerType{Type: "list", List: objectRef},
		}),
		newErrorDeclarationForTest("StringError", 404, newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String)),
		newErrorDeclarationForTest("IntError", 405, newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1Integer)),
	)
	src := stripSpace(f.buffer.String())

	for _, want := range []string{
		"Body *PlaidError\n}",
		"func (b *BadRequestError) GetBody() *PlaidError {\nif b == nil {\nreturn nil\n}\nreturn b.Body\n}",
		"func (o *OptionalError) GetBody() *PlaidError {\nif o == nil {\nreturn nil\n}\nreturn o.Body\n}",
		"func (o *OptionalStringError) GetBody() *string {\nif o == nil {\nreturn nil\n}\nreturn o.Body\n}",
		"func (l *ListError) GetBody() []*PlaidError {\nif l == nil {\nreturn nil\n}\nreturn l.Body\n}",
		"func (s *StringError) GetBody() string {\nif s == nil {\nreturn \"\"\n}\nreturn s.Body\n}",
		"func (i *IntError) GetBody() int {\nif i == nil {\nreturn 0\n}\nreturn i.Body\n}",
	} {
		if !strings.Contains(src, stripSpace(want)) {
			t.Errorf("emitted source must contain %q, but does not:\n%s", want, f.buffer.String())
		}
	}
}

// TestErrorWithoutBodyHasNoGetBody asserts that errors without a body are
// emitted exactly as before, without a GetBody accessor.
func TestErrorWithoutBodyHasNoGetBody(t *testing.T) {
	f := errorsSourceForDeclarations(t, nil, newErrorDeclarationForTest("NotFoundError", 404, nil))
	src := f.buffer.String()
	require.NotContains(t, src, "GetBody")
	require.NotContains(t, src, "Body ")
	require.Contains(t, stripSpace(src), stripSpace("func (n *NotFoundError) UnmarshalJSON(data []byte) error {\nn.StatusCode = 404\nreturn nil\n}"))
}

// TestErrorGetBodyThroughWrappedErrors compiles the emitted error types into a
// throwaway module and proves that a single interface-based errors.As covers
// every status-specific error, including through fmt.Errorf("%w") wrapping,
// a nil Body, and a nil receiver.
func TestErrorGetBodyThroughWrappedErrors(t *testing.T) {
	goBinary, err := exec.LookPath("go")
	if err != nil {
		t.Skip("go binary not found on PATH")
	}

	objectTypeId := "type_:PlaidError"
	types := newObjectTypesForTest(objectTypeId)
	objectRef := newNamedTypeReferenceForTest(objectTypeId, "PlaidError")
	f := errorsSourceForDeclarations(
		t,
		types,
		newErrorDeclarationForTest("BadRequestError", 400, objectRef),
		newErrorDeclarationForTest("UnauthorizedError", 401, objectRef),
		newErrorDeclarationForTest("ServerError", 500, newOptionalTypeReferenceForTest(objectRef)),
	)
	file, err := f.File()
	require.NoError(t, err)

	dir := t.TempDir()
	require.NoError(t, os.MkdirAll(filepath.Join(dir, "core"), 0755))
	writeTestFile(t, filepath.Join(dir, "go.mod"), "module "+errorGetBodyTestBaseImportPath+"\n\ngo 1.18\n")
	writeTestFile(t, filepath.Join(dir, "core", "api_error.go"), apiErrorFile)
	writeTestFile(t, filepath.Join(dir, "errors.go"), string(file.Content))
	writeTestFile(t, filepath.Join(dir, "types.go"), `package api

type PlaidError struct {
	ErrorCode string `+"`json:\"error_code\"`"+`
}
`)
	writeTestFile(t, filepath.Join(dir, "errors_test.go"), `package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"testing"

	"`+errorGetBodyTestBaseImportPath+`/core"
)

type bodyProvider interface{ GetBody() *PlaidError }

func decode(t *testing.T, target interface{ UnmarshalJSON([]byte) error }, body string) error {
	if err := target.UnmarshalJSON([]byte(body)); err != nil {
		t.Fatal(err)
	}
	return target.(error)
}

func TestGetBodyThroughWrappedErrors(t *testing.T) {
	bad := &BadRequestError{APIError: core.NewAPIError(400, nil, errors.New("bad"))}
	unauthorized := &UnauthorizedError{APIError: core.NewAPIError(401, nil, errors.New("unauthorized"))}
	server := &ServerError{APIError: core.NewAPIError(500, nil, errors.New("server"))}
	for _, tc := range []struct {
		err  error
		code string
	}{
		{decode(t, bad, `+"`"+`{"error_code":"INVALID_REQUEST"}`+"`"+`), "INVALID_REQUEST"},
		{decode(t, unauthorized, `+"`"+`{"error_code":"INVALID_API_KEYS"}`+"`"+`), "INVALID_API_KEYS"},
		{decode(t, server, `+"`"+`{"error_code":"INTERNAL_SERVER_ERROR"}`+"`"+`), "INTERNAL_SERVER_ERROR"},
	} {
		wrapped := fmt.Errorf("outer: %w", fmt.Errorf("inner: %w", tc.err))
		var bp bodyProvider
		if !errors.As(wrapped, &bp) {
			t.Fatalf("errors.As did not find bodyProvider in %T", tc.err)
		}
		if got := bp.GetBody().ErrorCode; got != tc.code {
			t.Fatalf("got error code %q, want %q", got, tc.code)
		}
	}
}

func TestGetBodyIsNilSafe(t *testing.T) {
	var nilReceiver *BadRequestError
	if nilReceiver.GetBody() != nil {
		t.Fatal("nil receiver must return nil")
	}
	var nilOptionalReceiver *ServerError
	if nilOptionalReceiver.GetBody() != nil {
		t.Fatal("nil receiver must return nil")
	}
	server := &ServerError{APIError: core.NewAPIError(500, nil, nil)}
	if err := json.Unmarshal([]byte(""), server); err == nil {
		t.Fatal("expected json.Unmarshal of empty input to fail")
	}
	if server.GetBody() != nil {
		t.Fatal("nil Body must return nil")
	}
	var bp bodyProvider
	if !errors.As(fmt.Errorf("wrapped: %w", server), &bp) || bp.GetBody() != nil {
		t.Fatal("wrapped error with nil Body must be found and return nil")
	}
}
`)

	cmd := exec.Command(goBinary, "test", "./...")
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "GOFLAGS=-mod=mod", "GOWORK=off")
	output, err := cmd.CombinedOutput()
	require.NoError(t, err, "generated errors did not compile or pass:\n%s\n\ngenerated source:\n%s", output, file.Content)
}

func writeTestFile(t *testing.T, path string, content string) {
	t.Helper()
	require.NoError(t, os.WriteFile(path, []byte(content), 0644))
}
