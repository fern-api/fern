import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";

/**
 * Represents a location in a source file.
 */
export class SourceLocation {
    public readonly absoluteFilePath: AbsoluteFilePath;
    public readonly relativeFilePath: RelativeFilePath;
    public readonly line: number;
    public readonly column: number;

    constructor({
        absoluteFilePath,
        relativeFilePath,
        line,
        column
    }: {
        absoluteFilePath: AbsoluteFilePath;
        relativeFilePath: RelativeFilePath;
        line: number;
        column: number;
    }) {
        this.absoluteFilePath = absoluteFilePath;
        this.relativeFilePath = relativeFilePath;
        this.line = line;
        this.column = column;
    }

    /**
     * Formats as "filepath:line:column" using the relative file path.
     */
    public toString(): string {
        return this.toRelativeString();
    }

    /**
     * Formats using the relative file path.
     */
    public toRelativeString(): string {
        return `${this.relativeFilePath}:${this.line}:${this.column}`;
    }

    /**
     * Formats using the absolute file path.
     */
    public toAbsoluteString(): string {
        return `${this.absoluteFilePath}:${this.line}:${this.column}`;
    }
}
