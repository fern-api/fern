package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

func nameAndWireValue(pascal string) *common.NameAndWireValue {
	return &common.NameAndWireValue{
		WireValue: pascal,
		Name: &common.Name{
			OriginalName: pascal,
			PascalCase:   &common.SafeAndUnsafeString{UnsafeName: pascal, SafeName: pascal},
		},
	}
}

func primitiveProperty(pascal string, primitive common.PrimitiveTypeV1) *ir.ObjectProperty {
	return &ir.ObjectProperty{
		Name:      nameAndWireValue(pascal),
		ValueType: &ir.TypeReference{Primitive: &ir.PrimitiveType{V1: primitive}},
	}
}

func objectProperty(pascal string) *ir.ObjectProperty {
	return primitiveProperty(pascal, common.PrimitiveTypeV1String)
}

func literalObjectProperty(pascal string) *ir.ObjectProperty {
	return &ir.ObjectProperty{
		Name:      nameAndWireValue(pascal),
		ValueType: &ir.TypeReference{Container: &ir.ContainerType{Literal: &ir.Literal{Type: "string", String: pascal}}},
	}
}

func objectType(properties ...*ir.ObjectProperty) *ir.TypeDeclaration {
	return &ir.TypeDeclaration{Shape: &ir.Type{Object: &ir.ObjectTypeDeclaration{Properties: properties}}}
}

func objectTypeDeclaration(propertyNames ...string) *ir.TypeDeclaration {
	var properties []*ir.ObjectProperty
	for _, name := range propertyNames {
		properties = append(properties, objectProperty(name))
	}
	return objectType(properties...)
}

func samePropertiesAsObjectVariant(typeID common.TypeId) *ir.SingleUnionType {
	return &ir.SingleUnionType{
		DiscriminantValue: nameAndWireValue(typeID),
		Shape: &ir.SingleUnionTypeProperties{
			PropertiesType:         "samePropertiesAsObject",
			SamePropertiesAsObject: &ir.DeclaredTypeName{TypeId: typeID},
		},
	}
}

func TestUnionInheritedBasePropertyNames(t *testing.T) {
	tv := &typeVisitor{
		dedupeUnionBaseProperties: true,
		writer: &fileWriter{
			types: map[common.TypeId]*ir.TypeDeclaration{
				"Foo": objectTypeDeclaration("Name", "Id"),
				"Bar": objectTypeDeclaration("Name"),
			},
		},
	}

	t.Run("suppresses only base properties every variant already carries", func(t *testing.T) {
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{objectProperty("Name"), objectProperty("Id")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("Foo"),
				samePropertiesAsObjectVariant("Bar"),
			},
		}
		got := tv.unionInheritedBasePropertyNames(union)
		if _, ok := got["Name"]; !ok {
			t.Errorf("expected Name to be suppressed: it is carried by both Foo and Bar")
		}
		// Id is only declared by Foo, so it is a genuine union-level base property and
		// must keep its top-level field.
		if _, ok := got["Id"]; ok {
			t.Errorf("did not expect Id to be suppressed: only Foo carries it")
		}
	})

	t.Run("suppresses nothing when a variant is not an object", func(t *testing.T) {
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{objectProperty("Name")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("Foo"),
				{Shape: &ir.SingleUnionTypeProperties{PropertiesType: "singleProperty"}},
			},
		}
		if got := tv.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no suppression when a variant carries no object properties, got %v", got)
		}
	})

	t.Run("no base properties means nothing to suppress", func(t *testing.T) {
		union := &ir.UnionTypeDeclaration{
			Types: []*ir.SingleUnionType{samePropertiesAsObjectVariant("Foo")},
		}
		if got := tv.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected empty result, got %v", got)
		}
	})

	t.Run("never suppresses literal base properties even when carried by every variant", func(t *testing.T) {
		// A literal property keeps its own `<Name>()` getter (no `Get` prefix) on both
		// the union and each variant. Suppressing it would emit a delegating
		// `Get<Name>()` that calls the variant's non-existent `Get<Name>()` and fail to
		// compile, so literals must stay on the normal path.
		litTv := &typeVisitor{
			dedupeUnionBaseProperties: true,
			writer: &fileWriter{
				types: map[common.TypeId]*ir.TypeDeclaration{
					"A": objectTypeDeclaration("Name", "Kind"),
					"B": objectTypeDeclaration("Name", "Kind"),
				},
			},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{objectProperty("Name"), literalObjectProperty("Kind")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("A"),
				samePropertiesAsObjectVariant("B"),
			},
		}
		got := litTv.unionInheritedBasePropertyNames(union)
		if _, ok := got["Name"]; !ok {
			t.Errorf("expected non-literal common property Name to be suppressed")
		}
		if _, ok := got["Kind"]; ok {
			t.Errorf("did not expect literal property Kind to be suppressed")
		}
	})

	t.Run("does not suppress when a variant's same-named property has a different type", func(t *testing.T) {
		// The delegating getter would be `GetName() string { ... return c.A.GetName() }`,
		// but the variant's GetName() returns int — a type mismatch that would not compile.
		mismatchTv := &typeVisitor{
			dedupeUnionBaseProperties: true,
			writer: &fileWriter{
				types: map[common.TypeId]*ir.TypeDeclaration{
					"A": objectType(primitiveProperty("Name", common.PrimitiveTypeV1Integer)),
					"B": objectType(primitiveProperty("Name", common.PrimitiveTypeV1Integer)),
				},
			},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{primitiveProperty("Name", common.PrimitiveTypeV1String)},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("A"),
				samePropertiesAsObjectVariant("B"),
			},
		}
		if got := mismatchTv.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no suppression when base (string) and variant (int) types differ, got %v", got)
		}
	})

	t.Run("does not suppress when a variant's same-named property is a literal", func(t *testing.T) {
		// Base `Kind` is non-literal, but each variant's `Kind` is a literal whose getter is
		// `Kind()` (no `Get` prefix); a delegating `Get<Name>()` would not compile.
		literalVariantTv := &typeVisitor{
			dedupeUnionBaseProperties: true,
			writer: &fileWriter{
				types: map[common.TypeId]*ir.TypeDeclaration{
					"A": objectType(literalObjectProperty("Kind")),
					"B": objectType(literalObjectProperty("Kind")),
				},
			},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{primitiveProperty("Kind", common.PrimitiveTypeV1String)},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("A"),
				samePropertiesAsObjectVariant("B"),
			},
		}
		if got := literalVariantTv.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no suppression when a variant's same-named property is a literal, got %v", got)
		}
	})

	t.Run("suppresses nothing when the dedupeUnionBaseProperties flag is off", func(t *testing.T) {
		off := &typeVisitor{
			dedupeUnionBaseProperties: false,
			writer:                    tv.writer,
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{objectProperty("Name")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("Foo"),
				samePropertiesAsObjectVariant("Bar"),
			},
		}
		if got := off.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no suppression when flag is off, got %v", got)
		}
	})
}
