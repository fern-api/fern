import { generateClientProject } from "@fern-typescript/client";
import { Command } from "../Command";

export const clientCommand: Command<"client"> = {
    key: "client",
    generate: async ({ intermediateRepresentation, helperManager, volume, fullPackageName, packageVersion }) => {
        await generateClientProject({
            intermediateRepresentation,
            helperManager,
            packageName: fullPackageName,
            packageVersion,
            volume,
        });
    },
};
