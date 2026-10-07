// biome-ignore-all lint/suspicious/noConsole: CLI output is intentionally written to stdout.
import { stat } from "fs/promises";
import inquirer from "inquirer";
import path from "path";
import { detectRepository } from "./detect";
import { isFernCliInstalled } from "./detect/package-manager";
import { recommend } from "./recommend";
import { showSplash } from "./splash";
import { type Command, formatCommand, runCommand } from "./steps/commands";
import { agentHandoffFiles, writeAgentHandoff } from "./steps/handoff";
import type { ActionId, ActionPlan, ApiSpec, Detection, WizardFlags } from "./types";
import { formatAction, printNextSteps, printPlan, printRecommendations } from "./ui";

interface ActionAnswers {
    actionIds: ActionId[];
}

interface SpecAnswers {
    specPath: string;
}

const ORG_PLACEHOLDER = "<your-org>";

export function planActions(detection: Detection, flags: WizardFlags): ActionPlan[] {
    const actions: ActionPlan[] = [];
    if (detection.fernCliVersion === null && !flags.skipInstall) {
        actions.push({
            id: "install-cli",
            title: "Install the Fern CLI",
            description: detection.hasPackageJson
                ? "Adds fern-api as a dev dependency so everyone on this repo uses the same Fern version."
                : "Installs the `fern` command globally so you can run it from any directory.",
            commands: [formatCommand(installCommand(detection))],
            files: [],
            selectedByDefault: true
        });
    }
    if (detection.fernProject.exists) {
        console.log("Existing Fern project detected at fern/ — skipping init");
    } else {
        const initApi = planInitApi(detection, flags);
        if (initApi !== undefined) {
            actions.push(initApi);
        }
    }
    if (!detection.fernProject.docsConfigExists) {
        const mintJson = findMintJson(detection);
        actions.push({
            id: "init-docs",
            ...(mintJson === undefined
                ? {
                      title: "Set up a docs site",
                      description: "Adds fern/docs.yml for a Fern docs site you can preview with `fern docs dev`."
                  }
                : {
                      title: "Import your Mintlify docs",
                      description: `Converts ${mintJson} into fern/docs.yml and copies your pages and images into fern/.`
                  }),
            commands: [displayFernCommand(detection, flags, docsInitArgs(detection, flags.org ?? ORG_PLACEHOLDER))],
            files: [],
            selectedByDefault: true
        });
    }
    if (detection.agents.length > 0) {
        actions.push(agentMcpAction(detection, flags));
    }
    actions.push({
        id: "agent-handoff",
        title: "Teach your coding agent about Fern",
        description: "Writes Fern setup instructions your agent picks up automatically. Existing files are left alone.",
        commands: [],
        files: agentHandoffFiles(detection),
        selectedByDefault: true
    });
    if (detection.apiSpecs.length > 0) {
        actions.push({
            id: "cli-interest",
            title: "Learn about the CLI generator (early access)",
            description: "Prints links to the CLI generator docs and a demo booking page. Changes nothing.",
            commands: [],
            files: [],
            selectedByDefault: false
        });
    }
    return actions;
}

function agentMcpAction(detection: Detection, flags: WizardFlags): ActionPlan {
    return {
        id: "agent-mcp",
        title: "Connect your coding agents to Fern",
        description:
            "Signs you in to Fern, then adds the Fern MCP server to the Claude Code, Cursor, or Codex config in your home directory (for example ~/.cursor/mcp.json).",
        commands: [
            displayFernCommand(detection, flags, ["login"]),
            displayFernCommand(detection, flags, ["mcp", "install"])
        ],
        files: [],
        selectedByDefault: true
    };
}

function planInitApi(detection: Detection, flags: WizardFlags): ActionPlan | undefined {
    const openApiSpecs = getOpenApiSpecs(detection.apiSpecs);
    const org = flags.org ?? ORG_PLACEHOLDER;
    if (openApiSpecs.length > 0) {
        const spec = openApiSpecs.length === 1 || flags.yes ? pickDefaultSpec(openApiSpecs) : undefined;
        return {
            id: "init-api",
            title: "Create a Fern project from your API spec",
            description: `Creates fern/ with fern.config.json and generators.yml pointing at ${spec?.path ?? "the spec you pick next"}.`,
            commands: [
                displayFernCommand(detection, flags, [
                    "init",
                    "--openapi",
                    spec?.path ?? "<selected-spec>",
                    "--org",
                    org
                ])
            ],
            files: [],
            selectedByDefault: true
        };
    }
    const nonOpenApiSpec = detection.apiSpecs[0];
    if (nonOpenApiSpec !== undefined) {
        console.log(
            `Found ${nonOpenApiSpec.format} at ${nonOpenApiSpec.path} — skipping API init; see https://buildwithfern.com/learn/api-definitions/overview/what-is-an-api-definition to configure it`
        );
        return undefined;
    }
    const framework = detection.frameworks.find((candidate) => candidate.canGenerateOpenApi) ?? detection.frameworks[0];
    if (framework !== undefined) {
        console.log(`Found ${framework.name} but no OpenAPI spec — skipping API init until you export one`);
        return undefined;
    }
    return {
        id: "init-api",
        title: "Create a starter Fern project",
        description: "No API spec was found, so Fern creates fern/ with a sample OpenAPI spec you can replace.",
        commands: [displayFernCommand(detection, flags, ["init", "--org", org])],
        files: [],
        selectedByDefault: true
    };
}

