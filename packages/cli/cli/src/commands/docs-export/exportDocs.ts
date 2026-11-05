import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { delay, extractErrorMessage, replaceEnvVariables, stripTrailingSlashes } from "@fern-api/core-utils";
import { createExportClient, ORPCError } from "@fern-api/fdr-sdk/orpc-client";
import { askToLogin } from "@fern-api/login";
import {
    CliError,
    type CreateInteractiveTaskParams,
    type InteractiveTaskContext,
    resolveErrorCode,
    shouldReportToSentry,
    TaskAbortSignal,
    type TaskContext
} from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";
import { FDR_ORIGIN } from "../docs-theme/themeOrigin.js";
import {
    downloadHostedPdf,
    type ExportFile,
    type ExportSource,
    hostedSource,
    type PdfExportOptions,
    type SiteExportClient,
    safeRelativePath
} from "./exportSources.js";

export { safeRelativePath };

export type DocsExportFormat = "html" | "md" | "pdf";
type SiteExportFormat = Exclude<DocsExportFormat, "pdf">;

const DOWNLOAD_CONCURRENCY = 16;
const DOWNLOAD_ATTEMPTS = 3;

/** Whether a site file belongs in an export of the given format: `md` keeps only the per-page Markdown and `llms.txt`. */
export function keepsFile(filePath: string, format: SiteExportFormat): boolean {
    return format === "html" || filePath.endsWith(".md") || path.posix.basename(filePath) === "llms.txt";
}

/** The output folder is wiped on each run, so it must not hold the folder the command runs from. */
export function isSafeOutputDir(outputDir: string, cwd: string): boolean {
    const relative = path.relative(path.resolve(cwd, outputDir), cwd);
    return relative.startsWith("..") || path.isAbsolute(relative);
}

/**
 * Writes every kept file of `source` under `outputDir`, keeping site-relative paths. Like local
 * generation, the folder is emptied first (except `.git`), but only once the first batch arrives,
 * so a failed export leaves the previous one intact. Returns the count written.
 */
export async function writeExport({
    source,
    format,
    outputDir,
    onProgress
}: {
    source: ExportSource;
    format: SiteExportFormat;
    outputDir: string;
    onProgress?: (written: number) => void;
}): Promise<number> {
    const root = path.resolve(outputDir);
    let written = 0;
    let cleared = false;
    for await (const batch of source.batches()) {
        if (!cleared) {
            await emptyDir(root);
            cleared = true;
        }
        const kept = batch.filter((file) => keepsFile(file.path, format));
        await forEachConcurrently(kept, DOWNLOAD_CONCURRENCY, async (file) => {
            await writeFileUnder(root, file);
            written++;
        });
        onProgress?.(written);
    }
    return written;
}

async function emptyDir(root: string): Promise<void> {
    const entries = await readdir(root).catch(() => []);
    await Promise.all(
        entries
            .filter((entry) => entry !== ".git")
            .map((entry) => rm(path.join(root, entry), { recursive: true, force: true }))
    );
}

async function writeFileUnder(root: string, file: ExportFile): Promise<void> {
    const relative = safeRelativePath(file.path);
    const destination = relative == null ? undefined : path.resolve(root, relative);
    if (destination == null || !destination.startsWith(root + path.sep)) {
        throw new Error(`Refusing to write outside the output folder: ${file.path}`);
    }
    const bytes = await withRetries(() => file.read());
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
}

async function withRetries<T>(run: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= DOWNLOAD_ATTEMPTS; attempt++) {
        try {
            return await run();
        } catch (error) {
            lastError = error;
            if (attempt < DOWNLOAD_ATTEMPTS) {
                await delay(250 * attempt);
            }
        }
    }
    throw lastError instanceof Error ? lastError : new Error(`Download failed: ${String(lastError)}`);
}

async function forEachConcurrently<T>(items: T[], limit: number, run: (item: T) => Promise<void>): Promise<void> {
    let next = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length) {
            const item = items[next++];
            if (item != null) {
                await run(item);
            }
        }
    });
    await Promise.all(workers);
}

/**
 * `target` as the user would type it: `./name` inside `cwd`, else absolute. Short enough not to
 * wrap, since the spinner redraw counts newlines, not wrapped rows, and leaves stray lines behind.
 */
