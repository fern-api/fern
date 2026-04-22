import {
    DEFAULT_GROUP_NAME,
    DEFINITION_DIRECTORY,
    GENERATOR_INVOCATIONS,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml,
    getLatestGeneratorVersion,
    ROOT_API_FILENAME
} from "@fern-api/configuration-loader";
import { formatDefinitionFile } from "@fern-api/fern-definition-formatter";
import { RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { SAMPLE_IMDB_API } from "./sampleImdbApi.js";
import { SAMPLE_OPENAPI } from "./sampleOpenApi.js";

export async function createFernWorkspace({
    directoryOfWorkspace,
    cliVersion,
    context,
    apiName = "api"
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    apiName?: string;
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
        directoryOfDefinition,
        apiName
    });
}

export async function createOpenAPIWorkspace({
    directoryOfWorkspace,
    openAPIFilePath,
    cliVersion,
    context
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    openAPIFilePath: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
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
        }
    });
}

export async function createDefaultOpenAPIWorkspace({
    directoryOfWorkspace,
    cliVersion,
    context
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
}): Promise<void> {
    if (!(await doesPathExist(directoryOfWorkspace))) {
        await mkdir(directoryOfWorkspace, { recursive: true });
    }
    const openApiFilePath = join(directoryOfWorkspace, RelativeFilePath.of("openapi.yml"));
    await writeFile(openApiFilePath, SAMPLE_OPENAPI);
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
        cliVersion,
        context,
        apiConfiguration: {
            specs: [{ openapi: "openapi.yml" }]
        }
    });
}

async function getDefaultGeneratorsConfiguration({
    cliVersion,
    context,
    apiConfiguration
}: {
    cliVersion: string;
    context: TaskContext;
    apiConfiguration?: generatorsYml.ApiConfigurationSchema;
}): Promise<generatorsYml.GeneratorsConfigurationSchema> {
    // Use the full name for lookups, but the shorthand name for the generated config
    const defaultGeneratorFullName = "fernapi/fern-typescript-sdk";
    const defaultGeneratorShortName = "fern-typescript-sdk";
    const fallbackInvocation = GENERATOR_INVOCATIONS[defaultGeneratorFullName];

    let version = fallbackInvocation.version;
    const versionFromDB = await getLatestGeneratorVersion({
        cliVersion,
        generatorName: defaultGeneratorFullName,
        channel: undefined
    });

    if (versionFromDB != null) {
        // Version found from FDR, using it
        version = versionFromDB;
    } else {
        context.logger.debug(
            `Failed to get latest version for ${defaultGeneratorFullName} that is compatible with CLI ${cliVersion}, falling back to preset version ${version}`
        );
    }
    const config: generatorsYml.GeneratorsConfigurationSchema = {
        "default-group": DEFAULT_GROUP_NAME,
        groups: {
            [DEFAULT_GROUP_NAME]: {
                generators: [
                    {
                        name: defaultGeneratorShortName,
                        ...fallbackInvocation,
                        version
                    }
                ]
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
    apiConfiguration
}: {
    filepath: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    apiConfiguration?: generatorsYml.ApiConfigurationV2Schema;
}): Promise<void> {
    await writeFile(
        filepath,
        "# yaml-language-server: $schema=https://schema.buildwithfern.dev/generators-yml.json\n" +
            yaml.dump(await getDefaultGeneratorsConfiguration({ cliVersion, context, apiConfiguration }), {
                sortKeys: (a, b) => {
                    if (a === "api") {
                        return -1;
                    }
                    if (b === "api") {
                        return 1;
                    }
                    return a.localeCompare(b);
                }
            })
    );
}

async function writeSampleApiDefinition({
    directoryOfDefinition,
    apiName
}: {
    directoryOfDefinition: AbsoluteFilePath;
    apiName: string;
}): Promise<void> {
    const rootApi: RootApiFileSchema = {
        name: apiName,
        "error-discrimination": {
            strategy: "status-code"
        }
    };
    await mkdir(directoryOfDefinition);
    await writeFile(join(directoryOfDefinition, RelativeFilePath.of(ROOT_API_FILENAME)), yaml.dump(rootApi));

    const absoluteFilepathToImdbYaml = join(directoryOfDefinition, RelativeFilePath.of("imdb.yml"));
    let formattedContent: string;
    try {
        formattedContent = await formatDefinitionFile({
            fileContents: SAMPLE_IMDB_API
        });
    } catch (error) {
        if (error instanceof CliError) {
            throw error;
        }
        throw new CliError({
            message: `Failed to format definition file: ${error instanceof Error ? error.message : String(error)}`,
            code: CliError.Code.ParseError
        });
    }
    await writeFile(absoluteFilepathToImdbYaml, formattedContent);
}
