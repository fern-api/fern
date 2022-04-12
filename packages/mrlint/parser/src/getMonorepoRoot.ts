import { MonorepoRoot } from "@mrlint/commons";
import { readdir } from "fs/promises";
import path from "path";
import { parse } from "path/posix";
import { z } from "zod";
import { readConfig } from "./readConfig";

const MONOREPO_ROOT_FILES = new Set([".mrlint.root.json", ".mrlint.root.yml"]);

const RootConfigSchema = z.strictObject({
    packages: z.string(),
    sharedConfigs: z.string(),
});

export declare namespace getMonorepoRoot {
    export interface Args {
        cwd?: string;
    }
}

export async function getMonorepoRoot({ cwd = process.cwd() }: getMonorepoRoot.Args = {}): Promise<MonorepoRoot> {
    const configPath = await closest({
        currentDirectory: cwd,
        predicate: (filepath) => MONOREPO_ROOT_FILES.has(path.basename(filepath)),
    });

    return {
        fullPath: path.dirname(configPath),
        config: await readConfig(configPath, (contents) => RootConfigSchema.parse(contents)),
    };
}

async function closest({
    currentDirectory,
    predicate,
}: {
    currentDirectory: string;
    predicate: (filepath: string) => boolean;
}): Promise<string> {
    const contents = await readdir(currentDirectory);
    for (const filename of contents) {
        const filepath = path.join(currentDirectory, filename);
        if (predicate(filepath)) {
            return filepath;
        }
    }

    if (currentDirectory === parse(currentDirectory).root) {
        throw new Error("Failed to find file");
    }

    return closest({
        currentDirectory: path.dirname(currentDirectory),
        predicate,
    });
}
