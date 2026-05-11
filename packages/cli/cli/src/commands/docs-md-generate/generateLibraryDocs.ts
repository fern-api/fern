import { FernToken } from "@fern-api/auth";
import { runLibraryDocsGeneration } from "@fern-api/library-docs-generator";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";

export interface GenerateLibraryDocsOptions {
    project: Project;
    cliContext: CliContext;
    /** If specified, only generate docs for this library */
    library: string | undefined;
}

/**
 * Generate library documentation from source code.
 *
 * Loads the docs workspace, authenticates with FDR, and delegates to the
 * shared orchestrator in `@fern-api/library-docs-generator` which starts
 * server-side parsing, polls for completion, downloads the resulting IR
 * from S3, and runs the local MDX generator.
 */
export async function generateLibraryDocs({ project, cliContext, library }: GenerateLibraryDocsOptions): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;

    if (docsWorkspace == null) {
        cliContext.failAndThrow("No docs workspace found. Make sure you have a docs.yml file.", undefined, {
            code: CliError.Code.ConfigError
        });
        return;
    }

    const libraries = docsWorkspace.config.libraries;

    if (libraries == null) {
        cliContext.failAndThrow(
            "No libraries configured in docs.yml. Add a `libraries` section to configure library documentation.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
        return;
    }

    await cliContext.runTask(async (context) => {
        const { successful } = await runLibraryDocsGeneration({
            libraries,
            library,
            docsDirectoryPath: docsWorkspace.absoluteFilePath,
            orgId: project.config.organization,
            tokenValue: token.value,
            context
        });

        if (successful > 0) {
            context.logger.info(chalk.green(`✓ Generated library documentation for ${successful} libraries`));
        }
    });
}
