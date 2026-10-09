import {
    APIS_DIRECTORY,
    ASYNCAPI_DIRECTORY,
    DEFINITION_DIRECTORY,
    DOCS_CONFIGURATION_FILENAME,
    FERN_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    isSdkConfigOnlyWorkspace,
    OPENAPI_DIRECTORY,
    SDK_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { extractErrorMessage, isPlainObject, titleCase } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, doesPathExist, isURL, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization.js";
import { getOpenAPIFileName, materializeOpenAPI } from "./createWorkspace.js";
import { addApiReference, DocsConfigWithFlatNavigation, hasFlatNavigation } from "./docsYmlSpecs.js";
import { updateDocsYml } from "./updateDocsYml.js";
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
            await addSpecToExistingDocsYml({
                absolutePathToFernDirectory: AbsoluteFilePath.of(path.dirname(docsYmlPath)),
                openApi,
                taskContext
            });
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
            const existingApis = await findExistingApis({
                absolutePathToFernDirectory: createDirectoryResponse.absolutePathToFernDirectory,
                taskContext,
                versionOfCli
            });
            const apiReferences = getApiReferences({ existingApis, specPathInDocsYml });
            if (apiReferences.length === 0) {
                await writeWelcomePage({
                    absolutePathToFernDirectory: createDirectoryResponse.absolutePathToFernDirectory,
                    organization: createDirectoryResponse.organization
                });
            }
            const docsConfig = getDocsConfig({
                organization: createDirectoryResponse.organization,
                apiReferences
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
    absolutePathToFernDirectory,
    openApi,
    taskContext
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    openApi: string;
    taskContext: TaskContext;
}): Promise<void> {
    const wasUpdated = await updateDocsYml({
        absolutePathToFernDirectory,
        taskContext,
        update: async (docsConfig) => {
            if (!hasFlatNavigation(docsConfig)) {
                taskContext.logger.warn(
                    "The OpenAPI spec was not added because docs.yml has no flat `navigation` list. Add it under an `api` entry's `specs` in docs.yml."
                );
                return docsConfig;
            }
            const specPath = await getSpecPathInDocsYml({
                absolutePathToFernDirectory,
                openApiPath: await resolveOpenApiPath({ openApi, taskContext }),
                taskContext
            });
            return addApiReference({ docsConfig, specPaths: [specPath] });
        }
    });
    if (wasUpdated) {
        taskContext.logger.info(chalk.green("Added the OpenAPI spec to docs.yml"));
    }
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
    const [firstSegment] = pathInFernDirectory.split(path.sep);
    const isInFernDirectory = firstSegment !== ".." && !path.isAbsolute(pathInFernDirectory);
    return isInFernDirectory
        ? toPathInDocsYml(pathInFernDirectory)
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
export async function findFreeFileName({
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

interface ExistingApis {
    /** Whether a `generators.yml` or Fern Definition API loads. The docs read it without a `specs` list. */
    hasFernApi: boolean;
    /** The spec paths, relative to `docs.yml`, of each SDK Config API, which the docs cannot read as an API. */
    sdkConfigApiSpecPaths: string[][];
}

/**
 * Confirms that at least one `generators.yml` or Fern Definition API workspace actually loads, so the generated `api:`
 * item is guaranteed to resolve. An SDK Config API has nothing to load, so its specs are read from its `sdk-config.yml`.
 */
async function findExistingApis({
    absolutePathToFernDirectory,
    taskContext,
    versionOfCli
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
    versionOfCli: string;
}): Promise<ExistingApis> {
    const existingApis: ExistingApis = { hasFernApi: false, sdkConfigApiSpecPaths: [] };
    for (const { absolutePathToWorkspace, workspaceName } of await findApiWorkspaces(absolutePathToFernDirectory)) {
        if (await isSdkConfigOnlyWorkspace(absolutePathToWorkspace)) {
            const specPaths = await getSdkConfigSpecPaths({
                absolutePathToWorkspace,
                absolutePathToFernDirectory,
                taskContext
            });
            if (specPaths.length > 0) {
                existingApis.sdkConfigApiSpecPaths.push(specPaths);
            }
        } else if (!existingApis.hasFernApi) {
            const result = await loadAPIWorkspace({
                absolutePathToWorkspace,
                context: taskContext,
                cliVersion: versionOfCli,
                workspaceName
            });
            existingApis.hasFernApi = result.didSucceed;
        }
    }
    return existingApis;
}

/**
 * The API workspaces of the fern directory: each folder of `apis/`, or the fern directory itself when it has the same
 * discovery markers as the project loader looks for.
 */
async function findApiWorkspaces(
    absolutePathToFernDirectory: AbsoluteFilePath
): Promise<{ absolutePathToWorkspace: AbsoluteFilePath; workspaceName: string | undefined }[]> {
    const apisDirectory = join(absolutePathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    if (await doesPathExist(apisDirectory)) {
        const entries = await readdir(apisDirectory, { withFileTypes: true });
        // `api`, `api1`, `api2`, ... `api10`, in the order `fern init` made them, so the API references come out in it.
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((name) => ({
                absolutePathToWorkspace: join(apisDirectory, RelativeFilePath.of(name)),
                workspaceName: name
            }));
    }

    const singleWorkspaceMarkers = [
        DEFINITION_DIRECTORY,
        OPENAPI_DIRECTORY,
        ASYNCAPI_DIRECTORY,
        GENERATORS_CONFIGURATION_FILENAME,
        GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
        SDK_CONFIG_FILENAME
    ];
    for (const marker of singleWorkspaceMarkers) {
        if (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(marker)))) {
            return [{ absolutePathToWorkspace: absolutePathToFernDirectory, workspaceName: undefined }];
        }
    }
    return [];
}

/**
 * The OpenAPI specs of an SDK Config API that exist as local files, relative to `docs.yml`. A spec given as a URL is
 * left out, because `docs.yml` can only reference files. Anything unreadable is left out too, so one broken
 * `sdk-config.yml` does not keep the docs from being created. It is read as is, not validated, for the same reason.
 */
async function getSdkConfigSpecPaths({
    absolutePathToWorkspace,
    absolutePathToFernDirectory,
    taskContext
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    absolutePathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<string[]> {
    const sdkConfigPath = join(absolutePathToWorkspace, RelativeFilePath.of(SDK_CONFIG_FILENAME));
    let sdkConfig: unknown;
    try {
        sdkConfig = yaml.load(await readFile(sdkConfigPath, "utf8"));
    } catch (error) {
        taskContext.logger.debug(`Skipping ${sdkConfigPath} for the docs: ${extractErrorMessage(error)}`);
        return [];
    }
    const specs = isPlainObject(sdkConfig) && isPlainObject(sdkConfig.source) ? sdkConfig.source.specs : undefined;
    const specPaths: string[] = [];
    for (const spec of Array.isArray(specs) ? specs : []) {
        if (!isPlainObject(spec) || spec.type !== "openapi" || typeof spec.path !== "string") {
            continue;
        }
        const absolutePathToSpec = AbsoluteFilePath.of(path.resolve(absolutePathToWorkspace, spec.path));
        if (await doesPathExist(absolutePathToSpec)) {
            specPaths.push(toPathInDocsYml(path.relative(absolutePathToFernDirectory, absolutePathToSpec)));
        }
    }
    return specPaths;
}

/**
 * The `api` entries `docs.yml` starts with: one for a `generators.yml` or Fern Definition API, one for each SDK Config
 * API, and one for the given spec unless an entry already lists it.
 * `fern init --openapi` hands over the spec of the API it just created, which is already listed.
 */
function getApiReferences({
    existingApis,
    specPathInDocsYml
}: {
    existingApis: ExistingApis;
    specPathInDocsYml: string | undefined;
}): unknown[] {
    const specPathsOfApis = [
        ...(existingApis.hasFernApi ? [[]] : []),
        ...existingApis.sdkConfigApiSpecPaths,
        ...(specPathInDocsYml != null ? [[specPathInDocsYml]] : [])
    ];
    const docsConfig = specPathsOfApis.reduce<DocsConfigWithFlatNavigation>(
        (config, specPaths) => addApiReference({ docsConfig: config, specPaths }),
        { navigation: [] }
    );
    return docsConfig.navigation;
}

/** `./a/b.json` for the path `a/b.json` from the fern directory, and `../b.json` for one outside of it. */
function toPathInDocsYml(pathFromFernDirectory: string): string {
    const posixPath = pathFromFernDirectory.split(path.sep).join("/");
    return posixPath.startsWith("../") ? posixPath : `./${posixPath}`;
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
    apiReferences
}: {
    organization: string;
    /** The `api` entries of the navigation. Without any, the navigation is a welcome page. */
    apiReferences: unknown[];
}): DocsConfigWithFlatNavigation {
    // Untyped like the `api` entries, which `docsYmlSpecs` builds the way it edits an existing `docs.yml`.
    const navigation =
        apiReferences.length > 0
            ? apiReferences
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
