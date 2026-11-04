import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { delay, replaceEnvVariables } from "@fern-api/core-utils";
import { createPdfExportClient, ORPCError } from "@fern-api/fdr-sdk/orpc-client";
import { askToLogin } from "@fern-api/login";
import {
    CliError,
    type CreateInteractiveTaskParams,
    type InteractiveTaskContext,
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

/** `--output` for a PDF export names a file; a bare name like the default `docs-export` gets `.pdf` added. */
export function pdfOutputPath(output: string): string {
    return output.toLowerCase().endsWith(".pdf") ? output : `${output}.pdf`;
}

/** The headline for a failed export; FDR's error code says whether to wait, check access, or re-run. */
export function exportFailureMessage(error: unknown): string {
    if (error instanceof ORPCError) {
        if (error.code === "TOO_MANY_REQUESTS") {
            return "Docs export failed: the organization hit its daily export limit. Try again tomorrow.";
        }
        if (error.code === "FORBIDDEN") {
            return "Docs export failed: this docs site does not belong to the organization in fern.config.json.";
        }
    }
    return "Docs export failed";
}

export async function exportDocs({
    cliContext,
    format,
    output,
    instance
}: {
    cliContext: CliContext;
    format: DocsExportFormat;
    output: string;
    instance: string | undefined;
}): Promise<void> {
    if (format === "pdf") {
        const hosted = await resolveHostedExport({ cliContext, instance });
        const outputFile = path.resolve(pdfOutputPath(output));
        await cliContext.runTask(async (context) => {
            await withSpinner(context, { name: "Exporting PDF", subtitle: outputFile }, () =>
                downloadHostedPdf({ ...hosted, outputFile })
            );
            context.logger.info(chalk.green(`Exported PDF to ${outputFile}`));
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
    const source = hostedSource({ ...(await resolveHostedExport({ cliContext, instance })), format });

    const outputDir = path.resolve(output);
    await cliContext.runTask(async (context) => {
        let count = 0;
        await withSpinner(
            context,
            { name: `Exporting ${format === "md" ? "Markdown" : "HTML"}`, subtitle: outputDir },
            async (task) => {
                count = await writeExport({
                    source,
                    format,
                    outputDir,
                    onProgress: (written) => task.setSubtitle(`${outputDir} (${written} files written)`)
                });
            }
        );
        context.logger.info(chalk.green(`Exported ${count} files to ${outputDir}`));
        if (format === "html") {
            context.logger.info(`Serve it locally with: npx serve ${output}`);
        }
    });
}

/** Runs one export step behind a spinner; a failure is logged once and fails the command. */
async function withSpinner(
    context: TaskContext,
    params: CreateInteractiveTaskParams,
    run: (task: InteractiveTaskContext) => Promise<unknown>
): Promise<void> {
    const succeeded = await context.runInteractiveTask(params, async (task) => {
        try {
            await run(task);
        } catch (error) {
            task.failAndThrow(exportFailureMessage(error), error, { code: CliError.Code.NetworkError });
        }
    });
    if (!succeeded) {
        context.failAndThrow(undefined, new TaskAbortSignal(context.getLastFailureMessage()));
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
        client: createPdfExportClient({ baseUrl: FDR_ORIGIN, token: token.value }),
        orgId: projectConfig.organization,
        docsUrl: instanceUrl
    };
}
