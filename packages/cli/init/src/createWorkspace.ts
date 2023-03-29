import { entries } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DEFAULT_GROUP_NAME, GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { OpenApiConvertedFernDefinition } from "@fern-api/openapi-migrator";
import {
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    ROOT_API_FILENAME,
} from "@fern-api/project-configuration";
import { formatDefinitionFile } from "@fern-api/yaml-formatter";
import { RootApiFileSchema } from "@fern-api/yaml-schema";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { SAMPLE_IMDB_API } from "./sampleImdbApi";

export async function createWorkspace({
    directoryOfWorkspace,
    fernDefinition,
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    fernDefinition: OpenApiConvertedFernDefinition | undefined;
}): Promise<void> {
    await mkdir(directoryOfWorkspace);
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)),
    });
    const directoryOfDefinition = join(directoryOfWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY));
    if (fernDefinition == null) {
        await writeSampleApiDefinition({
            directoryOfDefinition,
        });
    } else {
        await mkdir(directoryOfDefinition);
        await writeFile(
            join(directoryOfDefinition, RelativeFilePath.of(ROOT_API_FILENAME)),
            yaml.dump(fernDefinition.rootApiFile)
        );
        for (const [relativePath, definitionFile] of entries(fernDefinition.definitionFiles)) {
            const absoluteFilepath = join(directoryOfDefinition, relativePath);
            await writeFile(
                absoluteFilepath,
                formatDefinitionFile({
                    fileContents: yaml.dump(definitionFile),
                    absoluteFilepath,
                })
            );
        }
    }
}

const GENERATORS_CONFIGURATION: GeneratorsConfigurationSchema = {
    "default-group": DEFAULT_GROUP_NAME,
    groups: {
        [DEFAULT_GROUP_NAME]: {
            generators: [
                {
                    name: "fernapi/fern-typescript-sdk",
                    version: "0.2.2",
                    output: {
                        location: "local-file-system",
                        path: "../../generated/typescript",
                    },
                },
                {
                    name: "fernapi/fern-openapi",
                    version: "0.0.22",
                    output: {
                        location: "local-file-system",
                        path: "../../generated/openapi",
                    },
                },
            ],
        },
    },
};

async function writeGeneratorsConfiguration({ filepath }: { filepath: AbsoluteFilePath }): Promise<void> {
    await writeFile(filepath, yaml.dump(GENERATORS_CONFIGURATION));
}

const ROOT_API: RootApiFileSchema = {
    name: "api",
    "error-discrimination": {
        strategy: "status-code",
    },
};

async function writeSampleApiDefinition({
    directoryOfDefinition,
}: {
    directoryOfDefinition: AbsoluteFilePath;
}): Promise<void> {
    await mkdir(directoryOfDefinition);
    await writeFile(join(directoryOfDefinition, RelativeFilePath.of(ROOT_API_FILENAME)), yaml.dump(ROOT_API));

    const absoluteFilepathToImdbYaml = join(directoryOfDefinition, RelativeFilePath.of("imdb.yml"));
    await writeFile(
        absoluteFilepathToImdbYaml,
        formatDefinitionFile({
            fileContents: SAMPLE_IMDB_API,
            absoluteFilepath: absoluteFilepathToImdbYaml,
        })
    );
}
