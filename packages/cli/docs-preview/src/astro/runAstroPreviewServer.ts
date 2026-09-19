import { extractErrorMessage } from "@fern-api/core-utils";
import { wrapWithHttps } from "@fern-api/docs-resolver";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { runExeca } from "@fern-api/logging-execa";
import { Project } from "@fern-api/project-loader";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { createDocsPreviewWatcher } from "../createDocsPreviewWatcher.js";
import { getExternalDocsWatchPaths } from "../getExternalDocsWatchPaths.js";
import { getPreviewDocsDefinition, PreviewDocsResult } from "../previewDocs.js";
import { isContentOnlyEdit } from "../reloadUtils.js";
import { SnippetDependencyTracker } from "../SnippetDependencyTracker.js";
import { buildAstroPreviewModel } from "./buildAstroPreviewModel.js";
import { LocalLedgerMirror } from "./LocalLedgerMirror.js";

const RELOAD_DEBOUNCE_MS = 500;
const ASTRO_READY_TIMEOUT_MS = 60_000;
/** Must match `DEV_PREVIEW_RELOAD_PATH` in the Astro `dev-preview-reload` integration. */
const ASTRO_RELOAD_PATH = "/__fern/reload";
export const ASTRO_APP_PATH_ENV = "FERN_DOCS_ASTRO_PATH";
const SHUTDOWN_SIGNALS = ["SIGTERM", "SIGINT", "SIGHUP"] as const;

/**
 * `fern docs dev --astro`: renders the docs to the ledger read model the Astro
 * app consumes in production, serves it from a loopback mirror, and runs the
 * Astro dev server in `MIRROR_MODE` against it. Reloads rebuild the model and
 * POST to Astro's dev reload endpoint; a failed reload keeps serving the last
 * successful model.
 */
export async function runAstroPreviewServer({
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
    const astroAppPath = await resolveAstroAppPath(bundlePath);

    const docsWorkspace = initialProject.docsWorkspaces;
    if (docsWorkspace == null) {
        return context.failAndThrow("No docs workspace found. Add a docs.yml to your fern folder.");
    }
    const instance = new URL(wrapWithHttps(docsWorkspace.config.instances[0]?.url ?? `http://localhost:${port}`));
    const domain = instance.host;
    const basepath = instance.pathname.replace(/\/+$/, "");
    const orgId = initialProject.config.organization;
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

    const astroProcess = runExeca(
        context.logger,
        "pnpm",
        ["exec", "astro", "dev", "--port", port.toString(), "--host"],
        {
            cwd: astroAppPath,
            env: {
                ...process.env,
                MIRROR_MODE: "true",
                MIRROR_ENDPOINT: mirrorEndpoint,
                MIRROR_FILES_ENDPOINT: `${mirrorEndpoint}/files`,
                LOCAL_MODE_OVERRIDE: "true",
                FERN_DOCS_DEV_RELOAD: "true",
                NEXT_PUBLIC_DOCS_DOMAIN: domain,
                SITE_DOMAIN: domain,
                SITE_BASEPATH: basepath
            },
            doNotPipeOutput: true
        }
    );
    const astroReady = waitForAstroReady(astroProcess, context);

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
        if (!astroProcess.killed) {
            astroProcess.kill();
            setTimeout(() => {
                if (!astroProcess.killed) {
                    astroProcess.kill("SIGKILL");
                }
            }, 2000).unref();
        }
    };
    for (const signal of SHUTDOWN_SIGNALS) {
        process.on(signal, onSignal);
    }
    process.on("exit", cleanup);

    void astroProcess.on("exit", (code, signal) => {
        if (cleanedUp) {
            return;
        }
        cleanup();
        rejectRun(
            new CliError({
                message:
                    `Astro dev server exited unexpectedly (${code != null ? `code ${code}` : `signal ${signal}`}). ` +
                    "Run with --log-level debug for its output.",
                code: CliError.Code.EnvironmentError
            })
        );
    });

    try {
        await astroReady;
    } catch (err) {
        cleanup();
        context.failAndThrow(`Astro dev server failed to start: ${extractErrorMessage(err)}`, undefined, {
            code: CliError.Code.EnvironmentError
        });
    }

    const notifyAstro = async (): Promise<void> => {
        try {
            const response = await fetch(`http://127.0.0.1:${port}${ASTRO_RELOAD_PATH}`, { method: "POST" });
            if (!response.ok) {
                context.logger.warn(`Astro reload endpoint returned ${response.status}`);
            }
        } catch (err) {
            context.logger.warn(`Failed to notify Astro of reload: ${extractErrorMessage(err)}`);
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
                        await notifyAstro();
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

async function resolveAstroAppPath(bundlePath: string | undefined): Promise<AbsoluteFilePath> {
    const candidate = bundlePath ?? process.env[ASTRO_APP_PATH_ENV];
    if (candidate == null) {
        throw new CliError({
            message:
                `--astro requires the Astro docs app. Pass --bundle-path <fern-platform>/packages/fern-docs/astro ` +
                `or set ${ASTRO_APP_PATH_ENV}.`,
            code: CliError.Code.UserError
        });
    }
    const astroAppPath = AbsoluteFilePath.of(candidate);
    if (!(await doesPathExist(join(astroAppPath, RelativeFilePath.of("astro.config.mjs"))))) {
        throw new CliError({
            message: `${astroAppPath} does not contain an Astro app (missing astro.config.mjs).`,
            code: CliError.Code.UserError
        });
    }
    return astroAppPath;
}

function waitForAstroReady(astroProcess: ReturnType<typeof runExeca>, context: TaskContext): Promise<void> {
    return new Promise((resolve, reject) => {
        let settled = false;
        const settle = (fn: () => void) => {
            if (!settled) {
                settled = true;
                clearTimeout(timer);
                fn();
            }
        };
        const onOutput = (data: Buffer) => {
            const output = data.toString();
            context.logger.debug(`[Astro] ${output}`);
            if (/ready in|Local\s+http/i.test(output)) {
                settle(resolve);
            }
        };
        astroProcess.stdout?.on("data", onOutput);
        astroProcess.stderr?.on("data", onOutput);
        void astroProcess.on("error", (err) => settle(() => reject(err)));
        void astroProcess.on("exit", (code) =>
            settle(() => reject(new Error(`Astro exited with code ${code} before becoming ready`)))
        );
        const timer = setTimeout(
            () => settle(() => reject(new Error("timed out waiting for Astro to become ready"))),
            ASTRO_READY_TIMEOUT_MS
        );
    });
}
