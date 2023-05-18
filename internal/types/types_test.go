package types

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type visitor struct {
	visitedNamed     bool
	visitedContainer bool
	visitedPrimitive bool
	visitedUnknown   bool
}

func (v *visitor) VisitTypeReferenceNamed(_ *TypeReferenceNamed) error {
	v.visitedNamed = true
	return nil
}

func (v *visitor) VisitTypeReferenceContainer(_ *TypeReferenceContainer) error {
	v.visitedContainer = true
	return nil
}

func (v *visitor) VisitTypeReferencePrimitive(_ *TypeReferencePrimitive) error {
	v.visitedPrimitive = true
	return nil
}

func (v *visitor) VisitTypeReferenceUnknown(_ *TypeReferenceUnknown) error {
	v.visitedUnknown = true
	return nil
}

func TestVisitor(t *testing.T) {
	primitive := &ObjectProperty{
		Docs: "union",
		Availability: &Availability{
			Status:  AvailabilityStatusInDevelopment,
			Message: "in-development",
		},
		ValueType: &TypeReferencePrimitive{
			Type:      "string",
			Primitive: PrimitiveTypeString,
		},
	}
	visitor := new(visitor)
	require.NoError(t, primitive.VisitValueType(visitor))
	assert.True(t, visitor.visitedPrimitive)
}
