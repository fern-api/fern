import { extractErrorMessage } from "@fern-api/core-utils";
import { wrapWithHttps } from "@fern-api/docs-resolver";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { runExeca } from "@fern-api/logging-execa";
import { Project } from "@fern-api/project-loader";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { readFile, rm } from "fs/promises";
import http from "http";
import net from "net";
import { createDocsPreviewWatcher } from "../createDocsPreviewWatcher.js";
import { downloadBundle, getPathToBundleFolder, getPathToPreviewFolder } from "../downloadLocalDocsBundle.js";
import { getExternalDocsWatchPaths } from "../getExternalDocsWatchPaths.js";
import { getPreviewDocsDefinition, PreviewDocsResult } from "../previewDocs.js";
import { isContentOnlyEdit } from "../reloadUtils.js";
import { SnippetDependencyTracker } from "../SnippetDependencyTracker.js";
import { buildAstroPreviewModel } from "./buildAstroPreviewModel.js";
import { LocalLedgerMirror } from "./LocalLedgerMirror.js";

const RELOAD_DEBOUNCE_MS = 500;
const RENDERER_READY_TIMEOUT_MS = 60_000;
const SHUTDOWN_SIGNALS = ["SIGTERM", "SIGINT", "SIGHUP"] as const;
/** Written by fern-platform's `make-local-bundle` next to the renderer. */
const BUNDLE_MANIFEST_FILENAME = "fern-local-bundle.json";
const DEFAULT_RENDERER_ENTRY = "dist/server/entry.mjs";
/** The renderer scopes every request to this header (fern-platform `HEADER_X_FERN_HOST`). */
const X_FERN_HOST_HEADER = "x-fern-host";
/** The renderer's purge route: drops its site + render caches for the `x-fern-host`. */
const RENDERER_INVALIDATE_PATH = "/api/fern-docs/invalidate";
/** Browser live-reload: the proxy injects a listener into HTML and emits here after a reload. */
const RELOAD_EVENTS_PATH = "/__fern/reload-events";
const RELOAD_SCRIPT = `<script>(function(){var s=new EventSource(${JSON.stringify(RELOAD_EVENTS_PATH)});s.onmessage=function(){location.reload()};s.onerror=function(){s.close();setTimeout(function(){location.reload()},1500)}})();</script>`;

interface AstroBundle {
    root: AbsoluteFilePath;
    entry: AbsoluteFilePath;
}

/**
 * `fern docs dev --astro`: renders the docs to the ledger read model the Astro
 * app consumes in production, serves it from a loopback mirror, and runs the
 * prebuilt Astro preview-SSR renderer (downloaded from S3 and cached like the
 * Next bundle) against it. A loopback proxy on `port` stamps the `x-fern-host`
 * the renderer scopes requests by and injects a live-reload listener into HTML.
 * Reloads rebuild the model, purge the renderer, and reload the browser; a
 * failed reload keeps serving the last successful model.
 */
