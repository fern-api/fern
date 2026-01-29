import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { SourceLocation } from "@fern-api/source";
import { readFile } from "fs/promises";
import { parseDocument } from "yaml";
import { ValidationIssue } from "./ValidationIssue";
import { YamlDocument, type YamlPath } from "./YamlDocument";

const REF_KEY = "$ref";

export namespace ReferenceResolver {
    export type Result = Success | Failure;

    export interface Success {
        success: true;
        /** The resolved YAML document with all `$ref` nodes replaced. */
        data: unknown;
        /** Mappings from path prefixes to their source documents (for referenced files). */
        pathMappings: PathMapping[];
    }

    export interface Failure {
        success: false;
        issues: ValidationIssue[];
    }

    /**
     * Maps a path prefix to the document that contains the content at that path.
     *
     * This is surfaced to the caller so that it can be used to look up source locations
     * for errors associated with particular YAML paths (e.g. a Zod validation error).
     */
    export interface PathMapping {
        /** The YAML path prefix where the $ref was located (without the $ref key). */
        yamlPath: YamlPath;
        /** The document that contains the content at this path. */
        document: YamlDocument;
        /** The location of the $ref that brought us to this document. */
        refFromLocation: SourceLocation;
    }

    export interface ResolutionContext {
        /** The current working directory for resolving relative file paths. */
        cwd: AbsoluteFilePath;
        /** The source document for location lookups (only valid for the original document). */
        document: YamlDocument;
        /** The original document's file path. */
        originalFile: AbsoluteFilePath;
        /** The current file being processed. */
        currentFile: AbsoluteFilePath;
        /** Set of file paths that are currently being resolved (for circular reference detection). */
        resolutionStack: Set<string>;
        /** Cache of YamlDocuments for referenced files (for source location tracking). */
        referencedDocuments: Record<string, YamlDocument>;
        /** The index in yamlPath where the current file's content starts. */
        yamlPathIndex: number;
        /** The location of the `$ref` that brought us into the current file (undefined for the original file). */
        refFromLocation: SourceLocation | undefined;
        /** Accumulated path mappings for source location lookup after resolution. */
        pathMappings: PathMapping[];
        /** Accumulated issues. */
        issues: ValidationIssue[];
    }
}

/**
 * Resolves `$ref` references in YAML documents.
 *
 * Supports file-based references according to the following rules:
 *  - `$ref` must be a string value that points to a valid YAML file.
 *  - A node with `$ref` must not have any sibling keys.
 *  - The `$ref` value is replaced entirely by the resolved content.
 *  - Circular references are detected and reported as errors.
 *
 * Note that this is a subset of the behavior supported by OpenAPI so
 * that it's better suited for non-recursive structures.
 *
 * @example
 * ```yaml
 * redirects:
 *   $ref: "./redirects.yml"
 * ```
 */
export class ReferenceResolver {
    private readonly cwd: AbsoluteFilePath;

    constructor({ cwd }: { cwd: AbsoluteFilePath }) {
        this.cwd = cwd;
    }

    /**
     * Resolves all `$ref` references in the given YAML document.
     *
     * @param document - The parsed YAML document
     * @returns Result with either the resolved data or resolution issues
     */
    public async resolve({ document }: { document: YamlDocument }): Promise<ReferenceResolver.Result> {
        const originalFile = document.absoluteFilePath;
        const context: ReferenceResolver.ResolutionContext = {
            cwd: this.cwd,
            document,
            originalFile,
            currentFile: originalFile,
            resolutionStack: new Set([originalFile]),
            referencedDocuments: {},
            issues: [],
            pathMappings: [],
            yamlPathIndex: 0,
            refFromLocation: undefined
        };

        const resolved = await this.resolveValue({ context, yamlPath: [], value: document.toJS() });
        if (context.issues.length > 0) {
            return {
                success: false,
                issues: context.issues
            };
        }

        return {
            success: true,
            data: resolved,
            pathMappings: context.pathMappings
        };
    }

    /**
     * Looks up the source location for a path, checking path mappings for referenced files.
     *
     * @param document - The original document.
     * @param pathMappings - Path mappings returned from resolution.
     * @param yamlPath - The path to look up.
     * @returns The source location, with refFrom attached if the path is in a referenced file.
     */
    public getSourceLocationWithMappings({
        document,
        pathMappings,
        yamlPath
    }: {
        document: YamlDocument;
        pathMappings: ReferenceResolver.PathMapping[];
        yamlPath: YamlPath;
    }): SourceLocation {
        // Find the longest matching path prefix in the mappings.
        let bestMatch: ReferenceResolver.PathMapping | undefined;
        for (const mapping of pathMappings) {
            if (this.yamlPathStartsWith(yamlPath, mapping.yamlPath)) {
                if (bestMatch == null || mapping.yamlPath.length > bestMatch.yamlPath.length) {
                    bestMatch = mapping;
                }
            }
        }

        if (bestMatch != null) {
            const localYamlPath = yamlPath.slice(bestMatch.yamlPath.length);
            const location = bestMatch.document.getSourceLocation(localYamlPath);
            return location.withRefFrom(bestMatch.refFromLocation);
        }

        // Fall back to the original document.
        return document.getSourceLocation(yamlPath);
    }

