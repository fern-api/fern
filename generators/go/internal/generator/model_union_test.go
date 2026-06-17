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

func objectProperty(pascal string) *ir.ObjectProperty {
	return &ir.ObjectProperty{Name: nameAndWireValue(pascal)}
}

func objectTypeDeclaration(properties ...string) *ir.TypeDeclaration {
	object := &ir.ObjectTypeDeclaration{}
	for _, p := range properties {
		object.Properties = append(object.Properties, objectProperty(p))
	}
	return &ir.TypeDeclaration{Shape: &ir.Type{Object: object}}
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
