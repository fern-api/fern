import { FernYml } from "@fern-api/config";
import { ValidationError } from "../errors/ValidationError";
import { FernYmlConverter } from "./FernYmlConverter";
import { FernYmlSchemaLoader } from "./FernYmlSchemaLoader";

/**
 * Loads and validates a fern.yml configuration file.
 */
export async function loadFernYml({ cwd }: { cwd?: string }): Promise<FernYml> {
    const schemaLoader = new FernYmlSchemaLoader({ cwd });
    const result = await schemaLoader.load();
    if (!result.success) {
        throw new ValidationError(result.issues);
    }
    const converter = new FernYmlConverter();
    return converter.convert(result.sourced);
}
