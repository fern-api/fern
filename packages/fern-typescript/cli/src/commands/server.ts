import { generateModelFiles } from "@fernapi/typescript-model";
import { generateServerFiles } from "@fernapi/typescript-server";
import { Project } from "ts-morph";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";
import { writeFiles } from "./utils/writeFiles";

export async function serverCommand({ pathToIr, outputDir }: { pathToIr: string; outputDir: string }): Promise<void> {
    const intermediateRepresentation = await loadIntermediateRepresentation(pathToIr);

    const project = new Project({
        useInMemoryFileSystem: true,
    });

    const modelDirectory = project.createDirectory("model");

    generateModelFiles({
        directory: modelDirectory,
        intermediateRepresentation,
    });
    generateServerFiles({
        directory: project.createDirectory("server"),
        modelDirectory,
        intermediateRepresentation,
    });

    await writeFiles(outputDir, project);
}
