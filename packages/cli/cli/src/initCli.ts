import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { FernRegistryClient } from "@fern-fern/generators-sdk";
import { Generator } from "@fern-fern/generators-sdk/api/resources/generators";
import { CliContext } from "./cli-context/CliContext";
import { input, confirm } from "@inquirer/prompts";
import { select } from "inquirer-select-pro";
import { isURL } from "./utils/isUrl";
import { loadOpenAPIFromUrl, LoadOpenAPIStatus } from "@fern-api/init/src/utils/loadOpenApiFromUrl";
// Ideally we'd use interactive tasks from the context, but there's a fight for stdout that I can't
// figure out how to fix right now, so sticking with Ora
import ora from "ora";
import { initializeAPI } from "@fern-api/init";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons";
import { writeOverridesForWorkspaces } from "./commands/generate-overrides/writeOverridesForWorkspaces";
import { createGithubRepo, setupGithubApp } from "./utils/initv2/github";
import fileSelector from "inquirer-file-selector";

import { App } from "octokit";
import chalk from "chalk";
import boxen from "boxen";
import { generateAPIWorkspaces } from "./commands/generate/generateAPIWorkspaces";
import { FERN_DIRECTORY } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import { askToLogin } from "@fern-api/login";
import { getCurrentUser } from "@fern-api/auth";
import { getOrganziation } from "./commands/organization/getOrganization";
import { initializeAndPushRepository, writeFernConfigRepoAdditions } from "./utils/initv2/fernConfig";

export interface InitV2Output {
    organization: string;
    absoluteOpenApiPath: AbsoluteFilePath;
    selectedGenerators: Generator[];
}

export async function initV2(cliContext: CliContext): Promise<void> {
    await cliContext.runTask(async (context) => {
        // Needed to stop the fight for stdout, and allow ora to update the spinners in place
        cliContext.logger.disable();
        context.logger.disable();

        const pathToFernDirectory = join(cwd(), RelativeFilePath.of(FERN_DIRECTORY));
        if (await doesPathExist(pathToFernDirectory)) {
            cliContext.failAndThrow(
                "Fern workspace has already been initialized, run `fern add` to add additional generators."
            );
        }
        const app = setupGithubApp();
        const username = await getCurrentUsersGithubUsername(context);
        const usersToInvite = username == null ? [] : [username];

        let organization: string | undefined = await input({
            message: "Do you have a preferred organization name? (leave blank to use your GitHub username)"
        });
        if (organization == "") {
            organization = undefined;
        }

        // Prompt for spec + initialize workspace
        await initializeFernWorkspace(organization, cliContext, context);

        // Go back to the source of truth to pull the org
        organization = (
            await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            })
        ).config.organization;

        // Write overrides
        await initializeOverrides(cliContext);

        // TODO: validate spec

        // Prompt for generators, add them to the workspace, and create repos
        const generatedMessages = await initializeGenerators(organization, cliContext, app, usersToInvite, context);
        // Create a repo for their fern config
        generatedMessages.push(await initializeFernConfigRepo(organization, app, usersToInvite, context));

        // Run generate on these new generators
        await runGenerate(cliContext);

        let message = "";
        message += `${chalk.underline("Your Repositories")}\n\n`;
        message += generatedMessages.map((generatedMessage) => `- ${generatedMessage}`).join("\n");

        cliContext.logger.enable();
        cliContext.logger.info(
            boxen(message, {
                padding: 1,
                float: "center",
                textAlignment: "center",
                borderColor: "green",
                borderStyle: "round"
            })
        );
    });
}

async function getCurrentUsersGithubUsername(taskContext: TaskContext): Promise<string | undefined> {
    const token = await askToLogin(taskContext);
    if (token.type === "user") {
        const user = await getCurrentUser({ token, context: taskContext });
        return user.username;
    }
    return undefined;
}

async function runGenerate(cliContext: CliContext) {
    const generateSpinner = ora({ text: "Generating your libraries...\n" }).start();
    try {
        await generateAPIWorkspaces({
            project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: false
            }),
            cliContext,
            version: undefined,
            groupName: undefined,
            shouldLogS3Url: false,
            keepDocker: false,
            useLocalDocker: false,
            preview: false,
            mode: undefined
        });
        generateSpinner.succeed("Libraries generated!");
    } catch (error) {
        generateSpinner.fail("Failed to generate libraries, linking repositories, but they're empty for now.");
        cliContext.failAndThrow(error as string);
    }
}
async function initializeGenerators(
    organization: string,
    cliContext: CliContext,
    app: App,
    usersToInvite: string[],
    context: TaskContext
) {
    const generators = await promptForGenerators(cliContext);
    const genPromises: Promise<string | undefined>[] = [];
    for (const generator of generators) {
        genPromises.push(addGenerator(generator, organization, cliContext, app, usersToInvite, context));
    }
    const maybeRepoMessages = await Promise.all(genPromises);
    const repoMessages = maybeRepoMessages.filter((maybeRepoUrl) => maybeRepoUrl !== undefined) as string[];
    return repoMessages;
}

