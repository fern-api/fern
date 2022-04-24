import { generateModelFiles } from "@fern-api/typescript-model";
import { generateServerFiles } from "@fern-api/typescript-server";
import { Command } from "./Command";

export const serverCommand: Command = {
    run: ({ project, intermediateRepresentation }) => {
        const src = project.createDirectory("src");
        const modelDirectory = generateModelFiles({
            directory: src,
            intermediateRepresentation,
        });
        generateServerFiles({
            project,
            modelDirectory,
            intermediateRepresentation,
        });
    },
};
