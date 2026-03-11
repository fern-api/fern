import { ValidationIssue } from "@fern-api/yaml-loader";

/**
 * A validation error that contains source-located issues (with file:line:col).
 *
 * Used for fern.yml schema validation where each issue has a precise SourceLocation.
 * When displayed, each issue is shown on its own line with file:line:col prefix.
 */
export class SourcedValidationError extends Error {
    public readonly issues: ValidationIssue[];

    constructor(issues: ValidationIssue[]) {
        super(issues.map((issue) => issue.toString()).join("\n"));
        this.issues = issues;
    }
}
