import esutils from "esutils"

export function getPropertyKey(key: string): string {
    // [key: string]: any; => [key: string]: any;
    if (key.startsWith("[") && key.endsWith("]")) {
        return key
    }

    // "foo-bar": any; => "foo-bar": any;
    if (key.startsWith('"')) {
        if (key.endsWith('"')) {
            return key
        }
        throw new Error(`Internal; Invalid property key: ${key}`)
    }

    // 'foo-bar': any; => 'foo-bar': any;
    if (key.startsWith("'")) {
        if (key.endsWith("'")) {
            return key
        }
        throw new Error(`Internal; Invalid property key: ${key}`)
    }

    // foo-bar: any; => "foo-bar": any;
    if (esutils.keyword.isKeywordES6(key, true)) {
        return `"${key}"`
    }

    // fooBar: any; => fooBar: any;
    if (esutils.keyword.isIdentifierNameES6(key)) {
        return key
    }

    // foo-bar: any; => "foo-bar": any;
    return `"${key}"`
}
