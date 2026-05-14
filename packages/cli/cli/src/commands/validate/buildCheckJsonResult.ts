import { ApiValidationResult, DocsValidationResult } from "./printCheckReport.js";

export interface CheckJsonViolation {
    api?: string;
    severity: string;
    rule?: string;
    message: string;
    filepath?: string;
    line?: number;
    column?: number;
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
            if (violation.relativeFilepath !== "") {
                const filePath = violation.relativeFilepath;
                const lineColMatch = filePath.match(/^(.+?):(\d+)(?::(\d+))?$/);
                if (lineColMatch != null) {
                    entry.filepath = lineColMatch[1];
                    const lineStr = lineColMatch[2];
                    if (lineStr != null) {
                        entry.line = parseInt(lineStr, 10);
                    }
                    const colStr = lineColMatch[3];
                    if (colStr != null) {
                        entry.column = parseInt(colStr, 10);
                    }
                } else {
                    entry.filepath = filePath;
                }
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
