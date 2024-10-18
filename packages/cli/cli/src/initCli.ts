import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { FernRegistryClient } from "@fern-fern/generators-sdk";
import { Generator } from "@fern-fern/generators-sdk/api/resources/generators";
import { CliContext } from "./cli-context/CliContext";
import { input, confirm } from "@inquirer/prompts";
import { select } from "inquirer-select-pro";
import { isURL } from "./utils/isUrl";
import { loadOpenAPIFromUrl, LoadOpenAPIStatus } from "@fern-api/init/src/utils/loadOpenApiFromUrl";
import { GeneratorInvocationOverride } from "@fern-api/configuration/src/generators-yml/addGenerator";
import ora from "ora";
import { initializeAPI } from "@fern-api/init";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { addGeneratorToWorkspace } from "./commands/add-generator/addGeneratorToWorkspaces";
import { loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons";
import { createGithubRepo, setupGithubApp } from "./utils/github";
import fileSelector from "inquirer-file-selector";
import { App } from "octokit";
import chalk from "chalk";
import boxen from "boxen";
import { FERN_DIRECTORY } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import { askToLogin } from "@fern-api/login";
import { createOrganizationIfDoesNotExist, FernToken, getCurrentUser } from "@fern-api/auth";
import { initializeAndPushRepository, writeFernConfigRepoAdditions } from "./utils/fernConfig";
import { black } from "./commands/generate-overrides/black";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { generateWorkspace } from "./commands/generate/generateAPIWorkspace";
import { Project } from "@fern-api/project-loader";

export interface InitV2Output {
    organization: string;
    absoluteOpenApiPath: AbsoluteFilePath;
    selectedGenerators: Generator[];
}

export async function initV2(cliContext: CliContext): Promise<void> {
    let maybeOrganization: string | undefined;
    let token: FernToken | undefined;
    let usersToInvite: string[] = [];
    const app = setupGithubApp();

    // Initialize the workspace
    await cliContext.runTask(async (context) => {
        // Needed to stop the fight for stdout, and allow ora to update the spinners in place
        const pathToFernDirectory = join(cwd(), RelativeFilePath.of(FERN_DIRECTORY));
        if (await doesPathExist(pathToFernDirectory)) {
            cliContext.failAndThrow(
                "Fern workspace has already been initialized, run `fern add` to add additional generators."
            );
        }
        const tokenUser = await getCurrentUsersGithubUsername(context);
        usersToInvite = tokenUser == null ? [] : [tokenUser.username];
        token = tokenUser?.token;

        maybeOrganization = await input({
            message: "Do you have a preferred organization name? (leave blank to use your GitHub username)"
        });
        if (maybeOrganization == "") {
            maybeOrganization = undefined;
        }

        // Prompt for spec + initialize workspace
        await initializeFernWorkspace(maybeOrganization, cliContext, context);
    });

    // Go back to the source of truth to pull the org
    const organization = (
        await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true
        })
    ).config.organization;

    // Get that workspace and leverage it
    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });
    let generatedMessages: string[] = [];
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // Write overrides
                await initializeOverrides(context, workspace);

                generatedMessages = await initializeGenerators(
                    organization,
                    cliContext,
                    workspace,
                    app,
                    usersToInvite,
                    context
                );

                // Create a repo for their fern config
                const fernConfigRepoUrl = await initializeFernConfigRepo(context, organization, app, usersToInvite);
                if (fernConfigRepoUrl != null) {
                    generatedMessages.push(fernConfigRepoUrl);
                }
            });
        })
    );

    // Refetch the workspace to get the new generators
    const freshProject = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    await Promise.all(
        freshProject.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (token != null && token.type === "user") {
                    await createOrganizationIfDoesNotExist({
                        organization: project.config.organization,
                        token: token!,
                        context
                    });
                }
                // Run generate on these new generators
                await runGenerateAndFinish(context, workspace, freshProject, token!, generatedMessages);
            });
        })
    );
}

async function getCurrentUsersGithubUsername(
    taskContext: TaskContext
): Promise<{ token: FernToken; username: string } | undefined> {
    const token = await askToLogin(taskContext);
    if (token.type === "user") {
        const user = await getCurrentUser({ token, context: taskContext });
        return { token, username: user.username };
    }
    return undefined;
}

