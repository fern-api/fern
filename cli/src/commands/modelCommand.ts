import { generateErrorFiles, generateModelFiles } from "@fern-api/typescript-model";
import { Command } from "./Command";

export const modelCommand: Command = {
    run: ({ project, intermediateRepresentation }) => {
        const src = project.createDirectory("src");
        const modelDirectory = generateModelFiles({
            directory: src,
            intermediateRepresentation,
        });
        generateErrorFiles({
            directory: src,
            intermediateRepresentation,
            modelDirectory,
        });
    },
};