export async function runAstroPreviewServer({
    initialProject,
    reloadProject,
    validateProject,
    context,
    port,
    bundlePath,
    backendPort,
    forceDownload = false,
    cacheDir
}: {
    initialProject: Project;
    reloadProject: () => Promise<Project>;
    validateProject: (project: Project) => Promise<void>;
    context: TaskContext;
    port: number;
    bundlePath?: string;
    backendPort: number;
    forceDownload?: boolean;
    cacheDir?: AbsoluteFilePath;
}): Promise<void> {
    const docsWorkspace = initialProject.docsWorkspaces;
    if (docsWorkspace == null) {
        return context.failAndThrow("No docs workspace found. Add a docs.yml to your fern folder.");
    }
    const bundle = await resolveAstroBundle({ bundlePath, forceDownload, cacheDir, context });

    const instance = new URL(wrapWithHttps(docsWorkspace.config.instances[0]?.url ?? `http://localhost:${port}`));
    const domain = instance.host;
    const basepath = instance.pathname.replace(/\/+$/, "");
    const orgId = initialProject.config.organization;
    // The renderer only accepts generated preview hosts (`<org>-preview-<id>.docs…`).
    const rendererHost = `${orgId.toLowerCase()}-preview-local.docs.buildwithfern.com`;
    const absoluteFilePathToFern = dirname(initialProject.config._absolutePath);

    const mirror = new LocalLedgerMirror();
    await mirror.listen(backendPort);
    const mirrorEndpoint = `http://127.0.0.1:${backendPort}`;
    context.logger.debug(`Ledger mirror listening on ${mirrorEndpoint}`);

    let project = initialProject;
    let previewResult: PreviewDocsResult | undefined;
    const snippetTracker = new SnippetDependencyTracker(context);
    await snippetTracker.buildDependencyMap(project);

    const reloadDocsDefinition = async (editedAbsoluteFilepaths?: AbsoluteFilePath[]): Promise<boolean> => {
        context.logger.info("Reloading docs...");
        const startTime = Date.now();
        try {
            if (isContentOnlyEdit(editedAbsoluteFilepaths)) {
                await snippetTracker.updateDependencyMapForFiles(editedAbsoluteFilepaths ?? [], project);
            } else {
                project = await reloadProject();
                await snippetTracker.buildDependencyMap(project);
                void validateProject(project).catch((err) => {
                    context.logger.error(`Validation failed: ${extractErrorMessage(err)}`);
                });
            }

            const newPreviewResult = await getPreviewDocsDefinition({
                domain: `${instance.host}${instance.pathname}`,
                project,
                context,
                previousDocsDefinition: previewResult?.docsDefinition,
                editedAbsoluteFilepaths,
                previousPreviewResult: previewResult
            });
            const model = await buildAstroPreviewModel({
                previewResult: newPreviewResult,
                orgId,
                domain,
                basepath,
                substituteEnvVars: project.docsWorkspaces?.config.settings?.substituteEnvVars ?? false,
                context
            });

            previewResult = newPreviewResult;
            mirror.replaceModel(model);
            context.logger.info(`Reload completed in ${Date.now() - startTime}ms`);
            return true;
        } catch (err) {
            if (mirror.getModel() == null) {
                context.logger.error("Failed to read docs configuration. Rendering blank page.");
            } else {
                context.logger.error("Failed to read docs configuration. Rendering last successful configuration.");
            }
            context.logger.error(extractErrorMessage(err));
            if (err instanceof Error && err.stack != null) {
                context.logger.debug(`Stack Trace:\n${err.stack}`);
            }
            return false;
        }
    };

    await reloadDocsDefinition();

    const additionalFilepaths = project.apiWorkspaces.flatMap((workspace) => workspace.getAbsoluteFilePaths());
    if (previewResult != null) {
        additionalFilepaths.push(
            ...getExternalDocsWatchPaths(
                absoluteFilePathToFern,
                previewResult.docsDefinition,
                project.docsWorkspaces?.config._absoluteFilepathsToRedirectsFiles
            )
        );
    }
    const watcher = await createDocsPreviewWatcher({ absoluteFilePathToFern, additionalFilepaths, context });

    const rendererPort = await getFreePort();
    const rendererProcess = runExeca(context.logger, process.execPath, [bundle.entry], {
        cwd: bundle.root,
        env: {
            ...process.env,
            HOST: "127.0.0.1",
            PORT: rendererPort.toString(),
            NODE_ENV: "production",
            // Same contract as fern-platform's scripts/preview-ssr/entrypoint.sh, with the
            // CLI's mirror standing in for the credentialed mirror proxy.
            FERN_PREVIEW_SSR: "true",
            PROD_MODE_OVERRIDE: "true",
            LOCAL_MODE_OVERRIDE: "true",
            NEXT_PUBLIC_IS_LOCAL: "1",
            MIRROR_MODE: "true",
            MIRROR_ENDPOINT: mirrorEndpoint,
            MIRROR_FILES_ENDPOINT: `${mirrorEndpoint}/files`,
            EDGE_CONFIG: `${mirrorEndpoint}/edge-config`,
            DISABLE_FILE_MIRRORING: "true",
            DISABLE_IMAGE_OPTIMIZATION: "true",
            MIRROR_ALLOW_ASSET_MISS: "true",
            NEXT_PUBLIC_DOCS_DOMAIN: domain,
            SITE_DOMAIN: domain,
            SITE_BASEPATH: basepath
        },
        doNotPipeOutput: true
    });
    rendererProcess.stdout?.on("data", (data: Buffer) => context.logger.debug(`[Astro] ${data.toString().trimEnd()}`));
    rendererProcess.stderr?.on("data", (data: Buffer) => context.logger.debug(`[Astro] ${data.toString().trimEnd()}`));

    const reloadClients = new Set<http.ServerResponse>();
    const proxy = createFrontProxy({ rendererPort, rendererHost, reloadClients });

    let cleanedUp = false;
    let rejectRun: (err: Error) => void = () => undefined;
    const runUntilShutdown = new Promise<void>((_resolve, reject) => {
        rejectRun = reject;
    });
    const onSignal = (): void => {
        context.logger.debug("Shutting down server...");
        cleanup();
    };
    const cleanup = (): void => {
        if (cleanedUp) {
            return;
        }
        cleanedUp = true;
        for (const signal of SHUTDOWN_SIGNALS) {
            process.off(signal, onSignal);
        }
        process.off("exit", cleanup);
        void watcher.close();
        void mirror.close();
        for (const client of reloadClients) {
            client.end();
        }
        proxy.close();
        if (!rendererProcess.killed) {
            rendererProcess.kill();
            setTimeout(() => {
                if (!rendererProcess.killed) {
                    rendererProcess.kill("SIGKILL");
                }
            }, 2000).unref();
        }
    };
    for (const signal of SHUTDOWN_SIGNALS) {
        process.on(signal, onSignal);
    }
    process.on("exit", cleanup);

    void rendererProcess.on("exit", (code, signal) => {
        if (cleanedUp) {
            return;
        }
        cleanup();
        rejectRun(
            new CliError({
                message:
                    `Astro preview server exited unexpectedly (${code != null ? `code ${code}` : `signal ${signal}`}). ` +
                    "Run with --log-level debug for its output.",
                code: CliError.Code.EnvironmentError
            })
        );
    });

    try {
        await waitForPort(rendererPort, rendererProcess, RENDERER_READY_TIMEOUT_MS);
        await new Promise<void>((resolve, reject) => {
            proxy.once("error", reject);
            proxy.listen(port, () => resolve());
        });
    } catch (err) {
        cleanup();
        context.failAndThrow(`Astro preview server failed to start: ${extractErrorMessage(err)}`, undefined, {
            code: CliError.Code.EnvironmentError
        });
    }

    const notifyRenderer = async (): Promise<void> => {
        try {
            const response = await fetch(`http://127.0.0.1:${rendererPort}${RENDERER_INVALIDATE_PATH}`, {
                method: "POST",
                headers: { [X_FERN_HOST_HEADER]: rendererHost }
            });
            if (!response.ok) {
                context.logger.warn(`Astro invalidate endpoint returned ${response.status}`);
            }
        } catch (err) {
            context.logger.warn(`Failed to notify Astro of reload: ${extractErrorMessage(err)}`);
        }
        for (const client of reloadClients) {
            client.write("data: reload\n\n");
        }
    };

    const editedAbsoluteFilepaths: AbsoluteFilePath[] = [];
    let reloadTimer: NodeJS.Timeout | undefined;
    let isReloading = false;
    watcher.on("all", (event: string, targetPath: string) => {
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
                try {
                    const filesToReload = snippetTracker.getFilesToReload(editedAbsoluteFilepaths);
                    if (await reloadDocsDefinition(filesToReload)) {
                        await notifyRenderer();
                    }
                } finally {
                    editedAbsoluteFilepaths.length = 0;
                    isReloading = false;
                }
            })();
        }, RELOAD_DEBOUNCE_MS);
    });

    context.logger.info(`Docs preview server (Astro) ready on http://localhost:${port}${basepath}`);

    await runUntilShutdown;
}

