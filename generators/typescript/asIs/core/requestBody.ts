/**
 * Spreads caller-supplied `additionalBodyParameters` (from `requestOptions.additionalBodyParameters`)
 * on top of the request body. Caller-supplied properties win over the endpoint body. When no
 * additional body parameters are provided, the original body is returned unchanged so serialization
 * is unaffected.
 *
 * The merge only applies to plain-object (JSON object) bodies. When the body is `null`/`undefined`
 * the additional parameters become the body; when the body is an array or a primitive JSON value it
 * is returned unchanged, since object properties cannot be spread into it. This mirrors the Python
 * SDK, which only merges additional body parameters into mapping bodies.
 */
export function mergeAdditionalBodyParameters(
    body: unknown,
    additionalBodyParameters: Record<string, unknown> | undefined
): unknown {
    if (additionalBodyParameters == null) {
        return body;
    }
    if (body == null) {
        return { ...additionalBodyParameters };
    }
    if (typeof body === "object" && !Array.isArray(body)) {
        return { ...body, ...additionalBodyParameters };
    }
    return body;
}

/**
 * Deep-merges resolved `in: body` global parameters underneath the caller's
 * request `body`. Conceptually the body is spread on top of the global defaults:
 *
 *     { ...globalDefaults, ...body }   // but applied recursively (deep)
 *
 * so a more specific per-call value always wins over a global. When the body
 * already contains a key (at any depth) — including one explicitly set to `null`
 * or `undefined` — the caller's value is kept and the global is discarded. Global
 * values only fill in keys the body does not set.
 *
 * Intermediate objects are cloned (never mutated in place) so the caller's body
 * object is left untouched. Nullish global default values are ignored, and empty
 * default objects are never introduced.
 *
 * A nullish body is returned untouched: this helper never fabricates a body. An
 * endpoint with an optional (reference) request body that the caller omits has a
 * runtime-`undefined` body, and merging here would turn a request that carried no
 * body into one with a JSON payload.
 *
 * Global parameters are the lowest-precedence layer. They are composed underneath
 * both the endpoint body and any per-call `additionalBodyParameters` (which are
 * spread on top via `mergeAdditionalBodyParameters`), yielding the effective order
 * `{ ...globalDefaults, ...body, ...additionalBodyParameters }`.
 */
export function mergeGlobalBodyParameters(body: unknown, globalDefaults: Record<string, unknown>): unknown {
    if (body == null) {
        return body;
    }

    // A non-object body (array, string, etc.) has nowhere to merge nested fields —
    // leave it exactly as the caller supplied it.
    if (!isPlainObject(body)) {
        return body;
    }

    return mergeDefaultsUnder(body, globalDefaults);
}

function isPlainObject(candidate: unknown): candidate is Record<string, unknown> {
    return typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
}

/**
 * Returns a copy of `body` with values from `defaults` merged in only where `body`
 * does not already set the key. `body` always wins; recursion happens only when
 * both sides hold plain objects. Nullish defaults and empty default objects are
 * skipped so we never inject `undefined` leaves or fabricate empty objects.
 */
function mergeDefaultsUnder(body: Record<string, unknown>, defaults: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = { ...body };
    for (const [key, defaultValue] of Object.entries(defaults)) {
        if (defaultValue == null) {
            continue;
        }
        const existing = result[key];
        if (isPlainObject(defaultValue)) {
            if (isPlainObject(existing)) {
                result[key] = mergeDefaultsUnder(existing, defaultValue);
            } else if (!(key in result)) {
                const pruned = mergeDefaultsUnder({}, defaultValue);
                if (Object.keys(pruned).length > 0) {
                    result[key] = pruned;
                }
            }
            // else: the caller set this key to a non-object (incl. null) — keep it.
        } else if (!(key in result)) {
            result[key] = defaultValue;
        }
        // else: the caller already set this key — keep the caller's value.
    }
    return result;
}
