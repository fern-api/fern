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

function getGeneratorNameOrThrow(generatorName: string, context: TaskContext): GeneratorName {
    const normalizedGeneratorName = normalizeGeneratorName(generatorName);
    if (normalizedGeneratorName == null) {
        return context.failAndThrow("Unrecognized generator: " + generatorName);
    }

    return normalizedGeneratorName;
}

async function getLatestGeneratorVersion(generatorName: string): Promise<string | undefined> {
    const docker = new Docker();
    console.log("Testing docker connection...");
    let image;
    try {
        image = await docker.getImage(`${generatorName}`).inspect();
    } catch (e) {
        try {
            image = await docker.getImage(`${generatorName}:latest`).inspect();
        } catch {
            console.error(`No image found behind generator ${generatorName} at tag latest`);
            return;
        }
    }

    // This assumes we have a label of the form version=x.y.z
    // specifically adding a label to do this to be able to more easily get the version without regex
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const generatorVersion = image.Config.Labels?.["version"];
    if (generatorVersion == null) {
        console.error(`No version found behind generator ${generatorName} at tag latest: ${JSON.stringify(image)}`);
        return;
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
}): Promise<GeneratorsConfigurationSchema> {
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);
    return upgradeGeneratorVersion({
        generatorsConfiguration,
        groupName,
        context,
        generatorName: normalizedGeneratorName,
        version: await getLatestGeneratorVersion(normalizedGeneratorName)
    });
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
                version: (await getLatestGeneratorVersion(normalizedGeneratorName)) ?? invocation.version
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
