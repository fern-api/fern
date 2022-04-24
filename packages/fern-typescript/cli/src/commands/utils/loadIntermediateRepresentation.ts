import { IntermediateRepresentation } from "@fern-api/api";
import { readFile } from "fs/promises";

export async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return JSON.parse((await readFile(pathToFile)).toString());
}
