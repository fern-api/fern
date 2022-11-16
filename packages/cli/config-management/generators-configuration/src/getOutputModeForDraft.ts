import { assertNever } from "@fern-api/core-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { DraftGeneratorInvocationSchema } from "./schemas/DraftGeneratorInvocationSchema";

export function getOutputModeForDraft(generator: DraftGeneratorInvocationSchema): FernFiddle.remoteGen.OutputMode {
    switch (generator.mode) {
        case "download-files":
            return FernFiddle.remoteGen.OutputMode.downloadFiles();
        case "publish":
            return FernFiddle.remoteGen.OutputMode.publish({ registryOverrides: {} });
        default:
            assertNever(generator.mode);
    }
}
