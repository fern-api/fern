import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig, FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";
import { LoadOpenAPIStatus, loadOpenAPIFromUrl } from "./utils/loadOpenApiFromUrl";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { initializeAPI } from "./initializeAPI";
import { DocsWebsite } from "./docsWebsite";

export async function initializeDocs({
    organization,
    taskContext,
    versionOfCli,
    docsUrl,
}: {
    organization: string | undefined;
    taskContext: TaskContext;
    versionOfCli: string;
    docsUrl: DocsWebsite | undefined;
}): Promise<void> {
    const createDirectoryResponse = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext,
    });

    const docsCfg = await getDocsConfig(createDirectoryResponse.organization, docsUrl, taskContext, versionOfCli);
    await writeFile(
        join(createDirectoryResponse.absolutePathToFernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)),
        yaml.dump(docsCfg)
    );
}

function getApiSection(): FernDocsConfig.ApiSectionConfiguration[] {
    //todo (rishan): if multiple apis, crawl the /apis directory to get the api names
    return [
        {
            api: "API Reference",
        },
    ];
}

async function loadOpenApiAndInitApi(
    openApiUrl: string,
    organization: string,
    taskContext: TaskContext,
    versionOfCli: string
): Promise<void> {
    try {
        const result = await loadOpenAPIFromUrl({ url: openApiUrl, logger: taskContext.logger });

        let absoluteOpenApiPath: AbsoluteFilePath | undefined = undefined;

        if (result.status === LoadOpenAPIStatus.Failure) {
            taskContext.failAndThrow(result.errorMessage);
        } else {
            const tmpFilepath = result.filePath;
            absoluteOpenApiPath = AbsoluteFilePath.of(tmpFilepath);
            const pathExists = await doesPathExist(absoluteOpenApiPath);
            if (!pathExists) {
                taskContext.failAndThrow(`${absoluteOpenApiPath} does not exist`);
            }

            await initializeAPI({
                organization,
                versionOfCli,
                context: taskContext,
                openApiPath: absoluteOpenApiPath,
            });
        }
    } catch (error) {
        taskContext.logger.error(`Error loading and initializing OpenAPI: ${error}`);
    }
}

async function getDocsConfig(
    organization: string,
    docsUrl: DocsWebsite | undefined,
    taskContext: TaskContext,
    versionOfCli: string
): Promise<RawDocs.DocsConfiguration> {
    if (docsUrl) {
        const urls = await docsUrl.getAllOpenApiUrls();
        if (urls.length === 0) {
            taskContext.failAndThrow(`Invalid docs url. No openapi urls found at ${docsUrl.url}.`);
        }
        // Executing in parallel causes a race-condition when creating the /openapi directory, so we do it sequentially
        for (const url of urls) {
            await loadOpenApiAndInitApi(url, organization, taskContext, versionOfCli);
        }
    }

    return {
        instances: [
            {
                url: `https://${organization}.${process.env.DOCS_DOMAIN_SUFFIX}`,
            },
        ],
        title: `${organization} | Documentation`,
        navigation: getApiSection(),
        colors: {
            accentPrimary: "#ffffff",
            background: "#000000",
        },
    };
}
