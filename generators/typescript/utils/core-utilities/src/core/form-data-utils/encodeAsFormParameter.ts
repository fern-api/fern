import { stringify } from "../qs.js";

/**
 * Takes an unknown value, stringifies it using qs, and parses it into a key-value record
 */
export function encodeAsFormParameter(value: unknown): Record<string, string> {
    const stringified = stringify(value, { encode: false });

    const keyValuePairs = stringified.split("&").map((pair) => {
        const [key, value] = pair.split("=");
        return [key, value] as const;
    });

    return Object.fromEntries(keyValuePairs);
}
