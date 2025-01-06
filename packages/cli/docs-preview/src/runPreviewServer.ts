import chalk from "chalk";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import Watcher from "watcher";
import { type WebSocket, WebSocketServer } from "ws";

import { wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsV1Read, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";

import { downloadBundle, getPathToBundleFolder } from "./downloadLocalDocsBundle";
import { getPreviewDocsDefinition } from "./previewDocs";

const EMPTY_DOCS_DEFINITION: DocsV1Read.DocsDefinition = {
    pages: {},
    apis: {},
    files: {},
    filesV2: {},
    config: {
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
            await downloadBundle({ bucketUrl: url, logger: context.logger, preferCached: true });
        } catch (err) {
            const pathToBundle = getPathToBundleFolder();
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

    const reloadDocsDefinition = async () => {
        context.logger.info("Reloading docs...");
        const startTime = Date.now();
        try {
            project = await reloadProject();
            context.logger.info("Validating docs...");
            await validateProject(project);
            const newDocsDefinition = await getPreviewDocsDefinition({
                domain: `${instance.host}${instance.pathname}`,
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
            if (err instanceof Error) {
                context.logger.error(err.message);
                if (err instanceof Error && err.stack) {
                    context.logger.debug(`Stack Trace:\n${err.stack}`);
                }
            }
            return docsDefinition;
        }
    };

    // initialize docs definition
    docsDefinition = await reloadDocsDefinition();

    const additionalFilepaths = project.apiWorkspaces.flatMap((workspace) => workspace.getAbsoluteFilePaths());
    const bundleRoot = bundlePath ? AbsoluteFilePath.of(path.resolve(bundlePath)) : getPathToBundleFolder();

    const watcher = new Watcher([absoluteFilePathToFern, ...additionalFilepaths], {
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
                lightModeEnabled: definition.config.colorsV3?.type !== "dark",
                orgId: FernNavigation.OrgId(initialProject.config.organization)
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

    app.use("/_next", express.static(path.join(bundleRoot, "/_next")));

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.use("*", async (_req, res) => {
        return res.sendFile(path.join(bundleRoot, "/[[...slug]].html"));
    });

    app.listen(port);

    context.logger.info(`Running server on http://localhost:${port}`);

    // await infiinitely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
}
