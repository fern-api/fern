const BIGINT_MARKER = "#bigint#";
const CC_0 = 0x30,
    CC_9 = 0x39;
const CC_SPACE = 0x20,
    CC_TAB = 0x09,
    CC_LF = 0x0a,
    CC_CR = 0x0d;
const CC_MINUS = 0x2d,
    CC_PLUS = 0x2b,
    CC_DOT = 0x2e;
const CC_QUOTE = 0x22,
    CC_BACKSLASH = 0x5c;
const CC_COMMA = 0x2c,
    CC_COLON = 0x3a;
const CC_LBRACE = 0x7b,
    CC_RBRACE = 0x7d;
const CC_LBRACKET = 0x5b,
    CC_RBRACKET = 0x5d;
const CC_E_LOWER = 0x65,
    CC_E_UPPER = 0x45;
const CC_T = 0x74,
    CC_R = 0x72,
    CC_U = 0x75,
    CC_E = 0x65; // 'true'
const CC_F = 0x66,
    CC_A = 0x61,
    CC_L = 0x6c,
    CC_S = 0x73; // 'false'
const CC_N = 0x6e; // 'null'
const isWhitespace = (c: number) => c === CC_SPACE || c === CC_TAB || c === CC_LF || c === CC_CR;
const isDigit = (c: number) => c >= CC_0 && c <= CC_9;

// Cache the regex for better performance
const BIGINT_REGEX = new RegExp(`"(-?\\d+)${BIGINT_MARKER.replace(/[#]/g, "\\$&")}"`, "g");

/**
 * Serialize a value to JSON
 * @param value A JavaScript value, usually an object or array, to be converted.
 * @param replacer A function that transforms the results.
 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns JSON string
 */
export const toJson = (
    data: unknown,
    replacer?: (key: string, value: unknown) => unknown,
    space?: string | number
): string => {
    // Use native JSON.stringify with a custom replacer for BigInt
    const preliminaryJSON = JSON.stringify(
        data,
        (key: string, value: unknown) => {
            if (typeof value === "bigint") {
                return value.toString() + BIGINT_MARKER;
            }
            return replacer ? replacer(key, value) : value;
        },
        space
    );
    if (preliminaryJSON == null) {
        return preliminaryJSON;
    }

    // Strip quotes around numbers with marker: "123#bigint#" → 123
    return preliminaryJSON.replace(BIGINT_REGEX, "$1");
};

/**
 * Parse JSON string to object, array, or other type
 * @param text A valid JSON string.
 * @param reviver A function that transforms the results. This function is called for each member of the object. If a member contains nested objects, the nested objects are transformed before the parent object is.
 * @returns Parsed object, array, or other type
 */

