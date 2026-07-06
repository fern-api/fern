/**
 * Injects a global parameter (`in: body`) into the serialized request body at
 * a (possibly nested) dotted target path, without clobbering a value the caller
 * already supplied. This enforces the "per-call value wins" contract: the leaf
 * is only written when it is absent, so an explicit body value is preserved.
 *
 * Intermediate objects along the path are cloned (never mutated in place) so the
 * caller's body object is left untouched. Nullish values are ignored.
 *
 * A nullish body is returned untouched: this helper never fabricates a body. An
 * endpoint with an optional (reference) request body that the caller omits has a
 * runtime-`undefined` body, and injecting here would turn a request that carried
 * no body into one with a JSON payload.
 */
export function setGlobalBodyParameterIfAbsent(body: unknown, path: string[], value: unknown): unknown {
    if (value == null || path.length === 0 || body == null) {
        return body;
    }

    const isPlainObject = (candidate: unknown): candidate is Record<string, unknown> =>
        typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);

    // A non-object body (array, string, etc.) has nowhere to inject a nested
    // field — leave it exactly as the caller supplied it.
    if (!isPlainObject(body)) {
        return body;
    }

    const root: Record<string, unknown> = { ...body };

    let cursor = root;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i] as string;
        const existing = cursor[key];
        // If the caller set this segment to a non-object, leave it untouched.
        if (existing !== undefined && !isPlainObject(existing)) {
            return root;
        }
        const next: Record<string, unknown> = isPlainObject(existing) ? { ...existing } : {};
        cursor[key] = next;
        cursor = next;
    }

    const leaf = path[path.length - 1] as string;
    if (!(leaf in cursor)) {
        cursor[leaf] = value;
    }

    return root;
}
