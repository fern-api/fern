import { ApiValidationResult, DocsValidationResult } from "./printCheckReport.js";

export interface ApiCheckJsonViolation {
    api?: string;
    severity: string;
    rule: string;
    message: string;
}

export interface DocsCheckJsonViolation {
    severity: string;
    rule: string;
    message: string;
}

export interface CheckJsonResult {
    success: boolean;
    results: {
        apis?: ApiCheckJsonViolation[];
        docs?: DocsCheckJsonViolation[];
        sdks?: ApiCheckJsonViolation[];
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
    const apis: ApiCheckJsonViolation[] = [];
    for (const apiResult of apiResults) {
        for (const violation of apiResult.violations) {
            const entry: ApiCheckJsonViolation = {
                severity: violation.severity,
                rule: violation.name,
                message: violation.message
            };
            if (showApiNames) {
                entry.api = apiResult.apiName;
            }
            apis.push(entry);
        }
    }

    const docs: DocsCheckJsonViolation[] = [];
    if (docsResult != null) {
        for (const violation of docsResult.violations) {
            docs.push({
                severity: violation.severity,
                rule: violation.name,
                message: violation.message
            });
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