async function runGenerateAndFinish(
    context: TaskContext,
    workspace: AbstractAPIWorkspace<unknown>,
    project: Project,
    token: FernToken,
    generatedMessages: string[]
) {
    try {
        await context.runInteractiveTask({ name: "Generating your TypeScript SDK..." }, async (interactiveContext) => {
            await generateWorkspace({
                organization: project.config.organization,
                workspace,
                projectConfig: project.config,
                context: interactiveContext,
                version: undefined,
                groupName: undefined,
                shouldLogS3Url: false,
                keepDocker: false,
                useLocalDocker: false,
                absolutePathToPreview: undefined,
                mode: undefined,
                token
            });

            interactiveContext.setSubtitle("SDK generated!");

            let message = "";
            message += `${chalk.underline("Your Repositories")}\n\n`;
            message += generatedMessages.map((generatedMessage) => `- ${generatedMessage}`).join("\n");
            interactiveContext.setOutput(
                boxen(message, {
                    padding: 1,
                    float: "center",
                    textAlignment: "center",
                    borderColor: "green",
                    borderStyle: "round"
                })
            );
        });
    } catch (error) {
        context.failWithoutThrowing(
            `Failed to generate libraries, linking repositories, but they're empty for now: ${error as string}`
        );
    }
}
async function initializeGenerators(
    organization: string,
    cliContext: CliContext,
    workspace: AbstractAPIWorkspace<unknown>,
    app: App,
    usersToInvite: string[],
    context: TaskContext
) {
    const generators = await promptForGenerators(context);
    const genPromises: Promise<string | undefined>[] = [];
    for (const generator of generators) {
        genPromises.push(addGenerator(generator, organization, workspace, cliContext, app, usersToInvite, context));
    }

    const maybeRepoMessages = await Promise.all(genPromises);
    const repoMessages = maybeRepoMessages.filter((maybeRepoUrl) => maybeRepoUrl !== undefined) as string[];
    return repoMessages;
}

async function promptForGenerators(context: TaskContext): Promise<Generator[]> {
    const generatorsResponse = await new FernRegistryClient().generators.listGenerators();
    if (!generatorsResponse.ok) {
        context.failAndThrow("Could not fetch generators from registry, please try again later.");
    }

    const sdkGenerators = generatorsResponse.body.filter((generator) => generator.generatorType.type === "sdk");
    const serverGenerators = generatorsResponse.body.filter((generator) => generator.generatorType.type === "server");

    let generators: Generator[] = [];

    await context.runInteractiveTask(
        { name: "Select your generators", taskType: "prompt" },
        async (interactiveContext) => {
            await interactiveContext.takeOverTerminal(async () => {
                const shouldGenerateSdk = await confirm({
                    message: "Would you like to generate SDKs?"
                });
                if (shouldGenerateSdk) {
                    const sdkGeneratorsSelected = await selectGenerators(sdkGenerators, "SDKs");
                    generators.push(...sdkGeneratorsSelected);
                }

                const shouldGenerateServer = await confirm({
                    message: "Would you like to generate server boilerplate?"
                });
                if (shouldGenerateServer) {
                    generators.push(...(await selectGenerators(serverGenerators, "server boilerplate")));
                }

                const generatorNamesSelected = generators.map((generator) => generator.displayName);
                interactiveContext.setSubtitle(
                    generatorNamesSelected.length > 0
                        ? "Selected: " + generatorNamesSelected.join(", ")
                        : "No generators selected"
                );
            });
        }
    );

    return generators;
}

async function initializeOverrides(context: TaskContext, workspace: AbstractAPIWorkspace<unknown>) {
    // TODO: show a stream of the overrides being written to console
    try {
        if (workspace instanceof OSSWorkspace) {
            await context.runInteractiveTask(
                { name: "Writing overrides to improve your API spec", useProgressBar: true },
                async (interactiveContext) => {
                    await black({ workspace, context: interactiveContext });
                    interactiveContext.setSubtitle("Overrides written!");
                }
            );
        }
    } catch (error) {
        context.failWithoutThrowing(error as string);
    }
}

async function initializeFernWorkspace(organization: string | undefined, cliContext: CliContext, context: TaskContext) {
    let openApiSpec = await input({
        message: "Specify your OpenAPI spec (file path or URL), or leave blank to browse your filesystem"
    });
    if (openApiSpec == "") {
        openApiSpec = await fileSelector({
            message: "Select your OpenAPI spec:",
            match: (item) => item.name.endsWith(".yaml") || item.name.endsWith(".yml") || item.name.endsWith(".json")
        });
    }
    const absoluteOpenApiPath = await getOpenApiPathFromInput(openApiSpec, cliContext);
    const initSpinner = ora({ text: "Initializing your Fern workspace..." }).start();
    try {
        context.logger.disable();
        await initializeAPI({
            organization: organization,
            versionOfCli: await getLatestVersionOfCli({
                cliEnvironment: cliContext.environment,
                alwaysReturnLatestVersion: true
            }),
            context,
            openApiPath: absoluteOpenApiPath,
            writeDefaultGeneratorsConfiguration: false,
            includeOverrides: true
        });
        context.logger.enable();
        initSpinner.succeed("Fern workspace initialized!");
    } catch (error) {
        initSpinner.fail("Failed to initialize Fern workspace");
        cliContext.failAndThrow(error as string);
    }
}

