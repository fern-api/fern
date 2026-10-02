package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
	"github.com/fern-api/fern-go/internal/gospec"
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

func TestOptionalAliasPointerGoType(t *testing.T) {
	const baseImportPath = "example.com/sdk"
	str := primitiveTypeReference(common.PrimitiveTypeV1String)
	alias := func(aliasOf *ir.TypeReference) *ir.TypeDeclaration {
		return &ir.TypeDeclaration{Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{AliasOf: aliasOf}}}
	}
	named := func(typeID common.TypeId) *ir.TypeReference {
		return &ir.TypeReference{Named: &ir.NamedType{
			TypeId:       typeID,
			Name:         &common.Name{PascalCase: &common.SafeAndUnsafeString{UnsafeName: string(typeID), SafeName: string(typeID)}},
			FernFilepath: &common.FernFilepath{},
		}}
	}
	types := map[common.TypeId]*ir.TypeDeclaration{
		"NullableString":  alias(nullableTypeReference(str)),
		"NullableList":    alias(nullableTypeReference(listTypeReference(str))),
		"NullableUnknown": alias(nullableTypeReference(&ir.TypeReference{Unknown: "unknown"})),
		"NullableDate":    alias(nullableTypeReference(primitiveTypeReference(common.PrimitiveTypeV1Date))),
		"NullableDateRef": alias(named("NullableDate")),
	}

	for _, tc := range []struct {
		name        string
		reference   *ir.TypeReference
		wantDefault string
		wantLegacy  string
	}{
		{"nullable pointer alias", nullableTypeReference(named("NullableString")), "NullableString", "*NullableString"},
		{"optional pointer alias", optionalTypeReference(named("NullableString")), "NullableString", "*NullableString"},
		{"optional nullable pointer alias", optionalTypeReference(nullableTypeReference(named("NullableString"))), "NullableString", "*NullableString"},
		{"nullable list alias", nullableTypeReference(named("NullableList")), "*NullableList", "*NullableList"},
		{"nullable unknown alias", nullableTypeReference(named("NullableUnknown")), "*NullableUnknown", "*NullableUnknown"},
		{"nullable date alias", nullableTypeReference(named("NullableDate")), "NullableDate", "NullableDate"},
		{"chained nullable date alias", optionalTypeReference(named("NullableDateRef")), "NullableDateRef", "NullableDateRef"},
	} {
		for _, legacy := range []bool{false, true} {
			want := tc.wantDefault
			if legacy {
				want = tc.wantLegacy
			}
			got := typeReferenceToGoType(tc.reference, types, gospec.NewScope(), baseImportPath, baseImportPath, false, legacy)
			if got != want {
				t.Errorf("%s (legacyNullableAliasPointers=%v): got %q, want %q", tc.name, legacy, got, want)
			}
		}
	}
}
