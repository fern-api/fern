import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { type Sourced, SourceLocation } from "@fern-api/source";
import { z } from "zod";
import { deepStrict } from "./deepStrict.js";
import { ReferenceResolver } from "./ReferenceResolver.js";
import { ValidationIssue } from "./ValidationIssue.js";
import type { YamlDocument } from "./YamlDocument.js";
import { YamlParser } from "./YamlParser.js";
import { YamlSourceResolver } from "./YamlSourceResolver.js";
export namespace YamlConfigLoader {
    export type Result<T> = Success<T> | Failure;

    export interface Success<T> {
        success: true;
        /** The validated config data */
        data: T;
        /** The config with source location wrappers for error reporting */
        sourced: Sourced<T>;
        /** The absolute path to the loaded config file */
        absoluteFilePath: AbsoluteFilePath;
        /** The relative path to the loaded config file */
        relativeFilePath: RelativeFilePath;
        /**
         * Path mappings from `$ref` resolution — maps YAML path prefixes to the
         * source document they came from. Useful for resolving file paths relative
         * to the correct source file when a key was loaded via `$ref`.
         */
        pathMappings: ReferenceResolver.PathMapping[];
    }

    export interface Failure {
        success: false;
        /** The validation issues found in the YAML file */
        issues: ValidationIssue[];
    }
}

export class YamlConfigLoader {
    private readonly parser: YamlParser;
    private readonly cwd: AbsoluteFilePath;
    private readonly referenceResolver: ReferenceResolver;

    constructor({ cwd }: { cwd: AbsoluteFilePath }) {
        this.parser = new YamlParser();
        this.cwd = cwd;
        this.referenceResolver = new ReferenceResolver({ cwd });
    }

    /**
     * Loads and validates a YAML configuration file with source location tracking.
     *
     * @param absoluteFilePath - The absolute path to the YAML file.
     * @param schema - The zod schema to validate against.
     * @param resolveReferences - Whether to resolve `$ref` references before validation (default: true).
     * @returns Result with either the parsed config (both plain and sourced) or validation errors.
     *
     * @example
     * ```typescript
     * const loader = new YamlConfigLoader({ cwd });
     * const result = await loader.load(path, FernYmlSchema);
     * if (result.success) {
     *   console.log(result.data.edition);           // Plain value
     *   console.log(result.sourced.edition.$loc);   // Source location
     * }
     * ```
     */
    public async load<S extends z.ZodSchema>({
        absoluteFilePath,
        schema,
        resolveReferences = true,
        strict = false
    }: {
        absoluteFilePath: AbsoluteFilePath;
        schema: S;
        resolveReferences?: boolean;
        /** When true, recursively applies `.strict()` to all objects in the schema,
         *  causing validation errors for unrecognized keys at any depth. */
        strict?: boolean;
    }): Promise<YamlConfigLoader.Result<z.infer<S>>> {
        const document = await this.parseDocument(absoluteFilePath);

        const yamlErrors = this.getYamlErrors(document);
        if (yamlErrors.length > 0) {
            return { success: false, issues: yamlErrors };
        }

        const resolved = await this.resolveReferences({ document, resolveReferences });
        if (!resolved.success) {
            return {
                success: false,
                issues: resolved.issues
            };
        }
        const effectiveSchema = strict ? deepStrict(schema) : schema;
        const parseResult = effectiveSchema.safeParse(resolved.data);
        if (!parseResult.success) {
            const issues = parseResult.error.issues.map((issue) => {
                // Zod paths are PropertyKey[] but YAML paths are string | number
                const yamlPath = issue.path.filter((p): p is string | number => typeof p !== "symbol");
                return new ValidationIssue({
                    yamlPath,
                    message: this.formatZodIssue(issue),
                    location: this.referenceResolver.getSourceLocationWithMappings({
                        document,
                        pathMappings: resolved.pathMappings,
                        yamlPath
                    })
                });
            });

            return {
                success: false,
                issues
            };
        }
        const sourceResolver = new YamlSourceResolver(document);
        return {
            success: true,
            data: parseResult.data,
            sourced: sourceResolver.toSourced(parseResult.data),
            absoluteFilePath,
            relativeFilePath: RelativeFilePath.of(relative(this.cwd, absoluteFilePath)),
            pathMappings: resolved.pathMappings
        };
    }

