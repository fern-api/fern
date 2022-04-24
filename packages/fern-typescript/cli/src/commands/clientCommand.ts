import { generateClientFiles } from "@fern-api/typescript-client";
import { generateErrorFiles, generateModelFiles } from "@fern-api/typescript-model";
import { Command } from "./Command";

export const clientCommand: Command = {
    run: ({ project, intermediateRepresentation }) => {
        const src = project.createDirectory("src");
        const modelDirectory = generateModelFiles({
            directory: src,
            intermediateRepresentation,
        });
        const errorsDirectory = generateErrorFiles({
            directory: src,
            intermediateRepresentation,
            modelDirectory,
        });
        generateClientFiles({
            directory: src,
            intermediateRepresentation,
            modelDirectory,
            errorsDirectory,
        });
    },
};
