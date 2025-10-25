import { DocsDefinitionResolver, filterOssWorkspaces } from "@fern-api/docs-resolver";
import {
    APIV1Read,
    APIV1Write,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    convertDbDocsConfigToRead,
    convertDocsDefinitionToDb,
    DocsV1Read,
    FdrAPI,
    FernNavigation,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, convertToFernHostAbsoluteFilePath, relative } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { Project } from "@fern-api/project-loader";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

import {
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown
} from "../../docs-markdown-utils/src";

export async function getPreviewDocsDefinition({
    domain,
    project,
    context,
    previousDocsDefinition,
    editedAbsoluteFilepaths
}: {
    domain: string;
    project: Project;
    context: TaskContext;
    previousDocsDefinition?: DocsV1Read.DocsDefinition;
    editedAbsoluteFilepaths?: AbsoluteFilePath[];
}): Promise<DocsV1Read.DocsDefinition> {
    const docsWorkspace = project.docsWorkspaces;
    const apiWorkspaces = project.apiWorkspaces;
    if (docsWorkspace == null) {
        throw new Error("No docs workspace found in project");
    }

    if (editedAbsoluteFilepaths != null && previousDocsDefinition != null) {
        const allMarkdownFiles = editedAbsoluteFilepaths.every(
            (filepath) => filepath.endsWith(".mdx") || filepath.endsWith(".md")
        );
        for (const absoluteFilePath of editedAbsoluteFilepaths) {
            const relativePath = relative(docsWorkspace.absoluteFilePath, absoluteFilePath);
            const markdown = (await readFile(absoluteFilePath)).toString();
            const processedMarkdown = await replaceReferencedMarkdown({
                markdown,
                absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: absoluteFilePath,
                context
            });

            const previousValue = previousDocsDefinition.pages[FdrAPI.PageId(relativePath)];
            if (previousValue == null) {
                continue;
            }

            const fileIdsMap = new Map(
                Object.entries(previousDocsDefinition.filesV2 ?? {}).map(([id, file]) => {
                    const path = "/" + file.url.replace("/_local/", "");
                    return [AbsoluteFilePath.of(path), id];
                })
            );

            // Then replace image paths with file IDs
            let finalMarkdown = replaceImagePathsAndUrls(
                processedMarkdown,
                fileIdsMap,
                {}, // markdownFilesToPathName - empty object since we don't need it for images
                {
                    absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                    absolutePathToMarkdownFile: absoluteFilePath
                },
                context
            );

            finalMarkdown = await replaceReferencedCode({
                markdown: finalMarkdown,
                absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: absoluteFilePath,
                context
            });

            previousDocsDefinition.pages[FdrAPI.PageId(relativePath)] = {
                markdown: finalMarkdown,
                editThisPageUrl: previousValue.editThisPageUrl,
                rawMarkdown: markdown
            };
        }

        if (allMarkdownFiles) {
            return previousDocsDefinition;
        }
    }

    const ossWorkspaces = await filterOssWorkspaces(project);

    const apiCollector = new ReferencedAPICollector(context);
    const apiCollectorV2 = new ReferencedAPICollectorV2(context);

    const filesV2: Record<string, DocsV1Read.File_> = {};

    const resolver = new DocsDefinitionResolver({
        domain,
        docsWorkspace,
        ossWorkspaces,
        apiWorkspaces,
        taskContext: context,
        editThisPage: undefined,
        uploadFiles: async (files) =>
            files.map((file) => {
                const fileId = uuidv4();
                filesV2[fileId] = {
                    type: "url",
                    url: FernNavigation.Url(`/_local${convertToFernHostAbsoluteFilePath(file.absoluteFilePath)}`)
                };
                return {
                    absoluteFilePath: file.absoluteFilePath,
                    relativeFilePath: file.relativeFilePath,
                    fileId
                };
            }),
        registerApi: async (opts) => apiCollector.addReferencedAPI(opts),
        targetAudiences
    });

    const writeDocsDefinition = await resolver.resolve();
    const dbDocsDefinition = convertDocsDefinitionToDb({
        writeShape: writeDocsDefinition,
        files: {}
    });
    const readDocsConfig = convertDbDocsConfigToRead({
        dbShape: dbDocsDefinition.config
    });

    return {
        apis: apiCollector.getAPIsForDefinition(),
        apisV2: apiCollectorV2.getAPIsForDefinition(),
        config: readDocsConfig,
        files: {},
        filesV2,
        pages: dbDocsDefinition.pages,
        jsFiles: dbDocsDefinition.jsFiles,
        id: undefined
    };
}

type APIDefinitionID = string;

class ReferencedAPICollector {
    private readonly apis: Record<APIDefinitionID, APIV1Read.ApiDefinition> = {};

    constructor(private readonly context: TaskContext) {}

    public addReferencedAPI({
        ir,
        snippetsConfig,
        playgroundConfig
    }: {
        ir: IntermediateRepresentation;
        snippetsConfig: APIV1Write.SnippetsConfig;
        playgroundConfig?: { oauth?: boolean };
    }): APIDefinitionID {
        try {
            const id = uuidv4();

            const dbApiDefinition = convertAPIDefinitionToDb(
                convertIrToFdrApi({ ir, snippetsConfig, playgroundConfig, context: this.context }),
                FdrAPI.ApiDefinitionId(id),
                new SDKSnippetHolder({
                    snippetsConfigWithSdkId: {},
                    snippetsBySdkId: {},
                    snippetTemplatesByEndpoint: {},
                    snippetTemplatesByEndpointId: {},
                    snippetsBySdkIdAndEndpointId: {}
                })
            );

            const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);

            this.apis[id] = readApiDefinition;
            return id;
        } catch (e) {
            // Print Error
            const err = e as Error;
            this.context.logger.debug(`Failed to read referenced API: ${err?.message} ${err?.stack}`);
            this.context.logger.error(
                "An error occurred while trying to read an API definition. Please reach out to support."
            );
            if (err.stack != null) {
                this.context.logger.error(err?.stack);
            }
            throw e;
        }
    }

    public getAPIsForDefinition(): Record<FdrAPI.ApiDefinitionId, APIV1Read.ApiDefinition> {
        return this.apis;
    }
}

class ReferencedAPICollectorV2 {
    private readonly apis: Record<APIDefinitionID, FdrAPI.api.latest.ApiDefinition> = {};

    constructor(private readonly context: TaskContext) {}

    public addReferencedAPI({
        api,
        snippetsConfig
    }: {
        api: FdrAPI.api.latest.ApiDefinition;
        snippetsConfig: APIV1Write.SnippetsConfig;
    }): APIDefinitionID {
        try {
            api.snippetsConfiguration = snippetsConfig;
            this.apis[api.id] = api;
            return api.id;
        } catch (e) {
            // Print Error
            const err = e as Error;
            this.context.logger.debug(`Failed to read referenced API: ${err?.message} ${err?.stack}`);
            this.context.logger.error(
                "An error occurred while trying to read an API definition. Please reach out to support."
            );
            if (err.stack != null) {
                this.context.logger.error(err?.stack);
            }
            throw e;
        }
    }

    public getAPIsForDefinition(): Record<FdrAPI.ApiDefinitionId, FdrAPI.api.latest.ApiDefinition> {
        return this.apis;
    }
}
