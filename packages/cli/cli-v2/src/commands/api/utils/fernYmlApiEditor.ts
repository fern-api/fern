import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { type Document, parseDocument } from "yaml";
import { FileFinder } from "../../../config/FileFinder.js";
import { FERN_YML_FILENAME, REF_KEY } from "../../../config/fern-yml/constants.js";
import { CliError } from "../../../errors/CliError.js";

/**
 * Converts a YAML Document node (YAMLMap, YAMLSeq, Scalar) to its plain JS value.
 * Primitives and null/undefined pass through as-is.
 */
function nodeToJS(value: unknown): unknown {
    if (value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return value;
    }
    return (value as { toJSON(): unknown }).toJSON();
}

export interface OverrideEdit {
    /** 1-based line number where the edit occurred */
    line: number;
}

export interface RemoveOverridesResult extends OverrideEdit {
    removed: string[];
}

/**
 * Stateful editor for mutating API spec override references in fern.yml.
 *
 * Follows the same pattern as FernYmlEditor: loads fern.yml, resolves $ref
 * if the `api` section points to another file, and writes changes back to
 * the correct file with formatting preserved.
 */
export class FernYmlApiEditor {
    private dirty = false;
    private cachedSerialization: { text: string; parsed: Document } | undefined;

    private constructor(
        private readonly document: Document,
        public readonly filePath: AbsoluteFilePath,
        private readonly specsPath: (string | number)[]
    ) {}

    /**
     * Finds fern.yml by walking up from `cwd`, loads the document that
     * contains the `api.specs` array (resolving `$ref` if needed).
     */
    public static async load(cwd: AbsoluteFilePath): Promise<FernYmlApiEditor> {
        const finder = new FileFinder({ from: cwd });
        const fernYmlPath = await finder.find({ filename: FERN_YML_FILENAME });
        if (fernYmlPath == null) {
            throw new CliError({
                message: `${FERN_YML_FILENAME} not found in any parent directory. Run 'fern init' to initialize a project.`
            });
        }

        const content = await readFile(fernYmlPath, "utf-8");
        const document = parseDocument(content);
        const doc = document.toJS() as Record<string, unknown>;

        // Check if `api` uses a $ref
        const apiValue = doc.api;
        if (apiValue != null && typeof apiValue === "object" && REF_KEY in apiValue) {
            const refPath = (apiValue as Record<string, unknown>)[REF_KEY];
            if (typeof refPath === "string") {
                const resolvedPath = join(dirname(fernYmlPath), RelativeFilePath.of(refPath));
                const refContent = await readFile(resolvedPath, "utf-8");
                const refDocument = parseDocument(refContent);
                return new FernYmlApiEditor(refDocument, resolvedPath, ["specs"]);
            }
        }

        return new FernYmlApiEditor(document, fernYmlPath, ["api", "specs"]);
    }

    /**
     * Adds an override path to the matching spec entry.
     * Returns the edit location if a mutation was made, or undefined if no change.
     */
    public addOverride(specFilePath: AbsoluteFilePath, overrideAbsolutePath: AbsoluteFilePath): OverrideEdit | undefined {
        const fileDir = dirname(this.filePath);
        const relativeOverridePath = `./${path.relative(fileDir, overrideAbsolutePath)}`;
        const index = this.findSpecIndex(specFilePath);
        if (index < 0) {
            return undefined;
        }

        const overridesPath = [...this.specsPath, index, "overrides"];
        const existing = nodeToJS(this.document.getIn(overridesPath));
        const normalizedNew = path.normalize(relativeOverridePath);

        if (existing == null) {
            this.document.setIn(overridesPath, relativeOverridePath);
        } else if (typeof existing === "string") {
            if (path.normalize(existing) === normalizedNew) {
                return undefined;
            }
            this.document.setIn(overridesPath, this.document.createNode([existing, relativeOverridePath]));
        } else if (Array.isArray(existing)) {
            if (existing.some((p: string) => path.normalize(p) === normalizedNew)) {
                return undefined;
            }
            const updated = [...existing, relativeOverridePath];
            this.document.setIn(overridesPath, this.document.createNode(updated));
        }

        this.dirty = true;
        this.cachedSerialization = undefined;
        return { line: this.getLineOfPath(overridesPath) };
    }

    /**
     * Removes all override references for the matching spec.
     * Returns the removed paths and the edit location, or undefined if nothing was removed.
     */
    public removeOverrides(specFilePath: AbsoluteFilePath): RemoveOverridesResult | undefined {
        const index = this.findSpecIndex(specFilePath);
        if (index < 0) {
            return undefined;
        }

        const overridesPath = [...this.specsPath, index, "overrides"];
        const existing = nodeToJS(this.document.getIn(overridesPath));
        if (existing == null) {
            return undefined;
        }
        // Capture line before deletion
        const line = this.getLineOfPath(overridesPath);
        const removed: string[] = typeof existing === "string" ? [existing] : [...(existing as string[])];
        this.document.deleteIn(overridesPath);
        this.dirty = true;
        this.cachedSerialization = undefined;
        return { removed, line };
    }

    /**
     * Writes the document back to disk if any mutations were made.
     * Preserves YAML formatting via the `yaml` package's Document model.
     */
    public async save(): Promise<void> {
        if (!this.dirty) {
            return;
        }
        await writeFile(this.filePath, this.document.toString(), "utf-8");
        this.dirty = false;
        this.cachedSerialization = undefined;
    }

    /**
     * Re-serializes the document and finds the 1-based line number of the node at `nodePath`.
     * Caches the serialization to avoid redundant work when called multiple times between mutations.
     */
    private getLineOfPath(nodePath: (string | number)[]): number {
        if (this.cachedSerialization == null) {
            const text = this.document.toString();
            this.cachedSerialization = { text, parsed: parseDocument(text) };
        }
        const { text, parsed } = this.cachedSerialization;
        const node = parsed.getIn(nodePath, true);
        if (node != null && typeof node === "object" && "range" in node) {
            const range = (node as { range?: [number, number, number] }).range;
            if (range != null) {
                return text.substring(0, range[0]).split("\n").length;
            }
        }
        return 1;
    }

    /**
     * Finds the index of the spec entry matching the given absolute path.
     */
    private findSpecIndex(specFilePath: AbsoluteFilePath): number {
        const specs = nodeToJS(this.document.getIn(this.specsPath)) as unknown[];
        if (!Array.isArray(specs)) {
            return -1;
        }

        const fileDir = dirname(this.filePath);
        const relativeSpecPath = path.normalize(path.relative(fileDir, specFilePath));

        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i] as Record<string, unknown> | undefined;
            if (spec == null) {
                continue;
            }
            const specPath = (spec.openapi ?? spec.asyncapi) as string | undefined;
            if (specPath != null && path.normalize(specPath) === relativeSpecPath) {
                return i;
            }
        }
        return -1;
    }
}
