import { readFile, unlink, writeFile } from "fs/promises";
import { loadTypeRegistry, saveTypeRegistry, TypeRegistryInfo } from "./canonicalization";

export interface GeneratorState {
    typeRegistry: TypeRegistryInfo;
}

export async function writeGeneratorState(pathToState: string) {
    await writeFile(
        pathToState,
        JSON.stringify({
            typeRegistry: saveTypeRegistry()
        })
    );
}

export async function loadGeneratorState(pathToState: string) {
    try {
        const data = await readFile(pathToState, "utf-8");
        const parsed = JSON.parse(data) as GeneratorState;
        loadTypeRegistry(parsed.typeRegistry);

        // remove the file, we won't need to read it again in this process.
        await unlink(pathToState);
    } catch (error) {
        // if the type registry isn't there, then we just have to rely on the IR alone.
    }
}
