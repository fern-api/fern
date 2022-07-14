import { generateServerProject } from "@fern-typescript/server";
import { Command } from "../Command";

export const serverCommand: Command<"server"> = {
    key: "server",
    generate: async ({ intermediateRepresentation, helperManager, volume, fullPackageName, packageVersion }) => {
        await generateServerProject({
            intermediateRepresentation,
            helperManager,
            packageName: fullPackageName,
            packageVersion,
            volume,
        });
    },
};
