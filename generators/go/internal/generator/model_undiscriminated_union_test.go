package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetStrictObjectKeys(t *testing.T) {
	base := objectType(objectProperty("Genus"))
	fern := objectType(listStringProperty("Fronds"), optionalStringProperty("Habitat"))
	fern.Shape.Object.Extends = []*ir.DeclaredTypeName{{TypeId: "Base"}}
	permissive := objectType(objectProperty("Name"))
	permissive.Shape.Object.ExtraProperties = true
	extendsPermissive := objectType(objectProperty("Leaf"))
	extendsPermissive.Shape.Object.Extends = []*ir.DeclaredTypeName{{TypeId: "Permissive"}}
	alias := &ir.TypeDeclaration{Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{
		AliasOf: &ir.TypeReference{Named: &ir.NamedType{TypeId: "Base"}},
	}}}
	aliasOfAlias := &ir.TypeDeclaration{Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{
		AliasOf: &ir.TypeReference{Named: &ir.NamedType{TypeId: "Alias"}},
	}}}
	permissiveAlias := &ir.TypeDeclaration{Shape: &ir.Type{Alias: &ir.AliasTypeDeclaration{
		AliasOf: &ir.TypeReference{Named: &ir.NamedType{TypeId: "Permissive"}},
	}}}
	withUnknown := objectType(objectProperty("Id"))
	withUnknown.Shape.Object.Properties = append(withUnknown.Shape.Object.Properties, &ir.ObjectProperty{
		Name:      nameAndWireValue("Metadata"),
		ValueType: &ir.TypeReference{Type: "unknown", Unknown: map[string]interface{}{}},
	})
	types := map[common.TypeId]*ir.TypeDeclaration{
		"Base":              base,
		"AliasOfAlias":      aliasOfAlias,
		"PermissiveAlias":   permissiveAlias,
		"WithUnknown":       withUnknown,
		"Fern":              fern,
		"Permissive":        permissive,
		"ExtendsPermissive": extendsPermissive,
		"Alias":             alias,
	}

	keys := getStrictObjectKeys("Fern", types)
	require.NotNil(t, keys)
	assert.Equal(t, []string{"Genus", "Fronds", "Habitat"}, keys.known)
	assert.Equal(t, []string{"Genus", "Fronds"}, keys.required)

	assert.Nil(t, getStrictObjectKeys("Permissive", types))
	assert.Nil(t, getStrictObjectKeys("ExtendsPermissive", types))
	for _, typeId := range []common.TypeId{"Alias", "AliasOfAlias"} {
		aliasKeys := getStrictObjectKeys(typeId, types)
		require.NotNil(t, aliasKeys)
		assert.Equal(t, []string{"Genus"}, aliasKeys.known)
		assert.Equal(t, []string{"Genus"}, aliasKeys.required)
	}
	assert.Nil(t, getStrictObjectKeys("PermissiveAlias", types))

	unknownKeys := getStrictObjectKeys("WithUnknown", types)
	require.NotNil(t, unknownKeys)
	assert.Equal(t, []string{"Id", "Metadata"}, unknownKeys.known)
	assert.Equal(t, []string{"Id"}, unknownKeys.required)
	assert.Nil(t, getStrictObjectKeys("Missing", types))
}

func TestStringSliceLiteral(t *testing.T) {
	assert.Equal(t, `[]string{}`, stringSliceLiteral(nil))
	assert.Equal(t, `[]string{"a", "b\"c"}`, stringSliceLiteral([]string{"a", `b"c`}))
}