    private async resolveValue({
        context,
        yamlPath,
        value
    }: {
        context: ReferenceResolver.ResolutionContext;
        yamlPath: YamlPath;
        value: unknown;
    }): Promise<unknown> {
        if (value == null) {
            return value;
        }
        if (Array.isArray(value)) {
            return Promise.all(
                value.map((item, index) => this.resolveValue({ context, yamlPath: [...yamlPath, index], value: item }))
            );
        }
        if (typeof value === "object") {
            const obj = value as Record<string, unknown>;
            if (REF_KEY in obj) {
                const refYamlPath = [...yamlPath, REF_KEY];
                return this.resolveRef({
                    context,
                    yamlPath: refYamlPath,
                    location: this.getSourceLocation({ context, yamlPath: refYamlPath }),
                    obj,
                    refValue: obj[REF_KEY]
                });
            }
            const resolved: Record<string, unknown> = {};
            for (const key of Object.keys(obj)) {
                resolved[key] = await this.resolveValue({ context, yamlPath: [...yamlPath, key], value: obj[key] });
            }
            return resolved;
        }
        return value;
    }

    private async resolveRef({
        context,
        yamlPath,
        location,
        obj,
        refValue
    }: {
        context: ReferenceResolver.ResolutionContext;
        yamlPath: YamlPath;
        location: SourceLocation;
        obj: Record<string, unknown>;
        refValue: unknown;
    }): Promise<Record<string, unknown>> {
        // Validate $ref is a string.
        if (typeof refValue !== "string") {
            context.issues.push(
                new ValidationIssue({
                    message: `$ref must be a string, got ${typeof refValue}`,
                    location,
                    yamlPath
                })
            );
            return obj;
        }

        // Validate no sibling keys.
        const keys = Object.keys(obj);
        if (keys.length > 1) {
            const siblingKeys = keys.filter((k) => k !== REF_KEY);
            context.issues.push(
                new ValidationIssue({
                    message: `$ref cannot have sibling keys; found ${siblingKeys.join(", ")}`,
                    location,
                    yamlPath
                })
            );
            return obj;
        }

        // Validate no JSON pointer or in-document reference.
        if (refValue.includes("#")) {
            context.issues.push(
                new ValidationIssue({
                    message: `JSON pointer and in-document references are not supported: ${refValue}`,
                    location,
                    yamlPath
                })
            );
            return obj;
        }

        const referencedFilePath = this.resolveFilePath({ currentFile: context.currentFile, refValue });

        // Check for circular references.
        if (context.resolutionStack.has(referencedFilePath)) {
            const cycle = [...context.resolutionStack, referencedFilePath].join(" -> ");
            context.issues.push(
                new ValidationIssue({
                    message: `Circular $ref detected: ${cycle}`,
                    location,
                    yamlPath
                })
            );
            return obj;
        }

        // Load and parse the referenced file.
        const resolvedReference = await this.parseFile({
            context,
            referencedFilePath,
            yamlPath,
            location,
            refValue
        });
        if (resolvedReference === undefined) {
            // An issue was already added by parseFile.
            return obj;
        }
        if (resolvedReference === null) {
            context.issues.push(
                new ValidationIssue({
                    message: `$ref resolves to null: ${refValue}`,
                    location,
                    yamlPath
                })
            );
            return obj;
        }

        // The parent path is the path without the $ref key. This is the path
        // where the resolved content will be placed in the final result.
        const parentYamlPath = yamlPath.slice(0, -1);

        // Record the path mapping for source location lookup after resolution.
        const referencedDocument = context.referencedDocuments[referencedFilePath];
        if (referencedDocument != null) {
            context.pathMappings.push({
                yamlPath: parentYamlPath,
                document: referencedDocument,
                refFromLocation: location
            });
        }

        const fullyResolvedReference = await this.resolveReferencedFile({
            context,
            referencedFilePath,
            refFromLocation: location,
            yamlPath: parentYamlPath,
            value: resolvedReference
        });
        return fullyResolvedReference as Record<string, unknown>;
    }

