import { toQueryString } from "../url/qs";

export function createRequestUrl(
    baseUrl: string,
    queryParameters?: Record<string, unknown>,
    arrayFormats?: Record<string, "indices" | "repeat" | "comma">
): string {
    const queryString = toQueryString(queryParameters, { arrayFormat: "repeat", arrayFormats });
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
