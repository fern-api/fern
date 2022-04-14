import { generateModelFiles } from "@fern/typescript-model";
import { Project } from "ts-morph";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";
import { writeFiles } from "./utils/writeFiles";

export async function modelCommand({ pathToIr, outputDir }: { pathToIr: string; outputDir: string }): Promise<void> {
    const intermediateRepresentation = await loadIntermediateRepresentation(pathToIr);

    const project = new Project({
        useInMemoryFileSystem: true,
    });

    generateModelFiles({
        directory: project.createDirectory("model"),
        intermediateRepresentation,
    });

    await writeFiles(outputDir, project);
}
