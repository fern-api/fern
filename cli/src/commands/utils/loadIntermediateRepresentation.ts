import { IntermediateRepresentation } from "@fern/ir-generation";
import { readFile } from "fs/promises";

export async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return JSON.parse((await readFile(pathToFile)).toString());
}
