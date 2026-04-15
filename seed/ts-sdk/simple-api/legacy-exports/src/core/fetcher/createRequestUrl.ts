import { toQueryString } from "../url/qs.js";

export function createRequestUrl(
    baseUrl: string,
    queryParameters?: Record<string, unknown>,
    arrayFormat?: "indices" | "repeat" | "comma"
): string {
    const queryString = toQueryString(queryParameters, { arrayFormat: arrayFormat ?? "repeat" });
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
