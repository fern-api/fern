import chalk from "chalk";
import fs from "fs-extra";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";

import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { docsYml } from "@fern-api/configuration-loader";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

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

        try {
            // File already exists
            const stats = await fs.promises.stat(docsYmlPath);
            if (stats.isFile()) {
                taskContext.logger.info(chalk.yellow(`Docs configuration already exists at: ${docsYmlPath}`));
                return;
            }
        } catch (error: unknown) {
            // File doesn't exist - create new docs configuration
            if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
                try {
                    await writeFile(docsYmlPath, yaml.dump(getDocsConfig(createDirectoryResponse.organization)));
                    taskContext.logger.info(chalk.green("Created docs configuration"));
                    return;
                } catch (writeError) {
                    const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
                    taskContext.logger.debug(`Encountered an error while writing docs configuration: ${errorMessage}`);
                    taskContext.logger.error(chalk.red("Failed to write docs configuration"));
                    throw writeError;
                }
            }

            // Handle unexpected errors
            const errorMessage = error instanceof Error ? error.message : String(error);
            taskContext.logger.debug(`Encountered an error when checking the docs configuration: ${errorMessage}`);
            taskContext.logger.error(chalk.red("Failed to check docs configuration"));
            throw error;
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
        title: `${organization} | Documentation`,
        navigation: [{ api: "API Reference" }],
        colors: {
            accentPrimary: "#ffffff",
            background: "#000000"
        }
    };
}
