import { generateClientFiles } from "@fern-typescript/client";
import { Command } from "../Command";

export const clientCommand: Command = {
    run: ({ project, intermediateRepresentation, helperManager }) => {
        generateClientFiles({
            directory: project.createDirectory("."),
            intermediateRepresentation,
            helperManager,
        });
    },
};
