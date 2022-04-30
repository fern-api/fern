import fs from "fs/promises";
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
            pluginSearchDirs: getPluginSearchDirs(),
            tabWidth: 4,
        });

        await fileSystem.writeFile(filepath, formatted);
    }
}

// since this plugin might be run via npx, prettier might not be able to find
// the node_modules/ folder that exists in npx's cache. npx adds
// node_modules/.bin to the PATH, so we can find it from that environment
// variable.
const NPX_NPM_MODULES_REGEX = /(.*\/.npm\/_npx\/.*\/node_modules).*/;
function getPluginSearchDirs(): string[] {
    console.log("PATH is", process.env.PATH);
    if (process.env.PATH == null) {
        return [];
    }

    return process.env.PATH.split(":").reduce<string[]>((pluginDirs, pathItem) => {
        const match = pathItem.match(NPX_NPM_MODULES_REGEX);
        console.log("Evaluating: pathItem", match);
        if (match?.[1] != null) {
            pluginDirs.push(match[1]);
        }
        return pluginDirs;
    }, []);
}
