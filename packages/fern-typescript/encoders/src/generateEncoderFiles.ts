import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { HelperManager } from "@fern-typescript/helper-manager";
import { ModelContext } from "@fern-typescript/model-context";
import { Directory } from "ts-morph";

export async function generateEncoderFiles({
    helperManager,
}: {
    modelContext: ModelContext;
    servicesDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
    helperManager: HelperManager;
}): Promise<void> {
    const helpers = helperManager.getHelpers();
    for (const helperReference of Object.values(helpers.encodings)) {
        const helper = await helperManager.getOrLoadHelper(helperReference);
        if (helper.encodings != null) {
            for (const [, encoder] of Object.entries(helper.encodings)) {
                if (encoder._type === "fileBased") {
                    throw new Error("File-based encoders are not supported.");
                }
            }
        }
    }
}