    /**
     * Resolves a value within the context of a referenced file, handling
     * the bookkeeping for tracking the current file and YAML path index.
     */
    private async resolveReferencedFile({
        context,
        referencedFilePath,
        refFromLocation,
        yamlPath,
        value
    }: {
        context: ReferenceResolver.ResolutionContext;
        referencedFilePath: AbsoluteFilePath;
        refFromLocation: SourceLocation;
        yamlPath: YamlPath;
        value: unknown;
    }): Promise<unknown> {
        const previousFile = context.currentFile;
        const previousYamlPathIndex = context.yamlPathIndex;
        const previousRefFromLocation = context.refFromLocation;

        context.currentFile = referencedFilePath;
        context.yamlPathIndex = yamlPath.length;
        context.refFromLocation = refFromLocation;
        context.resolutionStack.add(referencedFilePath);

        try {
            return await this.resolveValue({ context, yamlPath, value });
        } finally {
            context.resolutionStack.delete(referencedFilePath);
            context.currentFile = previousFile;
            context.yamlPathIndex = previousYamlPathIndex;
            context.refFromLocation = previousRefFromLocation;
        }
    }

    private async parseFile({
        context,
        referencedFilePath,
        yamlPath,
        location,
        refValue
    }: {
        context: ReferenceResolver.ResolutionContext;
        referencedFilePath: AbsoluteFilePath;
        yamlPath: YamlPath;
        location: SourceLocation;
        refValue: string;
    }): Promise<unknown> {
        if (!(await doesPathExist(referencedFilePath))) {
            context.issues.push(
                new ValidationIssue({
                    message: `Referenced file does not exist: ${refValue}`,
                    location,
                    yamlPath
                })
            );
            return undefined;
        }

        const content = await readFile(referencedFilePath, "utf-8");

        const parsedDocument = parseDocument(content);
        if (parsedDocument.errors.length > 0) {
            const errorMessages = parsedDocument.errors.map((e) => e.message).join("; ");
            context.issues.push(
                new ValidationIssue({
                    message: `Failed to parse referenced file ${refValue}: ${errorMessages}`,
                    location,
                    yamlPath
                })
            );
            return undefined;
        }

        // Create and cache a YamlDocument for source location tracking.
        const yamlDocument = new YamlDocument({
            absoluteFilePath: referencedFilePath,
            relativeFilePath: RelativeFilePath.of(relative(context.cwd, referencedFilePath)),
            document: parsedDocument,
            source: content
        });
        context.referencedDocuments[referencedFilePath] = yamlDocument;

        return yamlDocument.toJS();
    }

    /**
     * Returns the source location for a value at the given path.
     *
     * For the original document, we use the YamlDocument's precise location tracking.
     * For referenced files, we look up the cached YamlDocument and compute the
     * local path within that file, attaching the original `$ref` location via `withRefFrom`.
     */
    private getSourceLocation({
        context,
        yamlPath
    }: {
        context: ReferenceResolver.ResolutionContext;
        yamlPath: YamlPath;
    }): SourceLocation {
        if (context.currentFile === context.originalFile) {
            return context.document.getSourceLocation(yamlPath);
        }
        const location = this.getSourceLocationFromCurrentFile({ context, yamlPath });
        if (context.refFromLocation != null) {
            // Attach the original $ref location for better error reporting.
            return location.withRefFrom(context.refFromLocation);
        }
        return location;
    }

    /**
     * Checks if a YAML path starts with a given prefix.
     */
    private yamlPathStartsWith(path: YamlPath, prefix: YamlPath): boolean {
        if (prefix.length > path.length) {
            return false;
        }
        for (let i = 0; i < prefix.length; i++) {
            if (path[i] !== prefix[i]) {
                return false;
            }
        }
        return true;
    }

    private getSourceLocationFromCurrentFile({
        context,
        yamlPath
    }: {
        context: ReferenceResolver.ResolutionContext;
        yamlPath: YamlPath;
    }): SourceLocation {
        const doc = context.referencedDocuments[context.currentFile];
        if (doc != null) {
            // Compute the YAML path within the referenced file.
            const localYamlPath = yamlPath.slice(context.yamlPathIndex);
            return doc.getSourceLocation(localYamlPath);
        }
        // Fallback that preserves the referenced file path.
        return this.createLocationForReferencedFile({ context, absoluteFilePath: context.currentFile });
    }

    private createLocationForReferencedFile({
        context,
        absoluteFilePath
    }: {
        context: ReferenceResolver.ResolutionContext;
        absoluteFilePath: AbsoluteFilePath;
    }): SourceLocation {
        return new SourceLocation({
            absoluteFilePath,
            relativeFilePath: RelativeFilePath.of(relative(context.cwd, absoluteFilePath)),
            line: 1,
            column: 1
        });
    }

    private resolveFilePath({
        currentFile,
        refValue
    }: {
        currentFile: AbsoluteFilePath;
        refValue: string;
    }): AbsoluteFilePath {
        const currentDir = dirname(currentFile);
        return join(currentDir, RelativeFilePath.of(refValue));
    }
}
