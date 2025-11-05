import { DocsDefinitionResolver, filterOssWorkspaces } from "@fern-api/docs-resolver";
import { generateLanguageSpecificDynamicIRs } from "@fern-api/dynamic-snippets-utils";
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
import { FernWorkspace } from "@fern-api/workspace-loader";
import { readFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import {
    parseImagePaths,
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown
} from "../../docs-markdown-utils/src";

export interface PreviewDocsDefinitionResult {
    docsDefinition: DocsV1Read.DocsDefinition;
    dynamicIRsByAPI: Record<string, Record<string, APIV1Write.DynamicIr>>;
}

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
}): Promise<PreviewDocsDefinitionResult> {
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

            const { markdown: markdownWithAbsPaths, filepaths } = parseImagePaths(processedMarkdown, {
                absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: absoluteFilePath
            });

            if (previousDocsDefinition.filesV2 == null) {
                previousDocsDefinition.filesV2 = {};
            }

            const fileIdsMap = new Map(
                Object.entries(previousDocsDefinition.filesV2).map(([id, file]) => {
                    const path = "/" + file.url.replace("/_local/", "");
                    return [AbsoluteFilePath.of(path), id];
                })
            );

            for (const filepath of filepaths) {
                if (!fileIdsMap.has(filepath)) {
                    const fileId = FdrAPI.FileId(uuidv4());
                    previousDocsDefinition.filesV2[fileId] = {
                        type: "url",
                        url: FernNavigation.Url(`/_local${convertToFernHostAbsoluteFilePath(filepath)}`)
                    };
                    fileIdsMap.set(filepath, fileId);
                }
            }

            // Then replace image paths with file IDs
            let finalMarkdown = replaceImagePathsAndUrls(
                markdownWithAbsPaths,
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
            return {
                docsDefinition: previousDocsDefinition,
                dynamicIRsByAPI: {}
            };
        }
    }

    const ossWorkspaces = await filterOssWorkspaces(project);

    const useDynamicSnippets = docsWorkspace.config.experimental?.dynamicSnippets;
    const apiCollector = new ReferencedAPICollector(context, useDynamicSnippets, project.config.organization);
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
        targetAudiences: undefined
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
        docsDefinition: {
            apis: apiCollector.getAPIsForDefinition(),
            apisV2: apiCollectorV2.getAPIsForDefinition(),
            config: readDocsConfig,
            files: {},
            filesV2,
            pages: dbDocsDefinition.pages,
            jsFiles: dbDocsDefinition.jsFiles,
            id: undefined
        },
        dynamicIRsByAPI: apiCollector.getDynamicIRsByAPI()
    };
}

type APIDefinitionID = string;

class ReferencedAPICollector {
    private readonly apis: Record<APIDefinitionID, APIV1Read.ApiDefinition> = {};
    private readonly dynamicIRsByAPI: Record<string, Record<string, APIV1Write.DynamicIr>> = {};

    constructor(
        private readonly context: TaskContext,
        private readonly useDynamicSnippets?: boolean,
        private readonly organization?: string
    ) {}

    public async addReferencedAPI({
        ir,
        snippetsConfig,
        playgroundConfig,
        workspace
    }: {
        ir: IntermediateRepresentation;
        snippetsConfig: APIV1Write.SnippetsConfig;
        playgroundConfig?: { oauth?: boolean };
        workspace?: FernWorkspace;
    }): Promise<APIDefinitionID> {
        try {
            const id = uuidv4();

            let snippetHolder = new SDKSnippetHolder({
                snippetsConfigWithSdkId: {},
                snippetsBySdkId: {},
                snippetTemplatesByEndpoint: {},
                snippetTemplatesByEndpointId: {},
                snippetsBySdkIdAndEndpointId: {}
            });

            if (this.useDynamicSnippets && workspace && this.organization) {
                try {
                    const dynamicIRsByLanguage = await generateLanguageSpecificDynamicIRs({
                        workspace,
                        organization: this.organization,
                        context: this.context,
                        snippetsConfig
                    });

                    if (dynamicIRsByLanguage) {
                        this.context.logger.debug(
                            `Generated dynamic IRs for ${Object.keys(dynamicIRsByLanguage).length} languages`
                        );
                        const workspaceName = workspace.workspaceName ?? "default";
                        this.dynamicIRsByAPI[workspaceName] = dynamicIRsByLanguage;
                    }
                } catch (error) {
                    this.context.logger.debug(
                        `Failed to generate dynamic IRs: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            }

            const dbApiDefinition = convertAPIDefinitionToDb(
                convertIrToFdrApi({ ir, snippetsConfig, playgroundConfig, context: this.context }),
                FdrAPI.ApiDefinitionId(id),
                snippetHolder
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

    public getDynamicIRsByAPI(): Record<string, Record<string, FdrAPI.api.v1.register.DynamicIr>> {
        return this.dynamicIRsByAPI;
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
