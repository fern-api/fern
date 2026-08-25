import { runLibraryDocsGeneration } from "@fern-api/library-docs-generator";
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
 * Loads the docs workspace and delegates to the shared orchestrator in
 * `@fern-api/library-docs-generator`, which runs the parser Docker images
 * on the user's machine — no authentication or network calls are required.
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

    if (library != null && libraries[library] == null) {
        cliContext.failAndThrow(
            `Library '${library}' not found in docs.yml. Available libraries: ${Object.keys(libraries).join(", ")}`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    await cliContext.runTask(async (context) => {
        const { successful } = await runLibraryDocsGeneration({
            libraries,
            library,
            docsDirectoryPath: docsWorkspace.absoluteFilePath,
            context
        });

        if (successful > 0) {
            context.logger.info(chalk.green(`✓ Generated library documentation for ${successful} libraries`));
        }
    });
}
