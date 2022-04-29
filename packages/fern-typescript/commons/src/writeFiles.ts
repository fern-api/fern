import fs, { lstat } from "fs/promises";
import { IPromisesAPI } from "memfs/lib/promises";
import path from "path";
import { format } from "prettier";
import { Project } from "ts-morph";

export async function writeFiles(
    baseDir: string,
    project: Project,
    fileSystem: typeof fs | IPromisesAPI = fs
): Promise<void> {
    for (const file of project.getSourceFiles()) {
        const filepath = path.join(baseDir, file.getFilePath());
        await fileSystem.mkdir(path.dirname(filepath), { recursive: true });

        const formatted = format(file.getFullText(), {
            parser: "typescript",
            plugins: ["prettier-plugin-organize-imports"],
            pluginSearchDirs: await getPluginSearchDirs(),
            tabWidth: 4,
        });

        await fileSystem.writeFile(filepath, formatted);
    }
}

// since this plugin might be run via npx, prettier might not be able to find
// the node_modules/ folder that exists in npx's cache. Per
// https://docs.npmjs.com/cli/v7/commands/npx, the node_modules is added to the
// PATH, so we can find it from that environment variable.
async function getPluginSearchDirs(): Promise<string[]> {
    if (process.env.PATH == null) {
        return [];
    }

    const dirs: string[] = [];

    await Promise.all(
        process.env.PATH.split(":").map(async (pathItem) => {
            if (await doesDirectoryExist(pathItem)) {
                dirs.push(pathItem);
            }
        })
    );

    return dirs;
}

async function doesDirectoryExist(pathToDir: string): Promise<boolean> {
    try {
        const stats = await lstat(pathToDir);
        return stats.isDirectory();
    } catch (e) {
        return false;
    }
}
