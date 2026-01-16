import { AbsoluteFilePath, RelativeFilePath, relative } from "@fern-api/fs-utils";
import type { Sourced } from "@fern-api/source";
import { z } from "zod";
import { ValidationIssue } from "./ValidationIssue";
import type { YamlDocument } from "./YamlDocument";
import { YamlParser } from "./YamlParser";
import { YamlSourceResolver } from "./YamlSourceResolver";

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

    constructor({ cwd }: { cwd: AbsoluteFilePath }) {
        this.parser = new YamlParser();
        this.cwd = cwd;
    }

    /**
     * Loads and validates a YAML configuration file with source location tracking.
     *
     * @param absoluteFilePath - The absolute path to the YAML file.
     * @param schema - The zod schema to validate against.
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
        schema
    }: {
        absoluteFilePath: AbsoluteFilePath;
        schema: S;
    }): Promise<YamlConfigLoader.Result<z.infer<S>>> {
        const document = await this.parseDocument(absoluteFilePath);

        const parseResult = schema.safeParse(document.toJS());
        if (!parseResult.success) {
            const issues = parseResult.error.issues.map((issue) => {
                // Zod paths are PropertyKey[] but YAML paths are string | number
                const yamlPath = issue.path.filter((p): p is string | number => typeof p !== "symbol");
                return new ValidationIssue({
                    yamlPath,
                    message: this.formatZodIssue(issue),
                    location: document.getSourceLocation(yamlPath)
                });
            });

            return {
                success: false,
                issues
            };
        }

        const resolver = new YamlSourceResolver(document);
        return {
            success: true,
            data: parseResult.data,
            sourced: resolver.toSourced(parseResult.data),
            absoluteFilePath,
            relativeFilePath: RelativeFilePath.of(relative(this.cwd, absoluteFilePath))
        };
    }

    private async parseDocument(absoluteFilePath: AbsoluteFilePath): Promise<YamlDocument> {
        try {
            return await this.parser.parseDocument({ absoluteFilePath, cwd: this.cwd });
        } catch (err) {
            throw new Error(
                `Failed to parse YAML file ${absoluteFilePath}: ${err instanceof Error ? err.message : String(err)}`
            );
        }
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
                // For union errors, collect unique expected types from nested errors
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
