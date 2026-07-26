const MAX_BREADCRUMB_TOKEN_LENGTH = 512;

function hashToken(token: string): string {
    // Two independent rolling hashes (different seeds) combined into one suffix,
    // widening the space well beyond 32 bits so distinct long tokens that share a
    // truncated prefix are extremely unlikely to collide. Deterministic.
    let hashA = 5381;
    let hashB = 52711;
    for (let i = 0; i < token.length; i++) {
        const code = token.charCodeAt(i);
        hashA = ((hashA << 5) + hashA + code) >>> 0;
        hashB = ((hashB << 5) + hashB + code) >>> 0;
    }
    return `${hashA.toString(36)}${hashB.toString(36)}${token.length.toString(36)}`;
}

/**
 * Caps a single breadcrumb/name token to a bounded, deterministic string.
 *
 * Some OpenAPI generators emit schema names/keys that are entire serialized type
 * expressions (hundreds of KB). Such a name becomes a breadcrumb that is carried
 * into every nested subschema and repeatedly joined/processed while walking the
 * tree, so across thousands of union branches it balloons memory usage and can
 * exhaust the heap. Capping the token produces an ugly-but-valid identifier for a
 * pathological name instead of taking the whole build down. A short hash of the
 * full token is appended so distinct long names remain distinct and deterministic.
 *
 * Real schema/property names never approach this length, so normal specs are
 * unaffected and produce identical output.
 */
export function capBreadcrumbToken(token: string): string {
    if (token.length <= MAX_BREADCRUMB_TOKEN_LENGTH) {
        return token;
    }
    // Reserve room for the "_<hash>" suffix so the result never exceeds the cap.
    // This keeps the function idempotent: capping an already-capped token is a no-op.
    const hash = hashToken(token);
    const prefixLength = MAX_BREADCRUMB_TOKEN_LENGTH - hash.length - 1;
    return `${token.slice(0, prefixLength)}_${hash}`;
}
