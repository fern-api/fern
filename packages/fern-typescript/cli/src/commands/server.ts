import { generateModelFiles } from "@fern/typescript-model";
import { generateServerFiles } from "@fern/typescript-server";
import { Project } from "ts-morph";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";
import { writeFiles } from "./utils/writeFiles";

export async function serverCommand({ pathToIr, outputDir }: { pathToIr: string; outputDir: string }): Promise<void> {
    const ir = await loadIntermediateRepresentation(pathToIr);

    const project = new Project({
        useInMemoryFileSystem: true,
    });

    generateModelFiles(project, ir);
    generateServerFiles(project, ir);

    await writeFiles(outputDir, project);
}
