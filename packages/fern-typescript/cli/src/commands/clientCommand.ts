import { generateClientFiles } from "@fern-typescript/client";
import { Command } from "../Command";

export const clientCommand: Command = {
    run: async ({ project, intermediateRepresentation, helperManager }) => {
        await generateClientFiles({
            directory: project.createDirectory("."),
            intermediateRepresentation,
            helperManager,
        });
    },
};
