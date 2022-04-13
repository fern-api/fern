import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { Project } from "ts-morph";

export async function writeFiles(baseDir: string, project: Project): Promise<void> {
    try {
        for (const file of project.getSourceFiles()) {
            file.formatText();
            file.organizeImports();
            const filepath = path.join(baseDir, file.getFilePath());
            await mkdir(path.dirname(filepath), { recursive: true });
            await writeFile(filepath, file.getFullText());
        }
    } catch (e) {
        console.error("Failed to generate files", e);
        rm(baseDir, { recursive: true });
    }
}
