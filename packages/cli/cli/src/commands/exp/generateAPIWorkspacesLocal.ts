import { resolve as resolvePath } from "node:path";

import { generatorsYml } from "@fern-api/configuration-loader";
import { keys } from "@fern-api/core-utils";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";

const SUPPORTED_LANG_MAP: Record<
    generatorsYml.GenerationLanguage,
    ((args: GenerateAPIWorkspacesLocalArgs) => Promise<void>) | undefined
> = {
    [generatorsYml.GenerationLanguage.SWIFT]: runSwiftLocalGeneration,
    [generatorsYml.GenerationLanguage.TYPESCRIPT]: undefined,
    [generatorsYml.GenerationLanguage.JAVA]: undefined,
    [generatorsYml.GenerationLanguage.PYTHON]: undefined,
    [generatorsYml.GenerationLanguage.GO]: undefined,
    [generatorsYml.GenerationLanguage.RUBY]: undefined,
    [generatorsYml.GenerationLanguage.CSHARP]: undefined,
    [generatorsYml.GenerationLanguage.PHP]: undefined,
    [generatorsYml.GenerationLanguage.RUST]: undefined
};

const SUPPORTED_LANGUAGES = new Set(keys(SUPPORTED_LANG_MAP).filter((lang) => SUPPORTED_LANG_MAP[lang] != null));

interface GenerateAPIWorkspacesLocalArgs {
    project: Project;
    cliContext: CliContext;
    groupName: string | undefined;
    api: string | undefined;
    version: string | undefined;
}

export async function generateAPIWorkspacesLocal({
    project,
    cliContext,
    groupName,
    api,
    version
}: GenerateAPIWorkspacesLocalArgs): Promise<void> {
    const presentLanguages = getPresentLanguages(project, groupName);
    const presentSupportedLanguages = presentLanguages.filter((lang) => SUPPORTED_LANGUAGES.has(lang));
    const presentUnsupportedLanguages = presentLanguages.filter((lang) => !SUPPORTED_LANGUAGES.has(lang));

    if (presentUnsupportedLanguages.length > 0) {
        cliContext.logger.warn(
            `Local generation is not yet available for the following languages: ${presentUnsupportedLanguages.join(
                ", "
            )}. These generators will be skipped.`
        );
    }

    if (presentSupportedLanguages.length === 0) {
        cliContext.logger.warn("Local generation is not yet available for any generators in the selected group.");
        return;
    }

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await Promise.all(
                (workspace.generatorsConfiguration?.groups ?? []).map(async (group) => {
                    await Promise.all(
                        group.generators.map(async (generator) => {
                            if (generator.language == null) {
                                cliContext.logger.warn(
                                    `Generator language not specified for "${generator.name}"; skipping.`
                                );
                                return;
                            }
                            const handler = SUPPORTED_LANG_MAP[generator.language];
                            await handler?.({ project, cliContext, groupName, api, version });
                        })
                    );
                })
            );
        })
    );
}

function getPresentLanguages(project: Project, groupName: string | undefined) {
    const langs = new Set<generatorsYml.GenerationLanguage>();

    for (const workspace of project.apiWorkspaces) {
        const generatorsConfig = workspace.generatorsConfiguration;
        if (generatorsConfig == null) {
            continue;
        }
        const group = generatorsConfig.groups.find((g) => g.groupName === (groupName ?? generatorsConfig.defaultGroup));
        group?.generators
            .map((g) => g.language)
            .filter((lang) => lang != null)
            .forEach((lang) => langs.add(lang));
    }

    return Array.from(langs);
}

async function runSwiftLocalGeneration(args: GenerateAPIWorkspacesLocalArgs): Promise<void> {
    const { project, cliContext, groupName, api, version } = args;

    // We derive an output directory from the first Swift generator we find.
    const swiftOutDir = getFirstSwiftOutputDir(project, groupName);
    if (swiftOutDir == null) {
        cliContext.logger.warn(
            "Found Swift generators but no local output directory is configured; skipping local Swift generation."
        );
        return;
    }

    const pathToGeneratorBundle = resolvePath(__dirname, "../../../../../generators/swift/sdk-wrapper/dist/api.cjs");

    const module = (await import(pathToGeneratorBundle)) as {
        generateSwiftSdk: (args: {
            api: string | undefined;
            group: string | undefined;
            outDir: string;
            version: string | undefined;
        }) => Promise<void>;
    };

    if (typeof module.generateSwiftSdk !== "function") {
        cliContext.failAndThrow("Failed to load Swift generator: missing generateSwiftSdk export.");
    }

    await module.generateSwiftSdk({
        api,
        group: groupName,
        outDir: swiftOutDir,
        version
    });
}

function getFirstSwiftOutputDir(project: Project, groupName: string | undefined): string | undefined {
    for (const workspace of project.apiWorkspaces) {
        const generatorsConfig = workspace.generatorsConfiguration;
        if (generatorsConfig == null || generatorsConfig.groups.length === 0) {
            continue;
        }

        const groupNameOrDefault = groupName ?? generatorsConfig.defaultGroup;
        if (groupNameOrDefault == null) {
            continue;
        }

        const group = generatorsConfig.groups.find((g) => g.groupName === groupNameOrDefault);
        if (group == null) {
            continue;
        }

        for (const generator of group.generators) {
            if (generator.language === generatorsYml.GenerationLanguage.SWIFT) {
                const outDir = generator.absolutePathToLocalOutput as string | undefined;
                if (outDir != null) {
                    return outDir;
                }
            }
        }
    }
    return undefined;
}
