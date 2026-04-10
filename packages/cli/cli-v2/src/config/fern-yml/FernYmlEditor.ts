import type { schemas } from "@fern-api/config";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { type Document, parseDocument } from "yaml";
import { FERN_YML_FILENAME, REF_KEY } from "./constants.js";

export interface OverrideEdit {
    /** 1-based line number where the edit occurred */
    line: number;
}

export interface RemoveOverridesResult extends OverrideEdit {
    removed: string[];
}

/**
 * A resolved section of fern.yml that may live in a `$ref` file.
 */
interface ResolvedSection {
    document: Document;
    filePath: AbsoluteFilePath;
    basePath: (string | number)[];
}

export namespace FernYmlEditor {
    export interface Config {
        /** Path to the fern.yml file. */
        fernYmlPath: AbsoluteFilePath;
    }

    /**
     * Type for adding a target to fern.yml. Mirrors the writable fields
     * of `SdkTargetSchema`.
     */
    export interface TargetSchema extends Omit<schemas.SdkTargetSchema, "output"> {
        // Note that `output` is intentionally widened to accept the pre-serialized
        // YAML representation that `AddCommand.buildOutputForYaml` produces.
        output: schemas.OutputSchema | Record<string, unknown>;
    }
}

/**
 * Stateful editor for mutating fern.yml configuration.
 *
 * Supports editing both the `sdks` section (targets) and the `api` section
 * (spec overrides/overlays). Sections are resolved lazily — if a section
 * uses a `$ref`, the referenced file is loaded on first access.
 */
export class FernYmlEditor {
    private readonly rootDocument: Document;
    private readonly rootFilePath: AbsoluteFilePath;
    private readonly rootDoc: Record<string, unknown>;

    /** Lazily resolved sections, keyed by top-level YAML key (e.g. "sdks", "api"). */
    private readonly sections = new Map<string, ResolvedSection>();

    /** Tracks which file paths have been mutated and need writing. */
    private readonly dirtyFiles = new Set<string>();

    /** Caches serialization for line-number lookups; invalidated on mutation. */
    private readonly cachedSerialization = new Map<string, { text: string; parsed: Document }>();

    private constructor(rootDocument: Document, rootFilePath: AbsoluteFilePath) {
        this.rootDocument = rootDocument;
        this.rootFilePath = rootFilePath;
        this.rootDoc = rootDocument.toJS() as Record<string, unknown>;
    }

    /**
     * Loads fern.yml from the given path.
     * Sections (`sdks`, `api`) are resolved lazily on first method call.
     */
    public static async load(config: FernYmlEditor.Config): Promise<FernYmlEditor> {
        const content = await readFile(config.fernYmlPath, "utf-8");
        const document = parseDocument(content);
        const doc = document.toJS() as Record<string, unknown>;

        if (doc == null || typeof doc !== "object") {
            throw new CliError({
                message: `Invalid ${FERN_YML_FILENAME}: expected a YAML object; run 'fern init' to initialize a new file.`,
                code: CliError.Code.ParseError
            });
        }

        return new FernYmlEditor(document, config.fernYmlPath);
    }

    /** The file path that contains the API specs section (after `$ref` resolution). */
    public async getApiFilePath(): Promise<AbsoluteFilePath> {
        const section = await this.resolveSection("api", ["specs"]);
        return section.filePath;
    }

    // ─── SDK target methods ──────────────────────────────────────────────

    /**
     * Adds a new target entry. Creates intermediate maps (sdks, targets)
     * if they don't exist.
     */
    public async addTarget(name: string, value: FernYmlEditor.TargetSchema): Promise<void> {
        const { document, basePath, filePath } = await this.resolveSection("sdks", ["targets"]);
        this.ensureMapPath(document, basePath);
        document.setIn([...basePath, name], document.createNode(value));
        this.markDirty(filePath);
    }

    /** Sets the version field for an existing target. */
    public async setTargetVersion(name: string, version: string): Promise<void> {
        const section = await this.resolveSection("sdks", ["targets"]);
        this.assertTargetExists(section, name);
        section.document.setIn([...section.basePath, name, "version"], version);
        this.markDirty(section.filePath);
    }

    /** Sets the generator-specific config for an existing target. */
    public async setTargetConfig(name: string, config: Record<string, unknown>): Promise<void> {
        const section = await this.resolveSection("sdks", ["targets"]);
        this.assertTargetExists(section, name);
        section.document.setIn([...section.basePath, name, "config"], section.document.createNode(config));
        this.markDirty(section.filePath);
    }

    /** Removes the generator-specific config from an existing target. */
    public async deleteTargetConfig(name: string): Promise<void> {
        const section = await this.resolveSection("sdks", ["targets"]);
        this.assertTargetExists(section, name);
        section.document.deleteIn([...section.basePath, name, "config"]);
        this.markDirty(section.filePath);
    }

    // ─── API spec methods ────────────────────────────────────────────────

