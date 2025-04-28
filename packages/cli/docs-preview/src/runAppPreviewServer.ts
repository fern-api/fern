import chalk from "chalk";
import { spawn } from "child_process";
// import { loggingExeca } from "@fern-api/logging-execa";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import Watcher from "watcher";
import { type WebSocket, WebSocketServer } from "ws";

import { wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsV1Read, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
// import { WebSocket } from "ws"
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";

import { downloadBundle, getPathToBundleFolder } from "./downloadLocalDocsBundle";
import { getPreviewDocsDefinition } from "./previewDocs";

const EMPTY_DOCS_DEFINITION: DocsV1Read.DocsDefinition = {
    pages: {},
    apis: {},
    apisV2: {},
    files: {},
    filesV2: {},
    config: {
        aiChatConfig: undefined,
        hideNavLinks: undefined,
        navigation: undefined,
        root: undefined,
        title: undefined,
        defaultLanguage: undefined,
        announcement: undefined,
        navbarLinks: undefined,
        footerLinks: undefined,
        logoHeight: undefined,
        logoHref: undefined,
        favicon: undefined,
        metadata: undefined,
        redirects: undefined,
        colorsV3: undefined,
        layout: undefined,
        typographyV2: undefined,
        analyticsConfig: undefined,
        integrations: undefined,
        css: undefined,
        js: undefined
    },
    search: {
        type: "legacyMultiAlgoliaIndex",
        algoliaIndex: undefined
    },
    algoliaSearchIndex: undefined,
    jsFiles: undefined,
    id: undefined
};

export async function runAppPreviewServer({
    initialProject,
    reloadProject,
    validateProject,
    context,
    port,
    bundlePath,
    backendPort
}: {
    initialProject: Project;
    reloadProject: () => Promise<Project>;
    validateProject: (project: Project) => Promise<void>;
    context: TaskContext;
    port: number;
    bundlePath?: string;
    backendPort: number;
}): Promise<void> {
    if (bundlePath != null) {
        context.logger.info(`Using bundle from path: ${bundlePath}`);
    } else {
        try {
            const url = process.env.APP_DOCS_PREVIEW_BUCKET;
            if (url == null) {
                throw new Error(
                    "Failed to connect to the docs preview server. Please contact support@buildwithfern.com"
                );
            }
            await downloadBundle({ bucketUrl: url, logger: context.logger, preferCached: true, app: true });
        } catch (err) {
            if (err instanceof Error) {
                context.logger.debug(`Failed to download latest docs bundle: ${(err as Error).message}`);
            }
            if (await doesPathExist(getPathToBundleFolder({ app: true }))) {
                context.logger.warn("Falling back to cached bundle...");
            } else {
                context.logger.warn("Please reach out to support@buildwithfern.com.");
                return;
            }
        }
    }

    const bundleRoot = bundlePath || getPathToBundleFolder({ app: true });
    const serverPath = path.join(bundleRoot, "standalone/packages/fern-docs/bundle/server.js");

    const env = {
        ...process.env,
        PORT: port.toString(),
        HOSTNAME: "0.0.0.0",
        NEXT_PUBLIC_FDR_ORIGIN_PORT: backendPort.toString(),
        NEXT_PUBLIC_FDR_ORIGIN: `http://localhost:${backendPort}`,
        NEXT_PUBLIC_DOCS_DOMAIN: initialProject.docsWorkspaces?.config.instances[0]?.url,
        NEXT_PUBLIC_IS_LOCAL: "1",
        NEXT_DISABLE_CACHE: "1",
        NODE_ENV: "production",
        NODE_PATH: bundleRoot
    };

    const serverProcess = spawn("node", [serverPath], {
        env,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"]
    });

    serverProcess.stdout?.on("data", (data) => {
        context.logger.debug(`[Next.js] ${data.toString()}`);
    });

    // some errors from the frontend don't need to be sent to user
    serverProcess.stderr?.on("data", (data) => {
        context.logger.debug(`[Next.js] ${data.toString()}`);
    });

    context.logger.debug(`Next.js standalone server started with PID: ${serverProcess.pid}`);

    serverProcess.on("error", (err) => {
        context.logger.error(`Server process error: ${err.message}`);
    });

    serverProcess.on("exit", (code, signal) => {
        if (code) {
            context.logger.error(`Server process exited with code: ${code}`);
        } else if (signal) {
            context.logger.debug(`Server process killed with signal: ${signal}`);
        } else {
            context.logger.debug("Server process exited");
        }
    });

    const cleanup = () => {
        if (serverProcess.pid) {
            context.logger.debug(`Killing server process with PID: ${serverProcess.pid}`);
            try {
                process.kill(-serverProcess.pid, "SIGTERM");
            } catch (err) {
                context.logger.error(`Failed to kill server process: ${err}`);
            }
        }
    };

    // clean up process
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    context.logger.debug(`Next.js server should now be running on http://localhost:${port}`);

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
        wrapWithHttps(initialProject.docsWorkspaces?.config.instances[0]?.url ?? `http://localhost:${port}`)
    );

    let project = initialProject;
    let docsDefinition: DocsV1Read.DocsDefinition | undefined;

    let reloadTimer: NodeJS.Timeout | null = null;
    let isReloading = false;
    const RELOAD_DEBOUNCE_MS = 1000;

    const reloadDocsDefinition = async (editedAbsoluteFilepaths?: AbsoluteFilePath[]) => {
        context.logger.info("Reloading docs...");
        const startTime = Date.now();
        try {
            project = await reloadProject();
            context.logger.info("Validating docs...");
            await validateProject(project);
            const newDocsDefinition = await getPreviewDocsDefinition({
                domain: `${instance.host}${instance.pathname}`,
                project,
                context,
                previousDocsDefinition: docsDefinition,
                editedAbsoluteFilepaths
            });
            context.logger.info(`Reload completed in ${Date.now() - startTime}ms`);
            return newDocsDefinition;
        } catch (err) {
            if (docsDefinition == null) {
                context.logger.error("Failed to read docs configuration. Rendering blank page.");
            } else {
                context.logger.error("Failed to read docs configuration. Rendering last successful configuration.");
            }
            if (err instanceof Error) {
                context.logger.error(err.message);
                if (err instanceof Error && err.stack) {
                    context.logger.debug(`Stack Trace:\n${err.stack}`);
                }
            }
            return docsDefinition;
        }
    };

    docsDefinition = await reloadDocsDefinition();

    const additionalFilepaths = project.apiWorkspaces.flatMap((workspace) => workspace.getAbsoluteFilePaths());

    const watcher = new Watcher([absoluteFilePathToFern, ...additionalFilepaths], {
        recursive: true,
        ignoreInitial: true,
        debounce: 100,
        renameDetection: true
    });

    const editedAbsoluteFilepaths: AbsoluteFilePath[] = [];

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    watcher.on("all", async (event: string, targetPath: string, _targetPathNext: string) => {
        context.logger.info(chalk.dim(`[${event}] ${targetPath}`));

        if (isReloading) {
            return;
        }

        editedAbsoluteFilepaths.push(AbsoluteFilePath.of(targetPath));

        if (reloadTimer != null) {
            clearTimeout(reloadTimer);
        }

        reloadTimer = setTimeout(() => {
            void (async () => {
                isReloading = true;
                sendData({
                    version: 1,
                    type: "startReload"
                });

                const reloadedDocsDefinition = await reloadDocsDefinition(editedAbsoluteFilepaths);
                if (reloadedDocsDefinition != null) {
                    docsDefinition = reloadedDocsDefinition;
                }

                editedAbsoluteFilepaths.length = 0;

                sendData({
                    version: 1,
                    type: "finishReload"
                });
                isReloading = false;
            })();
        }, RELOAD_DEBOUNCE_MS);
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
                lightModeEnabled: definition.config.colorsV3?.type !== "dark",
                orgId: FernNavigation.OrgId(initialProject.config.organization)
            };
            res.send(response);
        } catch (error) {
            context.logger.error("Stack trace:", (error as Error).stack ?? "");
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

    app.listen(backendPort);
    context.logger.info(chalk.dim(`Backend server running on http://localhost:${backendPort}`));
    context.logger.info(`Development server ready on http://localhost:${port}`);

    // await infinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
