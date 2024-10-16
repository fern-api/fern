import {
    DEFAULT_GROUP_NAME,
    DEFINITION_DIRECTORY,
    generatorsYml,
    GENERATORS_CONFIGURATION_FILENAME,
    OPENAPI_DIRECTORY,
    ROOT_API_FILENAME
} from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { formatDefinitionFile } from "@fern-api/fern-definition-formatter";
import { RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { mkdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { SAMPLE_IMDB_API } from "./sampleImdbApi";

export async function createFernWorkspace({
    directoryOfWorkspace,
    cliVersion,
    context,
    writeDefaultGeneratorsConfiguration
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    writeDefaultGeneratorsConfiguration: boolean;
}): Promise<void> {
    if (!(await doesPathExist(directoryOfWorkspace))) {
        await mkdir(directoryOfWorkspace);
    }

    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
        cliVersion,
        context,
        writeDefaultGeneratorsConfiguration
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
    writeDefaultGeneratorsConfiguration
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    openAPIFilePath: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    writeDefaultGeneratorsConfiguration: boolean;
}): Promise<void> {
    if (!(await doesPathExist(directoryOfWorkspace))) {
        await mkdir(directoryOfWorkspace);
    }
    const openAPIfilename = path.basename(openAPIFilePath);
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
        cliVersion,
        context,
        apiConfiguration: {
            path: join(RelativeFilePath.of(OPENAPI_DIRECTORY), RelativeFilePath.of(openAPIfilename))
        },
        writeDefaultGeneratorsConfiguration
    });
    const openapiDirectory = join(directoryOfWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    await mkdir(openapiDirectory);
    const openAPIContents = await readFile(openAPIFilePath);
    await writeFile(join(openapiDirectory, RelativeFilePath.of(openAPIfilename)), openAPIContents);
}

async function getDefaultGeneratorsConfiguration({
    cliVersion,
    context,
    apiConfiguration,
    writeDefaultGeneratorsConfiguration
}: {
    cliVersion: string;
    context: TaskContext;
    apiConfiguration?: generatorsYml.APIConfigurationSchema;
    writeDefaultGeneratorsConfiguration: boolean;
}): Promise<generatorsYml.GeneratorsConfigurationSchema> {
    const defaultGeneratorName = "fernapi/fern-typescript-node-sdk";
    const fallbackInvocation = generatorsYml.GENERATOR_INVOCATIONS[defaultGeneratorName];

    let version = fallbackInvocation.version;
    const versionFromDB = await generatorsYml.getLatestGeneratorVersion({
        cliVersion,
        generatorName: defaultGeneratorName,
        channel: undefined
    });

    if (versionFromDB != null) {
        // Version found from FDR, using it
        version = versionFromDB;
    } else {
        context.logger.debug(
            `Failed to get latest version for ${defaultGeneratorName} that is compatible with CLI ${cliVersion}, falling back to preset version ${version}`
        );
    }
    const config: generatorsYml.GeneratorsConfigurationSchema = {
        "default-group": DEFAULT_GROUP_NAME,
        groups: {
            [DEFAULT_GROUP_NAME]: {
                generators: writeDefaultGeneratorsConfiguration
                    ? [
                          {
                              name: defaultGeneratorName,
                              ...fallbackInvocation,
                              version
                          }
                      ]
                    : []
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
    writeDefaultGeneratorsConfiguration
}: {
    filepath: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    apiConfiguration?: generatorsYml.APIConfigurationSchema;
    writeDefaultGeneratorsConfiguration: boolean;
}): Promise<void> {
    await writeFile(
        filepath,
        yaml.dump(
            await getDefaultGeneratorsConfiguration({
                cliVersion,
                context,
                apiConfiguration,
                writeDefaultGeneratorsConfiguration
            })
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
