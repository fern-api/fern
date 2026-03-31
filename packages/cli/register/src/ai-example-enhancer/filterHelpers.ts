/**
 * Checks if a value looks like an FDR typed value wrapper (has `type` and/or `value` properties).
 * These wrappers are used internally but should be unwrapped for x-fern-examples.
 */
export function isFdrTypedValueWrapper(value: unknown): value is { type?: string; value?: unknown } {
    if (value === null || value === undefined || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0 || keys.length > 2) {
        return false;
    }
    const hasType = "type" in obj && typeof obj.type === "string";
    const hasValue = "value" in obj;
    return (
        (hasType && keys.length === 1) || (hasType && hasValue && keys.length === 2) || (hasValue && keys.length === 1)
    );
}

/**
 * Unwraps FDR typed value wrappers from an example body.
 * Converts structures like `{ "file": { "type": "filename", "value": "test.wav" } }`
 * to plain values like `{ "file": "test.wav" }`.
 * This is needed because x-fern-examples expects plain values, not the internal FDR structure.
 */
export function unwrapExampleValue(value: unknown): unknown {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(unwrapExampleValue);
    }

    if (typeof value !== "object") {
        return value;
    }

    const obj = value as Record<string, unknown>;

    if (isFdrTypedValueWrapper(obj)) {
        if ("value" in obj) {
            return unwrapExampleValue(obj.value);
        }
        return undefined;
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
        const unwrapped = unwrapExampleValue(val);
        if (unwrapped !== undefined) {
            result[key] = unwrapped;
        }
    }
    return result;
}

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
