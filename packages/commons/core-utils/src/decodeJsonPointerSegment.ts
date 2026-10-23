/**
 * Decodes a single JSON Pointer segment (RFC 6901): `~1` becomes `/` and `~0` becomes `~`.
 */
export function decodeJsonPointerSegment(segment: string): string {
    return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}
