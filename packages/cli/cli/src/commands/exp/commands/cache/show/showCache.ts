import { stat as fsStat, readdir } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { CliContext } from "../../../../../cli-context/CliContext";
import { EXP_GENERATORS_CACHE_DIR } from "../../../config";

export async function showCache({ cliContext }: { cliContext: CliContext }) {
    const cacheExists = await fsStat(EXP_GENERATORS_CACHE_DIR)
        .then((stats) => stats.isDirectory())
        .catch(() => false);

    if (!cacheExists) {
        cliContext.logger.info("Generator cache is empty.");
        return;
    }

    const entries = await readdir(EXP_GENERATORS_CACHE_DIR, { withFileTypes: true });
    let totalSize = 0;
    const lines: string[] = [];

    for (const langDir of entries.filter((e) => e.isDirectory())) {
        const langPath = resolvePath(EXP_GENERATORS_CACHE_DIR, langDir.name);
        const versions = await readdir(langPath, { withFileTypes: true });

        for (const versionDir of versions.filter((e) => e.isDirectory())) {
            const versionPath = resolvePath(langPath, versionDir.name);
            const size = await getDirectorySize(versionPath);
            totalSize += size;
            lines.push(`- ${langDir.name}@${versionDir.name}: ${formatBytes(size)} (${versionPath})`);
        }
    }

    if (lines.length === 0) {
        cliContext.logger.info("Generator cache is empty.");
        return;
    }

    cliContext.logger.info("Generator cache contents:");
    for (const line of lines) {
        cliContext.logger.info(line);
    }
    cliContext.logger.info(`Total cache size: ${formatBytes(totalSize)}`);
}

async function getDirectorySize(dirPath: string): Promise<number> {
    const entries = await readdir(dirPath, { withFileTypes: true });
    let total = 0;

    for (const entry of entries) {
        const fullPath = resolvePath(dirPath, entry.name);
        if (entry.isDirectory()) {
            total += await getDirectorySize(fullPath);
        } else if (entry.isFile()) {
            const stats = await fsStat(fullPath);
            total += stats.size;
        }
    }

    return total;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) {
        return "0 B";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(1)} ${units[i]}`;
}
