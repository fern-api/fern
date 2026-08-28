package generator

import (
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// idempotentRequestOptionsSourceForHeaders emits the *IdempotentRequestOptions
// definition for an API whose only configuration is the given idempotency headers.
func idempotentRequestOptionsSourceForHeaders(t *testing.T, headers []*ir.HttpHeader) string {
	t.Helper()
	f := newGlobalHeaderTestWriter(nil)
	if err := f.WriteIdempotentRequestOptionsDefinition(headers); err != nil {
		t.Fatalf("WriteIdempotentRequestOptionsDefinition returned error: %v", err)
	}
	return f.buffer.String()
}

// TestIdempotencyHeadersSendTheSuppliedValue asserts that the emitted ToHeader
// sends exactly the value the caller supplied.
//
// valueTypeFormat.Prefix is a Go expression prefix -- "*" to dereference an
// optional, or a base64 encode call -- and belongs only in the value expression.
// It was also interpolated into the fmt.Sprintf format string, so an optional
// idempotency header was sent with a literal "*" prepended to its value. Only
// optional headers were affected, which is why a required-string fixture missed it.
func TestIdempotencyHeadersSendTheSuppliedValue(t *testing.T) {
	src := idempotentRequestOptionsSourceForHeaders(
		t,
		[]*ir.HttpHeader{
			newGlobalHeaderForTest("Idempotency-Key", "IdempotencyKey", newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String)),
			newGlobalHeaderForTest("X-Idempotency-Key", "XIdempotencyKey", newOptionalTypeReferenceForTest(newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String))),
			newGlobalHeaderForTest("X-Idempotency-Bytes", "XIdempotencyBytes", newOptionalTypeReferenceForTest(newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1Base64))),
		},
	)

	// No format string may carry a Go expression prefix onto the wire.
	for _, unwanted := range []string{
		`fmt.Sprintf("*%v"`,
		`fmt.Sprintf("base64.StdEncoding.EncodeToString(`,
	} {
		if strings.Contains(src, unwanted) {
			t.Errorf("emitted source must not contain %q, but does:\n%s", unwanted, src)
		}
	}

	for _, want := range []string{
		`header.Set("Idempotency-Key", fmt.Sprintf("%v",i.IdempotencyKey))`,
		`header.Set("X-Idempotency-Key", fmt.Sprintf("%v",*i.XIdempotencyKey))`,
		`header.Set("X-Idempotency-Bytes", fmt.Sprintf("%v",base64.StdEncoding.EncodeToString(*i.XIdempotencyBytes)))`,
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted source must contain %q, but does not:\n%s", want, src)
		}
	}
}
