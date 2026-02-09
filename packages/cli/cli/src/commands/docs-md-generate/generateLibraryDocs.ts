import { docsYml } from "@fern-api/configuration";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";

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

/**
 * Generate library documentation from source code.
 * This is a stub implementation that prints the parsed config.
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

    // Stub: Print what would be generated
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
        const subpathInfo = config.input.subpath != null ? ` (subpath: ${config.input.subpath})` : "";
        cliContext.logger.info(
            `Would generate library '${name}' from ${config.input.git}${subpathInfo} to ${config.output.path} (lang: ${config.lang})`
        );
    }

    cliContext.logger.info(
        "\nStub implementation complete. Full generation will be implemented in a future iteration."
    );
}
