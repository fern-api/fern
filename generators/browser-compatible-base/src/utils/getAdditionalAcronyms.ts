/**
 * Reads `additionalAcronyms` off the IR's casings config.
 *
 * Generators pin a published `@fern-fern/ir-sdk`, which may predate the field even though the
 * CLI writes it: the IR is parsed with `unrecognizedObjectKeys: "passthrough"`, so the value is
 * present at runtime but absent from the generator's IR types.
 */
export function getAdditionalAcronyms(casingsConfig: unknown): string[] | undefined {
    if (typeof casingsConfig !== "object" || casingsConfig == null || !("additionalAcronyms" in casingsConfig)) {
        return undefined;
    }
    const additionalAcronyms: unknown = casingsConfig.additionalAcronyms;
    if (!Array.isArray(additionalAcronyms)) {
        return undefined;
    }
    return additionalAcronyms.filter((acronym): acronym is string => typeof acronym === "string");
}
