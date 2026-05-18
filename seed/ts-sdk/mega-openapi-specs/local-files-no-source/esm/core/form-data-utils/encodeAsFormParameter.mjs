import { toQueryString } from "../url/qs.mjs";
export function encodeAsFormParameter(value) {
    const stringified = toQueryString(value, { encode: false });
    const keyValuePairs = stringified.split("&").map((pair) => {
        const [key, value] = pair.split("=");
        return [key, value];
    });
    return Object.fromEntries(keyValuePairs);
}