/**
 * The command as it will run: plain `fern` when the CLI is (or is about to be) on PATH, otherwise
 * through the repository's package runner.
 */
function displayFernCommand(detection: Detection, flags: WizardFlags, args: string[]): string {
    const fernOnPath = detection.fernCliVersion !== null || (!detection.hasPackageJson && !flags.skipInstall);
    return formatCommand(fernOnPath ? { executable: "fern", args } : fernRunner(detection, args));
}

function findMintJson(detection: Detection): string | undefined {
    return detection.docsTools.find((tool) => tool.name === "mintlify" && path.basename(tool.path) === "mint.json")
        ?.path;
}

function getOpenApiSpecs(specs: ApiSpec[]): ApiSpec[] {
    return specs.filter((spec) => spec.format === "openapi");
}

export async function runWizard(flags: WizardFlags): Promise<number> {
    const dir = path.resolve(flags.dir);
    if (!(await isDirectory(dir))) {
        console.error(`Directory does not exist: ${dir}`);
        return 1;
    }
    if (!flags.yes && !process.stdin.isTTY) {
        console.error("Interactive mode requires a TTY. Re-run with --yes for non-interactive mode.");
        return 1;
    }

    const detection = await showSplash(dir, detectRepository(dir));
    const recommendations = recommend(detection);
    printRecommendations(recommendations);
    const actions = planActions(detection, flags);
    const selected = flags.yes
        ? actions.filter((action) => action.selectedByDefault)
        : await chooseActions(actions, detection, flags);
    const validationError = validateFlags(selected, flags);
    if (validationError !== undefined) {
        console.error(validationError);
        return 1;
    }
    const effectiveFlags =
        selected.some((action) => action.id === "init-api" || action.id === "init-docs") &&
        flags.org === undefined &&
        !flags.yes &&
        !flags.dryRun
            ? { ...flags, org: await promptForOrganization() }
            : flags;

    if (flags.dryRun) {
        printPlan(selected);
        return 0;
    }

    let failed = false;
    let cliInterest = false;
    for (const action of selected) {
        try {
            if (action.id === "cli-interest") {
                cliInterest = true;
                console.log(
                    "\nThe CLI generator is early access. Learn more at https://buildwithfern.com/learn/cli-generator/get-started/quickstart"
                );
                console.log("Book a demo: https://buildwithfern.com/book-demo?type=cli");
            } else if (action.id === "agent-handoff") {
                await writeAgentHandoff(dir, detection);
            } else {
                await executeAction(action.id, dir, detection, effectiveFlags);
            }
        } catch (error) {
            failed = true;
            console.error(`Step failed (${action.id}): ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    printNextSteps(cliInterest);
    return failed ? 1 : 0;
}

export function validateFlags(selected: ActionPlan[], flags: WizardFlags): string | undefined {
    const needsOrganization = selected.some((action) => action.id === "init-api" || action.id === "init-docs");
    if (needsOrganization && flags.yes && flags.org === undefined && !flags.dryRun) {
        return "--yes requires --org <name> when initializing a Fern project";
    }
    return undefined;
}

async function promptForOrganization(): Promise<string> {
    const answer = await inquirer.prompt<{ organization: string }>([
        {
            type: "input",
            name: "organization",
            message: "Fern organization name (used for fern.config.json)",
            validate: (input: string) => input.trim().length > 0 || "Organization name cannot be empty"
        }
    ]);
    return answer.organization.trim();
}

async function chooseActions(actions: ActionPlan[], detection: Detection, flags: WizardFlags): Promise<ActionPlan[]> {
    const answer = await inquirer.prompt<ActionAnswers>([
        {
            type: "checkbox",
            name: "actionIds",
            message: "Choose what to set up",
            // Each choice spans several lines; show them all instead of paginating mid-choice.
            pageSize: 40,
            loop: false,
            choices: actions.map((action) => ({
                // Continuation lines line up with the title after inquirer's "❯◉ " prefix; the trailing
                // newline leaves a blank line between steps.
                name: `${formatAction(action, "   ")}\n`,
                short: action.title,
                value: action.id,
                checked: action.selectedByDefault
            }))
        }
    ]);
    if (answer.actionIds.includes("agent-mcp") || detection.agents.length > 0) {
        return actions.filter((action) => answer.actionIds.includes(action.id));
    }
    const optIn = await inquirer.prompt<{ installMcp: boolean }>([
        {
            type: "confirm",
            name: "installMcp",
            message:
                "Connect a coding agent (Claude Code, Cursor, or Codex) to Fern? This runs `fern login` and `fern mcp install`.",
            default: false
        }
    ]);
    return optIn.installMcp
        ? [...actions.filter((action) => answer.actionIds.includes(action.id)), agentMcpAction(detection, flags)]
        : actions.filter((action) => answer.actionIds.includes(action.id));
}

async function executeAction(
    id: Exclude<ActionId, "agent-handoff" | "cli-interest">,
    dir: string,
    detection: Detection,
    flags: WizardFlags
): Promise<void> {
    if (id === "install-cli") {
        await runCommand(installCommand(detection), dir);
        if (!detection.hasPackageJson) {
            detection.fernCliVersion = await isFernCliInstalled(dir);
        }
        return;
    }
    if (id === "init-api") {
        // planActions only offers init-api when there is an OpenAPI spec or nothing to import at all.
        const spec = await chooseSpec(getOpenApiSpecs(detection.apiSpecs), flags.yes);
        await runFernCommand(
            spec === undefined
                ? ["init", ...orgArgs(flags.org)]
                : ["init", "--openapi", spec.path, ...orgArgs(flags.org)],
            dir,
            detection
        );
        return;
    }
    if (id === "init-docs") {
        await runFernCommand(docsInitArgs(detection, flags.org), dir, detection);
        return;
    }
    let firstError: unknown;
    try {
        await runFernCommand(["login"], dir, detection);
    } catch (error) {
        firstError = error;
    }
    try {
        await runFernCommand(["mcp", "install"], dir, detection);
    } catch (error) {
        firstError ??= error;
    }
    if (firstError !== undefined) {
        throw firstError;
    }
}

async function chooseSpec(specs: ApiSpec[], yes: boolean): Promise<ApiSpec | undefined> {
    if (specs.length <= 1 || yes) {
        return pickDefaultSpec(specs);
    }
    const answer = await inquirer.prompt<SpecAnswers>([
        {
            type: "list",
            name: "specPath",
            message: "Which API specification should Fern initialize?",
            choices: specs.map((spec) => ({ name: `${spec.path} (${spec.format})`, value: spec.path }))
        }
    ]);
    return specs.find((spec) => spec.path === answer.specPath);
}

export function pickDefaultSpec(specs: ApiSpec[]): ApiSpec | undefined {
    return specs.find((spec) => spec.format === "openapi") ?? specs[0];
}

export function docsInitArgs(detection: Detection, org: string | undefined): string[] {
    // `fern init --mintlify` only imports the legacy mint.json format, not Mintlify's newer docs.json.
    const mintJson = findMintJson(detection);
    return ["init", ...(mintJson === undefined ? ["--docs"] : ["--mintlify", mintJson]), ...orgArgs(org)];
}

async function runFernCommand(args: string[], dir: string, detection: Detection): Promise<void> {
    await runCommand(fernRunner(detection, args), dir);
}

export function installCommand(detection: Detection): Command {
    const packageManager = detection.packageManager;
    if (!detection.hasPackageJson) {
        return { executable: "npm", args: ["install", "-g", "fern-api"] };
    }
    if (packageManager === "npm") {
        return { executable: "npm", args: ["install", "--save-dev", "fern-api"] };
    }
    if (packageManager === "yarn") {
        return { executable: "yarn", args: ["add", "--dev", "fern-api"] };
    }
    if (packageManager === "bun") {
        return { executable: "bun", args: ["add", "--dev", "fern-api"] };
    }
    return {
        executable: "pnpm",
        args: detection.pnpmWorkspaceRoot ? ["add", "-D", "-w", "fern-api"] : ["add", "-D", "fern-api"]
    };
}

export function fernRunner(detection: Detection, args: string[] = []): Command {
    if (detection.fernCliVersion !== null) {
        return { executable: "fern", args };
    }
    if (detection.packageManager === "pnpm") {
        return { executable: "pnpm", args: ["exec", "fern", ...args] };
    }
    if (detection.packageManager === "yarn") {
        return { executable: "yarn", args: ["fern", ...args] };
    }
    if (detection.packageManager === "bun") {
        return { executable: "bunx", args: ["fern-api", ...args] };
    }
    return { executable: "npx", args: ["-y", "fern-api", ...args] };
}

function orgArgs(org: string | undefined): string[] {
    return org === undefined ? [] : ["--org", org];
}

async function isDirectory(dir: string): Promise<boolean> {
    try {
        return (await stat(dir)).isDirectory();
    } catch {
        return false;
    }
}
