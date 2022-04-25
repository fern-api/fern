import { generateClientFiles } from "@fern-api/typescript-client";
import { Command } from "../Command";

export const clientCommand: Command = {
    run: ({ project, intermediateRepresentation }) => {
        generateClientFiles({
            directory: project.createDirectory("src"),
            intermediateRepresentation,
        });
    },
};
