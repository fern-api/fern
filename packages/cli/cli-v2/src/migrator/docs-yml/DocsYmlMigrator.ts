import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import type { DetectResult, MigratorWarning } from "../types/index.js";

const REF_KEY = "$ref";

export declare namespace DocsYmlMigrator {
    export interface Config {
        cwd: AbsoluteFilePath;
    }

    export interface Result {
        success: boolean;
        docs?: Record<string, unknown>;
        warnings: MigratorWarning[];
        absoluteFilePath?: AbsoluteFilePath;
        /** Additional files referenced via $ref that were resolved. */
        referencedFiles: AbsoluteFilePath[];
    }
}

export class DocsYmlMigrator {
    private readonly cwd: AbsoluteFilePath;

    constructor({ cwd }: DocsYmlMigrator.Config) {
        this.cwd = cwd;
    }

    /**
     * Checks if docs.yml exists in the directory.
     */
    public async detect(): Promise<DetectResult> {
        const absoluteFilePath = this.getAbsoluteFilePath();
        const exists = await doesPathExist(absoluteFilePath, "file");
        return { found: exists, absoluteFilePath: exists ? absoluteFilePath : undefined };
    }

    /**
     * Migrates docs.yml by reading it and resolving all `$ref` references.
     */
    public async migrate(): Promise<DocsYmlMigrator.Result> {
        const warnings: MigratorWarning[] = [];
        const referencedFiles: AbsoluteFilePath[] = [];
        const absoluteFilePath = this.getAbsoluteFilePath();

        if (!(await doesPathExist(absoluteFilePath, "file"))) {
            return {
                success: true,
                warnings,
                referencedFiles
            };
        }

        try {
            const content = await readFile(absoluteFilePath, "utf-8");
            const parsed = yaml.load(content);

            if (parsed == null || typeof parsed !== "object") {
                return {
                    success: true,
                    warnings: [
                        {
                            type: "info",
                            message: "docs.yml is empty or invalid"
                        }
                    ],
                    referencedFiles
                };
            }

            const resolutionStack = new Set<string>([absoluteFilePath]);
            const resolved = await this.resolveRefs({
                value: parsed as Record<string, unknown>,
                currentFile: absoluteFilePath,
                resolutionStack,
                referencedFiles,
                warnings
            });

            return {
                success: true,
                docs: resolved as Record<string, unknown>,
                warnings,
                absoluteFilePath,
                referencedFiles
            };
        } catch (error) {
            const message = extractErrorMessage(error);
            return {
                success: false,
                warnings: [
                    {
                        type: "conflict",
                        message: `Failed to parse docs.yml: ${message}`
                    }
                ],
                referencedFiles
            };
        }
    }

    /**
     * Recursively resolves `$ref` references in the parsed YAML value.
     */
    private async resolveRefs(options: {
        value: unknown;
        currentFile: AbsoluteFilePath;
        resolutionStack: Set<string>;
        referencedFiles: AbsoluteFilePath[];
        warnings: MigratorWarning[];
    }): Promise<unknown> {
        const { value, currentFile, resolutionStack, referencedFiles, warnings } = options;

        if (value == null) {
            return value;
        }

        if (Array.isArray(value)) {
            return Promise.all(
                value.map((item) =>
                    this.resolveRefs({ value: item, currentFile, resolutionStack, referencedFiles, warnings })
                )
            );
        }

        if (typeof value === "object") {
            const obj = value as Record<string, unknown>;

            if (REF_KEY in obj) {
                const refValue = obj[REF_KEY];
                if (typeof refValue !== "string") {
                    warnings.push({
                        type: "conflict",
                        message: `$ref must be a string, got ${typeof refValue}`
                    });
                    return obj;
                }

                const siblingKeys = Object.keys(obj).filter((k) => k !== REF_KEY);
                if (siblingKeys.length > 0) {
                    warnings.push({
                        type: "conflict",
                        message: `$ref cannot have sibling keys; found ${siblingKeys.join(", ")}`
                    });
                    return obj;
                }

                const currentDir = dirname(currentFile);
                const referencedFilePath = join(currentDir, RelativeFilePath.of(refValue));

                if (resolutionStack.has(referencedFilePath)) {
                    warnings.push({
                        type: "conflict",
                        message: `Circular $ref detected: ${refValue}`
                    });
                    return obj;
                }

                if (!(await doesPathExist(referencedFilePath, "file"))) {
                    warnings.push({
                        type: "conflict",
                        message: `Referenced file does not exist: ${refValue}`
                    });
                    return obj;
                }

                try {
                    const refContent = await readFile(referencedFilePath, "utf-8");
                    const refParsed = yaml.load(refContent);

                    referencedFiles.push(referencedFilePath);

                    resolutionStack.add(referencedFilePath);
                    try {
                        return await this.resolveRefs({
                            value: refParsed,
                            currentFile: referencedFilePath,
                            resolutionStack,
                            referencedFiles,
                            warnings
                        });
                    } finally {
                        resolutionStack.delete(referencedFilePath);
                    }
                } catch (error) {
                    const message = extractErrorMessage(error);
                    warnings.push({
                        type: "conflict",
                        message: `Failed to resolve $ref '${refValue}': ${message}`
                    });
                    return obj;
                }
            }

            const resolved: Record<string, unknown> = {};
            for (const [key, val] of Object.entries(obj)) {
                resolved[key] = await this.resolveRefs({
                    value: val,
                    currentFile,
                    resolutionStack,
                    referencedFiles,
                    warnings
                });
            }
            return resolved;
        }

        return value;
    }

    private getAbsoluteFilePath(): AbsoluteFilePath {
        return join(this.cwd, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    }
}
