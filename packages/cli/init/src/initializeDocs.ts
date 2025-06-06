import chalk from "chalk";
import fs from "fs-extra";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";

import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { docsYml } from "@fern-api/configuration-loader";
import { RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { titleCase } from "../../../commons/core-utils/src";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";

export async function initializeDocs({
    organization,
    taskContext,
    versionOfCli
}: {
    organization: string | undefined;
    taskContext: TaskContext;
    versionOfCli: string;
}): Promise<void> {
    const createDirectoryResponse = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext
    });

    if (createDirectoryResponse.absolutePathToFernDirectory) {
        const docsYmlPath = join(
            createDirectoryResponse.absolutePathToFernDirectory,
            RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
        );

        if (await doesPathExist(docsYmlPath)) {
            taskContext.logger.info(chalk.yellow(`Docs configuration already exists at: ${docsYmlPath}`));
            return;
        } else {
            try {
                await writeFile(
                    docsYmlPath,
                    yaml.dump(kebabCaseParserConfig(getDocsConfig(createDirectoryResponse.organization)))
                );
                taskContext.logger.info(chalk.green("Created docs configuration"));
                return;
            } catch (writeError) {
                const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
                taskContext.logger.debug(`Encountered an error while writing docs configuration: ${errorMessage}`);
                taskContext.logger.error(chalk.red("Failed to write docs configuration"));
                throw writeError;
            }
        }
    }
}

function getDocsConfig(organization: string): docsYml.RawSchemas.DocsConfiguration {
    return {
        instances: [
            {
                url: `https://${organization}.${process.env.DOCS_DOMAIN_SUFFIX}`
            }
        ],
        title: `${titleCase(organization)} | Documentation`,
        navigation: [{ api: "API Reference", paginated: true }],
        colors: {
            accentPrimary: "#ffffff",
            background: "#000000"
        },
        experimental: {
            openapiParserV3: true
        }
    };
}

function kebabCaseParserConfig(config: docsYml.RawSchemas.DocsConfiguration): docsYml.RawSchemas.DocsConfiguration & {
    experimental: docsYml.RawSchemas.ExperimentalConfig & {
        "openapi-parser-v3": boolean;
    };
} {
    const enableOpenapiParserV3 = config.experimental?.openapiParserV3 ?? true;
    const { openapiParserV3: _, ...restExperimental } = config.experimental ?? {};

    return {
        ...config,
        experimental: {
            ...restExperimental,
            "openapi-parser-v3": enableOpenapiParserV3
        }
    };
}
