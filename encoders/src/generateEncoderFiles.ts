import { IntermediateRepresentation } from "@fern-api/api";
import { getOrCreateDirectory, ModelContext } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Directory } from "ts-morph";

export async function generateEncoderFiles({
    encodersDirectory,
    modelContext,
    servicesDirectory,
    intermediateRepresentation,
    helperManager,
}: {
    encodersDirectory: Directory;
    modelContext: ModelContext;
    servicesDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
    helperManager: HelperManager;
}): Promise<Directory> {
    const helpers = helperManager.getHelpers();
    for (const helperReference of Object.values(helpers.encodings)) {
        const helper = await helperManager.getOrLoadHelper(helperReference);
        if (helper.encodings != null) {
            for (const [encoding, encoder] of Object.entries(helper.encodings)) {
                if (encoder._type === "fileBased") {
                    const encoderDirectory = getOrCreateDirectory(encodersDirectory, encoding);
                    encoder.writeEncoder({
                        encoderDirectory,
                        servicesDirectory,
                        modelContext,
                        intermediateRepresentation,
                    });
                }
            }
        }
    }

    return encodersDirectory;
}
