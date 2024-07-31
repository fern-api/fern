import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
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
import { Project } from "@fern-api/project-loader";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { v4 as uuidv4 } from "uuid";

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
                    { enableUniqueErrorsPerEndpoint: true, detectGlobalHeaders: false }
                )
        )
    );

    const apiCollector = new ReferencedAPICollector();

    const filesV2: Record<string, DocsV1Read.File_> = {};

    const resolver = new DocsDefinitionResolver(
        domain,
        docsWorkspace,
        fernWorkspaces,
        context,
        undefined,
        async (files) =>
            files.map((file) => {
                const fileId = uuidv4();
                filesV2[fileId] = {
                    type: "url",
                    url: `/_local${file.absoluteFilePath}`
                };
                return {
                    absoluteFilePath: file.absoluteFilePath,
                    relativeFilePath: file.relativeFilePath,
                    fileId
                };
            }),
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
                snippetTemplatesByEndpoint: {},
                snippetTemplatesByEndpointId: {},
                snippetsBySdkIdAndEndpointId: {}
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
