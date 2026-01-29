import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";

/**
 * Represents a location in a source file.
 */
export class SourceLocation {
    public readonly absoluteFilePath: AbsoluteFilePath;
    public readonly relativeFilePath: RelativeFilePath;
    public readonly line: number;
    public readonly column: number;

    /**
     * If this location was resolved from a `$ref`, this contains the location
     * of the file that contained the `$ref` reference.
     */
    public readonly refFrom?: SourceLocation;

    constructor({
        absoluteFilePath,
        relativeFilePath,
        line,
        column,
        refFrom
    }: {
        absoluteFilePath: AbsoluteFilePath;
        relativeFilePath: RelativeFilePath;
        line: number;
        column: number;
        refFrom?: SourceLocation;
    }) {
        this.absoluteFilePath = absoluteFilePath;
        this.relativeFilePath = relativeFilePath;
        this.line = line;
        this.column = column;
        this.refFrom = refFrom;
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

    /**
     * Creates a new SourceLocation with the given `$ref` location.
     * This is used when resolving `$ref` references to track where
     * the reference originated.
     */
    public withRefFrom(refFrom: SourceLocation): SourceLocation {
        return new SourceLocation({
            absoluteFilePath: this.absoluteFilePath,
            relativeFilePath: this.relativeFilePath,
            line: this.line,
            column: this.column,
            refFrom: refFrom
        });
    }
}
