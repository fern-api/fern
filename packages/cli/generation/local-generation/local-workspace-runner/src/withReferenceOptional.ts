/**
 * Attaches `referenceOptional` to the serialized generator config so the generator knows that
 * README.md / reference.md failures should be tolerated. The field is not part of the published
 * generator-exec schema, so it is added after serialization; generators keep it because they parse
 * config.json with `unrecognizedObjectKeys: "passthrough"`.
 */
export function withReferenceOptional(serializedConfig: unknown, referenceOptional: boolean | undefined): unknown {
    if (referenceOptional !== true || typeof serializedConfig !== "object" || serializedConfig == null) {
        return serializedConfig;
    }
    return { ...serializedConfig, referenceOptional: true };
}
