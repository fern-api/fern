import { DocsV1Write } from "@fern-api/fdr-sdk";
import { DocsDefinitionResolver } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

export async function testFernDocsResolver({
    domain,
    docsWorkspace,
    fernWorkspaces,
    context
}: {
    domain: string;
    docsWorkspace: DocsWorkspace;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
}): Promise<DocsV1Write.DocsDefinition> {
    const resolver = new DocsDefinitionResolver(
        domain,
        docsWorkspace,
        fernWorkspaces,
        context,
        undefined,
        async (files) => files.map((file) => ({ ...file, fileId: UUID })),
        async ({ ir }) => ir.apiName.originalName
    );
    return resolver.resolve();
}
