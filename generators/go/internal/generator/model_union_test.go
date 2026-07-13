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

// The "which base properties are inherited by every variant" decision is computed upstream in
// the IR (UnionTypeDeclaration.InheritedBaseProperties) and covered by the IR-generator tests.
// These tests cover the Go side's *consumption* of that fact: the config-flag gate, the
// Go-local literal rendering filter, and the mapping to exported field names.
func TestUnionInheritedBasePropertyNames(t *testing.T) {
	tv := &typeVisitor{
		dedupeUnionBaseProperties: true,
		writer:                    &fileWriter{types: map[common.TypeId]*ir.TypeDeclaration{}},
	}

	t.Run("suppresses the base properties the IR marked as inherited", func(t *testing.T) {
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{objectProperty("Name"), objectProperty("Id")},
			InheritedBaseProperties: []*common.NameAndWireValue{nameAndWireValue("Name")},
		}
		got := tv.unionInheritedBasePropertyNames(union)
		if _, ok := got["Name"]; !ok {
			t.Errorf("expected Name to be suppressed: the IR marked it inherited")
		}
		// Id is not in InheritedBaseProperties, so it keeps its top-level field.
		if _, ok := got["Id"]; ok {
			t.Errorf("did not expect Id to be suppressed: the IR did not mark it inherited")
		}
	})

	t.Run("no inherited base properties means nothing to suppress", func(t *testing.T) {
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{objectProperty("Name")},
		}
		if got := tv.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected empty result, got %v", got)
		}
	})

	t.Run("never suppresses literal inherited base properties (Go local filter)", func(t *testing.T) {
		// A literal property renders as a `<Name>()` method (no `Get` prefix) on each variant, so a
		// delegating `Get<Name>()` on the envelope would reference a non-existent method and fail to
		// compile. Even when the IR marks it inherited, Go keeps it on the envelope. This is Go
		// rendering policy, not a re-derivation of the shared decision.
		union := &ir.UnionTypeDeclaration{
			BaseProperties: []*ir.ObjectProperty{objectProperty("Name"), literalObjectProperty("Kind")},
			InheritedBaseProperties: []*common.NameAndWireValue{
				nameAndWireValue("Name"),
				nameAndWireValue("Kind"),
			},
		}
		got := tv.unionInheritedBasePropertyNames(union)
		if _, ok := got["Name"]; !ok {
			t.Errorf("expected non-literal inherited property Name to be suppressed")
		}
		if _, ok := got["Kind"]; ok {
			t.Errorf("did not expect literal inherited property Kind to be suppressed")
		}
	})

	t.Run("suppresses nothing when the dedupeUnionBaseProperties flag is off", func(t *testing.T) {
		off := &typeVisitor{dedupeUnionBaseProperties: false, writer: tv.writer}
		union := &ir.UnionTypeDeclaration{
			BaseProperties:          []*ir.ObjectProperty{objectProperty("Name")},
			InheritedBaseProperties: []*common.NameAndWireValue{nameAndWireValue("Name")},
		}
		if got := off.unionInheritedBasePropertyNames(union); len(got) != 0 {
			t.Errorf("expected no suppression when flag is off, got %v", got)
		}
	})
}
