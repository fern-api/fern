package generator

import (
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// newGlobalHeaderTestWriter builds a bare fileWriter suitable for exercising the
// emitted core.RequestOptions definition.
func newGlobalHeaderTestWriter(types map[common.TypeId]*ir.TypeDeclaration) *fileWriter {
	return newFileWriter(
		"request_option.go",
		"core",
		"github.com/acme/test",
		false, // whitelabel
		false, // alwaysSendRequiredProperties
		false, // inlinePathParameters
		false, // inlineFileProperties
		false, // useReaderForBytesRequest
		false, // gettersPassByValue
		false, // dedupeUnionBaseProperties
		true,  // serverURLVariables
		false, // exportAllRequestsAtRoot
		false, // omitEmptyRequestWrappers
		userAgentConfig{},
		UnionVersionUnspecified,
		"",
		types,
		nil,
		(*coordinator.Client)(nil),
	)
}

// newGlobalHeaderForTest builds an IR global header with the given wire value,
// Go field name, and type.
func newGlobalHeaderForTest(wireValue string, fieldName string, valueType *ir.TypeReference) *ir.HttpHeader {
	return &ir.HttpHeader{
		Name: &common.NameAndWireValue{
			WireValue: wireValue,
			Name: &common.Name{
				OriginalName: wireValue,
				CamelCase:    &common.SafeAndUnsafeString{UnsafeName: fieldName, SafeName: fieldName},
				PascalCase:   &common.SafeAndUnsafeString{UnsafeName: fieldName, SafeName: fieldName},
			},
		},
		ValueType: valueType,
	}
}

func newPrimitiveTypeReferenceForTest(primitive common.PrimitiveTypeV1) *ir.TypeReference {
	return &ir.TypeReference{
		Type:      "primitive",
		Primitive: &ir.PrimitiveType{V1: primitive},
	}
}

func newOptionalTypeReferenceForTest(valueType *ir.TypeReference) *ir.TypeReference {
	return &ir.TypeReference{
		Type: "container",
		Container: &ir.ContainerType{
			Type:     "optional",
			Optional: valueType,
		},
	}
}

func newNamedTypeReferenceForTest(typeId string, name string) *ir.TypeReference {
	return &ir.TypeReference{
		Type: "named",
		Named: &ir.NamedType{
			TypeId:       common.TypeId(typeId),
			FernFilepath: &common.FernFilepath{},
			Name: &common.Name{
				OriginalName: name,
				CamelCase:    &common.SafeAndUnsafeString{UnsafeName: name, SafeName: name},
				PascalCase:   &common.SafeAndUnsafeString{UnsafeName: name, SafeName: name},
			},
		},
	}
}

// requestOptionsSourceForHeaders emits core/request_option.go for an API whose
// only configuration is the given global headers.
func requestOptionsSourceForHeaders(t *testing.T, headers []*ir.HttpHeader, types map[common.TypeId]*ir.TypeDeclaration) string {
	t.Helper()
	f := newGlobalHeaderTestWriter(types)
	if err := f.WriteRequestOptionsDefinition(
		&ir.ApiAuth{},
		headers,
		nil,             // idempotencyHeaders
		&ir.SdkConfig{}, // sdkConfig
		&ModuleConfig{}, // moduleConfig
		"",              // sdkVersion
		nil,             // environmentsConfig
		nil,             // inferredParams
	); err != nil {
		t.Fatalf("WriteRequestOptionsDefinition returned error: %v", err)
	}
	return f.buffer.String()
}

// TestGlobalHeadersAreOmittedWhenUnset asserts that global headers are only sent
// when they hold a value, matching the auth scheme header behavior. Previously
// every required global header was set unconditionally, so an SDK configured
// with just one of several global headers sent the rest as empty strings.
func TestGlobalHeadersAreOmittedWhenUnset(t *testing.T) {
	enumTypeId := common.TypeId("type_commons:Version")
	types := map[common.TypeId]*ir.TypeDeclaration{
		enumTypeId: {
			Shape: &ir.Type{
				Type: "enum",
				Enum: &ir.EnumTypeDeclaration{},
			},
		},
	}
	src := requestOptionsSourceForHeaders(
		t,
		[]*ir.HttpHeader{
			newGlobalHeaderForTest("PLAID-CLIENT-ID", "ClientId", newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String)),
			newGlobalHeaderForTest("X-API-Count", "Count", newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1Integer)),
			newGlobalHeaderForTest("X-API-Enabled", "Enabled", newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1Boolean)),
			newGlobalHeaderForTest("X-API-Datetime", "Datetime", newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1DateTime)),
			newGlobalHeaderForTest("X-API-Uuid", "Uuid", newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1Uuid)),
			newGlobalHeaderForTest("X-API-Version", "Version", newNamedTypeReferenceForTest(string(enumTypeId), "Version")),
			newGlobalHeaderForTest("X-API-Optional-Name", "OptionalName", newOptionalTypeReferenceForTest(newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String))),
		},
		types,
	)

	for _, want := range []string{
		`if r.ClientId != "" {`,
		"if !r.Datetime.IsZero() {",
		"if r.Uuid != uuid.Nil {",
		`if r.Version != "" {`,
		"if r.OptionalName != nil {",
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted request options missing %q\n---\n%s", want, src)
		}
	}

	// false and 0 are meaningful wire values that cannot be distinguished from an
	// unset field, so boolean and numeric headers are still always sent.
	for _, want := range []string{
		`header.Set("X-API-Count", fmt.Sprintf("%v", r.Count))`,
		`header.Set("X-API-Enabled", fmt.Sprintf("%v", r.Enabled))`,
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted request options missing unguarded %q\n---\n%s", want, src)
		}
	}
	for _, unwanted := range []string{"if r.Count", "if r.Enabled"} {
		if strings.Contains(src, unwanted) {
			t.Errorf("header with a meaningful zero value must not be guarded: %q\n---\n%s", unwanted, src)
		}
	}
}

// TestGlobalHeadersWithUncomparableTypesAreUnguarded asserts that headers whose
// generated Go type cannot be compared to a zero value (lists, maps, objects)
// keep the previous, unguarded behavior so that the generated code compiles.
func TestGlobalHeadersWithUncomparableTypesAreUnguarded(t *testing.T) {
	objectTypeId := common.TypeId("type_commons:Metadata")
	types := map[common.TypeId]*ir.TypeDeclaration{
		objectTypeId: {
			Shape: &ir.Type{
				Type:   "object",
				Object: &ir.ObjectTypeDeclaration{},
			},
		},
	}
	src := requestOptionsSourceForHeaders(
		t,
		[]*ir.HttpHeader{
			newGlobalHeaderForTest("X-API-Metadata", "Metadata", newNamedTypeReferenceForTest(string(objectTypeId), "Metadata")),
		},
		types,
	)

	if !strings.Contains(src, `header.Set("X-API-Metadata", fmt.Sprintf("%v", r.Metadata))`) {
		t.Errorf("expected unguarded header.Set for uncomparable header type:\n---\n%s", src)
	}
	if strings.Contains(src, "if r.Metadata !=") {
		t.Errorf("uncomparable header type must not be compared against a zero value:\n---\n%s", src)
	}
}
