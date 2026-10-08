import {
    APIS_DIRECTORY,
    ASYNCAPI_DIRECTORY,
    DEFINITION_DIRECTORY,
    DOCS_CONFIGURATION_FILENAME,
    docsYml,
    FERN_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    OPENAPI_DIRECTORY
} from "@fern-api/configuration-loader";
import { extractErrorMessage, titleCase } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, doesPathExist, isURL, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization.js";
import { getOpenAPIFileName, materializeOpenAPI } from "./createWorkspace.js";
import { addSpec, hasFlatNavigation } from "./docsYmlSpecs.js";
import { LoadOpenAPIStatus, loadOpenAPIFromUrl } from "./utils/loadOpenApiFromUrl.js";

const PAGES_DIRECTORY = "pages";
const WELCOME_PAGE_FILENAME = "welcome.mdx";

export async function initializeDocs({
    organization,
    taskContext,
    versionOfCli,
    openApi,
    useSdkConfig
}: {
    organization: string | undefined;
    taskContext: TaskContext;
    versionOfCli: string;
    /** Path or URL of an OpenAPI spec to render as the API reference. It is declared in `docs.yml`. Ignored unless `useSdkConfig` is set. */
    openApi?: string;
    /** Whether SDK Config init is enabled. Without it, `fern init --openapi` creates a `generators.yml` API the docs already read. */
    useSdkConfig: boolean;
}): Promise<void> {
    // The fern directory is always `./fern`, so this can be checked before anything is created or downloaded.
    const docsYmlPath = join(
        cwd(),
        RelativeFilePath.of(FERN_DIRECTORY),
        RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
    );
    if (await doesPathExist(docsYmlPath)) {
        taskContext.logger.info(chalk.yellow(`Docs configuration already exists at: ${docsYmlPath}`));
        if (useSdkConfig && openApi != null) {
            await addSpecToExistingDocsYml({ docsYmlPath, openApi, taskContext });
        }
        return;
    }

    // Resolve before creating anything, so a bad spec fails without leaving a half-initialized fern directory.
    const openApiPath =
        useSdkConfig && openApi != null ? await resolveOpenApiPath({ openApi, taskContext }) : undefined;

    const createDirectoryResponse = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext
    });

    if (createDirectoryResponse.absolutePathToFernDirectory) {
        try {
            const specPathInDocsYml =
                openApiPath != null
                    ? await getSpecPathInDocsYml({
                          absolutePathToFernDirectory: createDirectoryResponse.absolutePathToFernDirectory,
                          openApiPath,
                          taskContext
                      })
                    : undefined;
            const hasApi =
                specPathInDocsYml != null ||
                (await hasLoadableApiWorkspace({
                    absolutePathToFernDirectory: createDirectoryResponse.absolutePathToFernDirectory,
                    taskContext,
                    versionOfCli
                }));
            if (!hasApi) {
                await writeWelcomePage({
                    absolutePathToFernDirectory: createDirectoryResponse.absolutePathToFernDirectory,
                    organization: createDirectoryResponse.organization
                });
            }
            const docsConfig = getDocsConfig({
                organization: createDirectoryResponse.organization,
                hasApi,
                specPathInDocsYml
            });
            await writeFile(docsYmlPath, yaml.dump(docsConfig));
            taskContext.logger.info(chalk.green("Created docs configuration"));
        } catch (writeError) {
            const errorMessage = extractErrorMessage(writeError);
            taskContext.logger.debug(`Encountered an error while writing docs configuration: ${errorMessage}`);
            taskContext.logger.error(chalk.red("Failed to write docs configuration"));
            throw writeError;
        }
    }
}

/** Declares the spec in an existing `docs.yml`, on its first `api` entry or on a new one. */
async function addSpecToExistingDocsYml({
    docsYmlPath,
    openApi,
    taskContext
}: {
    docsYmlPath: AbsoluteFilePath;
    openApi: string;
    taskContext: TaskContext;
}): Promise<void> {
    const docsConfig: unknown = yaml.load(await readFile(docsYmlPath, "utf8"));
    if (!hasFlatNavigation(docsConfig)) {
        taskContext.logger.warn(
            "The OpenAPI spec was not added because docs.yml has no flat `navigation` list. Add it under an `api` entry's `specs` in docs.yml."
        );
        return;
    }
    const specPath = await getSpecPathInDocsYml({
        absolutePathToFernDirectory: AbsoluteFilePath.of(path.dirname(docsYmlPath)),
        openApiPath: await resolveOpenApiPath({ openApi, taskContext }),
        taskContext
    });
    await writeFile(docsYmlPath, yaml.dump(addSpec({ docsConfig, specPath })));
    taskContext.logger.info(chalk.green("Added the OpenAPI spec to docs.yml"));
}

