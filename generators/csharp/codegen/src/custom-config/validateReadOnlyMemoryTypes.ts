import { VALID_READ_ONLY_MEMORY_TYPES } from "../ast";
import { BaseCsharpCustomConfigSchema } from "./BaseCsharpCustomConfigSchema";

export function validateReadOnlyMemoryTypes(customConfig: BaseCsharpCustomConfigSchema): void {
    const readOnlyMemoryTypes = customConfig["read-only-memory-types"];
    if (readOnlyMemoryTypes != null) {
        for (const type of readOnlyMemoryTypes) {
            if (!VALID_READ_ONLY_MEMORY_TYPES.has(type)) {
                throw new Error(
                    `Type "${type}" is not a valid 'read-only-memory-types' custom config option; expected one of ${JSON.stringify(
                        VALID_READ_ONLY_MEMORY_TYPES
                    )}.`
                );
            }
        }
    }
}