/**
 * Locates the prebuilt renderer: an explicit `--bundle-path` (a directory holding
 * `fern-local-bundle.json` or `dist/server/entry.mjs`), else the S3 bundle,
 * downloaded through the same cache/ETag flow as the Next app bundle.
 */
async function resolveAstroBundle({
    bundlePath,
    forceDownload,
    cacheDir,
    context
}: {
    bundlePath: string | undefined;
    forceDownload: boolean;
    cacheDir: AbsoluteFilePath | undefined;
    context: TaskContext;
}): Promise<AstroBundle> {
    if (bundlePath != null) {
        context.logger.info(`Using Astro bundle from path: ${bundlePath}`);
        return await readBundle(AbsoluteFilePath.of(bundlePath));
    }

    if (forceDownload) {
        const previewFolder = getPathToPreviewFolder({ astro: true, cacheDir });
        if (await doesPathExist(previewFolder)) {
            context.logger.info("Force download requested. Deleting cached Astro bundle...");
            await rm(previewFolder, { recursive: true });
        }
    }

    const bucketUrl = process.env.APP_DOCS_ASTRO_PREVIEW_BUCKET;
    if (bucketUrl == null) {
        throw new CliError({
            message: "Failed to connect to the docs preview server. Please contact support@buildwithfern.com",
            code: CliError.Code.InternalError
        });
    }
    const bundleFolder = getPathToBundleFolder({ astro: true, cacheDir });
    const result = await downloadBundle({
        bucketUrl,
        logger: context.logger,
        preferCached: true,
        astro: true,
        tryTar: true,
        cacheDir
    });
    if (result.type === "failure") {
        if (await doesPathExist(bundleFolder)) {
            context.logger.warn("Falling back to cached Astro bundle...");
        } else {
            throw new CliError({
                message:
                    "Failed to download the Astro docs preview bundle. Please reach out to support@buildwithfern.com.",
                code: CliError.Code.NetworkError
            });
        }
    }
    return await readBundle(bundleFolder);
}

