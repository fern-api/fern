import { generateClientFiles } from "@fern/typescript-client";
import { generateModelFiles } from "@fern/typescript-model";
import { Project } from "ts-morph";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";
import { writeFiles } from "./utils/writeFiles";

export async function clientCommand({ pathToIr, outputDir }: { pathToIr: string; outputDir: string }): Promise<void> {
    const intermediateRepresentation = await loadIntermediateRepresentation(pathToIr);

    const project = new Project({
        useInMemoryFileSystem: true,
    });

    const modelDirectory = project.createDirectory("model");
    generateModelFiles({
        directory: modelDirectory,
        intermediateRepresentation,
    });
    generateClientFiles({
        directory: project.createDirectory("client"),
        modelDirectory,
        intermediateRepresentation,
    });

    await writeFiles(outputDir, project);
}
