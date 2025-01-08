import { createReadStream } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import {
    DEFAULT_GROUP_NAME,
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATOR_INVOCATIONS,
    OPENAPI_DIRECTORY,
    ROOT_API_FILENAME,
    generatorsYml,
    getLatestGeneratorVersion
} from "@fern-api/configuration-loader";
import { formatDefinitionFile } from "@fern-api/fern-definition-formatter";
import { RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { SAMPLE_IMDB_API } from "./sampleImdbApi";

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
    const openAPIfilename = path.basename(openAPIFilePath);
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
        cliVersion,
        context,
        apiConfiguration: {
            path: join(RelativeFilePath.of(OPENAPI_DIRECTORY), RelativeFilePath.of(openAPIfilename))
        }
    });
    const openapiDirectory = join(directoryOfWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    await mkdir(openapiDirectory);
    const openAPIContents = createReadStream(openAPIFilePath);
    await writeFile(join(openapiDirectory, RelativeFilePath.of(openAPIfilename)), openAPIContents);
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
    const defaultGeneratorName = "fernapi/fern-typescript-node-sdk";
    const fallbackInvocation = GENERATOR_INVOCATIONS[defaultGeneratorName];

    let version = fallbackInvocation.version;
    const versionFromDB = await getLatestGeneratorVersion({
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
                generators: [
                    {
                        name: defaultGeneratorName,
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
    apiConfiguration?: generatorsYml.ApiConfigurationSchema;
}): Promise<void> {
    await writeFile(
        filepath,
        yaml.dump(await getDefaultGeneratorsConfiguration({ cliVersion, context, apiConfiguration }))
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
