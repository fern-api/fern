import { docsYml } from "@fern-api/configuration";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import {
    APIV1Read,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    convertDbDocsConfigToRead,
    convertDocsDefinitionToDb,
    DocsV1Read,
    FdrAPI,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace, convertOpenApiWorkspaceToFernWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import { v4 as uuidv4 } from "uuid";

export async function getPreviewDocsDefinition({
    docsWorkspace,
    apiWorkspaces,
    context
}: {
    docsWorkspace: DocsWorkspace;
    apiWorkspaces: APIWorkspace[];
    context: TaskContext;
}): Promise<DocsV1Read.DocsDefinition> {
    const fernWorkspaces = await Promise.all(
        apiWorkspaces.map((workspace) =>
            workspace.type === "oss" ? convertOpenApiWorkspaceToFernWorkspace(workspace, context) : workspace
        )
    );

    const resolver = new DocsDefinitionResolver(
        "localhost",
        docsWorkspace,
        fernWorkspaces,
        context,
        undefined,
        async () => [],
        async () => ""
    );

    const writeDocsDefinition = await resolver.resolve();

    const apiCollector = new ReferencedAPICollector(fernWorkspaces, context);
    const dbDocsDefinition = convertDocsDefinitionToDb({
        writeShape: writeDocsDefinition,
        files: {}
    });
    const readDocsConfig = convertDbDocsConfigToRead({
        dbShape: dbDocsDefinition.config
    });

    return {
        apis: await apiCollector.getAPIsForDefinition(),
        config: readDocsConfig,
        files: {},
        filesV2: {},
        pages: dbDocsDefinition.pages,
        search: { type: "legacyMultiAlgoliaIndex" }
    };
}

type APIDefinitionID = string;

class ReferencedAPICollector {
    private readonly apis: Record<APIDefinitionID, docsYml.DocsNavigationItem.ApiSection> = {};

    constructor(private readonly apiWorkspaces: APIWorkspace[], private readonly context: TaskContext) {}

    public addReferencedAPI(api: docsYml.DocsNavigationItem.ApiSection): APIDefinitionID {
        const id = uuidv4();
        this.apis[id] = api;
        return id;
    }

    public async getAPIsForDefinition(): Promise<Promise<Record<FdrAPI.ApiDefinitionId, APIV1Read.ApiDefinition>>> {
        const result: Record<FdrAPI.ApiDefinitionId, APIV1Read.ApiDefinition> = {};
        for (const [id, api] of Object.entries(this.apis)) {
            let workspace = this.apiWorkspaces[0];
            if (api.apiName != null) {
                workspace = this.apiWorkspaces.find((workspace) => workspace.workspaceName);
            }
            if (workspace == null) {
                this.context.logger.error(`Failed to load API workspace ${api.apiName}`);
                continue;
            }
            const fernWorkspace =
                workspace.type === "oss"
                    ? await convertOpenApiWorkspaceToFernWorkspace(workspace, this.context)
                    : workspace;
            const ir = await generateIntermediateRepresentation({
                workspace: fernWorkspace,
                audiences: api.audiences,
                generationLanguage: undefined,
                smartCasing: false,
                disableExamples: false
            });
            const apiDefinition = convertIrToFdrApi({
                ir,
                snippetsConfig: {}
            });
            const dbApiDefinition = convertAPIDefinitionToDb(
                apiDefinition,
                "",
                new SDKSnippetHolder({
                    snippetsConfigWithSdkId: {},
                    snippetsBySdkId: {},
                    snippetTemplatesByEndpoint: {}
                })
            );
            const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);
            result[id] = readApiDefinition;
        }
        return result;
    }
}
