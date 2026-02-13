import { FernToken } from "@fern-api/auth";
import { docsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { resolve } from "@fern-api/fs-utils";
import { generate } from "@fern-api/library-docs-generator";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

export interface GenerateLibraryDocsOptions {
    project: Project;
    cliContext: CliContext;
    /** If specified, only generate docs for this library */
    library: string | undefined;
}

type FdrService = ReturnType<typeof createFdrService>;

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

    for (const [name, config] of Object.entries(librariesToGenerate)) {
        if (config == null) {
            continue;
        }
        if (!isGitLibraryInput(config.input)) {
            cliContext.failAndThrow(
                `Library '${name}' uses 'path' input which is not yet supported. Please use 'git' input.`
            );
            return;
        }

        const resolvedOutputPath = resolve(docsWorkspace.absoluteFilePath, config.output.path);
        const gitInput = config.input as docsYml.RawSchemas.GitLibraryInputSchema;

        await cliContext.runTask(async (context) => {
            const fdr = createFdrService({ token: token.value });

            context.logger.info(`Starting generation for library '${name}'...`);

            const jobId = await startGeneration(fdr, context, {
                orgId,
                githubUrl: gitInput.git,
                language: config.lang === "python" ? "PYTHON" : "CPP",
                packagePath: gitInput.subpath,
                name
            });

            await pollForCompletion(fdr, jobId, name, context);

            const ir = await downloadIr(fdr, jobId, name, context);

            context.logger.info("Generating MDX files...");

            const generateResult = generate({
                ir,
                outputDir: resolvedOutputPath,
                slug: name,
                title: name
            });

            context.logger.info(
                chalk.green(`Generated ${generateResult.pageCount} pages for '${name}' at ${resolvedOutputPath}`)
            );
        });
    }
}

async function startGeneration(
    fdr: FdrService,
    context: TaskContext,
    opts: { orgId: string; githubUrl: string; language: "PYTHON" | "CPP"; packagePath?: string; name: string }
): Promise<FdrAPI.docs.v2.write.LibraryDocsJobId> {
    const startResponse = await fdr.docs.v2.write.startLibraryDocsGeneration({
        orgId: FdrAPI.OrgId(opts.orgId),
        githubUrl: FdrAPI.Url(opts.githubUrl),
        language: opts.language,
        config: {
            branch: undefined,
            packagePath: opts.packagePath,
            title: opts.name,
            slug: opts.name
        }
    });

    if (!startResponse.ok) {
        return context.failAndThrow(
            `Failed to start generation for library '${opts.name}': ${JSON.stringify(startResponse.error)}`
        );
    }

    const jobId = startResponse.body.jobId;
    context.logger.info(`Generation job started (${jobId}). Polling for completion...`);
    return jobId;
}

async function pollForCompletion(
    fdr: FdrService,
    jobId: FdrAPI.docs.v2.write.LibraryDocsJobId,
    libraryName: string,
    context: TaskContext
): Promise<void> {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        const statusResponse = await fdr.docs.v2.write.getLibraryDocsGenerationStatus(jobId);

        if (!statusResponse.ok) {
            return context.failAndThrow(
                `Failed to check generation status for library '${libraryName}': ${JSON.stringify(statusResponse.error)}`
            );
        }

        const status = statusResponse.body;

        switch (status.status) {
            case "PENDING":
            case "PARSING":
                context.logger.info(`Status: ${status.status}${status.progress ? ` — ${status.progress}` : ""}`);
                break;
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
    fdr: FdrService,
    jobId: FdrAPI.docs.v2.write.LibraryDocsJobId,
    libraryName: string,
    context: TaskContext
): Promise<FdrAPI.libraryDocs.PythonLibraryDocsIr> {
    context.logger.info("Downloading generated IR...");

    const resultResponse = await fdr.docs.v2.write.getLibraryDocsResult(jobId);

    if (!resultResponse.ok) {
        return context.failAndThrow(
            `Failed to fetch generation result for library '${libraryName}': ${JSON.stringify(resultResponse.error)}`
        );
    }

    const irFetchResponse = await fetch(resultResponse.body.resultUrl);
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
    if (ir.rootModule == null) {
        return context.failAndThrow(`IR has no rootModule for library '${libraryName}'`);
    }

    return ir;
}