/**
 * The spec's path relative to `docs.yml`. A spec that already lives in the fern directory, like an SDK Config API's,
 * is referenced as is, so the docs and the API read the same file. Any other spec is copied there.
 */
async function getSpecPathInDocsYml({
    absolutePathToFernDirectory,
    openApiPath,
    taskContext
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    openApiPath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<string> {
    const pathInFernDirectory = path.relative(absolutePathToFernDirectory, openApiPath);
    const isInFernDirectory = !pathInFernDirectory.startsWith("..") && !path.isAbsolute(pathInFernDirectory);
    return isInFernDirectory
        ? `./${pathInFernDirectory.split(path.sep).join("/")}`
        : await copySpecIntoFernDirectory({ absolutePathToFernDirectory, openApiPath, taskContext });
}

/** A local path is checked for existence. A URL is downloaded, because `docs.yml` can only reference files. */
async function resolveOpenApiPath({
    openApi,
    taskContext
}: {
    openApi: string;
    taskContext: TaskContext;
}): Promise<AbsoluteFilePath> {
    if (isURL(openApi)) {
        const result = await loadOpenAPIFromUrl({ url: openApi, logger: taskContext.logger });
        if (result.status === LoadOpenAPIStatus.Failure) {
            return taskContext.failAndThrow(result.errorMessage, undefined, { code: CliError.Code.NetworkError });
        }
        return AbsoluteFilePath.of(result.filePath);
    }

    const openApiPath = AbsoluteFilePath.of(resolve(cwd(), openApi));
    if (!(await doesPathExist(openApiPath))) {
        return taskContext.failAndThrow(`${openApiPath} does not exist`, undefined, {
            code: CliError.Code.ConfigError
        });
    }
    return openApiPath;
}

/**
 * Writes the same bundled copy `fern init --openapi` makes, next to `docs.yml`. If `openapi.json|yml` is taken,
 * it uses `openapi-1.json|yml` and so on, so an existing API's spec is never overwritten.
 * Returns the copy's path relative to `docs.yml`.
 */
async function copySpecIntoFernDirectory({
    absolutePathToFernDirectory,
    openApiPath,
    taskContext
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    openApiPath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<string> {
    return await materializeOpenAPI({
        directoryOfWorkspace: absolutePathToFernDirectory,
        openAPIFilePath: openApiPath,
        context: taskContext,
        openAPIFileName: await findFreeFileName({
            directory: absolutePathToFernDirectory,
            fileName: getOpenAPIFileName(openApiPath)
        })
    });
}

/** Returns `fileName`, or the first of `name-1.ext`, `name-2.ext`, ... that does not exist in `directory` yet. */
async function findFreeFileName({
    directory,
    fileName
}: {
    directory: AbsoluteFilePath;
    fileName: string;
}): Promise<string> {
    const { name, ext } = path.parse(fileName);
    let candidate = fileName;
    for (let attempt = 1; await doesPathExist(join(directory, RelativeFilePath.of(candidate))); attempt++) {
        candidate = `${name}-${attempt}${ext}`;
    }
    return candidate;
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
    hasApi,
    specPathInDocsYml
}: {
    organization: string;
    hasApi: boolean;
    /** Spec path relative to `docs.yml`. When set, the API reference is built from it. */
    specPathInDocsYml: string | undefined;
}): docsYml.RawSchemas.DocsConfiguration {
    const navigation: docsYml.RawSchemas.NavigationItem[] = hasApi
        ? [
              {
                  api: "API Reference",
                  paginated: true,
                  ...(specPathInDocsYml != null ? { specs: [{ type: "openapi", path: specPathInDocsYml }] } : {})
              }
          ]
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
