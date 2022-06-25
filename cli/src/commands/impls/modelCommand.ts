import { generateModelProject } from "@fern-typescript/model";
import { Command } from "../Command";

export const modelCommand: Command<"model"> = {
    key: "model",
    generate: async ({ volume, intermediateRepresentation, packageName, packageVersion }) => {
        await generateModelProject({
            packageName,
            packageVersion,
            volume,
            intermediateRepresentation,
        });
    },
};
