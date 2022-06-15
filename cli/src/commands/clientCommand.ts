import { generateClientProject } from "@fern-typescript/client";
import { Command } from "../Command";

export const clientCommand: Command = {
    run: async ({ intermediateRepresentation, helperManager, volume, packageName, packageVersion }) => {
        await generateClientProject({
            intermediateRepresentation,
            helperManager,
            packageName,
            packageVersion,
            volume,
        });
    },
};
