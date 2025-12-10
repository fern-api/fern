import esutils from "esutils";

/**
 * Checks if a string is a valid JavaScript/TypeScript identifier name.
 * This can be used to determine whether to use dot notation (obj.prop) or bracket notation (obj["prop"]).
 */
export function isValidIdentifier(name: string): boolean {
    return esutils.keyword.isIdentifierNameES6(name);
}

export function getPropertyKey(key: string): string {
    // [key: string]: any; => [key: string]: any;
    if (key.startsWith("[") && key.endsWith("]")) {
        return key;
    }

    // "foo-bar": any; => "foo-bar": any;
    if (key.startsWith('"')) {
        if (key.endsWith('"')) {
            return key;
        }
        throw new Error(`Internal; Invalid property key: ${key}`);
    }

    // 'foo-bar': any; => 'foo-bar': any;
    if (key.startsWith("'")) {
        if (key.endsWith("'")) {
            return key;
        }
        throw new Error(`Internal; Invalid property key: ${key}`);
    }

    // foo-bar: any; => "foo-bar": any;
    if (esutils.keyword.isKeywordES6(key, true)) {
        return `"${key}"`;
    }

    // fooBar: any; => fooBar: any;
    if (esutils.keyword.isIdentifierNameES6(key)) {
        return key;
    }

    // foo-bar: any; => "foo-bar": any;
    return `"${key}"`;
}
