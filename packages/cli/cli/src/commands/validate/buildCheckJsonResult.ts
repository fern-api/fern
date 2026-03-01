import { ApiValidationResult, DocsValidationResult } from "./printCheckReport.js";

export interface CheckJsonViolation {
    api?: string;
    severity: string;
    rule?: string;
    message: string;
}

export interface CheckJsonResult {
    success: boolean;
    results: {
        apis?: CheckJsonViolation[];
        docs?: CheckJsonViolation[];
        sdks?: CheckJsonViolation[];
    };
    unusedAssets?: string[];
}

export function buildCheckJsonResult({
    apiResults,
    docsResult,
    hasErrors,
    showApiNames
}: {
    apiResults: ApiValidationResult[];
    docsResult: DocsValidationResult | undefined;
    hasErrors: boolean;
    showApiNames: boolean;
}): CheckJsonResult {
    const apis: CheckJsonViolation[] = [];
    for (const apiResult of apiResults) {
        for (const violation of apiResult.violations) {
            const entry: CheckJsonViolation = {
                severity: violation.severity,
                message: violation.message
            };
            if (showApiNames) {
                entry.api = apiResult.apiName;
            }
            if (violation.name != null) {
                entry.rule = violation.name;
            }
            apis.push(entry);
        }
    }

    const docs: CheckJsonViolation[] = [];
    if (docsResult != null) {
        for (const violation of docsResult.violations) {
            const entry: CheckJsonViolation = {
                severity: violation.severity,
                message: violation.message
            };
            if (violation.name != null) {
                entry.rule = violation.name;
            }
            docs.push(entry);
        }
    }

    const results: CheckJsonResult["results"] = {};
    if (apis.length > 0) {
        results.apis = apis;
    }
    if (docs.length > 0) {
        results.docs = docs;
    }

    // Collect unused assets from docs violations for easy machine consumption
    const unusedAssets: string[] = [];
    if (docsResult != null) {
        for (const violation of docsResult.violations) {
            if (violation.name === "unused-assets" && violation.severity === "warning") {
                // Extract relative path from the message "Unused asset file: <path>"
                const match = violation.message.match(/^Unused asset file: (.+)$/);
                if (match?.[1] != null) {
                    unusedAssets.push(match[1]);
                }
            }
        }
    }

    const result: CheckJsonResult = {
        success: !hasErrors,
        results
    };

    if (unusedAssets.length > 0) {
        result.unusedAssets = unusedAssets;
    }

    return result;
}
