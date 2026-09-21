// biome-ignore-all lint/suspicious/noConsole: CLI output is intentionally written to stdout.
import { access } from "fs/promises";
import inquirer from "inquirer";
import path from "path";
import { detectRepository } from "./detect";
import { isFernCliInstalled } from "./detect/package-manager";
import { recommend } from "./recommend";
import { type Command, formatCommand, runCommand } from "./steps/commands";
import { writeAgentHandoff } from "./steps/handoff";
import type { ActionId, ActionPlan, ApiSpec, Detection, WizardFlags } from "./types";
import { printBanner, printNextSteps, printPlan, printRecommendations } from "./ui";

interface ActionAnswers {
    actionIds: ActionId[];
}

interface SpecAnswers {
    specPath: string;
}

export function planActions(detection: Detection, flags: WizardFlags): ActionPlan[] {
    const actions: ActionPlan[] = [];
    if (detection.fernCliVersion === null && !flags.skipInstall) {
        actions.push({ id: "install-cli", label: installLabel(detection), selectedByDefault: true });
    }
    if (!detection.fernProject.exists) {
        actions.push({
            id: "init-api",
            label: `fern init --openapi <selected-spec>${orgLabel(flags.org)}`,
            selectedByDefault: true
        });
    } else {
        console.log("Existing Fern project detected at fern/ — skipping init");
    }
    if (!detection.fernProject.docsConfigExists) {
        actions.push({ id: "init-docs", label: `fern init --docs${orgLabel(flags.org)}`, selectedByDefault: true });
    }
    if (detection.agents.length > 0) {
        actions.push({ id: "agent-mcp", label: "fern login && fern mcp install", selectedByDefault: true });
    }
    actions.push({ id: "agent-handoff", label: "write coding-agent handoff files", selectedByDefault: true });
    if (detection.apiSpecs.length > 0) {
        actions.push({
            id: "cli-interest",
            label: "Interested in a generated CLI for your API?",
            selectedByDefault: false
        });
    }
    return actions;
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

    printBanner(dir);
    const detection = await detectRepository(dir, !flags.dryRun);
    const recommendations = recommend(detection);
    printRecommendations(recommendations);
    const actions = planActions(detection, flags);
    const selected = flags.yes
        ? actions.filter((action) => action.selectedByDefault)
        : await chooseActions(actions, detection);
    const validationError = validateFlags(selected, flags);
    if (validationError !== undefined) {
        console.error(validationError);
        return 1;
    }
    const effectiveFlags =
        selected.some((action) => action.id === "init-api" || action.id === "init-docs") &&
        flags.org === undefined &&
        !flags.yes
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

async function chooseActions(actions: ActionPlan[], detection: Detection): Promise<ActionPlan[]> {
    const answer = await inquirer.prompt<ActionAnswers>([
        {
            type: "checkbox",
            name: "actionIds",
            message: "Choose setup steps",
            choices: actions.map((action) => ({
                name: action.label,
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
            message: "Would you like to install Fern MCP for a coding agent?",
            default: false
        }
    ]);
    return optIn.installMcp
        ? [
              ...actions.filter((action) => answer.actionIds.includes(action.id)),
              { id: "agent-mcp", label: "Install Fern MCP", selectedByDefault: false }
          ]
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
            detection.fernCliVersion = await isFernCliInstalled();
        }
        return;
    }
    if (id === "init-api") {
        const spec = await chooseSpec(detection.apiSpecs, flags.yes);
        if (spec === undefined) {
            if (detection.frameworks.length === 0) {
                await runFernCommand(["init", ...orgArgs(flags.org)], dir, detection);
            } else {
                console.log("No API specification selected; export OpenAPI from your framework first.");
            }
        } else if (spec.format === "openapi") {
            await runFernCommand(["init", "--openapi", spec.path, ...orgArgs(flags.org)], dir, detection);
        } else {
            console.log(
                `${spec.format} detected at ${spec.path}; follow https://buildwithfern.com/learn/api-definitions/openapi/overview to configure it.`
            );
        }
        return;
    }
    if (id === "init-docs") {
        const mintlify = detection.docsTools.find((tool) => tool.name === "mintlify");
        await runFernCommand(
            ["init", "--docs", ...orgArgs(flags.org), ...(mintlify === undefined ? [] : ["--mintlify", mintlify.path])],
            dir,
            detection
        );
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
    if (specs.length === 0 || yes) {
        return specs[0];
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
    return { executable: "pnpm", args: ["add", "-D", "fern-api"] };
}

function installLabel(detection: Detection): string {
    return `Install Fern CLI (${formatCommand(installCommand(detection))})`;
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

function orgLabel(org: string | undefined): string {
    return ` --org ${org ?? "<org>"}`;
}

async function isDirectory(dir: string): Promise<boolean> {
    try {
        await access(dir);
        return true;
    } catch {
        return false;
    }
}
