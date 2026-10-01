package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

func TestIsAliasToPointerType(t *testing.T) {
	str := primitiveTypeReference(common.PrimitiveTypeV1String)
	alias := func(aliasOf *ir.TypeReference) *ir.TypeDeclaration {
		return &ir.TypeDeclaration{Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{AliasOf: aliasOf}}}
	}
	types := map[common.TypeId]*ir.TypeDeclaration{
		"object":                 {Shape: &ir.Type{Object: &ir.ObjectTypeDeclaration{}}},
		"listAlias":              alias(listTypeReference(str)),
		"nullableString":         alias(nullableTypeReference(str)),
		"optionalString":         alias(optionalTypeReference(str)),
		"nullableObject":         alias(nullableTypeReference(namedTypeReference("object"))),
		"nullableListAliasRef":   alias(nullableTypeReference(namedTypeReference("listAlias"))),
		"nullableList":           alias(nullableTypeReference(listTypeReference(str))),
		"nullableMap":            alias(nullableTypeReference(mapTypeReference(str, str))),
		"nullableUnknown":        alias(nullableTypeReference(&ir.TypeReference{Unknown: "unknown"})),
		"optionalNullableList":   alias(optionalTypeReference(nullableTypeReference(listTypeReference(str)))),
		"optionalNullableString": alias(optionalTypeReference(nullableTypeReference(str))),
		"aliasOfNullableString":  alias(namedTypeReference("nullableString")),
		"aliasOfNullableMap":     alias(namedTypeReference("nullableMap")),
		"plainString":            alias(str),
		"cycleA":                 alias(namedTypeReference("cycleB")),
		"cycleB":                 alias(namedTypeReference("cycleA")),
	}

	for _, tc := range []struct {
		typeID common.TypeId
		want   bool
	}{
		{"object", false},
		{"listAlias", false},
		{"nullableString", true},
		{"optionalString", true},
		{"nullableObject", true},
		{"nullableListAliasRef", true},
		{"nullableList", false},
		{"nullableMap", false},
		{"nullableUnknown", false},
		{"optionalNullableList", false},
		{"optionalNullableString", true},
		{"aliasOfNullableString", true},
		{"aliasOfNullableMap", false},
		{"plainString", false},
		{"cycleA", false},
		{"missing", false},
	} {
		if got := isAliasToPointerType(tc.typeID, types); got != tc.want {
			t.Errorf("%s: isAliasToPointerType = %v, want %v", tc.typeID, got, tc.want)
		}
	}
}
