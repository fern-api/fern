import { DocsV2Read } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import cors from "cors";
import express from "express";
import path from "path";
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
    const url = process.env.DOCS_PREVIEW_BUCKET;
    if (url == null) {
        context.failAndThrow("Failed to connect to the docs preview server. Please contact support@buildwithfern.com");
        return;
    }
    await maybeDownloadDocsUI({ bucketUrl: url });

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

    app.use("/_next", express.static(path.join(__dirname, "out/_next")));

    app.use("*", async (_req, res) => {
        return res.sendFile(path.join(__dirname, "out/[[...slug]].html"));
    });

    context.logger.info("Running server on http://localhost:3000");

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
