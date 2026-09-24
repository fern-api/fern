import { ErrorStatusCodeSchema } from "../schemas/index.js";

export const CLIENT_ERROR_WILDCARD_STATUS_CODE = "4XX";
export const SERVER_ERROR_WILDCARD_STATUS_CODE = "5XX";

export interface ParsedErrorStatusCode {
    /**
     * The concrete status code, or the first status code of the range for a
     * wildcard (400 for 4XX, 500 for 5XX).
     */
    statusCode: number;
    isWildcard: boolean;
}

/**
 * Parses the `status-code` of an error declaration. Returns undefined if the
 * value is neither an integer nor one of the supported wildcards (4XX, 5XX).
 */
export function parseErrorStatusCode(statusCode: ErrorStatusCodeSchema): ParsedErrorStatusCode | undefined {
    if (typeof statusCode === "number") {
        return Number.isInteger(statusCode) ? { statusCode, isWildcard: false } : undefined;
    }
    switch (statusCode.toUpperCase()) {
        case CLIENT_ERROR_WILDCARD_STATUS_CODE:
            return { statusCode: 400, isWildcard: true };
        case SERVER_ERROR_WILDCARD_STATUS_CODE:
            return { statusCode: 500, isWildcard: true };
        default: {
            const parsed = Number(statusCode);
            return Number.isInteger(parsed) && statusCode.trim() !== ""
                ? { statusCode: parsed, isWildcard: false }
                : undefined;
        }
    }
}
