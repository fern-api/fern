import { DocsDefinitionResolver, UploadedFile } from "@fern-api/docs-resolver";
import {
    APIV1Read,
    APIV1Write,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    convertDbDocsConfigToRead,
    convertDocsDefinitionToDb,
    DocsV1Read,
    FdrAPI,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
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

    const apiCollector = new ReferencedAPICollector();

    const filesV2: Record<string, DocsV1Read.File_> = {};

    const resolver = new DocsDefinitionResolver(
        "localhost",
        docsWorkspace,
        fernWorkspaces,
        context,
        undefined,
        async (files) => {
            const toRet: UploadedFile[] = [];
            files.forEach((file) => {
                const fileId = uuidv4();
                toRet.push({
                    absoluteFilePath: file.absoluteFilePath,
                    relativeFilePath: file.relativeFilePath,
                    fileId
                });
                filesV2[fileId] = {
                    type: "url",
                    url: `/_local${file.absoluteFilePath}`
                };
            });
            return toRet;
        },
        async (opts) => apiCollector.addReferencedAPI(opts)
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
        config: readDocsConfig,
        files: {},
        filesV2,
        pages: dbDocsDefinition.pages,
        search: { type: "legacyMultiAlgoliaIndex" }
    };
}

type APIDefinitionID = string;

class ReferencedAPICollector {
    private readonly apis: Record<APIDefinitionID, APIV1Read.ApiDefinition> = {};

    public addReferencedAPI({
        ir,
        snippetsConfig
    }: {
        ir: IntermediateRepresentation;
        snippetsConfig: APIV1Write.SnippetsConfig;
    }): APIDefinitionID {
        const id = uuidv4();

        const apiDefinition = convertIrToFdrApi({ ir, snippetsConfig });

        const dbApiDefinition = convertAPIDefinitionToDb(
            apiDefinition,
            id,
            new SDKSnippetHolder({
                snippetsConfigWithSdkId: {},
                snippetsBySdkId: {},
                snippetTemplatesByEndpoint: {}
            })
        );

        const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);

        this.apis[id] = readApiDefinition;
        return id;
    }

    public getAPIsForDefinition(): Record<FdrAPI.ApiDefinitionId, APIV1Read.ApiDefinition> {
        return this.apis;
    }
}
