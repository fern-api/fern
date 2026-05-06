/**
 * Returns the canonical date string used by the wire-test generator for both
 * the embedded JSON response body and the expected Swift struct's `Date`
 * literal. Both call sites must route through this helper so they cannot drift
 * apart.
 *
 * The Swift SDK's `JSONDecoder` (see `generators/swift/base/src/asIs/Sources/Serde.swift`)
 * only parses ISO 8601, so the wire format is normalized to ISO 8601 regardless
 * of whether the IR field was `datetime` or `datetimeRfc2822`. Fractional
 * seconds are stripped because the expected-struct side rounds to the nearest
 * second.
 *
 * Returns `undefined` when `raw` is absent so the caller can omit the value
 * entirely — `JSON.stringify` drops `undefined` keys, and the expected-struct
 * generator emits no argument in the matching position.
 */
export function formatDateTimeForWire(raw: string | null | undefined): string | undefined {
    if (raw == null) {
        return undefined;
    }
    const timestampSec = Math.round(new Date(raw).getTime() / 1000);
    return new Date(timestampSec * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
}