    private async parseDocument(absoluteFilePath: AbsoluteFilePath): Promise<YamlDocument> {
        try {
            return await this.parser.parseDocument({ absoluteFilePath, cwd: this.cwd });
        } catch (err) {
            throw new Error(`Failed to parse YAML file ${absoluteFilePath}: ${extractErrorMessage(err)}`);
        }
    }

    private async resolveReferences({
        document,
        resolveReferences
    }: {
        document: YamlDocument;
        resolveReferences: boolean;
    }): Promise<ReferenceResolver.Result> {
        if (!resolveReferences) {
            return {
                success: true,
                data: document.toJS(),
                pathMappings: []
            };
        }
        const resolveResult = await this.referenceResolver.resolve({ document });
        if (!resolveResult.success) {
            return {
                success: false,
                issues: resolveResult.issues
            };
        }
        return resolveResult;
    }

    private getYamlErrors(document: YamlDocument): ValidationIssue[] {
        if (document.errors.length === 0) {
            return [];
        }
        return document.errors.map((error) => {
            const line = error.linePos?.[0]?.line ?? 1;
            const col = error.linePos?.[0]?.col ?? 1;
            return new ValidationIssue({
                message: error.message,
                location: new SourceLocation({
                    absoluteFilePath: document.absoluteFilePath,
                    relativeFilePath: document.relativeFilePath,
                    line,
                    column: col
                })
            });
        });
    }

    private formatZodIssue(issue: z.core.$ZodIssue): string {
        const path = issue.path.join(".");

        switch (issue.code) {
            case "invalid_type":
                // In Zod 4, the received type is only in the message, not a separate property.
                //
                // Message format: "Invalid input: expected {type}, received {type}"
                if (issue.message.endsWith("received undefined")) {
                    return path.length > 0 ? `${path} is required` : "value is required";
                }
                return path.length > 0 ? `${path} must be a ${issue.expected}` : `must be a ${issue.expected}`;

            case "invalid_value": {
                if (issue.values != null) {
                    const options = issue.values.join(", ");
                    return path.length > 0 ? `${path} must be one of: ${options}` : `must be one of: ${options}`;
                }
                return issue.message;
            }

            case "unrecognized_keys":
                return `unknown key(s): ${issue.keys.join(", ")}`;

            case "invalid_union": {
                // Prefer surfacing unrecognized_keys errors — these occur when the input
                // object matches a union variant structurally but has unknown fields. They
                // give the user a much more actionable message than generic type errors.
                const unknownKeys: string[] = [];
                for (const errorGroup of issue.errors) {
                    for (const err of errorGroup) {
                        if (err.code === "unrecognized_keys") {
                            unknownKeys.push(...err.keys);
                        }
                    }
                }
                if (unknownKeys.length > 0) {
                    return `unknown key(s): ${[...new Set(unknownKeys)].join(", ")}`;
                }

                // Fall back to collecting unique expected types from nested invalid_type errors
                const expectedTypes = new Set<string>();
                for (const errorGroup of issue.errors) {
                    for (const err of errorGroup) {
                        if (err.code === "invalid_type") {
                            expectedTypes.add(err.expected);
                        }
                    }
                }
                if (expectedTypes.size > 0) {
                    const types = Array.from(expectedTypes).join(" or ");
                    return path.length > 0 ? `${path} must be a ${types}` : `must be a ${types}`;
                }
                return path.length > 0 ? `${path} has an invalid value` : "invalid value";
            }

            case "invalid_format":
                return path.length > 0 ? `${path} must be a valid ${issue.format}` : `must be a valid ${issue.format}`;

            default:
                return issue.message;
        }
    }
}
