import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { readFile } from "fs/promises";

export async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    const irString = (await readFile(pathToFile)).toString();
    const irJson = JSON.parse(irString);
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson);
}
