import { readdir } from "fs/promises";
import path from "path";

const SKIPPED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "vendor",
    "target",
    ".venv",
    "venv",
    "__pycache__",
    ".next"
]);

export async function walkFiles(root: string, maxDepth = 6): Promise<string[]> {
    const files: string[] = [];

    async function visit(current: string, depth: number): Promise<void> {
        if (depth > maxDepth) {
            return;
        }

        let entries;
        try {
            entries = await readdir(current, { withFileTypes: true });
        } catch {
            return;
        }

        await Promise.all(
            entries.map(async (entry) => {
                if (entry.isDirectory()) {
                    if (!SKIPPED_DIRECTORIES.has(entry.name)) {
                        await visit(path.join(current, entry.name), depth + 1);
                    }
                    return;
                }
                if (entry.isFile()) {
                    files.push(path.relative(root, path.join(current, entry.name)));
                }
            })
        );
    }

    await visit(root, 0);
    return files.sort();
}