    /**
     * Adds an override path to the matching spec entry.
     * Returns the edit location if a mutation was made, or undefined if no change.
     */
    public async addOverride(
        specFilePath: AbsoluteFilePath,
        overrideAbsolutePath: AbsoluteFilePath
    ): Promise<OverrideEdit | undefined> {
        const section = await this.resolveSection("api", ["specs"]);
        const fileDir = dirname(section.filePath);
        const relativeOverridePath = `./${path.relative(fileDir, overrideAbsolutePath)}`;
        const index = this.findSpecIndex(section, specFilePath);
        if (index < 0) {
            return undefined;
        }

        const overridesPath = [...section.basePath, index, "overrides"];
        const existing = nodeToJS(section.document.getIn(overridesPath));
        const normalizedNew = path.normalize(relativeOverridePath);

        if (existing == null) {
            section.document.setIn(overridesPath, relativeOverridePath);
        } else if (typeof existing === "string") {
            if (path.normalize(existing) === normalizedNew) {
                return undefined;
            }
            section.document.setIn(overridesPath, section.document.createNode([existing, relativeOverridePath]));
        } else if (Array.isArray(existing)) {
            if (existing.some((p: string) => path.normalize(p) === normalizedNew)) {
                return undefined;
            }
            const updated = [...existing, relativeOverridePath];
            section.document.setIn(overridesPath, section.document.createNode(updated));
        }

        this.markDirty(section.filePath);
        return { line: this.getLineOfPath(section, overridesPath) };
    }

    /**
     * Removes all override references for the matching spec.
     * Returns the removed paths and the edit location, or undefined if nothing was removed.
     */
    public async removeOverrides(specFilePath: AbsoluteFilePath): Promise<RemoveOverridesResult | undefined> {
        const section = await this.resolveSection("api", ["specs"]);
        const index = this.findSpecIndex(section, specFilePath);
        if (index < 0) {
            return undefined;
        }

        const overridesPath = [...section.basePath, index, "overrides"];
        const existing = nodeToJS(section.document.getIn(overridesPath));
        if (existing == null) {
            return undefined;
        }
        const line = this.getLineOfPath(section, overridesPath);
        const removed: string[] = typeof existing === "string" ? [existing] : [...(existing as string[])];
        section.document.deleteIn(overridesPath);
        this.markDirty(section.filePath);
        return { removed, line };
    }

    /**
     * Returns the existing overlay path for the matching spec entry, or undefined.
     */
    public async getOverlayPath(specFilePath: AbsoluteFilePath): Promise<AbsoluteFilePath | undefined> {
        const section = await this.resolveSection("api", ["specs"]);
        const index = this.findSpecIndex(section, specFilePath);
        if (index < 0) {
            return undefined;
        }
        const overlaysPath = [...section.basePath, index, "overlays"];
        const existing = nodeToJS(section.document.getIn(overlaysPath));
        if (typeof existing === "string") {
            const fileDir = dirname(section.filePath);
            return join(fileDir, RelativeFilePath.of(existing));
        }
        return undefined;
    }

    /**
     * Adds an overlay path to the matching spec entry.
     * Unlike overrides, overlays is a single path (not an array).
     * Returns the edit location if a mutation was made, or undefined if no change.
     *
     * TODO (parser/ir): Support multiple overlays, in which case the add/removeOverrides
     * and add/removeOverlays functions can be more easily collapsed.
     */
    public async addOverlay(
        specFilePath: AbsoluteFilePath,
        overlayAbsolutePath: AbsoluteFilePath
    ): Promise<OverrideEdit | undefined> {
        const section = await this.resolveSection("api", ["specs"]);
        const fileDir = dirname(section.filePath);
        const relativeOverlayPath = `./${path.relative(fileDir, overlayAbsolutePath)}`;
        const index = this.findSpecIndex(section, specFilePath);
        if (index < 0) {
            return undefined;
        }

        const overlaysPath = [...section.basePath, index, "overlays"];
        const existing = nodeToJS(section.document.getIn(overlaysPath));
        const normalizedNew = path.normalize(relativeOverlayPath);

        if (existing == null) {
            section.document.setIn(overlaysPath, relativeOverlayPath);
        } else if (typeof existing === "string") {
            if (path.normalize(existing) === normalizedNew) {
                return undefined;
            }
            section.document.setIn(overlaysPath, relativeOverlayPath);
        }

        this.markDirty(section.filePath);
        return { line: this.getLineOfPath(section, overlaysPath) };
    }

    /**
     * Removes the overlay reference for the matching spec.
     * Returns the edit location, or undefined if nothing was removed.
     */
    public async removeOverlay(specFilePath: AbsoluteFilePath): Promise<OverrideEdit | undefined> {
        const section = await this.resolveSection("api", ["specs"]);
        const index = this.findSpecIndex(section, specFilePath);
        if (index < 0) {
            return undefined;
        }

        const overlaysPath = [...section.basePath, index, "overlays"];
        const existing = nodeToJS(section.document.getIn(overlaysPath));
        if (existing == null) {
            return undefined;
        }
        const line = this.getLineOfPath(section, overlaysPath);
        section.document.deleteIn(overlaysPath);
        this.markDirty(section.filePath);
        return { line };
    }

