import { wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsV2Read } from "@fern-api/fdr-sdk";
import { dirname } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import Watcher from "watcher";
import { WebSocketServer, type WebSocket } from "ws";
import { downloadBundle, getPathToBundleFolder } from "./downloadLocalDocsBundle";
import { getPreviewDocsDefinition } from "./previewDocs";

export async function runPreviewServer({
    initialProject,
    reloadProject,
    validateProject,
    context,
    port
}: {
    initialProject: Project;
    reloadProject: () => Promise<Project>;
    validateProject: (project: Project) => Promise<void>;
    context: TaskContext;
    port: number;
}): Promise<void> {
    const url = process.env.DOCS_PREVIEW_BUCKET;
    if (url == null) {
        context.failAndThrow("Failed to connect to the docs preview server. Please contact support@buildwithfern.com");
        return;
    }

    await downloadBundle({ bucketUrl: url, logger: context.logger, preferCached: true });
    const absoluteFilePathToFern = dirname(initialProject.config._absolutePath);

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

    const instance = new URL(
        wrapWithHttps(initialProject.docsWorkspaces?.config.instances[0]?.url ?? `localhost:${port}`)
    );

    let project = initialProject;
    let docsDefinition = await getPreviewDocsDefinition({
        domain: instance.host,
        project: initialProject,
        context
    });

    const reloadDocsDefinition = async () => {
        context.logger.info("Reloading docs");
        const startTime = Date.now();
        try {
            project = await reloadProject();
            const newDocsDefinition = await getPreviewDocsDefinition({
                domain: instance.host,
                project,
                context
            });
            context.logger.info(`Reload docs completed in ${Date.now() - startTime}ms`);
            return newDocsDefinition;
        } catch (err) {
            context.logger.error("Failed to reload docs because of validation errors: ");
            await validateProject(project);
            return docsDefinition;
        }
    };

    const watcher = new Watcher(absoluteFilePathToFern, { recursive: true, ignoreInitial: true });
    watcher.on("all", async (event: string, targetPath: string, _targetPathNext: string) => {
        context.logger.debug(chalk.dim(`[${event}] ${targetPath}`));
        // after the docsDefinition is reloaded, send a message to all connected clients to reload the page
        const reloadedDocsDefinition = await reloadDocsDefinition();
        if (reloadedDocsDefinition != null) {
            docsDefinition = reloadedDocsDefinition;
        }
        for (const connection of connections) {
            connection.send(
                JSON.stringify({
                    reload: true
                })
            );
        }
    });

    app.post("/v2/registry/docs/load-with-url", async (_, res) => {
        try {
            const definition = docsDefinition;
            const response: DocsV2Read.LoadDocsForUrlResponse = {
                baseUrl: {
                    domain: instance.host,
                    basePath: instance.pathname
                },
                definition,
                lightModeEnabled: definition.config.colorsV3?.type !== "dark"
            };
            res.send(response);
        } catch (error) {
            context.logger.error("Error loading docs", (error as Error).message);
            res.status(500).send();
        }
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

    app.listen(port);

    context.logger.info(`Running server on http://localhost:${port}`);

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
