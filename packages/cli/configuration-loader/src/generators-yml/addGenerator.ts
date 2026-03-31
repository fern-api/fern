import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY, generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import semver from "semver";

import { GENERATOR_INVOCATIONS } from "./generatorInvocations.js";
import {
    addDefaultDockerOrgIfNotPresent,
    getGeneratorNameOrThrow,
    removeDefaultDockerOrgIfPresent
} from "./getGeneratorName.js";
import { getLatestGeneratorVersion } from "./getGeneratorVersions.js";
import { updateGeneratorGroup } from "./updateGeneratorGroup.js";

export async function addGenerator({
    generatorName,
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context,
    cliVersion
}: {
    generatorName: string;
    generatorsConfiguration: generatorsYml.GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
    cliVersion: string;
}): Promise<generatorsYml.GeneratorsConfigurationSchema> {
    // Normalize the generator name for lookups (adds fernapi/ if not present)
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);
    // Use shorthand name (without fernapi/) for writing to config
    const shorthandGeneratorName = removeDefaultDockerOrgIfPresent(normalizedGeneratorName);

    const invocation = GENERATOR_INVOCATIONS[normalizedGeneratorName];

    return await updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: async (group) => {
            // Check for duplicates using normalized name (handles both shorthand and full names in existing config)
            if (
                group.generators.some(
                    (generator) => addDefaultDockerOrgIfNotPresent(generator.name) === normalizedGeneratorName
                )
            ) {
                context.failAndThrow(`${generatorName} is already installed in group ${groupName}.`);
            }
            const latestVersion = await getLatestGeneratorVersion({
                cliVersion,
                generatorName: normalizedGeneratorName,
                context,
                channel: undefined
            });

            // Use the latest version from FDR if it's newer than the hardcoded fallback,
            // otherwise use the hardcoded version. This ensures we never add a generator
            // version that's older than what the current CLI is known to support (e.g.
            // when the dev CLI version 0.0.0 causes FDR to return an outdated version).
            const version =
                latestVersion != null && semver.valid(latestVersion) && semver.gt(latestVersion, invocation.version)
                    ? latestVersion
                    : invocation.version;

            group.generators.push({
                name: shorthandGeneratorName,
                ...invocation,
                version
            });
        }
    });
}
