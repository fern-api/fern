import { resolve as resolvePath } from "node:path";
import { computeSemanticVersion } from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml
} from "@fern-api/configuration-loader";
import { keys, replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { getGeneratorConfig, getPackageNameFromGeneratorConfig } from "@fern-api/local-workspace-runner";
import { Project } from "@fern-api/project-loader";
import { getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { GROUP_CLI_OPTION } from "../../constants";
import { checkOutputDirectory } from "../generate/checkOutputDirectory";
import { applyLfsOverride } from "../generate/generateAPIWorkspace";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";

type SdkGeneratorCli = new () => {
    runProgrammatically: (
        ir: IntermediateRepresentation,
        generatorConfig: ReturnType<typeof getGeneratorConfig>
    ) => Promise<void>;
};

type SdkGeneratorCliLoader = () => Promise<SdkGeneratorCli>;

const SUPPORTED_LANG_MAP: Record<generatorsYml.GenerationLanguage, SdkGeneratorCliLoader | undefined> = {
    [generatorsYml.GenerationLanguage.SWIFT]: loadSwiftGeneratorCli,
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

export async function generateAPIWorkspacesLocal({
    project,
    cliContext,
    groupName,
    api,
    version,
    force,
    lfsOverride
}: {
    project: Project;
    cliContext: CliContext;
    groupName: string | undefined;
    api: string | undefined;
    version: string | undefined;
    force: boolean;
    lfsOverride: string | undefined;
}): Promise<void> {
    validateOutputDirectories({ project, groupName, cliContext, force });

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
            await cliContext.runTaskForWorkspace(workspace, async (taskContext) => {
                const findGroup = () => {
                    const groupNameOrDefault = groupName ?? workspace.generatorsConfiguration?.defaultGroup;
                    if (groupNameOrDefault == null) {
                        return taskContext.failAndThrow(
                            `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`
                        );
                    }
                    let generatorGroup = workspace.generatorsConfiguration?.groups.find(
                        (otherGroup) => otherGroup.groupName === groupNameOrDefault
                    );
                    if (generatorGroup == null) {
                        return taskContext.failAndThrow(`Group '${groupNameOrDefault}' does not exist.`);
                    }
                    return generatorGroup;
                };

                let generatorGroup = findGroup();

                if (lfsOverride != null) {
                    generatorGroup = applyLfsOverride(generatorGroup, lfsOverride, taskContext);
                }

                await validateAPIWorkspaceAndLogIssues({
                    workspace: await workspace.toFernWorkspace({ context: taskContext }),
                    context: taskContext,
                    logWarnings: false
                });

                await Promise.all(
                    generatorGroup.generators.map(async (generatorInvocation) => {
                        const lang = generatorInvocation.language;
                        if (lang == null) {
                            cliContext.logger.warn(
                                `Generator language not specified for "${generatorInvocation.name}"; skipping.`
                            );
                            return;
                        }
                        const sdkGeneratorCliLoader = SUPPORTED_LANG_MAP[lang];
                        if (sdkGeneratorCliLoader == null) {
                            return;
                        }
                        const absolutePathToLocalOutput = generatorInvocation.absolutePathToLocalOutput;
                        if (absolutePathToLocalOutput == null) {
                            cliContext.logger.warn(
                                `Generator output directory not specified for "${generatorInvocation.name}"; skipping.`
                            );
                            return;
                        }
                        return taskContext.runInteractiveTask(
                            { name: generatorInvocation.name },
                            async (interactiveTaskContext) => {
                                generatorInvocation = replaceEnvVariables(generatorInvocation, {
                                    onError: (e) => interactiveTaskContext.failAndThrow(e)
                                });

                                const fernWorkspace = await workspace.toFernWorkspace(
                                    { context: taskContext },
                                    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation)
                                );

                                const packageName = getPackageNameFromGeneratorConfig(generatorInvocation);

                                const intermediateRepresentation = generateIntermediateRepresentation({
                                    workspace: fernWorkspace,
                                    audiences: generatorGroup.audiences,
                                    generationLanguage: generatorInvocation.language,
                                    keywords: generatorInvocation.keywords,
                                    smartCasing: generatorInvocation.smartCasing,
                                    exampleGeneration: {
                                        includeOptionalRequestPropertyExamples: false,
                                        disabled: generatorInvocation.disableExamples
                                    },
                                    readme: generatorInvocation.readme,
                                    version:
                                        version ?? (await computeSemanticVersion({ packageName, generatorInvocation })),
                                    packageName,
                                    context: taskContext,
                                    sourceResolver: new SourceResolverImpl(taskContext, fernWorkspace),
                                    dynamicGeneratorConfig: undefined,
                                    generationMetadata: {
                                        cliVersion: workspace.cliVersion,
                                        generatorName: generatorInvocation.name,
                                        generatorVersion: generatorInvocation.version,
                                        generatorConfig: generatorInvocation.config
                                    }
                                });

                                const generatorConfig = getGeneratorConfig({
                                    generatorInvocation,
                                    customConfig: generatorInvocation.config,
                                    workspaceName: fernWorkspace.definition.rootApiFile.contents.name,
                                    outputVersion: version,
                                    organization: project.config.organization,
                                    absolutePathToSnippet: undefined,
                                    absolutePathToSnippetTemplates: undefined,
                                    absolutePathToFernConfig: project.config._absolutePath,
                                    writeUnitTests: true,
                                    generateOauthClients: false,
                                    generatePaginatedClients: false,
                                    paths: {
                                        snippetPath: undefined,
                                        snippetTemplatePath: undefined,
                                        irPath: AbsoluteFilePath.of(resolvePath(process.cwd(), "ir.json")),
                                        outputDirectory: absolutePathToLocalOutput
                                    }
                                });

                                const cliClass = await sdkGeneratorCliLoader();
                                const cli = new cliClass();
                                await cli.runProgrammatically(intermediateRepresentation, generatorConfig);
                            }
                        );
                    })
                );
            });
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

async function validateOutputDirectories({
    project,
    groupName,
    cliContext,
    force
}: {
    project: Project;
    groupName: string | undefined;
    cliContext: CliContext;
    force: boolean;
}): Promise<void> {
    for (const workspace of project.apiWorkspaces) {
        for (const generator of workspace.generatorsConfiguration?.groups
            .filter((group) => groupName == null || groupName === group.groupName)
            .flatMap((group) => group.generators) ?? []) {
            const { shouldProceed } = await checkOutputDirectory(
                generator.absolutePathToLocalOutput,
                cliContext,
                force
            );
            if (!shouldProceed) {
                cliContext.failAndThrow("Generation cancelled");
            }
        }
    }
}

// function loadSdkGeneratorCli(lang: generatorsYml.GenerationLanguage): SdkGeneratorCliLoader | undefined {
//     switch ()
// }

async function loadSwiftGeneratorCli(): Promise<SdkGeneratorCli> {
    const pathToGeneratorBundle = resolvePath(__dirname, "../../../../../generators/swift/sdk/dist/api.cjs");
    const { SdkGeneratorCLI } = (await import(pathToGeneratorBundle)) as {
        SdkGeneratorCLI: SdkGeneratorCli;
    };
    return SdkGeneratorCLI;
}
