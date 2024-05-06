import { TaskContext } from "@fern-api/task-context";
import Docker from "dockerode";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    GeneratorName,
    GeneratorsConfigurationSchema,
    updateGeneratorGroup
} from ".";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";
import { upgradeGeneratorVersion } from "./upgradeGeneratorVersion";

function getOrThrowGeneratorName(generatorName: string, context: TaskContext): GeneratorName {
    const normalizedGeneratorName = normalizeGeneratorName(generatorName);
    if (normalizedGeneratorName == null) {
        return context.failAndThrow("Unrecognized generator: " + generatorName);
    }

    return normalizedGeneratorName;
}

async function getLatestGeneratorVersion(generatorName: string): Promise<string> {
    const docker = new Docker();
    const image = await docker.listImages({
        filters: JSON.stringify({
            reference: `${generatorName}:latest`
        })
    });

    if (image.length === 0) {
        throw new Error(`No image found for ${generatorName}`);
    } else if (image.length > 1) {
        throw new Error(`Multiple images found at latest tag for ${generatorName}`);
    }

    // This assumes we have a label of the form version=x.y.z
    // specifically adding a label to do this to be able to more easily get the version without regex
    const generatorVersion = image[0]?.Labels["version"];
    if (generatorVersion == null) {
        throw new Error(`No version found behind generator ${generatorName} at tag latest`);
    }

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
}) {
    const normalizedGeneratorName = getOrThrowGeneratorName(generatorName, context);
    upgradeGeneratorVersion({
        generatorsConfiguration,
        groupName,
        context,
        generatorName: normalizedGeneratorName,
        version: await getLatestGeneratorVersion(normalizedGeneratorName)
    });
}

export function addGenerator({
    generatorName,
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
}): GeneratorsConfigurationSchema {
    const normalizedGeneratorName = getOrThrowGeneratorName(generatorName, context);

    const invocation = GENERATOR_INVOCATIONS[normalizedGeneratorName];

    return updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: async (group) => {
            if (group.generators.some((generator) => generator.name === normalizedGeneratorName)) {
                context.failAndThrow(`${generatorName} is already installed in group ${groupName}.`);
            }
            group.generators.push({
                name: normalizedGeneratorName,
                version: await getLatestGeneratorVersion(normalizedGeneratorName),
                ...invocation
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
