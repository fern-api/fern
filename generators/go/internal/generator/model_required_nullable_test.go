package generator

import (
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

func TestWriteRequiredNullableFieldsEmitsExplicitTable(t *testing.T) {
	writer := newRequireTestWriter(nil)
	name := writeRequiredNullableFields(writer, "AccountBalance", []requiredNullableProperty{
		{wireValue: "limit", constantName: fieldBitConstantName("AccountBalance", "Limit")},
		{wireValue: "unofficial_currency_code", constantName: fieldBitConstantName("AccountBalance", "UnofficialCurrencyCode")},
	})
	if name != "accountBalanceRequiredNullableFields" {
		t.Fatalf("unexpected variable name %q", name)
	}
	src := writer.buffer.String()
	for _, want := range []string{
		"var accountBalanceRequiredNullableFields = map[string]*big.Int{",
		`"limit": accountBalanceFieldLimit,`,
		`"unofficial_currency_code": accountBalanceFieldUnofficialCurrencyCode,`,
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted table missing %q\n---\n%s", want, src)
		}
	}
}

func TestWriteRequiredNullableFieldsSkipsTypesWithoutNullableProperties(t *testing.T) {
	writer := newRequireTestWriter(nil)
	if name := writeRequiredNullableFields(writer, "AccountsResponse", nil); name != "" {
		t.Fatalf("expected no variable name, got %q", name)
	}
	if writer.buffer.Len() != 0 {
		t.Fatalf("expected no output, got\n%s", writer.buffer.String())
	}
	writeRequireFieldsFromJSON(writer, "a", "")
	if writer.buffer.Len() != 0 {
		t.Fatalf("expected no UnmarshalJSON presence tracking, got\n%s", writer.buffer.String())
	}
}

func TestWriteRequireFieldsFromJSON(t *testing.T) {
	writer := newRequireTestWriter(nil)
	writeRequireFieldsFromJSON(writer, "a", "accountBalanceRequiredNullableFields")
	src := writer.buffer.String()
	for _, want := range []string{
		"presentFields, err := internal.ExplicitFieldsFromJSON(data, accountBalanceRequiredNullableFields)",
		"a.require(presentFields)",
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted presence tracking missing %q\n---\n%s", want, src)
		}
	}
}

func TestIsNullableType(t *testing.T) {
	str := &ir.TypeReference{Primitive: &ir.PrimitiveType{V1: common.PrimitiveTypeV1String}}
	nullable := &ir.TypeReference{Container: &ir.ContainerType{Nullable: str}}
	optional := &ir.TypeReference{Container: &ir.ContainerType{Optional: str}}
	optionalNullable := &ir.TypeReference{Container: &ir.ContainerType{Optional: nullable}}
	aliasID := common.TypeId("alias")
	types := map[common.TypeId]*ir.TypeDeclaration{
		aliasID: {Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{AliasOf: nullable}}},
	}
	named := &ir.TypeReference{Named: &ir.NamedType{TypeId: aliasID}}

	for _, tc := range []struct {
		name string
		ref  *ir.TypeReference
		want bool
	}{
		{"nil", nil, false},
		{"primitive", str, false},
		{"nullable", nullable, true},
		{"optional", optional, false},
		{"optional<nullable>", optionalNullable, false},
		{"alias of nullable", named, true},
	} {
		if got := isNullableType(tc.ref, types); got != tc.want {
			t.Errorf("%s: isNullableType = %v, want %v", tc.name, got, tc.want)
		}
	}
}
