import {
    APIS_DIRECTORY,
    ASYNCAPI_DIRECTORY,
    DEFINITION_DIRECTORY,
    DOCS_CONFIGURATION_FILENAME,
    docsYml,
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    OPENAPI_DIRECTORY
} from "@fern-api/configuration-loader";
import { extractErrorMessage, titleCase } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { mkdir, readdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization.js";

const PAGES_DIRECTORY = "pages";
const WELCOME_PAGE_FILENAME = "welcome.mdx";

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
                const hasApi = await hasLoadableApiWorkspace({
                    absolutePathToFernDirectory: createDirectoryResponse.absolutePathToFernDirectory,
                    taskContext,
                    versionOfCli
                });
                if (!hasApi) {
                    await writeWelcomePage({
                        absolutePathToFernDirectory: createDirectoryResponse.absolutePathToFernDirectory,
                        organization: createDirectoryResponse.organization
                    });
                }
                const docsConfig = getDocsConfig({ organization: createDirectoryResponse.organization, hasApi });
                await writeFile(docsYmlPath, yaml.dump(docsConfig));
                taskContext.logger.info(chalk.green("Created docs configuration"));
                return;
            } catch (writeError) {
                const errorMessage = extractErrorMessage(writeError);
                taskContext.logger.debug(`Encountered an error while writing docs configuration: ${errorMessage}`);
                taskContext.logger.error(chalk.red("Failed to write docs configuration"));
                throw writeError;
            }
        }
    }
}

/**
 * Uses the same discovery markers as the project loader, then confirms at least one
 * API workspace actually loads, so the generated `api:` item is guaranteed to resolve.
 */
async function hasLoadableApiWorkspace({
    absolutePathToFernDirectory,
    taskContext,
    versionOfCli
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
    versionOfCli: string;
}): Promise<boolean> {
    const apisDirectory = join(absolutePathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    if (await doesPathExist(apisDirectory)) {
        const entries = await readdir(apisDirectory, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }
            const result = await loadAPIWorkspace({
                absolutePathToWorkspace: join(apisDirectory, RelativeFilePath.of(entry.name)),
                context: taskContext,
                cliVersion: versionOfCli,
                workspaceName: entry.name
            });
            if (result.didSucceed) {
                return true;
            }
        }
        return false;
    }

    const singleWorkspaceMarkers = [
        DEFINITION_DIRECTORY,
        OPENAPI_DIRECTORY,
        ASYNCAPI_DIRECTORY,
        GENERATORS_CONFIGURATION_FILENAME,
        GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE
    ];
    let hasMarker = false;
    for (const marker of singleWorkspaceMarkers) {
        if (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(marker)))) {
            hasMarker = true;
            break;
        }
    }
    if (!hasMarker) {
        return false;
    }
    const result = await loadAPIWorkspace({
        absolutePathToWorkspace: absolutePathToFernDirectory,
        context: taskContext,
        cliVersion: versionOfCli,
        workspaceName: undefined
    });
    return result.didSucceed;
}

async function writeWelcomePage({
    absolutePathToFernDirectory,
    organization
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    organization: string;
}): Promise<void> {
    const pagesDirectory = join(absolutePathToFernDirectory, RelativeFilePath.of(PAGES_DIRECTORY));
    const welcomePagePath = join(pagesDirectory, RelativeFilePath.of(WELCOME_PAGE_FILENAME));
    if (await doesPathExist(welcomePagePath)) {
        return;
    }
    await mkdir(pagesDirectory, { recursive: true });
    await writeFile(welcomePagePath, getWelcomePageContent(organization));
}

function getWelcomePageContent(organization: string): string {
    return `---
title: Welcome
subtitle: Welcome to the ${titleCase(organization)} documentation
---

This site was generated by \`fern init --docs\`.

## Next steps

- Edit this page at \`fern/pages/welcome.mdx\`.
- Add more pages and sections to the \`navigation\` in \`fern/docs.yml\`.
- Add an API reference by running \`fern init --openapi <path-or-url>\` and adding \`- api: API Reference\` to the navigation.
- Preview locally with \`fern docs dev\`, then publish with \`fern generate --docs\`.
`;
}

function getDocsConfig({
    organization,
    hasApi
}: {
    organization: string;
    hasApi: boolean;
}): docsYml.RawSchemas.DocsConfiguration {
    const navigation: docsYml.RawSchemas.NavigationItem[] = hasApi
        ? [{ api: "API Reference", paginated: true }]
        : [{ page: "Welcome", path: `${PAGES_DIRECTORY}/${WELCOME_PAGE_FILENAME}` }];
    return {
        instances: [
            {
                url: `https://${organization}.${process.env.DOCS_DOMAIN_SUFFIX}`
            }
        ],
        title: `${titleCase(organization)} | Documentation`,
        navigation,
        colors: {
            accentPrimary: "#ffffff",
            background: "#000000"
        }
    };
}
