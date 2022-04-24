import { writeFiles } from "@fern-api/typescript-commons";
import { mkdir, rm } from "fs/promises";
import { Project } from "ts-morph";
import { Command } from "./Command";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";

export async function runCommand({
    command,
    pathToIr,
    outputDir,
}: {
    command: Command;
    pathToIr: string;
    outputDir: string;
}): Promise<void> {
    const intermediateRepresentation = await loadIntermediateRepresentation(pathToIr);

    const project = new Project({
        useInMemoryFileSystem: true,
    });

    command.run({
        project,
        intermediateRepresentation,
    });

    try {
        await rm(outputDir, { recursive: true, force: true });
        await mkdir(outputDir, { recursive: true });
        await writeFiles(outputDir, project);
    } catch (e) {
        console.error("Failed to run command", e);
        await rm(outputDir, { recursive: true, force: true });
    }
}
