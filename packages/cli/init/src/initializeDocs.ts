import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";

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
                const docsConfig = getDocsConfig(createDirectoryResponse.organization);
                await writeFile(docsYmlPath, yaml.dump(docsConfig));
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
        }
    };
}
