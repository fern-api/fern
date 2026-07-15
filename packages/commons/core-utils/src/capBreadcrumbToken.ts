const MAX_BREADCRUMB_TOKEN_LENGTH = 512;

function hashToken(token: string): string {
    let hash = 5381;
    for (let i = 0; i < token.length; i++) {
        hash = ((hash << 5) + hash + token.charCodeAt(i)) >>> 0;
    }
    return hash.toString(36);
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
    return `${token.slice(0, MAX_BREADCRUMB_TOKEN_LENGTH)}_${hashToken(token)}`;
}
