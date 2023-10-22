import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME, FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import * as RawDocsSerializers from "@fern-fern/docs-config/serialization";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";
import { DocsWebsite } from "./docsWebsite";
import { initializeAPI } from "./initializeAPI";
import { writeOpenApiToTmpFile } from "./utils/loadOpenApiFromUrl";
import { APIWorkspace } from "@fern-api/workspace-loader";
import { FernDocsConfig } from "@fern-fern/docs-config";
import { loadApis } from "@fern-api/project-loader";

import SwaggerParser from "@apidevtools/swagger-parser";

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
    const serDocsCfg = await RawDocsSerializers.DocsConfiguration.jsonOrThrow(docsCfg);
    
    await writeFile(
        join(createDirectoryResponse.absolutePathToFernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)),
        yaml.dump(serDocsCfg)
    );
}

async function getApiSection(
    context: TaskContext,
    cliVersion: string
): Promise<FernDocsConfig.ApiSectionConfiguration[]> {
    const apis: FernDocsConfig.ApiSectionConfiguration[] = [];

    try {
        let apiWorkspaces: APIWorkspace[] = [];
        const currentDirectory = process.cwd();
        apiWorkspaces = await loadApis({
            fernDirectory: join(AbsoluteFilePath.of(currentDirectory), RelativeFilePath.of(FERN_DIRECTORY)),
            context,
            cliVersion,
            cliName: "fern",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true,
        });

        for (const workspace of apiWorkspaces) {
            if (workspace.type === "openapi") {
                const openApiObj = await SwaggerParser.parse(workspace.openapi.absoluteFilepath);

                apis.push({
                    apiName: workspace.workspaceName != null ? workspace.workspaceName : "API Reference",
                    api: openApiObj.info.title,
                });
            }
        }
        if (apis.length === 0) {
            return [
                {
                    api: "API Reference",
                }
            ];
        }
        return apis;
    } catch (error) {
        context.logger.error(`Error loading api sections: ${error}`);
        return [
            {
                api: "API Reference",
            },
        ];
    }
}

// async function loadOpenApiAndInitApi(
//     openApiUrl: string,
//     endpointToTagMapping: Map<Endpoint, ApiSection>,
//     organization: string,
//     taskContext: TaskContext,
//     versionOfCli: string
// ): Promise<void> {
//     try {
//         const result = await loadOpenAPIFromUrl({
//             url: openApiUrl,
//             endpointToDocsTagsMap: endpointToTagMapping,
//             logger: taskContext.logger,
//         });

//         let absoluteOpenApiPath: AbsoluteFilePath | undefined = undefined;

//         if (result.status === LoadOpenAPIStatus.Failure) {
//             taskContext.failAndThrow(result.errorMessage);
//         } else {
//             const tmpFilepath = result.filePath;
//             absoluteOpenApiPath = AbsoluteFilePath.of(tmpFilepath);
//             const pathExists = await doesPathExist(absoluteOpenApiPath);
//             if (!pathExists) {
//                 taskContext.failAndThrow(`${absoluteOpenApiPath} does not exist`);
//             }

//             await initializeAPI({
//                 organization,
//                 versionOfCli,
//                 context: taskContext,
//                 openApiPath: absoluteOpenApiPath,
//             });
//         }
//     } catch (error) {
//         taskContext.logger.error(`Error loading and initializing OpenAPI: ${error}`);
//     }
// }

async function getDocsConfig(
    organization: string,
    docsUrl: DocsWebsite | undefined,
    taskContext: TaskContext,
    versionOfCli: string
): Promise<RawDocs.DocsConfiguration> {
    if (docsUrl) {
        const openApiObj = await docsUrl.getOpenApiFromApiReferencePages();
        if (openApiObj != null) {
            const filePathOfTmpOpenApi = await writeOpenApiToTmpFile(openApiObj);
            await initializeAPI({
                organization,
                versionOfCli,
                context: taskContext,
                openApiPath: AbsoluteFilePath.of(filePathOfTmpOpenApi),
            });
        }
    }

    const apiSection = await getApiSection(taskContext, versionOfCli);
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
