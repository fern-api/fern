import { TaskContext } from "@fern-api/task-context";

import { GeneratorName } from "./GeneratorName";

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

export function getGeneratorNameOrThrow(generatorName: string, context: TaskContext): GeneratorName {
    const normalizedGeneratorName = normalizeGeneratorName(generatorName);
    if (normalizedGeneratorName == null) {
        return context.failAndThrow("Unrecognized generator: " + generatorName);
    }

    return normalizedGeneratorName;
}

export function normalizeGeneratorName(generatorName: string): GeneratorName | undefined {
    generatorName = addDefaultDockerOrgIfNotPresent(generatorName);
    if (isGeneratorName(generatorName)) {
        return generatorName;
    }
    return undefined;
}

function isGeneratorName(generatorName: string): generatorName is GeneratorName {
    return Object.values(GeneratorName).includes(generatorName as GeneratorName);
}