export function fromJson<T = unknown>(
    json: string,
    reviver?: (this: unknown, key: string, value: unknown) => unknown
): T {
    let i = 0;
    const len = json.length;

    function skipWhitespace() {
        while (i < len && isWhitespace(json.charCodeAt(i))) i++;
    }

    function parseValue(): unknown {
        skipWhitespace();
        const c = json.charCodeAt(i);

        if (c === CC_QUOTE) return parseString();
        if (c === CC_LBRACE) return parseObject();
        if (c === CC_LBRACKET) return parseArray();
        if (c === CC_MINUS || isDigit(c)) return parseNumber();

        // Check for true/false/null using character codes
        if (c === CC_T) {
            if (json.charCodeAt(i + 1) === CC_R && json.charCodeAt(i + 2) === CC_U && json.charCodeAt(i + 3) === CC_E) {
                i += 4;
                return true;
            }
        } else if (c === CC_F) {
            if (
                json.charCodeAt(i + 1) === CC_A &&
                json.charCodeAt(i + 2) === CC_L &&
                json.charCodeAt(i + 3) === CC_S &&
                json.charCodeAt(i + 4) === CC_E
            ) {
                i += 5;
                return false;
            }
        } else if (c === CC_N) {
            if (json.charCodeAt(i + 1) === CC_U && json.charCodeAt(i + 2) === CC_L && json.charCodeAt(i + 3) === CC_L) {
                i += 4;
                return null;
            }
        }

        throw new SyntaxError(`Unexpected character at position ${i}: ${json[i]}`);
    }

    function parseString(): string {
        i++; // skip opening quote
        const start = i;

        // Fast path: scan for end quote without escapes
        while (i < len) {
            const c = json.charCodeAt(i);
            if (c === CC_QUOTE) {
                const result = json.slice(start, i);
                i++;
                return result;
            }
            if (c === CC_BACKSLASH) {
                break; // Hit an escape, fall through to slow path
            }
            i++;
        }

        // Slow path: handle escapes using array for better performance
        const parts = [json.slice(start, i)];
        while (i < len) {
            const c = json.charCodeAt(i);
            if (c === CC_QUOTE) {
                i++;
                return parts.join("");
            }
            if (c === CC_BACKSLASH) {
                i++;
                const next = json.charCodeAt(i);
                switch (next) {
                    case CC_QUOTE:
                        parts.push('"');
                        break;
                    case CC_BACKSLASH:
                        parts.push("\\");
                        break;
                    case 0x2f: // '/'
                        parts.push("/");
                        break;
                    case 0x62: // 'b'
                        parts.push("\b");
                        break;
                    case 0x66: // 'f'
                        parts.push("\f");
                        break;
                    case CC_N: // 'n'
                        parts.push("\n");
                        break;
                    case CC_R: // 'r'
                        parts.push("\r");
                        break;
                    case CC_T: // 't'
                        parts.push("\t");
                        break;
                    case CC_U: // 'u'
                        parts.push(String.fromCharCode(parseInt(json.slice(i + 1, i + 5), 16)));
                        i += 4;
                        break;
                    default:
                        throw new SyntaxError(`Invalid escape sequence at position ${i}`);
                }
                i++;
            } else {
                // Accumulate regular characters
                const chunkStart = i;
                while (i < len) {
                    const cc = json.charCodeAt(i);
                    if (cc === CC_QUOTE || cc === CC_BACKSLASH) break;
                    i++;
                }
                parts.push(json.slice(chunkStart, i));
            }
        }
        throw new SyntaxError("Unterminated string");
    }

    function parseNumber(): number | bigint {
        const start = i;

        // Optional minus
        if (json.charCodeAt(i) === CC_MINUS) i++;

        // Integer part
        const digitStart = i;
        if (json.charCodeAt(i) === CC_0) {
            i++;
        } else if (isDigit(json.charCodeAt(i))) {
            while (i < len && isDigit(json.charCodeAt(i))) i++;
        }
        const intEnd = i;

        // Fraction part
        let hasFrac = false;
        if (json.charCodeAt(i) === CC_DOT) {
            hasFrac = true;
            i++;
            while (i < len && isDigit(json.charCodeAt(i))) i++;
        }

        // Exponent part
        let hasExp = false;
        const c = json.charCodeAt(i);
        if (c === CC_E_LOWER || c === CC_E_UPPER) {
            hasExp = true;
            i++;
            const sign = json.charCodeAt(i);
            if (sign === CC_MINUS || sign === CC_PLUS) i++;
            while (i < len && isDigit(json.charCodeAt(i))) i++;
        }

        const numStr = json.slice(start, i);

        // If it's a pure integer, check if we should use BigInt
        if (!hasFrac && !hasExp) {
            const digitCount = intEnd - digitStart;

            // Quick length check - numbers > 16 digits are definitely unsafe
            if (digitCount > 16) {
                return BigInt(numStr);
            }

            // Numbers < 15 digits are always safe
            if (digitCount < 15) {
                return Number(numStr);
            }

            // For 15-16 digit numbers, convert and check
            const num = Number(numStr);
            if (!Number.isSafeInteger(num)) {
                return BigInt(numStr);
            }
            return num;
        }

        return Number(numStr);
    }

    function parseObject(): Record<string, unknown> {
        i++; // skip opening brace
        skipWhitespace();

        const obj: Record<string, unknown> = {};

        if (json.charCodeAt(i) === CC_RBRACE) {
            i++;
            return obj;
        }

        while (true) {
            skipWhitespace();
            const key = parseString();
            skipWhitespace();

            if (json.charCodeAt(i) !== CC_COLON) {
                throw new SyntaxError(`Expected ':' at position ${i}`);
            }
            i++;

            const value = parseValue();
            obj[key] = value;

            skipWhitespace();
            const c = json.charCodeAt(i);
            if (c === CC_RBRACE) {
                i++;
                return obj;
            }
            if (c === CC_COMMA) {
                i++;
                continue;
            }
            throw new SyntaxError(`Expected ',' or '}' at position ${i}`);
        }
    }

    function parseArray(): unknown[] {
        i++; // skip opening bracket
        skipWhitespace();

        const arr: unknown[] = [];

        if (json.charCodeAt(i) === CC_RBRACKET) {
            i++;
            return arr;
        }

        while (true) {
            arr.push(parseValue());
            skipWhitespace();

            const c = json.charCodeAt(i);
            if (c === CC_RBRACKET) {
                i++;
                return arr;
            }
            if (c === CC_COMMA) {
                i++;
                continue;
            }
            throw new SyntaxError(`Expected ',' or ']' at position ${i}`);
        }
    }

    const result = parseValue();
    skipWhitespace();

    if (i < json.length) {
        throw new SyntaxError(`Unexpected content at position ${i}`);
    }

    // Apply reviver if provided
    if (!reviver) return result as T;

    function reviveRecursive(holder: Record<string, unknown> | unknown[], key: string): unknown {
        let value: unknown;
        if (Array.isArray(holder)) {
            const idx = Number(key);
            if (Number.isInteger(idx)) {
                value = holder[idx];
            } else {
                value = (holder as unknown as Record<string, unknown>)[key];
            }
        } else {
            value = holder[key];
        }

        if (value && typeof value === "object") {
            if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    const newValue = reviveRecursive(value, String(i));
                    if (newValue !== undefined) {
                        value[i] = newValue;
                    } else {
                        delete value[i];
                    }
                }
            } else {
                const obj = value as Record<string, unknown>;
                for (const k of Object.keys(obj)) {
                    const newValue = reviveRecursive(obj, k);
                    if (newValue !== undefined) {
                        obj[k] = newValue;
                    } else {
                        delete obj[k];
                    }
                }
            }
        }

        return reviver?.call(holder, key, value);
    }

    return reviveRecursive({ "": result }, "") as T;
}