async function readBundle(root: AbsoluteFilePath): Promise<AstroBundle> {
    const manifestPath = join(root, RelativeFilePath.of(BUNDLE_MANIFEST_FILENAME));
    let entry = DEFAULT_RENDERER_ENTRY;
    if (await doesPathExist(manifestPath)) {
        const manifest = JSON.parse(await readFile(manifestPath, "utf-8")) as { entry?: string };
        if (typeof manifest.entry === "string") {
            entry = manifest.entry;
        }
    }
    const entryPath = join(root, RelativeFilePath.of(entry));
    if (!(await doesPathExist(entryPath))) {
        throw new CliError({
            message: `${root} does not contain the Astro preview server (missing ${entry}).`,
            code: CliError.Code.UserError
        });
    }
    return { root, entry: entryPath };
}

/**
 * Loopback proxy in front of the renderer. Adds `x-fern-host`, serves the
 * live-reload event stream, and appends the reload listener to HTML responses.
 */
function createFrontProxy({
    rendererPort,
    rendererHost,
    reloadClients
}: {
    rendererPort: number;
    rendererHost: string;
    reloadClients: Set<http.ServerResponse>;
}): http.Server {
    return http.createServer((req, res) => {
        if (req.url === RELOAD_EVENTS_PATH) {
            res.writeHead(200, {
                "content-type": "text/event-stream",
                "cache-control": "no-store",
                connection: "keep-alive"
            });
            res.write(": connected\n\n");
            reloadClients.add(res);
            req.on("close", () => reloadClients.delete(res));
            return;
        }

        const upstream = http.request(
            {
                host: "127.0.0.1",
                port: rendererPort,
                method: req.method,
                path: req.url,
                headers: { ...req.headers, [X_FERN_HOST_HEADER]: rendererHost }
            },
            (upstreamRes) => {
                const headers = { ...upstreamRes.headers };
                const isHtml =
                    (headers["content-type"] ?? "").includes("text/html") && headers["content-encoding"] == null;
                if (!isHtml) {
                    res.writeHead(upstreamRes.statusCode ?? 502, headers);
                    upstreamRes.pipe(res);
                    return;
                }
                const chunks: Buffer[] = [];
                upstreamRes.on("data", (chunk: Buffer) => chunks.push(chunk));
                upstreamRes.on("end", () => {
                    const html = Buffer.concat(chunks).toString("utf-8");
                    const closeBody = html.lastIndexOf("</body>");
                    const injected =
                        closeBody >= 0
                            ? `${html.slice(0, closeBody)}${RELOAD_SCRIPT}${html.slice(closeBody)}`
                            : `${html}${RELOAD_SCRIPT}`;
                    const body = Buffer.from(injected, "utf-8");
                    delete headers["transfer-encoding"];
                    headers["content-length"] = body.byteLength.toString();
                    res.writeHead(upstreamRes.statusCode ?? 502, headers);
                    res.end(body);
                });
                upstreamRes.on("error", () => res.destroy());
            }
        );
        upstream.on("error", (err) => {
            if (!res.headersSent) {
                res.writeHead(502, { "content-type": "text/plain" });
            }
            res.end(`Astro preview server unavailable: ${err.message}\n`);
        });
        req.pipe(upstream);
    });
}

function getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            const port = typeof address === "object" && address != null ? address.port : undefined;
            server.close(() => (port != null ? resolve(port) : reject(new Error("could not allocate a port"))));
        });
    });
}

function waitForPort(port: number, child: ReturnType<typeof runExeca>, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve, reject) => {
        let exited = false;
        void child.on("exit", (code) => {
            exited = true;
            reject(new Error(`Astro preview server exited with code ${code} before becoming ready`));
        });
        const attempt = (): void => {
            if (exited) {
                return;
            }
            if (Date.now() > deadline) {
                reject(new Error("timed out waiting for the Astro preview server to become ready"));
                return;
            }
            const socket = net.connect(port, "127.0.0.1");
            socket.once("connect", () => {
                socket.destroy();
                resolve();
            });
            socket.once("error", () => {
                socket.destroy();
                setTimeout(attempt, 200);
            });
        };
        attempt();
    });
}
