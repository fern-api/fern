import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernYmlSchemaLoader } from "./FernYmlSchemaLoader.js";

/**
 * Loads and validates a fern.yml configuration file.
 *
 * Returns the sourced schema directly, preserving source locations for
 * error reporting. Domain-specific converters (e.g., SDKConfigConverter)
 * handle conversion to their respective config types.
 *
 * @throws SourcedValidationError if the configuration is invalid.
 * @throws Error if fern.yml is not found.
 */
export async function loadFernYml({ cwd }: { cwd?: AbsoluteFilePath }): Promise<FernYmlSchemaLoader.Success> {
    const schemaLoader = new FernYmlSchemaLoader({ cwd });
    return await schemaLoader.loadOrThrow();
}
