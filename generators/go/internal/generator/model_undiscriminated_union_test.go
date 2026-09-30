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
	types := map[common.TypeId]*ir.TypeDeclaration{
		"Base":              base,
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
	assert.Nil(t, getStrictObjectKeys("Alias", types))
	assert.Nil(t, getStrictObjectKeys("Missing", types))
}

func TestStringSliceLiteral(t *testing.T) {
	assert.Equal(t, `[]string{}`, stringSliceLiteral(nil))
	assert.Equal(t, `[]string{"a", "b\"c"}`, stringSliceLiteral([]string{"a", `b"c`}))
}
