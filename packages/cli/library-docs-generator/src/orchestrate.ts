import { readFile } from "node:fs/promises";
import { docsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { CliError, type TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { generateCpp } from "./CppDocsGenerator.js";
import { generate } from "./PythonDocsGenerator.js";
import type { CppLibraryDocsIr } from "./types/CppLibraryDocsIr.js";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

type LibraryLanguage = "PYTHON" | "CPP";

/**
 * Lightweight client interface for the library docs endpoints.
 *
 * Mirrors the oRPC contract in `@fern-api/fdr-sdk` so callers stay decoupled
 * from the concrete HTTP transport. Once the published fdr-sdk includes
 * `createLibraryDocsClient`, this interface and the fetch-based
 * implementation below can be replaced with a direct import.
 */
export interface LibraryDocsClient {
    startLibraryDocsGeneration(input: {
        orgId: string;
        githubUrl: string;
        language: LibraryLanguage;
        config?: {
            branch?: string | null;
            packagePath?: string | null;
            title?: string | null;
            slug?: string | null;
            doxyfileContent?: string | null;
        } | null;
    }): Promise<{ jobId: string }>;
    getLibraryDocsGenerationStatus(input: { jobId: string }): Promise<{
        jobId: string;
        status: string;
        progress: string;
        error?: { code: string; message: string };
        createdAt: string;
        updatedAt: string;
    }>;
    getLibraryDocsResult(input: { jobId: string }): Promise<{
        jobId: string;
        resultUrl: string;
    }>;
}

/**
 * Build a {@link LibraryDocsClient} backed by plain `fetch`.
 *
 * The base URL and auth mirror what `createFdrService` uses so that
 * env-var overrides (`DEFAULT_FDR_ORIGIN`, `FERN_FDR_ORIGIN`) keep
 * working.
 */
export function createLibraryDocsClient({ token }: { token: string }): LibraryDocsClient {
    const defaultOrigin = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
    const baseUrl = process.env.FERN_FDR_ORIGIN ?? process.env.OVERRIDE_FDR_ORIGIN ?? defaultOrigin;
    const docsBase = `${baseUrl}/v2/registry/docs`;

    async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
        const response = await fetch(`${docsBase}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: body != null ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new CliError({ message: `HTTP ${response.status}: ${text}`, code: CliError.Code.NetworkError });
        }

        return (await response.json()) as T;
    }

    return {
        startLibraryDocsGeneration(input) {
            return request("POST", "/library-docs/generate", input);
        },
        getLibraryDocsGenerationStatus(input) {
            return request("GET", `/library-docs/status/${input.jobId}`);
        },
        getLibraryDocsResult(input) {
            return request("GET", `/library-docs/result/${input.jobId}`);
        }
    };
}

function isGitLibraryInput(
    input: docsYml.RawSchemas.LibraryInputConfiguration
): input is docsYml.RawSchemas.GitLibraryInputSchema {
    return "git" in input;
}

function toLanguage(lang: docsYml.RawSchemas.LibraryConfiguration["lang"]): LibraryLanguage | undefined {
    if (lang === "python") {
        return "PYTHON";
    }
    if (lang === "cpp") {
        return "CPP";
    }
    return undefined;
}

/**
 * Wrap a long-running step. Callers can pass a spinner-based wrapper to
 * render progress; the default just calls `operation` directly so all
 * progress messages flow through `context.logger`.
 */
export type StepWrapper = <T>(opts: { message: string; operation: () => Promise<T> }) => Promise<T>;

const defaultWrapStep: StepWrapper = ({ operation }) => operation();

/**
 * Iterates over the configured libraries, calling the FDR library-docs
 * endpoints to start generation, polling for completion, downloading the
 * resulting IR, and running the local MDX generator.
 *
 * All libraries are attempted (via `Promise.allSettled`) so a single failure
 * does not abort generation for the remaining ones. If any library failed,
 * the first error is re-thrown so the caller exits non-zero with a
 * specific, actionable message.
 */
export async function runLibraryDocsGeneration({
    libraries,
    library,
    docsDirectoryPath,
    orgId,
    tokenValue,
    context,
    wrapStep = defaultWrapStep
}: {
    libraries: Record<string, docsYml.RawSchemas.LibraryConfiguration | undefined>;
    /** Optional library name to filter to a single entry. */
    library?: string;
    /** Absolute path of the directory containing docs.yml — used to resolve output paths. */
    docsDirectoryPath: AbsoluteFilePath;
    orgId: string;
    /** The raw bearer token value. */
    tokenValue: string;
    context: TaskContext;
    wrapStep?: StepWrapper;
}): Promise<{ successful: number }> {
    if (Object.keys(libraries).length === 0) {
        throw new CliError({
            message:
                "No libraries configured in docs.yml.\n\n" +
                "  Add a 'libraries' section to configure library documentation.",
            code: CliError.Code.ConfigError
        });
    }

    if (library != null && libraries[library] == null) {
        throw new CliError({
            message:
                `Library '${library}' not found in docs.yml.\n\n` +
                `  Available libraries: ${Object.keys(libraries).join(", ")}`,
            code: CliError.Code.ConfigError
        });
    }

    const librariesToGenerate = library != null ? { [library]: libraries[library] } : libraries;
    const client = createLibraryDocsClient({ token: tokenValue });

    const results = await Promise.allSettled(
        Object.entries(librariesToGenerate).map(async ([name, config]) => {
            if (config == null) {
                throw new CliError({
                    message: `Library '${name}': missing configuration`,
                    code: CliError.Code.ConfigError
                });
            }
            if (!isGitLibraryInput(config.input)) {
                throw new CliError({
                    message: `Library '${name}': 'path' input is not yet supported. Please use 'git' input.`,
                    code: CliError.Code.ConfigError
                });
            }
            await generateSingleLibrary({
                client,
                context,
                name,
                config,
                docsDirectoryPath,
                orgId,
                wrapStep
            });
        })
    );

    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    for (const failure of failures) {
        context.logger.error(chalk.red(extractErrorMessage(failure.reason)));
    }

    const firstFailure = failures[0];
    if (firstFailure != null) {
        // Surface the first specific failure so the caller exits with a useful message.
        const reason = firstFailure.reason;
        if (reason instanceof CliError) {
            throw reason;
        }
        throw new CliError({
            message: extractErrorMessage(reason),
            code: CliError.Code.InternalError
        });
    }

    return { successful: results.length - failures.length };
}

async function generateSingleLibrary({
    client,
    context,
    name,
    config,
    docsDirectoryPath,
    orgId,
    wrapStep
}: {
    client: LibraryDocsClient;
    context: TaskContext;
    name: string;
    config: docsYml.RawSchemas.LibraryConfiguration;
    docsDirectoryPath: AbsoluteFilePath;
    orgId: string;
    wrapStep: StepWrapper;
}): Promise<void> {
    const resolvedOutputPath = resolve(docsDirectoryPath, config.output.path);
    const gitInput = config.input as docsYml.RawSchemas.GitLibraryInputSchema;

    if (config.config?.doxyfile != null && config.lang !== "cpp") {
        throw new CliError({
            message: `Library '${name}': 'doxyfile' config is only valid for lang: cpp`,
            code: CliError.Code.ConfigError
        });
    }

    let doxyfileContent: string | undefined;
    if (config.lang === "cpp" && config.config?.doxyfile != null) {
        const doxyfilePath = resolve(docsDirectoryPath, config.config.doxyfile);
        try {
            doxyfileContent = await readFile(doxyfilePath, "utf-8");
        } catch {
            throw new CliError({
                message:
                    `Library '${name}': Could not read Doxyfile at '${config.config.doxyfile}' ` +
                    `(resolved to ${doxyfilePath})`,
                code: CliError.Code.ConfigError
            });
        }
    }

    const language = toLanguage(config.lang);
    if (language == null) {
        throw new CliError({
            message: `Library '${name}': unsupported language '${config.lang}'`,
            code: CliError.Code.ConfigError
        });
    }

    const jobId = await wrapStep({
        message: `Library '${name}': starting generation from ${gitInput.git}`,
        operation: () =>
            startGeneration(client, {
                name,
                orgId,
                githubUrl: gitInput.git,
                language,
                packagePath: gitInput.subpath,
                doxyfileContent
            })
    });

    await wrapStep({
        message: `Library '${name}': generating documentation`,
        operation: () => pollForCompletion(client, jobId, name)
    });

    const ir = await wrapStep({
        message: `Library '${name}': downloading generated IR`,
        operation: () => downloadIr(client, jobId, name, language)
    });

    if (language === "CPP") {
        const cppIr = ir as CppLibraryDocsIr;
        const result = generateCpp({
            ir: cppIr,
            outputDir: resolvedOutputPath,
            slug: name
        });
        context.logger.info(
            chalk.green(`Library '${name}': generated ${result.pageCount} pages at ${resolvedOutputPath}`)
        );
        context.logger.info(
            `\n  To include in your docs navigation, add to docs.yml:\n` +
                `    navigation:\n` +
                `      - folder: ${config.output.path}`
        );
    } else {
        const pythonIr = ir as FdrAPI.libraryDocs.PythonLibraryDocsIr;
        const generateResult = generate({
            ir: pythonIr,
            outputDir: resolvedOutputPath,
            slug: name,
            title: name
        });
        context.logger.info(
            chalk.green(`Library '${name}': generated ${generateResult.pageCount} pages at ${resolvedOutputPath}`)
        );
    }
}

async function startGeneration(
    client: LibraryDocsClient,
    opts: {
        name: string;
        orgId: string;
        githubUrl: string;
        language: LibraryLanguage;
        packagePath?: string;
        doxyfileContent?: string;
    }
): Promise<string> {
    try {
        const result = await client.startLibraryDocsGeneration({
            orgId: opts.orgId,
            githubUrl: opts.githubUrl,
            language: opts.language,
            config: {
                branch: undefined,
                packagePath: opts.packagePath,
                title: opts.name,
                slug: opts.name,
                doxyfileContent: opts.doxyfileContent
            }
        });
        return result.jobId;
    } catch (error) {
        throw new CliError({
            message: `Failed to start generation for library '${opts.name}': ${extractErrorMessage(error)}`,
            code: CliError.Code.NetworkError
        });
    }
}

async function pollForCompletion(client: LibraryDocsClient, jobId: string, libraryName: string): Promise<void> {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        let status;
        try {
            status = await client.getLibraryDocsGenerationStatus({ jobId });
        } catch (error) {
            throw new CliError({
                message:
                    `Failed to check generation status for library '${libraryName}': ` + extractErrorMessage(error),
                code: CliError.Code.NetworkError
            });
        }

        switch (status.status) {
            case "PENDING":
            case "PARSING":
                break;
            case "COMPLETED":
                return;
            case "FAILED":
                throw new CliError({
                    message:
                        `Generation failed for library '${libraryName}': ` +
                        `${status.error?.message ?? "Unknown error"} (${status.error?.code ?? "UNKNOWN"})`,
                    code: CliError.Code.InternalError
                });
            default:
                throw new CliError({
                    message: `Unexpected generation status for library '${libraryName}': ${status.status}`,
                    code: CliError.Code.InternalError
                });
        }
    }

    throw new CliError({
        message: `Generation timed out for library '${libraryName}' after ${POLL_TIMEOUT_MS / 1000}s`,
        code: CliError.Code.NetworkError
    });
}

async function downloadIr(
    client: LibraryDocsClient,
    jobId: string,
    libraryName: string,
    language: LibraryLanguage
): Promise<unknown> {
    let resultUrl: string;
    try {
        const result = await client.getLibraryDocsResult({ jobId });
        resultUrl = result.resultUrl;
    } catch (error) {
        throw new CliError({
            message: `Failed to fetch generation result for library '${libraryName}': ` + extractErrorMessage(error),
            code: CliError.Code.NetworkError
        });
    }

    const irFetchResponse = await fetch(resultUrl);
    if (!irFetchResponse.ok) {
        throw new CliError({
            message: `Failed to download IR for library '${libraryName}': HTTP ${irFetchResponse.status}`,
            code: CliError.Code.NetworkError
        });
    }

    const irWrapper = (await irFetchResponse.json()) as { ir?: unknown };
    const ir = irWrapper.ir;

    if (ir == null) {
        throw new CliError({
            message: `IR is empty for library '${libraryName}'`,
            code: CliError.Code.InternalError
        });
    }

    if (language === "CPP") {
        if ((ir as { rootNamespace?: unknown }).rootNamespace == null) {
            throw new CliError({
                message: `IR has no rootNamespace for C++ library '${libraryName}'`,
                code: CliError.Code.InternalError
            });
        }
    } else if ((ir as { rootModule?: unknown }).rootModule == null) {
        throw new CliError({
            message: `IR has no rootModule for library '${libraryName}'`,
            code: CliError.Code.InternalError
        });
    }

    return ir;
}
