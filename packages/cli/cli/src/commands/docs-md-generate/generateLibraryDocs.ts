import { FernToken } from "@fern-api/auth";
import { docsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { resolve } from "@fern-api/fs-utils";
import { generate } from "@fern-api/library-docs-generator";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

export interface GenerateLibraryDocsOptions {
    project: Project;
    cliContext: CliContext;
    /** If specified, only generate docs for this library */
    library: string | undefined;
}

function isGitLibraryInput(
    input: docsYml.RawSchemas.LibraryInputConfiguration
): input is docsYml.RawSchemas.GitLibraryInputSchema {
    return "git" in input;
}

const POLL_INTERVAL_MS = 3000;

/**
 * Generate library documentation from source code.
 *
 * 1. Authenticates with FDR
 * 2. Starts server-side parsing via FDR API
 * 3. Polls for completion
 * 4. Downloads the resulting IR from S3
 * 5. Runs the local MDX generator (which also writes _navigation.yml)
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

    // Filter to specific library if specified
    const librariesToGenerate = library != null ? { [library]: libraries[library] } : libraries;

    if (library != null && libraries[library] == null) {
        cliContext.failAndThrow(
            `Library '${library}' not found in docs.yml. Available libraries: ${Object.keys(libraries).join(", ")}`
        );
        return;
    }

    // Authenticate
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

        await cliContext.runTask(async (context) => {
            const fdr = createFdrService({ token: token.value });
            const gitInput = config.input as docsYml.RawSchemas.GitLibraryInputSchema;

            context.logger.info(`Starting generation for library '${name}'...`);

            // 1. Start server-side parsing
            const startResponse = await fdr.docs.v2.write.startLibraryDocsGeneration({
                orgId: orgId as Parameters<typeof fdr.docs.v2.write.startLibraryDocsGeneration>[0]["orgId"],
                githubUrl: gitInput.git as Parameters<
                    typeof fdr.docs.v2.write.startLibraryDocsGeneration
                >[0]["githubUrl"],
                language: config.lang === "python" ? "PYTHON" : "CPP",
                config: {
                    branch: undefined, // TODO: make optional in FDR API definition
                    packagePath: gitInput.subpath,
                    title: name,
                    slug: name
                }
            });

            if (!startResponse.ok) {
                return context.failAndThrow(
                    `Failed to start generation for library '${name}': ${JSON.stringify(startResponse.error)}`
                );
            }

            const jobId = startResponse.body.jobId;
            context.logger.info(`Generation job started (${jobId}). Polling for completion...`);

            // 2. Poll for completion
            let completed = false;
            while (!completed) {
                await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

                const statusResponse = await fdr.docs.v2.write.getLibraryDocsGenerationStatus(jobId);

                if (!statusResponse.ok) {
                    return context.failAndThrow(
                        `Failed to check generation status for library '${name}': ${JSON.stringify(statusResponse.error)}`
                    );
                }

                const status = statusResponse.body;

                switch (status.status) {
                    case "PENDING":
                    case "PARSING":
                        context.logger.info(
                            `Status: ${status.status}${status.progress ? ` — ${status.progress}` : ""}`
                        );
                        break;
                    case "COMPLETED":
                        completed = true;
                        break;
                    case "FAILED":
                        return context.failAndThrow(
                            `Generation failed for library '${name}': ${status.error?.message ?? "Unknown error"} (${status.error?.code ?? "UNKNOWN"})`
                        );
                    default:
                        return context.failAndThrow(
                            `Unexpected generation status for library '${name}': ${status.status}`
                        );
                }
            }

            // 3. Fetch IR from S3
            context.logger.info("Downloading generated IR...");

            const resultResponse = await fdr.docs.v2.write.getLibraryDocsResult(jobId);

            if (!resultResponse.ok) {
                return context.failAndThrow(
                    `Failed to fetch generation result for library '${name}': ${JSON.stringify(resultResponse.error)}`
                );
            }

            const irFetchResponse = await fetch(resultResponse.body.resultUrl);
            if (!irFetchResponse.ok) {
                return context.failAndThrow(
                    `Failed to download IR for library '${name}': HTTP ${irFetchResponse.status}`
                );
            }

            const ir = await irFetchResponse.json();

            // 4. Generate MDX files + _navigation.yml
            context.logger.info("Generating MDX files...");

            const generateResult = generate({
                ir,
                outputDir: resolvedOutputPath,
                slug: name,
                title: name
            });

            context.logger.info(
                chalk.green(
                    `Generated ${generateResult.pageCount} pages for '${name}' at ${resolvedOutputPath}`
                )
            );
        });
    }
}
