/**
 * Checks if a value is an empty object (i.e., {})
 */
export function isEmptyObject(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value !== "object") {
        return false;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    return Object.keys(value as Record<string, unknown>).length === 0;
}

export interface FilterRequestBodyResult {
    filteredBody: unknown;
    extractedPathParams: Record<string, unknown>;
    extractedQueryParams: Record<string, unknown>;
    extractedHeaders: Record<string, unknown>;
}

/**
 * Filters out path parameters, query parameters, and header keys from the request body.
 * The AI model sometimes incorrectly includes these in the request body.
 * Returns the filtered body and any extracted parameter values.
 */
export function filterRequestBody(
    requestBody: unknown,
    pathParameters: Record<string, unknown> | undefined,
    queryParameters: Record<string, unknown> | undefined,
    headers: Record<string, unknown> | undefined
): FilterRequestBodyResult {
    const extractedPathParams: Record<string, unknown> = {};
    const extractedQueryParams: Record<string, unknown> = {};
    const extractedHeaders: Record<string, unknown> = {};

    if (
        requestBody === null ||
        requestBody === undefined ||
        typeof requestBody !== "object" ||
        Array.isArray(requestBody)
    ) {
        return { filteredBody: requestBody, extractedPathParams, extractedQueryParams, extractedHeaders };
    }

    const bodyRecord = requestBody as Record<string, unknown>;
    const filteredBody: Record<string, unknown> = {};

    // Get all parameter keys to filter out
    const pathParamKeys = new Set(Object.keys(pathParameters ?? {}));
    const queryParamKeys = new Set(Object.keys(queryParameters ?? {}));
    const headerKeys = new Set(Object.keys(headers ?? {}));

    for (const [key, value] of Object.entries(bodyRecord)) {
        // Check if this key matches a path parameter (case-insensitive, with common variations)
        const normalizedKey = key.toLowerCase().replace(/[-_]/g, "");

        let isPathParam = false;
        let isQueryParam = false;
        let isHeader = false;

        for (const pathKey of pathParamKeys) {
            const normalizedPathKey = pathKey.toLowerCase().replace(/[-_]/g, "");
            if (normalizedKey === normalizedPathKey) {
                isPathParam = true;
                extractedPathParams[pathKey] = value;
                break;
            }
        }

        if (!isPathParam) {
            for (const queryKey of queryParamKeys) {
                const normalizedQueryKey = queryKey.toLowerCase().replace(/[-_]/g, "");
                if (normalizedKey === normalizedQueryKey) {
                    isQueryParam = true;
                    extractedQueryParams[queryKey] = value;
                    break;
                }
            }
        }

        if (!isPathParam && !isQueryParam) {
            for (const headerKey of headerKeys) {
                const normalizedHeaderKey = headerKey.toLowerCase().replace(/[-_]/g, "");
                if (normalizedKey === normalizedHeaderKey) {
                    isHeader = true;
                    extractedHeaders[headerKey] = value;
                    break;
                }
            }
        }

        // Only include in filtered body if it's not a path/query/header param
        if (!isPathParam && !isQueryParam && !isHeader) {
            filteredBody[key] = value;
        }
    }

    return { filteredBody, extractedPathParams, extractedQueryParams, extractedHeaders };
}
