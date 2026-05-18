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
            // For md-validate violations, parse filepath:line:column from relativeFilepath
            if (violation.name === "md-validate" && violation.relativeFilepath) {
                const match = violation.relativeFilepath.match(/^(.+?):(\d+)(?::(\d+))?$/);
                if (match != null) {
                    entry.filepath = match[1];
                    entry.line = parseInt(match[2]!, 10);
                    if (match[3] != null) {
                        entry.column = parseInt(match[3], 10);
                    }
                    // Use clean message without context lines for JSON
                    const firstNewline = violation.message.indexOf("\n");
                    if (firstNewline > 0) {
                        entry.message = violation.message.substring(0, firstNewline).trim();
                    }
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
