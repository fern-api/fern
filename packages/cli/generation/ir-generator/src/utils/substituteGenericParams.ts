/**
 * Escapes special regex characters in a string so it can be used as a literal
 * pattern inside a RegExp. Defense-in-depth: parseGeneric constrains param names
 * to `[\w]` chars, but this ensures safety even if that invariant changes.
 */
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Substitutes generic parameter names with their corresponding argument values
 * within a type reference string. Uses a single-pass regex replacement to avoid
 * clobbering when an argument value matches a later parameter name.
 *
 * Uses word-boundary matching to avoid replacing substrings of other identifiers
 * (e.g., replacing "T" won't affect "TypeName").
 *
 * Examples:
 *   substituteGenericParams("T", ["T"], ["User"]) => "User"
 *   substituteGenericParams("list<Data<T>>", ["T"], ["User"]) => "list<Data<User>>"
 *   substituteGenericParams("map<A, list<B>>", ["A", "B"], ["string", "integer"]) => "map<string, list<integer>>"
 *   substituteGenericParams("map<A, B>", ["A", "B"], ["B", "string"]) => "map<B, string>"
 */
export function substituteGenericParams(
    typeReference: string,
    genericParamNames: string[],
    genericArgValues: string[]
): string {
    if (genericParamNames.length === 0) {
        return typeReference;
    }

    const paramToArg = new Map<string, string>();
    for (let i = 0; i < genericParamNames.length; i++) {
        const param = genericParamNames[i];
        const arg = genericArgValues[i];
        if (param != null && arg != null) {
            paramToArg.set(param, arg);
        }
    }

    if (paramToArg.size === 0) {
        return typeReference;
    }

    const pattern = Array.from(paramToArg.keys())
        .map((p) => `\\b${escapeRegExp(p)}\\b`)
        .join("|");
    return typeReference.replace(new RegExp(pattern, "g"), (match) => paramToArg.get(match) ?? match);
}
