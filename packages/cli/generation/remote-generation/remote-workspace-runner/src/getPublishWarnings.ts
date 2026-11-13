import { isRecord } from "@fern-api/core-utils";

/**
 * Warnings FDR attached to a docs publish response, such as plan features the site
 * uses without being entitled to them. Read structurally so older FDR SDK types work.
 */
export function getPublishWarnings(response: unknown): string[] {
    if (!isRecord(response) || !Array.isArray(response.warnings)) {
        return [];
    }
    return response.warnings.filter((warning): warning is string => typeof warning === "string" && warning !== "");
}