export function displayPath(target: string, cwd: string): string {
    const relative = path.relative(cwd, target);
    return relative === "" || relative.startsWith("..") || path.isAbsolute(relative)
        ? target
        : `.${path.sep}${relative}`;
}

/** `--output` for a PDF export names a file; a bare name like `docs-export` gets `.pdf` added. */
export function pdfOutputPath(output: string): string {
    return output.toLowerCase().endsWith(".pdf") ? output : `${output}.pdf`;
}

/**
 * The default `--output`, named like the dashboard's download (`docs-acme-com.pdf`): one name per
 * site and format, so exporting `md` after `html` does not empty the HTML export.
 */
export function defaultOutput(docsUrl: string, format: DocsExportFormat): string {
    const site = stripTrailingSlashes(docsUrl.replace(/^https?:\/\//, "")).replace(/[^a-zA-Z0-9-]/g, "-");
    return format === "pdf" ? `${site}.pdf` : `${site}-${format}`;
}

/** What `fern docs export --format pdf` can set, matching the dashboard's export settings. */
export interface PdfSettings {
    cover?: boolean;
    toc?: boolean;
    coverTitle?: string;
    coverSubtitle?: string;
    headerLeft?: string;
    headerRight?: string;
    footerLeft?: string;
    footerRight?: string;
}

/** The export options for `settings`, or `undefined` when every setting is the site's default. */
export function pdfExportOptions(settings: PdfSettings): PdfExportOptions | undefined {
    const options = {
        hideCover: settings.cover === false ? true : undefined,
        hideToc: settings.toc === false ? true : undefined,
        coverTitle: settings.coverTitle,
        coverSubtitle: settings.coverSubtitle,
        headerLeftTemplate: settings.headerLeft,
        headerRightTemplate: settings.headerRight,
        footerLeftTemplate: settings.footerLeft,
        footerRightTemplate: settings.footerRight
    };
    const set = Object.fromEntries(Object.entries(options).filter(([, value]) => value != null));
    return Object.keys(set).length === 0 ? undefined : { version: "v1", ...set };
}

/** One line for a failed export: FDR's error code says whether to wait or check access; otherwise the cause. */
export function exportFailureMessage(error: unknown): string {
    if (error instanceof ORPCError) {
        if (error.code === "TOO_MANY_REQUESTS") {
            return "Export failed: the organization hit its daily export limit. Try again tomorrow.";
        }
        if (error.code === "FORBIDDEN") {
            return "Export failed: this docs site does not belong to the organization in fern.config.json.";
        }
    }
    return `Export failed: ${extractErrorMessage(error).replace(/^Export failed:\s*/i, "")}`;
}

export async function exportDocs({
    cliContext,
    format,
    output: requestedOutput,
    instance,
    pdf = {}
}: {
    cliContext: CliContext;
    format: DocsExportFormat;
    output: string | undefined;
    instance: string | undefined;
    pdf?: PdfSettings;
}): Promise<void> {
    const options = pdfExportOptions(pdf);
    if (format !== "pdf" && options != null) {
        return cliContext.failAndThrow(
            "--no-cover, --no-toc, --cover-title, --cover-subtitle, --header-* and --footer-* only apply to --format pdf.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const hosted = await resolveHostedExport({ cliContext, instance });
    const output = requestedOutput ?? defaultOutput(hosted.docsUrl, format);
    if (format === "pdf") {
        const outputFile = path.resolve(pdfOutputPath(output));
        await cliContext.runTask(async (context) => {
            await withSpinner(context, cliContext.isTTY, { name: "Exporting PDF" }, async () => {
                await downloadHostedPdf({ ...hosted, outputFile, options });
                return [chalk.green(`Exported PDF to ${displayPath(outputFile, process.cwd())}`)];
            });
        });
        return;
    }
    if (!isSafeOutputDir(output, process.cwd())) {
        return cliContext.failAndThrow(
            `--output ${output} contains the current folder. Each export empties the output folder; choose a new one.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const source = hostedSource({ ...hosted, format });

    const outputDir = path.resolve(output);
    await cliContext.runTask(async (context) => {
        await withSpinner(
            context,
            cliContext.isTTY,
            { name: format === "md" ? "Exporting Markdown" : "Exporting site" },
            async (task) => {
                const count = await writeExport({
                    source,
                    format,
                    outputDir,
                    onProgress: (written) => task.setSubtitle(`${written} files written`)
                });
                const summary = [chalk.green(`Exported ${count} files to ${displayPath(outputDir, process.cwd())}`)];
                if (format === "html") {
                    summary.push(`Serve it locally with: npx serve ${output}`);
                }
                return summary;
            }
        );
    });
}

/**
 * Runs one export step behind a spinner and fails the command if it throws. The outcome (the
 * summary lines `run` returns, or the error) prints after the spinner: on a TTY it replaces the
 * spinner's subtitle, since logs print above the spinner box; without one the box never renders,
 * so it is logged.
 */
async function withSpinner(
    context: TaskContext,
    isTTY: boolean,
    params: CreateInteractiveTaskParams,
    run: (task: InteractiveTaskContext) => Promise<string[]>
): Promise<void> {
    const succeeded = await context.runInteractiveTask(params, async (task) => {
        let summary: string[];
        try {
            summary = await run(task);
        } catch (error) {
            const message = exportFailureMessage(error);
            if (!isTTY) {
                task.failAndThrow(message, error, { code: CliError.Code.NetworkError });
            }
            task.setSubtitle(chalk.red(message));
            reportExportFailure(context, error);
            throw new TaskAbortSignal(message);
        }
        if (isTTY) {
            task.setSubtitle(summary.join("\n"));
        } else {
            for (const line of summary) {
                context.logger.info(line);
            }
        }
    });
    if (!succeeded) {
        context.failAndThrow(undefined, new TaskAbortSignal(context.getLastFailureMessage()));
    }
}

/** The telemetry `failAndThrow` sends, for a failure shown in the spinner instead of logged. */
function reportExportFailure(context: TaskContext, error: unknown): void {
    const code = resolveErrorCode(error, CliError.Code.NetworkError);
    context.instrumentPostHogEvent({ command: process.argv.join(" "), properties: { failed: true, errorCode: code } });
    if (shouldReportToSentry(code)) {
        context.captureException(error, { tags: { "error.code": code } });
    }
}

/** Finds the hosted site to export and logs in: the export client, the org and the docs URL. */
async function resolveHostedExport({
    cliContext,
    instance
}: {
    cliContext: CliContext;
    instance: string | undefined;
}): Promise<{ client: SiteExportClient; orgId: string; docsUrl: string }> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(
            "No fern directory found. Run this command from within a Fern project. For self-hosted docs, run /scripts/export.sh inside the container.",
            undefined,
            { code: CliError.Code.ValidationError }
        );
    }
    const docsWorkspace = await cliContext.runTask((context) => loadDocsWorkspace({ fernDirectory, context }));
    const instanceUrls = await cliContext.runTask((context) =>
        (docsWorkspace?.config.instances ?? []).map((docsInstance) =>
            replaceEnvVariables(
                docsInstance.url,
                { onError: (e) => context.failAndThrow(undefined, e, { code: CliError.Code.EnvironmentError }) },
                { substituteAsEmpty: false }
            )
        )
    );
    const instanceUrl = instance ?? instanceUrls[0];
    if (instanceUrl == null) {
        return cliContext.failAndThrow("No docs instances found in docs.yml.", undefined, {
            code: CliError.Code.ConfigError
        });
    }
    if (instance != null && !instanceUrls.includes(instance)) {
        return cliContext.failAndThrow(
            `--instance ${instance} is not in docs.yml. Available instances: ${instanceUrls.join(", ")}`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    if (instance == null && instanceUrls.length > 1) {
        return cliContext.failAndThrow(
            `docs.yml has ${instanceUrls.length} instances. Choose one with --instance: ${instanceUrls.join(", ")}`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const token = await cliContext.runTask((context) => askToLogin(context));
    if (token == null) {
        return cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
    }
    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );
    return {
        client: createExportClient({ baseUrl: FDR_ORIGIN, token: token.value }),
        orgId: projectConfig.organization,
        docsUrl: instanceUrl
    };
}
