import { DocsV2Read } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import cors from "cors";
import express from "express";
import http from "http";
import next from "next";
import WebSocket from "ws";
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

    // http server links the express server to the next.js server and allows for websocket connections
    const httpServer = http.createServer(app);

    const nextApp = next({
        dev: true,
        hostname: "localhost",
        // TODO: make port configurable, and automatically find an open port
        port: 3000,
        httpServer,
        conf: {
            env: {
                PORT: "3000"
            }
        },
        dir: "/Volumes/git/fern-platform/packages/ui/local-preview-bundle"
    });

    // prepare the next.js server
    await nextApp.prepare();

    // prepare the websocket server
    const wss = new WebSocket.Server({ server: httpServer });
    wss.on("connection", (ws) => {
        console.log("connected");
    });

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

    app.get("*", (req, res) => {
        if (req.headers.upgrade === "websocket") {
            return wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
                wss.emit("connection", ws, req);
            });
        }
        const handler = nextApp.getRequestHandler();
        return handler(req, res);
    });

    app.listen(3000);

    context.logger.info("Running server on https://localhost:3000");

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
