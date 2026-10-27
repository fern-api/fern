import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getFernDirectory } from "@fern-api/configuration-loader";
import { delay, replaceEnvVariables, stripTrailingSlashes } from "@fern-api/core-utils";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";
import { FDR_ORIGIN } from "../docs-theme/themeOrigin.js";
import { type ExportFile, type ExportSource, hostedSource, selfHostedSource } from "./exportSources.js";

export type DocsExportFormat = "html" | "md";

const DOWNLOAD_CONCURRENCY = 16;
const DOWNLOAD_ATTEMPTS = 3;

/** Whether a site file belongs in an export of the given format: `md` keeps only the per-page Markdown and `llms.txt`. */
export function keepsFile(filePath: string, format: DocsExportFormat): boolean {
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
    format: DocsExportFormat;
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

/**
 * A server-supplied site path (`docs/quickstart/index.html`) as a native relative path, or undefined
 * when it is absolute, has empty, `.` or `..` segments, or holds a backslash, drive letter or NUL.
 */
export function safeRelativePath(filePath: string): string | undefined {
    if (/[\\\0]/.test(filePath) || filePath.startsWith("/") || /^[a-zA-Z]:/.test(filePath)) {
        return undefined;
    }
    const segments = filePath.split("/");
    if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
        return undefined;
    }
    return segments.join(path.sep);
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

/** Splits a docs.yml instance url (`acme.docs.buildwithfern.com/learn`) into the domain and basepath FDR keys sites by. */
export function parseInstanceUrl(instanceUrl: string): { domain: string; basepath: string } {
    const url = new URL(/^https?:\/\//i.test(instanceUrl) ? instanceUrl : `https://${instanceUrl}`);
    const basepath = stripTrailingSlashes(url.pathname);
    return { domain: url.hostname, basepath: basepath === "/" ? "" : basepath };
}

export async function exportDocs({
    cliContext,
    format,
    output,
    instance,
    selfHostedUrl,
    adminToken
}: {
    cliContext: CliContext;
    format: DocsExportFormat;
    output: string;
    instance: string | undefined;
    selfHostedUrl: string | undefined;
    adminToken: string | undefined;
}): Promise<void> {
    if (!isSafeOutputDir(output, process.cwd())) {
        return cliContext.failAndThrow(
            `--output ${output} contains the current folder. Each export empties the output folder; choose a new one.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    if (selfHostedUrl != null && adminToken == null) {
        return cliContext.failAndThrow("--admin-token is required with --url.", undefined, {
            code: CliError.Code.ConfigError
        });
    }
    const source =
        selfHostedUrl != null && adminToken != null
            ? selfHostedSource({
                  url: selfHostedUrl,
                  adminToken,
                  basepath: instance != null ? parseInstanceUrl(instance).basepath : ""
              })
            : await resolveHostedSource({ cliContext, instance });

    await cliContext.runTask(async (context) => {
        context.logger.info(`Exporting ${format === "md" ? "Markdown" : "HTML"} to ${output}...`);
        try {
            const count = await writeExport({
                source,
                format,
                outputDir: output,
                onProgress: (written) => context.logger.debug(`${written} files written`)
            });
            context.logger.info(chalk.green(`Exported ${count} files to ${output}`));
            if (format === "html") {
                context.logger.info(`Serve it locally with: npx serve ${output}`);
            }
        } catch (error) {
            return context.failAndThrow("Docs export failed", error, { code: CliError.Code.NetworkError });
        }
    });
}

async function resolveHostedSource({
    cliContext,
    instance
}: {
    cliContext: CliContext;
    instance: string | undefined;
}): Promise<ExportSource> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(
            "No fern directory found. Run this command from within a Fern project, or pass --url for a self-hosted site.",
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
    const { domain, basepath } = parseInstanceUrl(instanceUrl);
    return hostedSource({ fdrOrigin: FDR_ORIGIN, token: token.value, domain, basepath });
}
