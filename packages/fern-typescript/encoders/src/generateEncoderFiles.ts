import { IntermediateRepresentation } from "@fern-api/api";
import { getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Directory } from "ts-morph";

export async function generateEncoderFiles({
    encodersDirectory,
    modelDirectory,
    servicesDirectory,
    intermediateRepresentation,
    helperManager,
    typeResolver,
}: {
    encodersDirectory: Directory;
    modelDirectory: Directory;
    servicesDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
    helperManager: HelperManager;
    typeResolver: TypeResolver;
}): Promise<Directory> {
    const helpers = helperManager.getHelpers();
    for (const helperReference of Object.values(helpers.encodings)) {
        const helper = await helperManager.getOrLoadHelper(helperReference);
        if (helper.encodings != null) {
            for (const [encoding, encoder] of Object.entries(helper.encodings)) {
                if (encoder._type === "fileBased") {
                    const encoderDirectory = getOrCreateDirectory(encodersDirectory, encoding, {
                        // only export the encoder
                        exportOptions: { type: "namedExports", exports: [encoder.name] },
                    });
                    encoder.writeEncoder({
                        encoderDirectory,
                        modelDirectory,
                        servicesDirectory,
                        intermediateRepresentation,
                        typeResolver,
                    });
                }
            }
        }
    }

    return encodersDirectory;
}
