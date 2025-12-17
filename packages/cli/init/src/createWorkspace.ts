import {
    DEFAULT_GROUP_NAME,
    DEFINITION_DIRECTORY,
    GENERATOR_INVOCATIONS,
    GENERATORS_CONFIGURATION_FILENAME,
    GeneratorName,
    generatorsYml,
    getLatestGeneratorVersion,
    ROOT_API_FILENAME
} from "@fern-api/configuration-loader";
import { formatDefinitionFile } from "@fern-api/fern-definition-formatter";
import { RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { GeneratorSelection, SdkLanguage } from "./promptForGeneratorSelection";
import { SAMPLE_IMDB_API } from "./sampleImdbApi";

const SDK_LANGUAGE_TO_GENERATOR: Record<SdkLanguage, GeneratorName> = {
    typescript: GeneratorName.TYPESCRIPT_SDK,
    python: GeneratorName.PYTHON_SDK,
    java: GeneratorName.JAVA_SDK,
    go: GeneratorName.GO_SDK,
    csharp: GeneratorName.CSHARP_SDK,
    ruby: GeneratorName.RUBY_SDK,
    php: GeneratorName.PHP_SDK,
    swift: GeneratorName.SWIFT_SDK
};

export async function createFernWorkspace({
    directoryOfWorkspace,
    cliVersion,
    context
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
}): Promise<void> {
    if (!(await doesPathExist(directoryOfWorkspace))) {
        await mkdir(directoryOfWorkspace);
    }
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
        cliVersion,
        context
    });
    const directoryOfDefinition = join(directoryOfWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY));
    await writeSampleApiDefinition({
        directoryOfDefinition
    });
}

export async function createOpenAPIWorkspace({
    directoryOfWorkspace,
    openAPIFilePath,
    cliVersion,
    context,
    generatorSelection
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    openAPIFilePath: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    generatorSelection?: GeneratorSelection;
}): Promise<void> {
    if (!(await doesPathExist(directoryOfWorkspace))) {
        await mkdir(directoryOfWorkspace);
    }
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
        cliVersion,
        context,
        apiConfiguration: {
            specs: [{ openapi: relative(directoryOfWorkspace, openAPIFilePath) }]
        },
        generatorSelection
    });
}

async function getGeneratorInvocation({
    cliVersion,
    context,
    generatorName
}: {
    cliVersion: string;
    context: TaskContext;
    generatorName: GeneratorName;
}): Promise<generatorsYml.GeneratorInvocationSchema> {
    const fallbackInvocation = GENERATOR_INVOCATIONS[generatorName];

    let version = fallbackInvocation.version;
    const versionFromDB = await getLatestGeneratorVersion({
        cliVersion,
        generatorName,
        channel: undefined
    });

    if (versionFromDB != null) {
        version = versionFromDB;
    } else {
        context.logger.debug(
            `Failed to get latest version for ${generatorName} that is compatible with CLI ${cliVersion}, falling back to preset version ${version}`
        );
    }

    return {
        name: generatorName,
        ...fallbackInvocation,
        version
    };
}

async function getDefaultGeneratorsConfiguration({
    cliVersion,
    context,
    apiConfiguration,
    generatorSelection
}: {
    cliVersion: string;
    context: TaskContext;
    apiConfiguration?: generatorsYml.ApiConfigurationSchema;
    generatorSelection?: GeneratorSelection;
}): Promise<generatorsYml.GeneratorsConfigurationSchema> {
    const generators: generatorsYml.GeneratorInvocationSchema[] = [];

    // If no selection provided, default to TypeScript SDK (backward compatibility)
    if (generatorSelection == null) {
        const defaultGeneratorName = GeneratorName.TYPESCRIPT_SDK;
        generators.push(
            await getGeneratorInvocation({
                cliVersion,
                context,
                generatorName: defaultGeneratorName
            })
        );
    } else {
        // Add SDK generators based on selection
        if (generatorSelection.outputType === "sdks" || generatorSelection.outputType === "both") {
            for (const language of generatorSelection.sdkLanguages) {
                const generatorName = SDK_LANGUAGE_TO_GENERATOR[language];
                generators.push(
                    await getGeneratorInvocation({
                        cliVersion,
                        context,
                        generatorName
                    })
                );
            }
        }
    }

    const config: generatorsYml.GeneratorsConfigurationSchema = {
        "default-group": DEFAULT_GROUP_NAME,
        groups: {
            [DEFAULT_GROUP_NAME]: {
                generators
            }
        }
    };

    if (apiConfiguration != null) {
        config.api = apiConfiguration;
    }

    return config;
}

async function writeGeneratorsConfiguration({
    filepath,
    cliVersion,
    context,
    apiConfiguration,
    generatorSelection
}: {
    filepath: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    apiConfiguration?: generatorsYml.ApiConfigurationV2Schema;
    generatorSelection?: GeneratorSelection;
}): Promise<void> {
    await writeFile(
        filepath,
        "# yaml-language-server: $schema=https://schema.buildwithfern.dev/generators-yml.json\n" +
            yaml.dump(
                await getDefaultGeneratorsConfiguration({ cliVersion, context, apiConfiguration, generatorSelection }),
                {
                    sortKeys: (a, b) => {
                        if (a === "api") {
                            return -1;
                        }
                        if (b === "api") {
                            return 1;
                        }
                        return a.localeCompare(b);
                    }
                }
            )
    );
}

const ROOT_API: RootApiFileSchema = {
    name: "api",
    "error-discrimination": {
        strategy: "status-code"
    }
};

async function writeSampleApiDefinition({
    directoryOfDefinition
}: {
    directoryOfDefinition: AbsoluteFilePath;
}): Promise<void> {
    await mkdir(directoryOfDefinition);
    await writeFile(join(directoryOfDefinition, RelativeFilePath.of(ROOT_API_FILENAME)), yaml.dump(ROOT_API));

    const absoluteFilepathToImdbYaml = join(directoryOfDefinition, RelativeFilePath.of("imdb.yml"));
    await writeFile(
        absoluteFilepathToImdbYaml,
        await formatDefinitionFile({
            fileContents: SAMPLE_IMDB_API
        })
    );
}
