import { v4 as uuidv4 } from "uuid";

import { DocsDefinitionResolver, filterOssWorkspaces } from "@fern-api/docs-resolver";
import {
    APIV1Read,
    APIV1Write,
    DocsV1Read,
    FdrAPI,
    FernNavigation,
    SDKSnippetHolder,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    convertDbDocsConfigToRead,
    convertDocsDefinitionToDb
} from "@fern-api/fdr-sdk";
import { convertToFernHostAbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { Project } from "@fern-api/project-loader";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";

import { parseDocsConfiguration } from "../../configuration-loader/src/docs-yml/parseDocsConfiguration";

export async function getPreviewDocsDefinition({
    domain,
    project,
    context
}: {
    domain: string;
    project: Project;
    context: TaskContext;
}): Promise<DocsV1Read.DocsDefinition> {
    const docsWorkspace = project.docsWorkspaces;
    const apiWorkspaces = project.apiWorkspaces;
    if (docsWorkspace == null) {
        throw new Error("No docs workspace found in project");
    }

    const fernWorkspaces = await Promise.all(
        apiWorkspaces.map(
            async (workspace) =>
                await workspace.toFernWorkspace(
                    { context },
                    { enableUniqueErrorsPerEndpoint: true, detectGlobalHeaders: false, preserveSchemaIds: true }
                )
        )
    );

    const ossWorkspaces = await filterOssWorkspaces(project);

    const apiCollector = new ReferencedAPICollector(context);
    const apiCollectorV2 = new ReferencedAPICollectorV2(context);

    const filesV2: Record<string, DocsV1Read.File_> = {};

    const parsedDocsConfig = await parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
    });

    const resolver = new DocsDefinitionResolver(
        domain,
        docsWorkspace,
        ossWorkspaces,
        fernWorkspaces,
        context,
        undefined,
        async (files) =>
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
        async (opts) => apiCollector.addReferencedAPI(opts),
        async (opts) => apiCollectorV2.addReferencedAPI(opts)
    );

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
        search: { type: "legacyMultiAlgoliaIndex", algoliaIndex: undefined },
        algoliaSearchIndex: undefined,
        jsFiles: undefined,
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
                convertIrToFdrApi({ ir, snippetsConfig, playgroundConfig }),
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
                "An error occured while trying to read an API definition. Please reach out to support."
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

    public addReferencedAPI({ api }: { api: FdrAPI.api.latest.ApiDefinition }): APIDefinitionID {
        try {
            this.apis[api.id] = api;
            return api.id;
        } catch (e) {
            // Print Error
            const err = e as Error;
            this.context.logger.debug(`Failed to read referenced API: ${err?.message} ${err?.stack}`);
            this.context.logger.error(
                "An error occured while trying to read an API definition. Please reach out to support."
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
