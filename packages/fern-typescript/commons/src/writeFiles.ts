import fs from "fs/promises";
import { IPromisesAPI } from "memfs/lib/promises";
import path from "path";
import { format } from "prettier";
import organizeImportsPlugin from "prettier-plugin-organize-imports";
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
            plugins: [organizeImportsPlugin],
            tabWidth: 4,
        });

        await fileSystem.writeFile(filepath, formatted);
    }
}
