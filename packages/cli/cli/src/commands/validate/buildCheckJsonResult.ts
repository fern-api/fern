import { SystemValidationResult } from "./checkNodeVersion.js";
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
        system?: CheckJsonViolation[];
        apis?: CheckJsonViolation[];
        docs?: CheckJsonViolation[];
        sdks?: CheckJsonViolation[];
    };
}

export function buildCheckJsonResult({
    systemResult,
    apiResults,
    docsResult,
    hasErrors,
    showApiNames
}: {
    systemResult?: SystemValidationResult;
    apiResults: ApiValidationResult[];
    docsResult: DocsValidationResult | undefined;
    hasErrors: boolean;
    showApiNames: boolean;
}): CheckJsonResult {
    const system: CheckJsonViolation[] = (systemResult?.violations ?? []).map((violation) => ({
        severity: violation.severity,
        message: violation.message,
        ...(violation.name != null ? { rule: violation.name } : {})
    }));

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
    if (system.length > 0) {
        results.system = system;
    }
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
