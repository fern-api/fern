import { TaskContext } from "@fern-api/task-context";

import { GeneratorName } from "./GeneratorName.js";

export const DEFAULT_DOCKER_ORG = "fernapi";

/**
 * Adds the default Docker org prefix (fernapi/) to a generator name if no org is specified.
 * If the name already contains a "/" (meaning an org is specified), it is returned as-is.
 * This allows users to omit "fernapi/" in generators.yml while still supporting custom orgs.
 *
 * Examples:
 * - "fern-typescript-sdk" -> "fernapi/fern-typescript-sdk"
 * - "fernapi/fern-typescript-sdk" -> "fernapi/fern-typescript-sdk" (unchanged)
 * - "myorg/my-generator" -> "myorg/my-generator" (unchanged)
 */
export function addDefaultDockerOrgIfNotPresent(generatorName: string): string {
    if (generatorName.includes("/")) {
        return generatorName;
    }
    return `${DEFAULT_DOCKER_ORG}/${generatorName}`;
}

/**
 * Removes the default Docker org prefix (fernapi/) from a generator name if present.
 * If the name has a different org prefix, it is returned as-is.
 * This is used when writing generator names to generators.yml to use the shorthand format.
 *
 * Examples:
 * - "fernapi/fern-typescript-sdk" -> "fern-typescript-sdk"
 * - "fern-typescript-sdk" -> "fern-typescript-sdk" (unchanged)
 * - "myorg/my-generator" -> "myorg/my-generator" (unchanged, different org)
 */
export function removeDefaultDockerOrgIfPresent(generatorName: string): string {
    const prefix = `${DEFAULT_DOCKER_ORG}/`;
    if (generatorName.startsWith(prefix)) {
        return generatorName.slice(prefix.length);
    }
    return generatorName;
}

export function getGeneratorNameOrThrow(generatorName: string, context: TaskContext): GeneratorName {
    const normalizedGeneratorName = normalizeGeneratorName(generatorName);
    if (normalizedGeneratorName == null) {
        return context.failAndThrow("Unrecognized generator: " + generatorName);
    }

    return normalizedGeneratorName;
}

const GENERATOR_NAME_ALIASES: Record<string, string> = {
    "fernapi/java-model": GeneratorName.JAVA_MODEL,
    "fernapi/fern-typescript-node-sdk": GeneratorName.TYPESCRIPT_SDK
};

export function normalizeGeneratorName(generatorName: string): GeneratorName | undefined {
    generatorName = addDefaultDockerOrgIfNotPresent(generatorName);
    const aliased = GENERATOR_NAME_ALIASES[generatorName];
    if (aliased != null) {
        generatorName = aliased;
    }
    if (isGeneratorName(generatorName)) {
        return generatorName;
    }
    return undefined;
}

function isGeneratorName(generatorName: string): generatorName is GeneratorName {
    return Object.values(GeneratorName).includes(generatorName as GeneratorName);
}
