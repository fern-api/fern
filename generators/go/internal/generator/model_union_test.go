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
		ValueType: &ir.TypeReference{Container: &ir.ContainerType{Type: "literal", Literal: &ir.Literal{Type: "string", String: pascal}}},
	}
}

func listStringProperty(pascal string) *ir.ObjectProperty {
	return &ir.ObjectProperty{
		Name: nameAndWireValue(pascal),
		ValueType: &ir.TypeReference{Container: &ir.ContainerType{
			Type: "list",
			List: &ir.TypeReference{Primitive: &ir.PrimitiveType{V1: common.PrimitiveTypeV1String}},
		}},
	}
}

func setStringProperty(pascal string) *ir.ObjectProperty {
	return &ir.ObjectProperty{
		Name: nameAndWireValue(pascal),
		ValueType: &ir.TypeReference{Container: &ir.ContainerType{
			Type: "set",
			Set:  &ir.TypeReference{Primitive: &ir.PrimitiveType{V1: common.PrimitiveTypeV1String}},
		}},
	}
}

func objectType(properties ...*ir.ObjectProperty) *ir.TypeDeclaration {
	return &ir.TypeDeclaration{Shape: &ir.Type{Object: &ir.ObjectTypeDeclaration{Properties: properties}}}
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

// The dedupe decision has two layers, both covered here:
//   - the language-agnostic structural core, supplied by the IR in
//     UnionTypeDeclaration.InheritedBaseProperties (covered by the IR-generator tests); and
//   - a Go-render-equivalence widening applied locally on top of it (list/set -> []T,
//     optional/nullable -> *T), so Go dedupes every field it can safely delegate a getter for.
func TestUnionInheritedBasePropertyNames(t *testing.T) {
	tv := &typeVisitor{
		dedupeUnionBaseProperties: true,
		writer:                    &fileWriter{types: map[common.TypeId]*ir.TypeDeclaration{}},
	}

	t.Run("dedupes the structural core the IR marked", func(t *testing.T) {
		tv := &typeVisitor{
			dedupeUnionBaseProperties: true,
			writer: &fileWriter{types: map[common.TypeId]*ir.TypeDeclaration{
				// Foo carries `shared` and `id`; Bar only `shared`.
				"Foo": objectType(objectProperty("shared"), objectProperty("id")),
				"Bar": objectType(objectProperty("shared")),
			}},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{objectProperty("shared"), objectProperty("id")},
			InheritedBaseProperties: []*common.NameAndWireValue{nameAndWireValue("shared")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("Foo"),
				samePropertiesAsObjectVariant("Bar"),
			},
		}
		got := tv.unionInheritedBasePropertyNames(union)
		if _, ok := got["Shared"]; !ok {
			t.Errorf("expected Shared to be deduped: the IR marked it and every variant carries it")
		}
		// `id` is not in the IR fact and Bar does not carry it, so the widening cannot dedupe it either.
		if _, ok := got["Id"]; ok {
			t.Errorf("did not expect Id to be deduped: only Foo carries it")
		}
	})

	t.Run("Go-render widening dedupes list/set that the IR left unmarked", func(t *testing.T) {
		// The union base property `tags` is a list<string>; each variant carries it as a set<string>.
		// These are structurally distinct (so the IR does NOT list it in InheritedBaseProperties), but
		// both render to []string in Go, so the delegating getter compiles and the field is deduped.
		widen := &typeVisitor{
			dedupeUnionBaseProperties: true,
			writer: &fileWriter{types: map[common.TypeId]*ir.TypeDeclaration{
				"A": objectType(setStringProperty("tags")),
				"B": objectType(setStringProperty("tags")),
			}},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{listStringProperty("tags")},
			InheritedBaseProperties: nil, // IR's structural equality does not mark list-vs-set
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("A"),
				samePropertiesAsObjectVariant("B"),
			},
		}
		if _, ok := widen.unionInheritedBasePropertyNames(union)["Tags"]; !ok {
			t.Errorf("expected Tags to be deduped via the Go-render widening (list<string> and set<string> both render []string)")
		}
	})

	t.Run("widening does not dedupe genuinely different rendered types", func(t *testing.T) {
		mismatch := &typeVisitor{
			dedupeUnionBaseProperties: true,
			writer: &fileWriter{types: map[common.TypeId]*ir.TypeDeclaration{
				"A": objectType(primitiveProperty("count", common.PrimitiveTypeV1Integer)),
				"B": objectType(primitiveProperty("count", common.PrimitiveTypeV1Integer)),
			}},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{primitiveProperty("count", common.PrimitiveTypeV1String)},
			InheritedBaseProperties: nil,
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("A"),
				samePropertiesAsObjectVariant("B"),
			},
		}
		if got := mismatch.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no dedupe when base (string) and variant (int) render differently, got %v", got)
		}
	})

	t.Run("never dedupes literal base properties, even when the IR marked them", func(t *testing.T) {
		lit := &typeVisitor{
			dedupeUnionBaseProperties: true,
			writer: &fileWriter{types: map[common.TypeId]*ir.TypeDeclaration{
				"A": objectType(objectProperty("name"), literalObjectProperty("kind")),
				"B": objectType(objectProperty("name"), literalObjectProperty("kind")),
			}},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{objectProperty("name"), literalObjectProperty("kind")},
			InheritedBaseProperties: []*common.NameAndWireValue{nameAndWireValue("name"), nameAndWireValue("kind")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("A"),
				samePropertiesAsObjectVariant("B"),
			},
		}
		got := lit.unionInheritedBasePropertyNames(union)
		if _, ok := got["Name"]; !ok {
			t.Errorf("expected non-literal property Name to be deduped")
		}
		if _, ok := got["Kind"]; ok {
			t.Errorf("did not expect literal property Kind to be deduped (renders as a method, not a field)")
		}
	})

	t.Run("dedupes nothing when a variant is not samePropertiesAsObject", func(t *testing.T) {
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{objectProperty("shared")},
			InheritedBaseProperties: []*common.NameAndWireValue{nameAndWireValue("shared")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("Foo"),
				{Shape: &ir.SingleUnionTypeProperties{PropertiesType: "singleProperty"}},
			},
		}
		tv.writer.types["Foo"] = objectType(objectProperty("shared"))
		if got := tv.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no dedupe when a variant carries no object properties, got %v", got)
		}
	})

	t.Run("dedupes nothing when there are no base properties", func(t *testing.T) {
		union := &ir.UnionTypeDeclaration{
			Types: []*ir.SingleUnionType{samePropertiesAsObjectVariant("Foo")},
		}
		if got := tv.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected empty result, got %v", got)
		}
	})

	t.Run("dedupes nothing when the dedupeUnionBaseProperties flag is off", func(t *testing.T) {
		off := &typeVisitor{
			dedupeUnionBaseProperties: false,
			writer: &fileWriter{types: map[common.TypeId]*ir.TypeDeclaration{
				"Foo": objectType(objectProperty("shared")),
				"Bar": objectType(objectProperty("shared")),
			}},
		}
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{objectProperty("shared")},
			InheritedBaseProperties: []*common.NameAndWireValue{nameAndWireValue("shared")},
			Types: []*ir.SingleUnionType{
				samePropertiesAsObjectVariant("Foo"),
				samePropertiesAsObjectVariant("Bar"),
			},
		}
		if got := off.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no dedupe when flag is off, got %v", got)
		}
	})
}
