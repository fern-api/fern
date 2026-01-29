import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { RelativeFilePath } from "@fern-api/path-utils";
import { SourceLocation } from "@fern-api/source";
import { type Document, isNode } from "yaml";

/**
 * A path to a value within a YAML document. Each element is either
 * a string (object key) or number (array index).
 */
export type YamlPath = ReadonlyArray<string | number>;

/**
 * Wraps a parsed YAML Document to provide source location lookups.
 */
export class YamlDocument {
    public readonly absoluteFilePath: AbsoluteFilePath;
    public readonly relativeFilePath: RelativeFilePath;
    private readonly document: Document;
    private readonly source: string;

    constructor({
        absoluteFilePath,
        relativeFilePath,
        document,
        source
    }: {
        absoluteFilePath: AbsoluteFilePath;
        relativeFilePath: RelativeFilePath;
        document: Document;
        source: string;
    }) {
        this.absoluteFilePath = absoluteFilePath;
        this.relativeFilePath = relativeFilePath;
        this.document = document;
        this.source = source;
    }

    /**
     * Returns the parsed YAML content as a plain JavaScript value.
     */
    public toJS(): unknown {
        return this.document.toJS();
    }

    /**
     * Returns the source location for a value at the given path.
     * Falls back to the document root location if the path doesn't exist.
     *
     * @param path - Path to the value (e.g., ["sdks", "targets", "node", 0, "lang"])
     * @returns The source location, or the document root if the path doesn't exist.
     */
    public getSourceLocation(path: YamlPath): SourceLocation {
        const node = this.document.getIn(path, true);
        if (!isNode(node)) {
            return this.getRootSourceLocation();
        }

        const range = node.range;
        if (range == null) {
            return this.getRootSourceLocation();
        }

        // range[0] is the start offset.
        return this.offsetToLocation(range[0]);
    }

    /**
     * Returns the source location for the document root.
     */
    public getRootSourceLocation(): SourceLocation {
        return new SourceLocation({
            absoluteFilePath: this.absoluteFilePath,
            relativeFilePath: this.relativeFilePath,
            line: 1,
            column: 1
        });
    }

    private offsetToLocation(offset: number): SourceLocation {
        let line = 1;
        let lastNewline = -1;
        for (let i = 0; i < offset && i < this.source.length; i++) {
            if (this.source[i] === "\n") {
                line++;
                lastNewline = i;
            }
        }
        return new SourceLocation({
            absoluteFilePath: this.absoluteFilePath,
            relativeFilePath: this.relativeFilePath,
            line,
            column: offset - lastNewline
        });
    }
}
