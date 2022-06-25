import { generateClientProject } from "@fern-typescript/client";
import { Command } from "../Command";

export const clientCommand: Command<"client"> = {
    key: "client",
    generate: async ({ intermediateRepresentation, helperManager, volume, packageName, packageVersion }) => {
        await generateClientProject({
            intermediateRepresentation,
            helperManager,
            packageName,
            packageVersion,
            volume,
        });
    },
};
