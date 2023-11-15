import { PathResolver } from "@fern-api/fdr-sdk";
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

    const resolver = new PathResolver({
        definition: {
            apis: {},
            docsConfig: docsDefinition.config,
        },
    });
    const slugs = resolver.getAllSlugs();

    app.post("/docs/preview/urls", async (_, res) => {
        res.send(slugs);
    });

    app.listen(3000);

    // await infinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
