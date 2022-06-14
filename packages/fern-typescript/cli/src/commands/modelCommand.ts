import { generateModelProject } from "@fern-typescript/model";
import { Command } from "../Command";

export const modelCommand: Command = {
    run: async ({ volume, intermediateRepresentation, packageName, packageVersion }) => {
        await generateModelProject({
            packageName,
            packageVersion,
            volume,
            intermediateRepresentation,
        });
    },
};
