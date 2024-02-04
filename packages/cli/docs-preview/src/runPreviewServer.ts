import { DocsV2Read } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import cors from "cors";
import express from "express";
import { getPreviewDocsDefinition } from "./previewDocs";

export async function runPreviewServer({
    docsWorkspace,
    apiWorkspaces,
    context
}: {
    docsWorkspace: DocsWorkspace;
    apiWorkspaces: APIWorkspace[];
    context: TaskContext;
}): Promise<void> {
    const app = express();
    app.use(cors());

    const docsDefinition = await getPreviewDocsDefinition({
        docsWorkspace,
        apiWorkspaces,
        context
    });
    const response: DocsV2Read.LoadDocsForUrlResponse = {
        baseUrl: {
            domain: "localhost:3000",
            basePath: ""
        },
        definition: docsDefinition,
        lightModeEnabled: docsDefinition.config.colorsV3?.type !== "dark"
    };

    app.post("/v2/registry/docs/load-with-url", async (_, res) => {
        res.send(response);
    });
    app.listen(3000);

    context.logger.info("Running server on https://localhost:3000");

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
