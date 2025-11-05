import { wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsV1Read, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import Watcher from "watcher";
import { type WebSocket, WebSocketServer } from "ws";

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
        languages: undefined,
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
        settings: undefined,
        typographyV2: undefined,
        analyticsConfig: undefined,
        integrations: undefined,
        css: undefined,
        js: undefined,
        pageActions: undefined,
        theme: undefined
    },
    jsFiles: undefined,
    id: undefined
};

export async function runPreviewServer({
    initialProject,
    reloadProject,
    validateProject,
    context,
    port,
    bundlePath
}: {
    initialProject: Project;
    reloadProject: () => Promise<Project>;
    validateProject: (project: Project) => Promise<void>;
    context: TaskContext;
    port: number;
    bundlePath?: string;
}): Promise<void> {
    if (bundlePath != null) {
        context.logger.info(`Using bundle from path: ${bundlePath}`);
    } else {
        try {
            const url = process.env.DOCS_PREVIEW_BUCKET;
            if (url == null) {
                throw new Error(
                    "Failed to connect to the docs preview server. Please contact support@buildwithfern.com"
                );
            }
            await downloadBundle({ bucketUrl: url, logger: context.logger, preferCached: true, tryTar: false });
        } catch (err) {
            const pathToBundle = getPathToBundleFolder({});
            if (err instanceof Error) {
                context.logger.debug(`Failed to download latest docs bundle: ${(err as Error).message}`);
            }
            if (await doesPathExist(pathToBundle)) {
                context.logger.warn("Falling back to cached bundle...");
            } else {
                context.logger.warn("Please reach out to support@buildwithfern.com.");
                return;
            }
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
            const result = await getPreviewDocsDefinition({
                domain: `${instance.host}${instance.pathname}`,
                project,
                context,
                previousDocsDefinition: docsDefinition,
                editedAbsoluteFilepaths
            });
            context.logger.info(`Reload completed in ${Date.now() - startTime}ms`);
            return result;
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
            return { docsDefinition, dynamicIRsByAPI: {} };
        }
    };

    // initialize docs definition
    const initialResult = await reloadDocsDefinition();
    docsDefinition = initialResult.docsDefinition;

    const additionalFilepaths = project.apiWorkspaces.flatMap((workspace) => workspace.getAbsoluteFilePaths());
    const bundleRoot = bundlePath ? AbsoluteFilePath.of(path.resolve(bundlePath)) : getPathToBundleFolder({});

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

        // Don't schedule another reload if one is in progress
        if (isReloading) {
            return;
        }

        editedAbsoluteFilepaths.push(AbsoluteFilePath.of(targetPath));

        // Clear any existing timer
        if (reloadTimer != null) {
            clearTimeout(reloadTimer);
        }

        // Set up new timer
        reloadTimer = setTimeout(() => {
            void (async () => {
                isReloading = true;
                sendData({
                    version: 1,
                    type: "startReload"
                });

                const reloadedResult = await reloadDocsDefinition(editedAbsoluteFilepaths);
                if (reloadedResult != null) {
                    docsDefinition = reloadedResult.docsDefinition;
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
        const requestedPath = `/${req.params[0]}`;

        // Build a set of allowed file paths from the docs definition
        const allowedPaths = new Set<string>();
        if (docsDefinition?.filesV2) {
            for (const file of Object.values(docsDefinition.filesV2)) {
                if (file.type === "url") {
                    const urlPath = file.url.replace(/^\/_local/, "");
                    allowedPaths.add(urlPath);
                }
            }
        }

        if (!allowedPaths.has(requestedPath)) {
            context.logger.warn(`Blocked unauthorized file access attempt: ${requestedPath}`);
            return res.status(403).send("Access denied");
        }

        return res.sendFile(requestedPath);
    });

    app.get("/", (req, _res, next) => {
        if (req.headers.upgrade === "websocket") {
            return wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
                wss.emit("connection", ws, req);
            });
        }
        return next();
    });

    app.use("/_next", express.static(path.join(bundleRoot, "/_next")));

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.use("*", async (_req, res) => {
        return res.sendFile(path.join(bundleRoot, "/[[...slug]].html"));
    });

    app.listen(port);

    context.logger.info(`Running server on http://localhost:${port}`);

    // await infinitely
    // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
    await new Promise(() => {});
}
