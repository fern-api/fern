import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir, readFile, writeFile } from "fs/promises";
import type { MigratorWarning } from "../types/index.js";

const WORKFLOWS_DIR = ".github/workflows";

/**
 * Scans `.github/workflows/` and rewrites fern CLI commands to v2 syntax:
 *   `fern generate` → `fern sdk generate`, `--group` → `--target`.
 */
export async function migrateGithubWorkflows(cwd: AbsoluteFilePath): Promise<MigratorWarning[]> {
    const warnings: MigratorWarning[] = [];
    const workflowsDir = join(cwd, RelativeFilePath.of(WORKFLOWS_DIR));
    if (!(await doesPathExist(workflowsDir, "directory"))) {
        return warnings;
    }

    const entries = await readdir(workflowsDir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && (e.name.endsWith(".yml") || e.name.endsWith(".yaml")));

    for (const entry of files) {
        const filePath = join(workflowsDir, RelativeFilePath.of(entry.name));
        const original = await readFile(filePath, "utf-8");
        const migrated = migrateFernCommands(original);
        if (migrated !== original) {
            await writeFile(filePath, migrated, "utf-8");
            warnings.push({ type: "info", message: `Updated workflow file: ${WORKFLOWS_DIR}/${entry.name}` });
        }
    }

    return warnings;
}

/** Rewrites `fern generate` → `fern sdk generate` and `--group` → `--target` on matching lines. */
function migrateFernCommands(content: string): string {
    return content
        .split("\n")
        .map((line) => {
            if (!/\bfern(?:-api)?\s+generate\b/.test(line)) {
                return line;
            }
            return line.replace(/(\bfern(?:-api)?\s+)generate\b/g, "$1sdk generate").replace(/--group\b/g, "--target");
        })
        .join("\n");
}
