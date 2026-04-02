import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir, readFile, writeFile } from "fs/promises";
import type { MigratorWarning } from "../types/index.js";

const GITHUB_WORKFLOWS_DIR = ".github/workflows";

export declare namespace GithubWorkflowMigrator {
    export interface Config {
        /** Project root directory (where .github/ lives). */
        cwd: AbsoluteFilePath;
    }

    export interface Result {
        success: boolean;
        warnings: MigratorWarning[];
        /** Number of workflow files that were updated. */
        updatedFiles: number;
    }
}

/**
 * Migrates GitHub Actions workflow files to use the latest Fern CLI v2 syntax.
 *
 * Transformations applied:
 *   - `fern generate …`  →  `fern sdk generate …`
 *   - `--group <name>`   →  `--target <name>`
 */
export class GithubWorkflowMigrator {
    private readonly cwd: AbsoluteFilePath;

    constructor({ cwd }: GithubWorkflowMigrator.Config) {
        this.cwd = cwd;
    }

    public async migrate(): Promise<GithubWorkflowMigrator.Result> {
        const warnings: MigratorWarning[] = [];

        const workflowsDir = join(this.cwd, RelativeFilePath.of(GITHUB_WORKFLOWS_DIR));
        if (!(await doesPathExist(workflowsDir, "directory"))) {
            return { success: true, warnings, updatedFiles: 0 };
        }

        const entries = await readdir(workflowsDir, { withFileTypes: true });
        const workflowFiles = entries
            .filter((e) => e.isFile() && (e.name.endsWith(".yml") || e.name.endsWith(".yaml")))
            .map((e) => e.name);

        if (workflowFiles.length === 0) {
            return { success: true, warnings, updatedFiles: 0 };
        }

        let updatedFiles = 0;

        for (const fileName of workflowFiles) {
            const filePath = join(workflowsDir, RelativeFilePath.of(fileName));
            const original = await readFile(filePath, "utf-8");
            const migrated = this.migrateContent(original);

            if (migrated !== original) {
                await writeFile(filePath, migrated, "utf-8");
                updatedFiles++;
                warnings.push({
                    type: "info",
                    message: `Updated workflow file: ${GITHUB_WORKFLOWS_DIR}/${fileName}`
                });
            }
        }

        return { success: true, warnings, updatedFiles };
    }

    /**
     * Applies all fern CLI command migrations to the given file content.
     */
    private migrateContent(content: string): string {
        return content
            .split("\n")
            .map((line) => this.migrateLine(line))
            .join("\n");
    }

    /**
     * Migrates a single line.
     *
     * Pattern: any invocation of `fern generate` becomes `fern sdk generate`,
     * and `--group <value>` becomes `--target <value>`.
     */
    private migrateLine(line: string): string {
        // Match lines containing `fern generate` (possibly prefixed by npx, node, etc.)
        // We use a regex that captures the fern command invocation.
        if (!this.containsFernGenerate(line)) {
            return line;
        }

        let result = line;

        // Replace `fern generate` with `fern sdk generate`
        // Handles: `fern generate`, `npx fern generate`, `fern-api generate`, etc.
        result = result.replace(/(\bfern(?:-api)?\s+)generate\b/g, "$1sdk generate");

        // Replace `--group <value>` with `--target <value>`
        result = result.replace(/--group\b/g, "--target");

        return result;
    }

    private containsFernGenerate(line: string): boolean {
        return /\bfern(?:-api)?\s+generate\b/.test(line);
    }
}
