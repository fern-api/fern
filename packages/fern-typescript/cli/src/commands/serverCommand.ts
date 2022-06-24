import { generateServerProject } from "@fern-typescript/server";
import { Command } from "../Command";

export const serverCommand: Command = {
    run: async ({ intermediateRepresentation, helperManager, volume, packageName, packageVersion }) => {
        await generateServerProject({
            intermediateRepresentation,
            helperManager,
            packageName,
            packageVersion,
            volume,
        });
    },
};
