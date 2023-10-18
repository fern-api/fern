import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";
import { ApiSection, DocsWebsite, Endpoint } from "./docsWebsite";
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

// async function getApiSection(
//     context: TaskContext,
//     cliVersion: string
// ): Promise<FernDocsConfig.ApiSectionConfiguration[]> {
//     const apis: FernDocsConfig.ApiSectionConfiguration[] = [];

//     try {
//         let apiWorkspaces: APIWorkspace[] = [];
//         const currentDirectory = process.cwd();
//         apiWorkspaces = await loadApis({
//             fernDirectory: join(AbsoluteFilePath.of(currentDirectory), RelativeFilePath.of(FERN_DIRECTORY)),
//             context,
//             cliVersion,
//             cliName: "fern",
//             commandLineApiWorkspace: undefined,
//             defaultToAllApiWorkspaces: true,
//         });

//         for (const workspace of apiWorkspaces) {
//             if (workspace.type === "openapi") {
//                 apis.push({
//                     // todo (rishan): parse openapi file and get title
//                     api: workspace.name,
//                     apiName: workspace.name,
//                 });
//             }
//         }
//         if (apis.length === 0) {
//             return [
//                 {
//                     api: "API Reference",
//                 }
//             ];
//         }
//         return apis;
//     } catch (error) {
//         context.logger.error(`Error loading api sections: ${error}`);
//         return [
//             {
//                 api: "API Reference",
//             },
//         ];
//     }
// }

async function loadOpenApiAndInitApi(
    openApiUrl: string,
    endpointToTagMapping: Map<Endpoint, ApiSection>,
    organization: string,
    taskContext: TaskContext,
    versionOfCli: string
): Promise<void> {
    try {
        const result = await loadOpenAPIFromUrl({
            url: openApiUrl,
            endpointToDocsTagsMap: endpointToTagMapping,
            logger: taskContext.logger,
        });

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
        const mapping = await docsUrl.getGroupingStructure();
        if (urls.length === 0) {
            taskContext.failAndThrow(`Invalid docs url. No openapi urls found at ${docsUrl.url}.`);
        }
        // Executing in parallel causes a race-condition when creating the /openapi directory, so we do it sequentially
        for (const url of urls) {
            await loadOpenApiAndInitApi(url, mapping, organization, taskContext, versionOfCli);
        }
    }

    return {
        instances: [
            {
                url: `https://${organization}.${process.env.DOCS_DOMAIN_SUFFIX}`,
            },
        ],
        title: `${organization} | Documentation`,
        navigation: [{
            api: "API Reference",
        }],
        colors: {
            accentPrimary: "#ffffff",
            background: "#000000",
        },
    };
}
