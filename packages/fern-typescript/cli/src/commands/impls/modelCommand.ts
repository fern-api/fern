import { generateModelProject } from "@fern-typescript/model";
import { Command } from "../Command";

export const modelCommand: Command<"model"> = {
    key: "model",
    generate: async ({ volume, intermediateRepresentation, fullPackageName, packageVersion }) => {
        await generateModelProject({
            packageName: fullPackageName,
            packageVersion,
            volume,
            intermediateRepresentation,
        });
    },
};
