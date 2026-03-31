import { FernToken } from "@fern-api/auth";
import { docsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import type { CppLibraryDocsIr } from "@fern-api/library-docs-generator";
import { generate, generateCpp } from "@fern-api/library-docs-generator";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { InteractiveTaskContext, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { readFile } from "fs/promises";
import { CliContext } from "../../cli-context/CliContext.js";
export interface GenerateLibraryDocsOptions {
    project: Project;
    cliContext: CliContext;
    /** If specified, only generate docs for this library */
    library: string | undefined;
}

/**
 * Lightweight client interface for the library docs endpoints.
 *
 * Mirrors the oRPC contract in @fern-api/fdr-sdk so that callers are
 * decoupled from the concrete HTTP transport. Once the published fdr-sdk
 * includes `createLibraryDocsClient`, this interface and the fetch-based
 * implementation below can be replaced with a direct import.
 */
interface LibraryDocsClient {
    startLibraryDocsGeneration(input: {
        orgId: string;
        githubUrl: string;
        language: "PYTHON" | "CPP";
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
function createLibraryDocsClient({ token }: { token: string }): LibraryDocsClient {
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
            throw new Error(`HTTP ${response.status}: ${text}`);
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

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Generate library documentation from source code.
 *
 * Authenticates with FDR, starts server-side parsing, polls for completion,
 * downloads the resulting IR from S3, and runs the local MDX generator
 * (which also writes `_navigation.yml` — see NavigationBuilder.ts).
 */
export async function generateLibraryDocs({ project, cliContext, library }: GenerateLibraryDocsOptions): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;

    if (docsWorkspace == null) {
        cliContext.failAndThrow("No docs workspace found. Make sure you have a docs.yml file.");
        return;
    }

    const rawConfig = docsWorkspace.config;
    const libraries = rawConfig.libraries;

    if (libraries == null || Object.keys(libraries).length === 0) {
        cliContext.failAndThrow(
            "No libraries configured in docs.yml. Add a `libraries` section to configure library documentation."
        );
        return;
    }

    const librariesToGenerate = library != null ? { [library]: libraries[library] } : libraries;

    if (library != null && libraries[library] == null) {
        cliContext.failAndThrow(
            `Library '${library}' not found in docs.yml. Available libraries: ${Object.keys(libraries).join(", ")}`
        );
        return;
    }

    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return;
    }

    const orgId = project.config.organization;

    await cliContext.runTask(async (context) => {
        const results = await Promise.all(
            Object.entries(librariesToGenerate).map(async ([name, config]) => {
                if (config == null) {
                    return false;
                }
                if (!isGitLibraryInput(config.input)) {
                    context.failAndThrow(
                        `Library '${name}' uses 'path' input which is not yet supported. Please use 'git' input.`
                    );
                    return false;
                }

                return generateSingleLibrary({
                    name,
                    config,
                    docsWorkspace,
                    orgId,
                    token,
                    context
                });
            })
        );

        // Log summary of successful generations
        const successful = results.filter(Boolean).length;
        if (successful > 0) {
            context.logger.info(chalk.green(`✓ Generated library documentation for ${successful} libraries`));
        }
    });
}

async function generateSingleLibrary({
    name,
    config,
    docsWorkspace,
    orgId,
    token,
    context
}: {
    name: string;
    config: docsYml.RawSchemas.LibraryConfiguration;
    docsWorkspace: { absoluteFilePath: AbsoluteFilePath };
    orgId: string;
    token: FernToken;
    context: TaskContext;
}): Promise<boolean> {
    const resolvedOutputPath = resolve(docsWorkspace.absoluteFilePath, config.output.path);
    const gitInput = config.input as docsYml.RawSchemas.GitLibraryInputSchema;

    return context.runInteractiveTask({ name }, async (interactiveTaskContext) => {
        // Validate language-specific config
        if (config.config?.doxyfile != null && config.lang !== "cpp") {
            return interactiveTaskContext.failAndThrow(
                `Library '${name}': 'doxyfile' config is only valid for lang: cpp`
            );
        }

        // Read Doxyfile from disk if specified
        let doxyfileContent: string | undefined;
        if (config.lang === "cpp" && config.config?.doxyfile != null) {
            const doxyfilePath = resolve(docsWorkspace.absoluteFilePath, config.config.doxyfile);
            try {
                doxyfileContent = await readFile(doxyfilePath, "utf-8");
            } catch {
                return interactiveTaskContext.failAndThrow(
                    `Library '${name}': Could not read Doxyfile at '${config.config.doxyfile}' (resolved to ${doxyfilePath})`
                );
            }
        }

        const language = config.lang === "python" ? "PYTHON" : config.lang === "cpp" ? "CPP" : undefined;
        if (language == null) {
            return interactiveTaskContext.failAndThrow(`Library '${name}': unsupported language '${config.lang}'`);
        }

        const client = createLibraryDocsClient({ token: token.value });

        interactiveTaskContext.logger.debug(`Starting generation for library '${name}' from ${gitInput.git}`);

        const jobId = await startGeneration(client, interactiveTaskContext, {
            orgId,
            githubUrl: gitInput.git,
            language,
            packagePath: gitInput.subpath,
            name,
            doxyfileContent
        });

        await pollForCompletion(client, jobId, name, interactiveTaskContext);

        const ir = await downloadIr(client, jobId, name, language, interactiveTaskContext);

        if (config.lang === "cpp") {
            const cppIr = ir as CppLibraryDocsIr;
            const result = generateCpp({
                ir: cppIr,
                outputDir: resolvedOutputPath,
                slug: name
            });
            interactiveTaskContext.logger.info(
                chalk.green(`Generated ${result.pageCount} pages at ${resolvedOutputPath}`)
            );
            interactiveTaskContext.logger.info(
                `\nTo include in your docs navigation, add to docs.yml:\n` +
                    `  navigation:\n` +
                    `    - folder: ${config.output.path}`
            );
        } else if (config.lang === "python") {
            const pythonIr = ir as FdrAPI.libraryDocs.PythonLibraryDocsIr;
            const generateResult = generate({
                ir: pythonIr,
                outputDir: resolvedOutputPath,
                slug: name,
                title: name
            });
            interactiveTaskContext.logger.debug(`Generated ${generateResult.pageCount} pages at ${resolvedOutputPath}`);
        } else {
            return interactiveTaskContext.failAndThrow(`Library '${name}': unsupported language '${config.lang}'`);
        }
    });
}

async function startGeneration(
    client: LibraryDocsClient,
    context: InteractiveTaskContext,
    opts: {
        orgId: string;
        githubUrl: string;
        language: "PYTHON" | "CPP";
        packagePath?: string;
        name: string;
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
        context.logger.debug(`Generation job started with ID: ${result.jobId}`);
        return result.jobId;
    } catch (error) {
        return context.failAndThrow(
            `Failed to start generation for library '${opts.name}': ${extractErrorMessage(error)}`
        );
    }
}

async function pollForCompletion(
    client: LibraryDocsClient,
    jobId: string,
    libraryName: string,
    context: InteractiveTaskContext
): Promise<void> {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        let status;
        try {
            status = await client.getLibraryDocsGenerationStatus({ jobId });
        } catch (error) {
            return context.failAndThrow(
                `Failed to check generation status for library '${libraryName}': ${extractErrorMessage(error)}`
            );
        }

        switch (status.status) {
            case "PENDING":
                context.logger.debug(`Status: PENDING`);
                break;
            case "PARSING": {
                context.logger.debug(`Status: PARSING${status.progress ? ` — ${status.progress}` : ""}`);
                break;
            }
            case "COMPLETED":
                return;
            case "FAILED":
                return context.failAndThrow(
                    `Generation failed for library '${libraryName}': ${status.error?.message ?? "Unknown error"} (${status.error?.code ?? "UNKNOWN"})`
                );
            default:
                return context.failAndThrow(
                    `Unexpected generation status for library '${libraryName}': ${status.status}`
                );
        }
    }

    return context.failAndThrow(`Generation timed out for library '${libraryName}' after ${POLL_TIMEOUT_MS / 1000}s`);
}

async function downloadIr(
    client: LibraryDocsClient,
    jobId: string,
    libraryName: string,
    language: "PYTHON" | "CPP",
    context: InteractiveTaskContext
): Promise<unknown> {
    let resultUrl: string;
    try {
        const result = await client.getLibraryDocsResult({ jobId });
        resultUrl = result.resultUrl;
    } catch (error) {
        return context.failAndThrow(
            `Failed to fetch generation result for library '${libraryName}': ${extractErrorMessage(error)}`
        );
    }

    context.logger.debug(`Fetching IR from ${resultUrl}`);
    const irFetchResponse = await fetch(resultUrl);
    if (!irFetchResponse.ok) {
        return context.failAndThrow(
            `Failed to download IR for library '${libraryName}': HTTP ${irFetchResponse.status}`
        );
    }

    const irWrapper = await irFetchResponse.json();
    const ir = irWrapper.ir;

    if (ir == null) {
        return context.failAndThrow(`IR is empty for library '${libraryName}'`);
    }

    if (language === "CPP") {
        if (ir.rootNamespace == null) {
            return context.failAndThrow(`IR has no rootNamespace for C++ library '${libraryName}'`);
        }
        context.logger.debug(`Downloaded C++ IR for '${libraryName}'`);
    } else {
        if (ir.rootModule == null) {
            return context.failAndThrow(`IR has no rootModule for library '${libraryName}'`);
        }
        context.logger.debug(`Downloaded IR with ${Object.keys(ir.rootModule).length} top-level keys`);
    }

    return ir;
}
