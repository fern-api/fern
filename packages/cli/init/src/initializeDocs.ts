import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig, FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";
import { initializeAPI } from "./initializeAPI";
import { loadOpenAPIFromUrl, LoadOpenAPIStatus } from "./utils/loadOpenApiFromUrl";

export async function initializeDocs({
    organization,
    taskContext,
    versionOfCli,
    docsUrl,
}: {
    organization: string | undefined;
    taskContext: TaskContext;
    versionOfCli: string;
    docsUrl: string | undefined;
}): Promise<void> {
    const createDirectoryResponse = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext,
    });
    taskContext.logger.info(`Initializing docs for ${createDirectoryResponse.organization}`);
    const docsConfig = await getDocsConfig(createDirectoryResponse.organization, docsUrl, taskContext, versionOfCli);
    await writeFile(
        join(createDirectoryResponse.absolutePathToFernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)),
        yaml.dump(docsConfig)
    );
}

async function loadOpenApiAndGetApiSectionFromUrl(
    docsUrl: string,
    organization: string,
    taskContext: TaskContext,
    versionOfCli: string
): Promise<FernDocsConfig.ApiSectionConfiguration[]> {
    const result = await loadOpenAPIFromUrl({ url: docsUrl, logger: taskContext.logger });

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

        taskContext.logger.debug(`Loaded OpenAPI spec from ${docsUrl} into file ${absoluteOpenApiPath}`);
        await initializeAPI({
            organization,
            versionOfCli,
            context: taskContext,
            openApiPath: absoluteOpenApiPath,
        });
    }

    return [
        {
            api: "API Reference",
        },
    ];
}

async function getDocsConfig(
    organization: string,
    docsUrl: string | undefined | null,
    taskContext: TaskContext,
    versionOfCli: string
): Promise<RawDocs.DocsConfiguration> {
    const apiSection =
        docsUrl != null
            ? await loadOpenApiAndGetApiSectionFromUrl(docsUrl, organization, taskContext, versionOfCli)
            : [{ api: "API Reference" }];
    return {
        instances: [
            {
                url: `https://${organization}.${process.env.DOCS_DOMAIN_SUFFIX}`,
            },
        ],
        title: `${organization} | Documentation`,
        navigation: apiSection,
        colors: {
            accentPrimary: "#ffffff",
            background: "#000000",
        },
    };
}
