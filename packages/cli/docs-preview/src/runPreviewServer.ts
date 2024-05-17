import { wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsV2Read } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import cors from "cors";
import express from "express";
import http from "http";
import { debounce } from "lodash-es";
import path from "path";
import Watcher from "watcher";
import { WebSocketServer, type WebSocket } from "ws";
import { downloadBundle, getPathToBundleFolder } from "./downloadLocalDocsBundle";
import { getPreviewDocsDefinition } from "./previewDocs";

const debouncedGetPreviewDocsDefinition = debounce(getPreviewDocsDefinition, 300, {
    leading: false,
    trailing: true
});

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

    await downloadBundle({ bucketUrl: url, logger: context.logger, preferCached: true });

    const app = express();
    const httpServer = http.createServer(app);
    const wss = new WebSocketServer({ server: httpServer });

    const connections = new Set<WebSocket>();

    wss.on("connection", function connection(ws) {
        connections.add(ws);

        ws.on("close", function close() {
            connections.delete(ws);
        });
    });

    app.use(cors());

    const instance = new URL(wrapWithHttps(docsWorkspace.config.instances[0]?.url ?? "localhost:3000"));

    let docsDefinition = getPreviewDocsDefinition({
        domain: instance.host,
        docsWorkspace,
        apiWorkspaces,
        context
    });

    const watcher = new Watcher(docsWorkspace.absoluteFilepath, { recursive: true, ignoreInitial: true });
    watcher.on("all", (_event: string, targetPath: string, _targetPathNext: string) => {
        context.logger.info(`File ${targetPath} has changed. Reloading...`);
        const promise = debouncedGetPreviewDocsDefinition({
            domain: instance.host,
            docsWorkspace,
            apiWorkspaces,
            context
        });
        if (promise != null) {
            docsDefinition = promise;
        }
    });

    app.post("/v2/registry/docs/load-with-url", async (_, res) => {
        const definition = await docsDefinition;
        const response: DocsV2Read.LoadDocsForUrlResponse = {
            baseUrl: {
                domain: instance.host,
                basePath: instance.pathname
            },
            definition,
            lightModeEnabled: definition.config.colorsV3?.type !== "dark"
        };
        res.send(response);
    });

    app.get(/^\/_local\/(.*)/, (req, res) => {
        return res.sendFile(`/${req.params[0]}`);
    });

    app.get("/", (req, _res, next) => {
        if (req.headers.upgrade === "websocket") {
            return wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
                wss.emit("connection", ws, req);
            });
        }
        return next();
    });

    app.use("/_next", express.static(path.join(getPathToBundleFolder(), "/_next")));

    app.use("*", async (_req, res) => {
        return res.sendFile(path.join(getPathToBundleFolder(), "/[[...slug]].html"));
    });

    app.listen(3000);

    context.logger.info("Running server on http://localhost:3000");

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
