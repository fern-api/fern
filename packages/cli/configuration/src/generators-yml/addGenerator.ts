import { TaskContext } from "@fern-api/task-context";
import Docker from "dockerode";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    GeneratorName,
    GeneratorsConfigurationSchema,
    updateGeneratorGroup
} from ".";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";

function getGeneratorNameOrThrow(generatorName: string, context: TaskContext): GeneratorName {
    const normalizedGeneratorName = normalizeGeneratorName(generatorName);
    if (normalizedGeneratorName == null) {
        return context.failAndThrow("Unrecognized generator: " + generatorName);
    }

    return normalizedGeneratorName;
}

export async function getLatestGeneratorVersion(
    generatorName: string,
    context?: TaskContext
): Promise<string | undefined> {
    const docker = new Docker();
    let image;
    try {
        context?.logger.debug(`Determining latest version for generator ${generatorName}.`);
        const pullStream = await docker.pull(`${generatorName}`);
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(pullStream, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        image = await docker.getImage(`${generatorName}:latest`).inspect();
    } catch (e) {
        context?.logger.error(`No image found behind generator ${generatorName} at tag latest.`);
        return;
    }

    // This assumes we have a label of the form version=x.y.z
    // specifically adding a label to do this to be able to more easily get the version without regex
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const generatorVersion = image.Config.Labels?.["version"];
    if (generatorVersion == null) {
        context?.logger.error(`No version found behind generator ${generatorName} at tag latest.`);
        return;
    }
    context?.logger.debug(`Found image behind generator ${generatorName} at tag latest: ${generatorVersion}.`);
    return generatorVersion;
}

export async function upgradeGenerator({
    generatorName,
    generatorsConfiguration,
    groupName,
    context
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string;
    context: TaskContext;
}): Promise<GeneratorsConfigurationSchema> {
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);

    const conf = await updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: async (group) => {
            const latestVersion = await getLatestGeneratorVersion(normalizedGeneratorName, context);
            const genConfig = group.generators.find((generator) => generator.name === normalizedGeneratorName);
            if (genConfig == null) {
                return;
            }
            if (latestVersion != null) {
                group.generators = group.generators.filter((generator) => generator.name !== normalizedGeneratorName);
                group.generators.push({
                    ...genConfig,
                    name: normalizedGeneratorName,
                    version: latestVersion
                });
            }
        }
    });
    return conf;
}

export async function addGenerator({
    generatorName,
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
}): Promise<GeneratorsConfigurationSchema> {
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);

    const invocation = GENERATOR_INVOCATIONS[normalizedGeneratorName];

    return await updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: async (group) => {
            if (group.generators.some((generator) => generator.name === normalizedGeneratorName)) {
                context.failAndThrow(`${generatorName} is already installed in group ${groupName}.`);
            }
            group.generators.push({
                name: normalizedGeneratorName,
                ...invocation,
                // Fall back to the hardcoded version if a "latest" does not yet exist
                version: (await getLatestGeneratorVersion(normalizedGeneratorName, context)) ?? invocation.version
            });
        }
    });
}

function normalizeGeneratorName(generatorName: string): GeneratorName | undefined {
    if (!generatorName.startsWith("fernapi/")) {
        generatorName = `fernapi/${generatorName}`;
    }
    if (isGeneratorName(generatorName)) {
        return generatorName;
    }
    return undefined;
}

function isGeneratorName(generatorName: string): generatorName is GeneratorName {
    return Object.values(GeneratorName).includes(generatorName as GeneratorName);
}
