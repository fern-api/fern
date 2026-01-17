import { ValidationIssue } from "@fern-api/yaml-loader";

/**
 * A validation error that contains source code for each validation issue.
 *
 * These errors should be written to stderr.
 */
export class ValidationError extends Error {
    public readonly issues: ValidationIssue[];

    constructor(issues: ValidationIssue[]) {
        super(issues.map((issue) => issue.toString()).join("\n"));
        this.issues = issues;
    }
}