    // ─── Shared ──────────────────────────────────────────────────────────

    /**
     * Writes all mutated documents back to disk, preserving YAML formatting.
     */
    public async save(): Promise<void> {
        if (this.dirtyFiles.size === 0) {
            return;
        }

        const writes: Promise<void>[] = [];
        const written = new Set<string>();
        // Sections are guaranteed to be resolved if they were dirtied.
        // Deduplicate: sections may share the same file when no $ref is used.
        for (const section of this.sections.values()) {
            if (this.dirtyFiles.has(section.filePath) && !written.has(section.filePath)) {
                written.add(section.filePath);
                writes.push(writeFile(section.filePath, section.document.toString(), "utf-8"));
            }
        }
        await Promise.all(writes);

        this.dirtyFiles.clear();
        this.cachedSerialization.clear();
    }

    // ─── Private: section resolution ─────────────────────────────────────

    /**
     * Lazily resolves a top-level section that may use a `$ref`.
     * If the section has a `$ref`, loads the referenced file on first access.
     * Otherwise returns a section pointing into the root document.
     * Results are cached per section key.
     */
    private async resolveSection(sectionKey: string, innerPath: (string | number)[]): Promise<ResolvedSection> {
        const cached = this.sections.get(sectionKey);
        if (cached != null) {
            return cached;
        }

        const sectionValue = this.rootDoc[sectionKey];
        if (sectionValue != null && typeof sectionValue === "object" && REF_KEY in sectionValue) {
            const refPath = (sectionValue as Record<string, unknown>)[REF_KEY];
            if (typeof refPath === "string") {
                const resolvedPath = join(dirname(this.rootFilePath), RelativeFilePath.of(refPath));
                if (!(await doesPathExist(resolvedPath))) {
                    throw new CliError({
                        message: `Referenced file '${refPath}' in ${FERN_YML_FILENAME} does not exist.`,
                        code: CliError.Code.ConfigError
                    });
                }
                const refContent = await readFile(resolvedPath, "utf-8");
                const refDocument = parseDocument(refContent);
                const section: ResolvedSection = {
                    document: refDocument,
                    filePath: resolvedPath,
                    basePath: innerPath
                };
                this.sections.set(sectionKey, section);
                return section;
            }
        }
        const section: ResolvedSection = {
            document: this.rootDocument,
            filePath: this.rootFilePath,
            basePath: [sectionKey, ...innerPath]
        };
        this.sections.set(sectionKey, section);
        return section;
    }

    // ─── Private: SDK helpers ────────────────────────────────────────────

    private assertTargetExists(section: ResolvedSection, name: string): void {
        const existing = section.document.getIn([...section.basePath, name]);
        if (existing == null) {
            throw new CliError({
                message: `Target '${name}' not found in SDK configuration.`,
                code: CliError.Code.ConfigError
            });
        }
    }

    /**
     * Ensures that the map path exists in the document, creating intermediate
     * maps as needed.
     */
    private ensureMapPath(document: Document, mapPath: (string | number)[]): void {
        for (let i = 1; i <= mapPath.length; i++) {
            const subPath = mapPath.slice(0, i);
            const existing = document.getIn(subPath);
            if (existing == null) {
                document.setIn(subPath, document.createNode({}));
            }
        }
    }

    // ─── Private: API spec helpers ───────────────────────────────────────

    /**
     * Finds the index of the spec entry matching the given absolute path.
     */
    private findSpecIndex(section: ResolvedSection, specFilePath: AbsoluteFilePath): number {
        const specs = nodeToJS(section.document.getIn(section.basePath)) as unknown[];
        if (!Array.isArray(specs)) {
            return -1;
        }

        const fileDir = dirname(section.filePath);
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

    // ─── Private: shared helpers ─────────────────────────────────────────

    private markDirty(filePath: AbsoluteFilePath): void {
        this.dirtyFiles.add(filePath);
        this.cachedSerialization.delete(filePath);
    }

    /**
     * Re-serializes the document and finds the 1-based line number of the node at `nodePath`.
     * Caches the serialization to avoid redundant work when called multiple times between mutations.
     */
    private getLineOfPath(section: ResolvedSection, nodePath: (string | number)[]): number {
        let cached = this.cachedSerialization.get(section.filePath);
        if (cached == null) {
            const text = section.document.toString();
            cached = { text, parsed: parseDocument(text) };
            this.cachedSerialization.set(section.filePath, cached);
        }
        const { text, parsed } = cached;
        const node = parsed.getIn(nodePath, true);
        if (node != null && typeof node === "object" && "range" in node) {
            const range = (node as { range?: [number, number, number] }).range;
            if (range != null) {
                return text.substring(0, range[0]).split("\n").length;
            }
        }
        return 1;
    }
}

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