const FERN_DEMO_ORG = "fern-demo";

const initializeFernConfigRepo = async (
    context: TaskContext,
    organization: string,
    app: App,
    usersToInvite: string[]
) => {
    let repoUrl: string | undefined = undefined;
    await context.runInteractiveTask({ name: "Creating Fern Configuration repository" }, async (interactiveContext) => {
        // const repoName = `${organization}-fern-config`;
        const repoName = `${organization}-configuration`;
        repoUrl = await createGithubRepo({
            app,
            orgName: FERN_DEMO_ORG,
            repoName,
            usersToInvite,
            description: `The Fern Configuration for generating ${organization}'s SDKs.`
        });
        await writeFernConfigRepoAdditions(organization);
        await initializeAndPushRepository(repoUrl + ".git");
        interactiveContext.setSubtitle("Fern configuration repository created!");
    });

    return repoUrl ? `Fern configuration: ${repoUrl}` : undefined;
};

const addGenerator = async (
    generator: Generator,
    organization: string,
    workspace: AbstractAPIWorkspace<unknown>,
    cliContext: CliContext,
    app: App,
    usersToInvite: string[],
    context: TaskContext
): Promise<string | undefined> => {
    try {
        let repoUrl: string | undefined = undefined;
        await context.runInteractiveTask(
            { name: `Adding ${generator.displayName} generator...` },
            async (interactiveContext) => {
                const repoName = `${organization}-${generator.generatorLanguage}-${generator.generatorType.type}`;
                repoUrl = await createGithubRepo({
                    app,
                    orgName: FERN_DEMO_ORG,
                    repoName,
                    usersToInvite,
                    context: interactiveContext,
                    description: `A ${generator.displayName} for ${organization}.`
                });
                // TODO: we should likely add the generators to different groups and respect those throughout (generation and the github workflows)
                await addGeneratorToWorkspace({
                    workspace,
                    generatorName: generator.dockerImage,
                    groupName: undefined,
                    context,
                    invocation: getGeneratorInvocationOverride(generator, repoName, organization),
                    cliVersion: cliContext.environment.packageVersion
                });
            }
        );

        return repoUrl ? `${generator.displayName}: ${repoUrl}` : undefined;
    } catch (error) {
        return undefined;
    }
};

function getGeneratorInvocationOverride(
    generator: Generator,
    repoName: string,
    organization: string
): GeneratorInvocationOverride {
    const defaultInvocation: GeneratorInvocationOverride = {
        github: {
            repository: `${FERN_DEMO_ORG}/${repoName}`,
            branch: "main",
            mode: "push"
        },
        "smart-casing": true
    };
    if (generator.generatorType.type === "sdk" && generator.generatorLanguage === "typescript") {
        return {
            ...defaultInvocation,
            "ir-version": "v53",
            version: "2.0.0-rc4",
            config: {
                namespaceExport: organization,
                allowCustomFetcher: true,
                skipResponseValidation: true,
                // generateWireTests: true,
                noSerdeLayer: true
            },
            output: {
                location: "npm",
                "package-name": organization
            }
        };
    }
    return defaultInvocation;
}

// Ripped from cli.ts
const getOpenApiPathFromInput = async (openapi: string, cliContext: CliContext): Promise<AbsoluteFilePath> => {
    let absoluteOpenApiPath: AbsoluteFilePath | undefined = undefined;
    if (isURL(openapi)) {
        const result = await loadOpenAPIFromUrl({ url: openapi, logger: cliContext.logger });

        if (result.status === LoadOpenAPIStatus.Failure) {
            cliContext.failAndThrow(result.errorMessage);
        }

        const tmpFilepath = result.filePath;
        absoluteOpenApiPath = AbsoluteFilePath.of(tmpFilepath);
    } else {
        absoluteOpenApiPath = AbsoluteFilePath.of(resolve(cwd(), openapi));
    }
    const pathExists = await doesPathExist(absoluteOpenApiPath);
    if (!pathExists) {
        cliContext.failAndThrow(`${absoluteOpenApiPath} does not exist`);
    }

    return absoluteOpenApiPath;
};

const selectGenerators = async (generators: Generator[], generatorTypeDisplayText: string) => {
    return await select({
        message: `Which languages would you like to generate ${generatorTypeDisplayText} in?`,
        options: generators.map((generator) => ({
            name: generator.generatorLanguage,
            value: generator
        }))
    });
};
