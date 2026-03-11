import { constructCasingsGenerator } from "@fern-api/casings-generator";
import type { FernIr } from "@fern-fern/ir-sdk";

/**
 * Pre-configured CasingsGenerator instance for use in tests.
 * Uses no language-specific keywords and no smart casing.
 */
export const casingsGenerator = constructCasingsGenerator({
    generationLanguage: undefined,
    keywords: undefined,
    smartCasing: false
});

/**
 * Creates a NameAndWireValue using the real casings generator.
 * If wireValue is not provided, it defaults to the name.
 */
export function createNameAndWireValue(name: string, wireValue?: string): FernIr.NameAndWireValue {
    return {
        wireValue: wireValue ?? name,
        name: casingsGenerator.generateName(name)
    };
}
