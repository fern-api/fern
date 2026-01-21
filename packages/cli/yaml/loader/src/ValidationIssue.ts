import type { SourceLocation } from "@fern-api/source";

/**
 * Represents a validation issue found when parsing a YAML configuration file.
 *
 * Use `toString()` to format as `<file>:<line>:<col>: <message>` for CLI output.
 */
export class ValidationIssue {
    /** The validation error message */
    public readonly message: string;
    /** The source location where the issue was found */
    public readonly location: SourceLocation;
    /** The path to the value in the YAML document (e.g., ["cli", "version"]) */
    public readonly yamlPath: ReadonlyArray<string | number>;

    constructor({
        message,
        location,
        yamlPath
    }: {
        message: string;
        location: SourceLocation;
        yamlPath: ReadonlyArray<string | number>;
    }) {
        this.message = message;
        this.location = location;
        this.yamlPath = yamlPath;
    }

    /**
     * Formats as `<file>:<line>:<col>: <message>` for CLI output.
     *
     * @example
     * ```
     * fern.yml:6:13: org must be a string
     * ```
     */
    public toString(): string {
        return `${this.location}: ${this.message}`;
    }
}
