import { wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { dirname, doesPathExist } from "@fern-api/fs-utils";
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

const EMPTY_DOCS_DEFINITION: DocsV1Read.DocsDefinition = {
    pages: {},
    apis: {},
    files: {},
    filesV2: {},
    config: {
        navigation: {
            items: []
        }
    },
    search: {
        type: "legacyMultiAlgoliaIndex"
    }
};

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
    try {
        const url = process.env.DOCS_PREVIEW_BUCKET;
        if (url == null) {
            throw new Error("Failed to connect to the docs preview server. Please contact support@buildwithfern.com");
        }
        await downloadBundle({ bucketUrl: url, logger: context.logger, preferCached: true });
    } catch (err) {
        const pathToBundle = getPathToBundleFolder();
        if (await doesPathExist(pathToBundle)) {
            context.logger.warn("Failed to download latest docs application. Falling back to existing bundle.");
        } else {
            context.logger.warn("Failed to download docs application. Please reach out to support@buildwithfern.com.");
            return;
        }
    }

    const absoluteFilePathToFern = dirname(initialProject.config._absolutePath);

    const app = express();
    const httpServer = http.createServer(app);
    const wss = new WebSocketServer({ server: httpServer });

    const connections = new Set<WebSocket>();
    function sendData(data: unknown) {
        for (const connection of connections) {
            connection.send(JSON.stringify(data));
        }
    }

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
    let docsDefinition: DocsV1Read.DocsDefinition | undefined;

    const reloadDocsDefinition = async () => {
        context.logger.info("Reloading docs...");
        const startTime = Date.now();
        try {
            project = await reloadProject();
            context.logger.info("Validating docs...");
            await validateProject(project);
            const newDocsDefinition = await getPreviewDocsDefinition({
                domain: instance.host,
                project,
                context
            });
            context.logger.info(`Reload completed in ${Date.now() - startTime}ms`);
            return newDocsDefinition;
        } catch (err) {
            if (docsDefinition == null) {
                context.logger.error("Failed to read docs configuration. Rendering blank page.");
            } else {
                context.logger.error("Failed to read docs configuration. Rendering last successful configuration.");
            }
            return docsDefinition;
        }
    };

    // initialize docs definition
    docsDefinition = await reloadDocsDefinition();

    const watcher = new Watcher(absoluteFilePathToFern, {
        recursive: true,
        ignoreInitial: true,
        debounce: 1000,
        renameDetection: true
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    watcher.on("all", async (event: string, targetPath: string, _targetPathNext: string) => {
        context.logger.info(chalk.dim(`[${event}] ${targetPath}`));
        sendData({
            version: 1,
            type: "startReload"
        });
        // after the docsDefinition is reloaded, send a message to all connected clients to reload the page
        const reloadedDocsDefinition = await reloadDocsDefinition();
        if (reloadedDocsDefinition != null) {
            docsDefinition = reloadedDocsDefinition;
        }
        sendData({
            version: 1,
            type: "finishReload"
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.post("/v2/registry/docs/load-with-url", async (_, res) => {
        try {
            // set to empty in case docsDefinition is null which happens when the initial docs definition is invalid
            const definition = docsDefinition ?? EMPTY_DOCS_DEFINITION;
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.use("*", async (_req, res) => {
        return res.sendFile(path.join(getPathToBundleFolder(), "/[[...slug]].html"));
    });

    app.listen(port);

    context.logger.info(`Running server on http://localhost:${port}`);

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
