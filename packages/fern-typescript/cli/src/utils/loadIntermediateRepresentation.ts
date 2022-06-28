import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { readFile } from "fs/promises";

export async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return JSON.parse((await readFile(pathToFile)).toString());
}
