import type { FernYmlSchema } from "@fern-api/config";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { YamlConfigLoader } from "@fern-api/yaml-loader";
import { ValidationError } from "../../errors/ValidationError";
import { FernYmlSchemaLoader } from "./FernYmlSchemaLoader";

/**
 * Loads and validates a fern.yml configuration file.
 *
 * Returns the sourced schema directly, preserving source locations for
 * error reporting. Domain-specific converters (e.g., SDKConfigConverter)
 * handle conversion to their respective config types.
 *
 * @throws ValidationError if the configuration is invalid.
 * @throws Error if fern.yml is not found.
 */
export async function loadFernYml({
    cwd
}: {
    cwd?: AbsoluteFilePath;
}): Promise<YamlConfigLoader.Success<FernYmlSchema>> {
    const schemaLoader = new FernYmlSchemaLoader({ cwd });
    const result = await schemaLoader.load();
    if (!result.success) {
        throw new ValidationError(result.issues);
    }
    return result;
}
