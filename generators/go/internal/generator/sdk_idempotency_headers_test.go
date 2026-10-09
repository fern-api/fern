package generator

import (
	"strings"
	"testing"
	"unicode"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// idempotentRequestOptionsSourceForHeaders emits the *IdempotentRequestOptions
// definition for an API whose only configuration is the given idempotency headers.
func idempotentRequestOptionsSourceForHeaders(t *testing.T, headers []*ir.HttpHeader) string {
	t.Helper()
	f := newHeaderTestWriter(nil)
	if err := f.WriteIdempotentRequestOptionsDefinition(headers); err != nil {
		t.Fatalf("WriteIdempotentRequestOptionsDefinition returned error: %v", err)
	}
	return f.buffer.String()
}

// stripSpace removes all whitespace so assertions on emitted source do not depend
// on how the file writer joins its arguments. The buffer is pre-gofmt. Literal
// spaces are dropped too, so this is unsuitable for asserting on a wire prefix
// such as "Bearer ".
func stripSpace(s string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, s)
}

// TestIdempotencyHeadersSendTheSuppliedValue asserts that the emitted ToHeader
// sends exactly the value the caller supplied, with no Go expression prefix
// ("*", or a base64 encode call) leaking into the format string.
func TestIdempotencyHeadersSendTheSuppliedValue(t *testing.T) {
	src := idempotentRequestOptionsSourceForHeaders(
		t,
		[]*ir.HttpHeader{
			newHeaderForTest("Idempotency-Key", "IdempotencyKey", newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String)),
			newHeaderForTest("X-Idempotency-Key", "XIdempotencyKey", newOptionalTypeReferenceForTest(newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String))),
			newHeaderForTest("X-Idempotency-Bytes", "XIdempotencyBytes", newOptionalTypeReferenceForTest(newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1Base64))),
		},
	)

	for _, want := range []string{
		`header.Set("Idempotency-Key", fmt.Sprintf("%v", i.IdempotencyKey))`,
		`header.Set("X-Idempotency-Key", fmt.Sprintf("%v", *i.XIdempotencyKey))`,
		`header.Set("X-Idempotency-Bytes", fmt.Sprintf("%v", base64.StdEncoding.EncodeToString(*i.XIdempotencyBytes)))`,
	} {
		if !strings.Contains(stripSpace(src), stripSpace(want)) {
			t.Errorf("emitted source must contain %q, but does not:\n%s", want, src)
		}
	}
}