async function promptForGenerators(cliContext: CliContext): Promise<Generator[]> {
    const generatorsResponse = await new FernRegistryClient().generators.listGenerators();
    if (!generatorsResponse.ok) {
        cliContext.failAndThrow("Could not fetch generators from registry, please try again later.");
    }

    const sdkGenerators = generatorsResponse.body.filter((generator) => generator.generatorType.type === "sdk");
    const serverGenerators = generatorsResponse.body.filter((generator) => generator.generatorType.type === "server");

    const shouldGenerateSdk = await confirm({
        message: "Would you like to generate SDKs?"
    });
    let generators: Generator[] = [];
    if (shouldGenerateSdk) {
        generators.push(...(await selectGenerators(sdkGenerators, "SDKs")));
    }

    const shouldGenerateServer = await confirm({
        message: "Would you like to generate server boilerplate?"
    });
    if (shouldGenerateServer) {
        generators.push(...(await selectGenerators(serverGenerators, "server boilerplate")));
    }

    return generators;
}

async function initializeOverrides(cliContext: CliContext) {
    // TODO: augment this with AI
    // TODO: show a stream of the overrides being written to console

    const overridesSpinner = ora({ text: "Writing overrides to improve your API spec...\n" }).start();
    try {
        await writeOverridesForWorkspaces({
            project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            }),
            includeModels: true,
            cliContext,
            withAI: false
        });
        overridesSpinner.succeed("Overrides written!");
    } catch (error) {
        overridesSpinner.fail(
            "Could not write overrides, but you can do so manually following the steps in our documentation: https://buildwithfern.com/learn/api-definition/openapi/overlay-customizations"
        );
        cliContext.failAndThrow(error as string);
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
    const initSpinner = ora({ text: "Initializing your Fern workspace...\n" }).start();
    try {
        await initializeAPI({
            organization: organization,
            versionOfCli: await getLatestVersionOfCli({ cliEnvironment: cliContext.environment }),
            context,
            openApiPath: absoluteOpenApiPath,
            writeDefaultGeneratorsConfiguration: false
        });
        initSpinner.succeed("Fern workspace initialized!");
    } catch (error) {
        initSpinner.fail("Failed to initialize Fern workspace");
        cliContext.failAndThrow(error as string);
    }
}

const FERN_DEMO_ORG = "fern-demo";

const initializeFernConfigRepo = async (
    organization: string,
    app: App,
    usersToInvite: string[],
    context: TaskContext
) => {
    const repoName = `${organization}-fern-config`;
    const repoUrl = await createGithubRepo({
        app,
        orgName: FERN_DEMO_ORG,
        repoName,
        usersToInvite,
        context,
        description: `The Fern Configuration for generating ${organization}'s SDKs.`
    });
    await writeFernConfigRepoAdditions(organization);
    await initializeAndPushRepository(repoUrl + ".git");
    return `Fern configuration: ${repoUrl}`;
};

const addGenerator = async (
    generator: Generator,
    organization: string,
    cliContext: CliContext,
    app: App,
    usersToInvite: string[],
    context: TaskContext
): Promise<string | undefined> => {
    const generatorSpinner = ora({
        text: `Adding ${generator.displayName} generator...\n`
    }).start();
    try {
        const repoName = `${organization}-${generator.generatorLanguage}-${generator.generatorType.type}`;
        const repoUrl = await createGithubRepo({
            app,
            orgName: FERN_DEMO_ORG,
            repoName,
            usersToInvite,
            context,
            description: `A ${generator.displayName} for ${organization}.`
        });
        // TODO: we should likely add the generators to different groups and respect those throughout (generation and the github workflows)
        await addGeneratorToWorkspaces({
            project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: false
            }),
            generatorName: generator.dockerImage,
            groupName: undefined,
            cliContext,
            invocation: {
                github: {
                    repository: `${FERN_DEMO_ORG}/${repoName}`,
                    branch: "main",
                    mode: "push"
                }
            }
        });
        generatorSpinner.succeed(`${generator.displayName} added!`);
        return `${generator.displayName}: ${repoUrl}`;
    } catch (error) {
        generatorSpinner.fail(`Failed to add ${generator.displayName}`);
        return undefined;
    }
};

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
