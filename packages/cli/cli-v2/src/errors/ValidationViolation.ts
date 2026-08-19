/**
 * A validation violation found during API or docs validation.
 *
 * This is a local type that mirrors the structure of validation violations
 * from legacy packages (docs-validator, fern-definition-validator) without
 * importing their types directly.
 */
export interface ValidationViolation {
    /** The rule name that produced this violation */
    name?: string;
    /** The severity of the violation */
    severity: "fatal" | "error" | "warning";
    /** File path relative to the workspace root */
    relativeFilepath: string;
    /** Path to the node in the document tree */
    nodePath: ReadonlyArray<string | { key: string; arrayIndex?: number }>;
    /** Human-readable description of the violation */
    message: string;
}
