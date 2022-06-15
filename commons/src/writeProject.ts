import { Volume } from "memfs/lib/volume";
import path from "path";
import prettier from "prettier";
import organizeImportsPlugin from "prettier-plugin-organize-imports";
import { Project } from "ts-morph";

export async function writeProject(project: Project, volume: Volume): Promise<void> {
    for (const file of project.getSourceFiles()) {
        const filepath = file.getFilePath();
        await volume.promises.mkdir(path.dirname(filepath), { recursive: true });

        const formatted = prettier.format(file.getFullText(), {
            plugins: [organizeImportsPlugin],
            filepath,
        });

        await volume.promises.writeFile(filepath, formatted);
    }
}
