import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import express from "express";
import { previewDocs } from "./previewDocs";

export async function runPreviewServer({
    docsWorkspace,
    context,
}: {
    docsWorkspace: DocsWorkspace;
    context: TaskContext;
}): Promise<void> {
    const app = express();

    const docsDefinition = await previewDocs({
        docsWorkspace,
        context,
    });

    app.post("/docs/preview/load", async (_, res) => {
        res.send(docsDefinition);
    });

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
