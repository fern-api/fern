import type { FernToken } from "@fern-api/auth";
import { docsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import type { CppLibraryDocsIr } from "@fern-api/library-docs-generator";
import { generate, generateCpp } from "@fern-api/library-docs-generator";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import { readFile } from "fs/promises";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

type LibraryLanguage = "PYTHON" | "CPP";

/**
 * Lightweight client interface for the library docs endpoints.
 *
 * Mirrors the oRPC contract in `@fern-api/fdr-sdk` so callers stay decoupled
 * from the concrete HTTP transport. Once the published fdr-sdk includes
 * `createLibraryDocsClient`, this interface and the fetch-based
 * implementation below can be replaced with a direct import.
 */
interface LibraryDocsClient {
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

export declare namespace GenerateCommand {
    export interface Args extends GlobalArgs {
        /** If specified, only generate docs for this library. */
        library?: string;
    }
}

export class GenerateCommand {
    public async handle(context: Context, args: GenerateCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const libraries = workspace.docs.raw.libraries;
        if (libraries == null || Object.keys(libraries).length === 0) {
            throw new CliError({
                message:
                    "No libraries configured in docs.yml.\n\n" +
                    "  Add a 'libraries' section to configure library documentation.",
                code: CliError.Code.ConfigError
            });
        }

        if (args.library != null && libraries[args.library] == null) {
            throw new CliError({
                message:
                    `Library '${args.library}' not found in docs.yml.\n\n` +
                    `  Available libraries: ${Object.keys(libraries).join(", ")}`,
                code: CliError.Code.ConfigError
            });
        }

        const librariesToGenerate = args.library != null ? { [args.library]: libraries[args.library] } : libraries;

        const token = await context.getTokenOrPrompt();
        await context.verifyOrgAccess({ organization: workspace.org, token });

        const docsFilePath = workspace.docs.absoluteFilePath ?? workspace.absoluteFilePath ?? context.cwd;
        const docsAbsoluteFilePath = AbsoluteFilePath.of(dirname(docsFilePath));

        const results = await Promise.all(
            Object.entries(librariesToGenerate).map(async ([name, config]) => {
                if (config == null) {
                    return false;
                }
                if (!isGitLibraryInput(config.input)) {
                    context.stderr.error(
                        `${Icons.error} ${chalk.red(
                            `Library '${name}': 'path' input is not yet supported. Please use 'git' input.`
                        )}`
                    );
                    return false;
                }

                try {
                    return await this.generateSingleLibrary({
                        context,
                        name,
                        config,
                        docsAbsoluteFilePath,
                        orgId: workspace.org,
                        token
                    });
                } catch (error) {
                    context.stderr.error(
                        `${Icons.error} ${chalk.red(`Library '${name}': ${extractErrorMessage(error)}`)}`
                    );
                    return false;
                }
            })
        );

        const successful = results.filter(Boolean).length;
        const failed = results.length - successful;

        if (successful > 0) {
            context.stderr.info(
                `${Icons.success} ${chalk.green(
                    `Generated library documentation for ${successful} ${successful === 1 ? "library" : "libraries"}`
                )}`
            );
        }

        if (failed > 0) {
            throw new CliError({ code: CliError.Code.InternalError });
        }
    }

    private async generateSingleLibrary({
        context,
        name,
        config,
        docsAbsoluteFilePath,
        orgId,
        token
    }: {
        context: Context;
        name: string;
        config: docsYml.RawSchemas.LibraryConfiguration;
        docsAbsoluteFilePath: AbsoluteFilePath;
        orgId: string;
        token: FernToken;
    }): Promise<boolean> {
        const resolvedOutputPath = resolve(docsAbsoluteFilePath, config.output.path);
        const gitInput = config.input as docsYml.RawSchemas.GitLibraryInputSchema;

        if (config.config?.doxyfile != null && config.lang !== "cpp") {
            throw new CliError({
                message: `Library '${name}': 'doxyfile' config is only valid for lang: cpp`,
                code: CliError.Code.ConfigError
            });
        }

        let doxyfileContent: string | undefined;
        if (config.lang === "cpp" && config.config?.doxyfile != null) {
            const doxyfilePath = resolve(docsAbsoluteFilePath, config.config.doxyfile);
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

        const client = createLibraryDocsClient({ token: token.value });

        const jobId = await withSpinner({
            message: `Library '${name}': starting generation from ${gitInput.git}`,
            operation: () =>
                this.startGeneration(client, {
                    name,
                    orgId,
                    githubUrl: gitInput.git,
                    language,
                    packagePath: gitInput.subpath,
                    doxyfileContent
                })
        });

        await withSpinner({
            message: `Library '${name}': generating documentation`,
            operation: () => this.pollForCompletion(client, jobId, name)
        });

        const ir = await withSpinner({
            message: `Library '${name}': downloading generated IR`,
            operation: () => this.downloadIr(client, jobId, name, language)
        });

        if (language === "CPP") {
            const cppIr = ir as CppLibraryDocsIr;
            const result = generateCpp({
                ir: cppIr,
                outputDir: resolvedOutputPath,
                slug: name
            });
            context.stderr.info(
                `${Icons.success} ${chalk.green(
                    `Library '${name}': generated ${result.pageCount} pages at ${resolvedOutputPath}`
                )}`
            );
            context.stderr.info(
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
            context.stderr.info(
                `${Icons.success} ${chalk.green(
                    `Library '${name}': generated ${generateResult.pageCount} pages at ${resolvedOutputPath}`
                )}`
            );
        }

        return true;
    }

    private async startGeneration(
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

    private async pollForCompletion(client: LibraryDocsClient, jobId: string, libraryName: string): Promise<void> {
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

    private async downloadIr(
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
                message:
                    `Failed to fetch generation result for library '${libraryName}': ` + extractErrorMessage(error),
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
}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new GenerateCommand();
    command(
        cli,
        "generate",
        "[Beta] Generate MDX documentation from library source code. Requires 'libraries' config in docs.yml.",
        (context, args) => cmd.handle(context, args as GenerateCommand.Args),
        (yargs) =>
            yargs.option("library", {
                type: "string",
                description: "Name of a specific library defined in docs.yml to generate docs for"
            })
    );
}
