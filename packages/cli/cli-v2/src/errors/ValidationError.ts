import { ValidationIssue } from "@fern-api/yaml-loader";

/**
 * A validation error that contains source code for each validation issue.
 *
 * When displayed, each issue is shown on its own line with file:line:col prefix.
 */
export class ValidationError extends Error {
    public readonly issues: ValidationIssue[];

    constructor(issues: ValidationIssue[]) {
        super(issues.map((issue) => issue.toString()).join("\n"));
        this.issues = issues;
    }
}
