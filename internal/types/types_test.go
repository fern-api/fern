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

func (v *visitor) VisitNamed(_ *DeclaredTypeName) error {
	v.visitedNamed = true
	return nil
}

func (v *visitor) VisitContainer(_ *ContainerType) error {
	v.visitedContainer = true
	return nil
}

func (v *visitor) VisitPrimitive(_ PrimitiveType) error {
	v.visitedPrimitive = true
	return nil
}

func (v *visitor) VisitUnknown(_ any) error {
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
		ValueType: &TypeReference{
			Type:      "primitive",
			Primitive: PrimitiveTypeString,
		},
	}
	visitor := new(visitor)
	require.NoError(t, primitive.ValueType.Accept(visitor))
	assert.True(t, visitor.visitedPrimitive)
}
