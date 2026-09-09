package generator

import (
	"math/big"
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// newRequireTestWriter builds a bare fileWriter suitable for exercising the
// emitted require method.
func newRequireTestWriter(types map[common.TypeId]*ir.TypeDeclaration) *fileWriter {
	return newFileWriter(
		"types.go",
		"acme",
		"github.com/acme/test",
		false, // whitelabel
		true,  // alwaysSendRequiredProperties
		false, // inlinePathParameters
		false, // inlineFileProperties
		false, // useReaderForBytesRequest
		false, // gettersPassByValue
		false, // dedupeUnionBaseProperties
		true,  // serverURLVariables
		false, // exportAllRequestsAtRoot
		false, // omitEmptyRequestWrappers
		userAgentConfig{},
		UnionVersionUnspecified,
		"",
		types,
		nil,
		(*coordinator.Client)(nil),
	)
}

// The explicitFields bitmask is reached through a pointer, so a value copy of the
// enclosing struct aliases it. require must therefore replace the mask rather than
// mutate it in place; otherwise calling a setter on one copy is observable in every
// other copy of the same value.
func TestWriteRequireMethodDoesNotMutateSharedBitmask(t *testing.T) {
	writer := newRequireTestWriter(nil)
	writer.WriteRequireMethod("InstitutionsSearchRequest")
	src := writer.buffer.String()

	for _, want := range []string{
		"func (i *InstitutionsSearchRequest) require(field *big.Int) {",
		"next := new(big.Int)",
		"if i.explicitFields != nil {",
		"next.Set(i.explicitFields)",
		"next.Or(next, field)",
		"i.explicitFields = next",
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted require method missing %q\n---\n%s", want, src)
		}
	}

	// The aliasing form: an in-place Or on the shared bitmask.
	if strings.Contains(src, "i.explicitFields.Or(") {
		t.Errorf("emitted require method mutates the shared bitmask in place\n---\n%s", src)
	}
	if strings.Contains(src, "i.explicitFields = big.NewInt(0)") {
		t.Errorf("emitted require method still seeds the bitmask in place\n---\n%s", src)
	}
}

// explicitFieldsCarrier mirrors the code emitted by WriteRequireMethod. It guards the
// semantics the emitted method relies on: each value copy gets its own bitmask on
// first write, in either direction.
type explicitFieldsCarrier struct {
	explicitFields *big.Int
}

func (e *explicitFieldsCarrier) require(field *big.Int) {
	next := new(big.Int)
	if e.explicitFields != nil {
		next.Set(e.explicitFields)
	}
	next.Or(next, field)
	e.explicitFields = next
}

func TestRequireCopyOnWriteIsolatesValueCopies(t *testing.T) {
	var (
		bitA = big.NewInt(1 << 0)
		bitB = big.NewInt(1 << 1)
		bitC = big.NewInt(1 << 2)
	)

	original := explicitFieldsCarrier{}
	original.require(bitA)

	copied := original
	copied.require(bitB)

	if got := original.explicitFields; got.Bit(1) != 0 {
		t.Errorf("setter on the copy leaked into the original: got mask %b", got)
	}
	if got := copied.explicitFields; got.Bit(0) == 0 || got.Bit(1) == 0 {
		t.Errorf("copy lost the original's bits: got mask %b", got)
	}

	// The reverse direction: a bit set on the original after the copy was taken
	// must not appear in the copy.
	original.require(bitC)
	if got := copied.explicitFields; got.Bit(2) != 0 {
		t.Errorf("setter on the original leaked into the copy: got mask %b", got)
	}
}
