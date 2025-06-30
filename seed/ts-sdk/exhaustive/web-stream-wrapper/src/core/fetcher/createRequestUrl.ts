import { stringify } from "../qs.js";

export function createRequestUrl(baseUrl: string, queryParameters?: Record<string, unknown>): string {
    const queryString = stringify(queryParameters, { arrayFormat: "repeat" });
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
