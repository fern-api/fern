import type { GeneratorInvocationSchema } from "./schemas/index.js";

/**
 * True when a generators.yml invocation publishes to Maven (`output.location: maven`, with or without a `github`
 * block) without a `signature` and without a `url`. Both shapes fall back to the default Central Portal staging URL
 * (see `getMavenRegistryUrl` in convertGeneratorsConfiguration). Maven Central only releases signed artifacts, so an
 * upload like this is staged but never reaches Central.
 */
export function isUnsignedMavenPublishingWithoutUrl(generator: GeneratorInvocationSchema): boolean {
    const output = generator.output;
    return output?.location === "maven" && output.signature == null && output.url == null;
}

/**
 * Warning for a Maven publish target with no `signature` and no `url`. Shared by the generators.yml validator,
 * `fern generate`, and the fern.yml SDK checker so all three report the same guidance.
 */
export function getUnsignedMavenPublishingWithoutUrlMessage(generatorName: string): string {
    return (
        `Maven output for ${generatorName} has no \`signature\` and no \`url\`. Maven Central requires signed ` +
        "artifacts, so this publish will be uploaded to the Central Portal staging service but never released. " +
        "Add `signature` to publish to Maven Central, or set `url` to publish to another registry."
    );
}
