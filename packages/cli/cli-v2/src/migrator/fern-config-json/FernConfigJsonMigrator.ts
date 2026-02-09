import { PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import type { DetectResult, MigratorWarning } from "../types/index.js";

export declare namespace FernConfigJsonMigrator {
    export interface Config {
        cwd: AbsoluteFilePath;
    }

    export interface Result {
        success: boolean;
        org?: string;
        cliVersion?: string;
        warnings: MigratorWarning[];
        absoluteFilePath?: AbsoluteFilePath;
    }
}

export class FernConfigJsonMigrator {
    private readonly cwd: AbsoluteFilePath;

    constructor({ cwd }: { cwd: AbsoluteFilePath }) {
        this.cwd = cwd;
    }

    /**
     * Checks if fern.config.json exists in the fern directory.
     */
    public async detect(): Promise<DetectResult> {
        const absoluteFilePath = this.getAbsoluteFilePath();
        const exists = await doesPathExist(absoluteFilePath, "file");
        return { found: exists, absoluteFilePath: exists ? absoluteFilePath : undefined };
    }

    /**
     * Migrates fern.config.json to the new fern.yml format.
     * Extracts org and cli.version fields.
     */
    public async migrate(): Promise<FernConfigJsonMigrator.Result> {
        const warnings: MigratorWarning[] = [];
        const absoluteFilePath = this.getAbsoluteFilePath();

        if (!(await doesPathExist(absoluteFilePath, "file"))) {
            return {
                success: false,
                warnings: [
                    {
                        type: "info",
                        message: `${PROJECT_CONFIG_FILENAME} not found`
                    }
                ]
            };
        }

        try {
            const content = await readFile(absoluteFilePath, "utf-8");
            const config = JSON.parse(content) as Record<string, unknown>;

            const org = typeof config.organization === "string" ? config.organization : undefined;
            const cliVersion = typeof config.version === "string" ? config.version : undefined;

            if (org == null) {
                warnings.push({
                    type: "conflict",
                    message: `Missing 'organization' field in ${PROJECT_CONFIG_FILENAME}`,
                    suggestion: "Add an 'org' field to your fern.yml manually"
                });
            }

            return {
                success: true,
                org,
                cliVersion,
                warnings,
                absoluteFilePath
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                warnings: [
                    {
                        type: "conflict",
                        message: `Failed to parse ${PROJECT_CONFIG_FILENAME}: ${message}`
                    }
                ]
            };
        }
    }

    private getAbsoluteFilePath(): AbsoluteFilePath {
        return join(this.cwd, RelativeFilePath.of(PROJECT_CONFIG_FILENAME));
    }
}
