import { entries } from "@fern-api/core-utils";
import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { FernDefinition } from "@fern-api/openapi-migrator";
import {
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    ROOT_API_FILENAME,
} from "@fern-api/project-configuration";
import { formatServiceFile } from "@fern-api/yaml-formatter";
import { RootApiFileSchema } from "@fern-api/yaml-schema";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { SAMPLE_IMDB_API } from "./sampleImdbApi";

export async function createWorkspace({
    directoryOfWorkspace,
    fernDefinition,
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    fernDefinition: FernDefinition | undefined;
}): Promise<void> {
    await mkdir(directoryOfWorkspace);
    await writeGeneratorsConfiguration({
        filepath: join(directoryOfWorkspace, GENERATORS_CONFIGURATION_FILENAME),
    });
    const directoryOfDefinition = join(directoryOfWorkspace, DEFINITION_DIRECTORY);
    if (fernDefinition == null) {
        await writeSampleApiDefinition({
            directoryOfDefinition,
        });
    } else {
        await mkdir(directoryOfDefinition);
        await writeFile(join(directoryOfDefinition, ROOT_API_FILENAME), yaml.dump(fernDefinition.rootApiFile));
        for (const [relativePath, serviceFile] of entries(fernDefinition.serviceFiles)) {
            const absoluteFilepath = join(directoryOfDefinition, relativePath);
            await writeFile(
                absoluteFilepath,
                formatServiceFile({
                    fileContents: yaml.dump(serviceFile),
                    absoluteFilepath,
                })
            );
        }
    }
}

const GENERATORS_CONFIGURATION: GeneratorsConfigurationSchema = {
  "default-group": "local",
  groups: {
      local: {
          generators: [
              {
                  name: "fernapi/fern-typescript-sdk",
                  version: "0.0.273",
                  output: {
                      location: "local-file-system",
                      path: "../../generated/typescript"
                  }
              },
              {
                  name: "fernapi/fern-openapi",
                  version: "0.0.19",
                  output: {
                      location: "local-file-system",
                      path: "../../generated/openapi"
                  }
              }
          ]
      }
  }
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
    await writeFile(join(directoryOfDefinition, ROOT_API_FILENAME), yaml.dump(ROOT_API));

    const absoluteFilepathToImdbYaml = join(directoryOfDefinition, "imdb.yml");
    await writeFile(
        absoluteFilepathToImdbYaml,
        formatServiceFile({
            fileContents: SAMPLE_IMDB_API,
            absoluteFilepath: absoluteFilepathToImdbYaml,
        })
    );
}