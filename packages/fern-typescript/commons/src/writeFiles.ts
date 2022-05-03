import fs, { access } from "fs/promises";
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
            plugins: [await getPathToOrganizeImportsPlugin()],
            tabWidth: 4,
        });

        await fileSystem.writeFile(filepath, formatted);
    }
}

const ORGANIZE_IMPORTS_PLUGIN_NAME = "prettier-plugin-organize-imports";
const NPX_NPM_MODULES_REGEX = new RegExp(".*/\\.npm/_npx/.*/node_modules");
async function getPathToOrganizeImportsPlugin(): Promise<string> {
    if (process.env.PATH != null) {
        for (const pathItem of process.env.PATH.split(":")) {
            const match = pathItem.match(NPX_NPM_MODULES_REGEX);
            if (match?.[0] != null) {
                const pathToPlugin = path.join(match[0], ORGANIZE_IMPORTS_PLUGIN_NAME);
                if (await doesPathExist(pathToPlugin)) {
                    return pathToPlugin;
                }
            }
        }
    }

    // if no npx node_modules in PATH, then just use the plugin name and let
    // prettier resolve it
    return ORGANIZE_IMPORTS_PLUGIN_NAME;
}

async function doesPathExist(p: string): Promise<boolean> {
    try {
        await access(p);
        return true;
    } catch {
        return false;
    }
}
