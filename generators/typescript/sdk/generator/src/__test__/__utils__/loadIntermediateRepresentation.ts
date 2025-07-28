import { readFile } from "fs/promises";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk";
import { serialization as IrSerialization } from "@fern-fern/ir-sdk";

export async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    const irString = (await readFile(pathToFile)).toString();
    const irJson = JSON.parse(irString);
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson, {
        unrecognizedObjectKeys: "passthrough"
    });
}
