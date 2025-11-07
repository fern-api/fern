import { AbsoluteFilePath } from "@fern-api/fs-utils";
import * as diff from "diff";
import { readFile } from "fs/promises";
import { glob } from "glob";
import * as minimatch from "minimatch";
import * as path from "path";
import { Normalizer } from "./Normalizer";
import { ComparisonRules, Difference } from "./types";

export class FileComparator {
    private normalizer: Normalizer;
    private ignorePatterns: string[];

    constructor(rules: ComparisonRules) {
        this.normalizer = new Normalizer([...Normalizer.getDefaultRules(), ...(rules.normalize ?? [])]);
        this.ignorePatterns = rules.ignore ?? [];
    }

    public async compareDirectories(remoteDir: AbsoluteFilePath, localDir: AbsoluteFilePath): Promise<Difference[]> {
        const differences: Difference[] = [];

        const remoteFiles = await this.listFiles(remoteDir);
        const localFiles = await this.listFiles(localDir);

        const onlyInRemote = remoteFiles.filter((f) => !localFiles.includes(f));
        const onlyInLocal = localFiles.filter((f) => !remoteFiles.includes(f));
        const inBoth = remoteFiles.filter((f) => localFiles.includes(f));

        if (onlyInRemote.length > 0) {
            differences.push({
                type: "missing-in-local",
                files: onlyInRemote
            });
        }

        if (onlyInLocal.length > 0) {
            differences.push({
                type: "missing-in-remote",
                files: onlyInLocal
            });
        }

        for (const file of inBoth) {
            if (this.shouldIgnore(file)) {
                continue;
            }

            const remoteFilePath = path.join(remoteDir, file);
            const localFilePath = path.join(localDir, file);

            const remoteContent = await readFile(remoteFilePath, "utf-8");
            const localContent = await readFile(localFilePath, "utf-8");

            const normalizedRemote = this.normalizer.normalize(remoteContent);
            const normalizedLocal = this.normalizer.normalize(localContent);

            if (normalizedRemote !== normalizedLocal) {
                const fileDiff = this.generateDiff(normalizedRemote, normalizedLocal, file);
                differences.push({
                    type: "content-mismatch",
                    file,
                    diff: fileDiff
                });
            }
        }

        return differences;
    }

    private async listFiles(dir: AbsoluteFilePath): Promise<string[]> {
        const files = await glob("**/*", {
            cwd: dir,
            nodir: true,
            dot: true,
            ignore: [
                ".git/**",
                "node_modules/**",
                "__pycache__/**",
                "*.pyc",
                ".DS_Store",
                "*.class",
                "target/**",
                "build/**",
                "dist/**"
            ]
        });
        return files;
    }

    private shouldIgnore(file: string): boolean {
        for (const pattern of this.ignorePatterns) {
            if (minimatch(file, pattern)) {
                return true;
            }
        }
        return false;
    }

    private generateDiff(remote: string, local: string, filename: string): string {
        const patches = diff.createPatch(filename, remote, local, "remote", "local");
        return patches;
    }
}
