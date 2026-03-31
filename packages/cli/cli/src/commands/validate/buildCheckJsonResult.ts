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

    return {
        success: !hasErrors,
        results
    };
}
