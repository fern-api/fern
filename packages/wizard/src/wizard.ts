// biome-ignore-all lint/suspicious/noConsole: CLI output is intentionally written to stdout.
import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";
import { readFile, stat, writeFile } from "fs/promises";
import inquirer from "inquirer";
import path from "path";
import { pathToFileURL } from "url";
import { parse as parseYaml } from "yaml";
import { detectRepository } from "./detect";
import { isFernCliInstalled } from "./detect/package-manager";
import {
    type Availability,
    type AvailabilityChecker,
    createAvailabilityChecker,
    DOCS_DOMAIN,
    findUsableName,
    isValidName
} from "./docs-site/availability";
import { readFernToken } from "./docs-site/brand";
import { applyBrand, chooseBrand, toSubdomain } from "./docs-site/brand-flow";
import { pickAvailableName } from "./docs-site/name-picker";
import { type DocsSiteChoices, defaultDocsSiteChoices } from "./docs-site/options";
import { promptDocsSiteChoices } from "./docs-site/prompt";
import { scaffoldDocsSite } from "./docs-site/scaffold";
import { showSplash } from "./splash";
import {
    type Command,
    CommandFailedError,
    formatCommand,
    openInBrowser,
    runCommand,
    runCommandQuietly
} from "./steps/commands";
import { agentHandoffFiles, writeAgentHandoff } from "./steps/handoff";
import {
    ensureSdkGroup,
    isDockerRunning,
    isNonEmptyDirectory,
    listApis,
    readConfiguredSdks,
    readOrganization,
    SDK_LANGUAGES,
    type SdkLanguage,
    sdkGroupWritesOnlyLocally,
    setGeneratorVersion
} from "./steps/sdks";
import type {
    ActionId,
    ActionPlan,
    ActionPlanResult,
    Agent,
    ApiSpec,
    Detection,
    Product,
    PublishResult,
    SetupStep,
    StepId,
    WizardFlags
} from "./types";
import {
    billingUrl,
    dashboardUrl,
    hyperlink,
    printDetail,
    printDone,
    printFailed,
    printNextSteps,
    printPlan,
    printSkipped,
    printStepHeader,
    printStepPreview,
    withStatus
} from "./ui";

interface SpecAnswers {
    specPath: string;
}

type DocsSkillTarget = Exclude<Agent, "vscode"> | "github-copilot";

const DOCS_SKILL_PATHS: Record<DocsSkillTarget, string> = {
    "claude-code": ".claude/skills/fern-docs/",
    cursor: ".agents/skills/fern-docs/",
    codex: ".agents/skills/fern-docs/",
    "github-copilot": ".agents/skills/fern-docs/",
    windsurf: ".windsurf/skills/fern-docs/"
};

const ORG_PLACEHOLDER = "<your-org>";

const ALL_PRODUCTS: Product[] = ["sdks", "docs"];

const STEPS: Array<{ id: StepId; title: string; question: string; actions: ActionId[] }> = [
    {
        id: "cli-setup",
        title: "Set up Fern",
        question: "Set up Fern in this repo?",
        actions: ["install-cli", "init-api", "init-docs"]
    },
    {
        id: "agent",
        title: "Teach your coding agent",
        question: "Teach your coding agent about Fern?",
        // Connecting the MCP server also signs you in and edits global agent configs, so it asks again.
        actions: ["agent-handoff", "docs-skills", "agent-mcp"]
    },
    {
        id: "publish",
        title: "Preview and publish your docs",
        question: "Create a preview link for your docs?",
        actions: ["publish-docs"]
    },
    {
        id: "generate",
        title: "Generate your SDKs",
        question: "Generate SDKs now?",
        actions: ["generate-sdks"]
    }
];

export function planActions(
    detection: Detection,
    flags: WizardFlags,
    products: Product[] = ALL_PRODUCTS
): ActionPlanResult {
    const actions: ActionPlan[] = [];
    const notes: string[] = [];
    const wantsSdks = products.includes("sdks");
    const wantsDocs = products.includes("docs");
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
    // API docs alone only need `fern init` when there is a spec to wire into the API reference;
    // otherwise the docs template creates the project itself.
    const wantsApiProject = wantsSdks || (wantsDocs && getOpenApiSpecs(detection.apiSpecs).length > 0);
    if (detection.fernProject.exists) {
        notes.push("Existing Fern project found in fern/, so no new project is needed");
    } else if (wantsApiProject) {
        const initApi = planInitApi(detection, flags, notes);
        if (initApi !== undefined) {
            actions.push(initApi);
        }
    }
    if (wantsDocs && !detection.fernProject.docsConfigExists) {
        const mintJson = findMintJson(detection);
        actions.push({
            id: "init-docs",
            ...(mintJson === undefined
                ? {
                      title: "Create your docs site",
                      description:
                          "Copies Fern's docs starter into fern/ with the layout, branding, and features you pick next (same options as the dashboard onboarding)."
                  }
                : {
                      title: "Import your Mintlify docs",
                      description: `Converts ${mintJson} into fern/docs.yml and copies your pages and images into fern/.`
                  }),
            commands:
                mintJson === undefined
                    ? []
                    : [displayFernCommand(detection, flags, docsInitArgs(mintJson, flags.org ?? ORG_PLACEHOLDER))],
            files: mintJson === undefined ? ["fern/docs.yml", "fern/docs/", "fern/styles.css"] : [],
            selectedByDefault: true
        });
    }
    const docsInitializationOffered = wantsDocs && !detection.fernProject.docsConfigExists;
    const docsSiteAlreadyExists = detection.fernProject.docsConfigExists === true;
    if (shouldOfferDocsSkill(docsInitializationOffered, docsSiteAlreadyExists, detection.docsSkillInstalled)) {
        actions.push(docsSkillAction(detection));
    }
    if (detection.agents.length > 0 && flags.skipMcp !== true) {
        actions.push(agentMcpAction(detection, flags));
    }
    if (wantsDocs && (detection.fernProject.docsConfigExists === true || docsInitializationOffered)) {
        actions.push({
            id: "publish-docs",
            title: "Create a preview link, then choose whether to publish",
            description:
                "Builds a shareable preview of your docs, then asks before publishing your public site and adding it to your Fern Dashboard.",
            commands: [
                displayFernCommand(detection, flags, ["generate", "--docs", "--preview"]),
                displayFernCommand(detection, flags, ["generate", "--docs"])
            ],
            files: [],
            selectedByDefault: true
        });
    }
    if (wantsSdks && (detection.fernProject.exists || actions.some((action) => action.id === "init-api"))) {
        actions.push({
            id: "generate-sdks",
            title: "Pick your SDK languages, then generate them into sdks/",
            description: "Adds a generator for each language you pick and generates the SDKs into this repository.",
            commands: [displayFernCommand(detection, flags, ["generate"])],
            files: ["sdks/"],
            selectedByDefault: true
        });
    }
    actions.push({
        id: "agent-handoff",
        title: handoffTitle(detection),
        description: "Writes Fern setup instructions your agent picks up automatically. Existing files are left alone.",
        commands: [],
        files: agentHandoffFiles(detection),
        selectedByDefault: true
    });
    return { actions, notes };
}

/** Names the agents that will get Fern instructions, e.g. "Claude Code and Cursor". */
function handoffTitle(detection: Detection): string {
    const agents = detection.agents.filter((agent) => agent === "claude-code" || agent === "cursor");
    if (agents.length === 0) {
        return "Add Fern instructions to AGENTS.md";
    }
    return `Write Fern instructions for ${agents.map((agent) => AGENT_NAMES[agent]).join(" and ")}`;
}

/** Groups planned actions into the wizard's steps, dropping steps with nothing to do. */
export function planSteps(actions: ActionPlan[]): SetupStep[] {
    return STEPS.map((step) => ({
        id: step.id,
        title: step.title,
        question: step.question,
        actions: step.actions.flatMap((id) => actions.filter((action) => action.id === id))
    })).filter((step) => step.actions.length > 0);
}

/** SDK generation needs an OpenAPI spec to start from, so it is only preselected when one exists. */
export function defaultProducts(detection: Detection): Product[] {
    return getOpenApiSpecs(detection.apiSpecs).length > 0 ? ["sdks", "docs"] : ["docs"];
}

export function shouldOfferDocsSkill(
    docsInitializationOffered: boolean,
    docsSiteAlreadyExists: boolean,
    skillAlreadyInstalled: boolean
): boolean {
    return !skillAlreadyInstalled && (docsInitializationOffered || docsSiteAlreadyExists);
}

function docsSkillTargets(detection: Detection): DocsSkillTarget[] {
    const targets: DocsSkillTarget[] =
        detection.agents.length === 0
            ? ["claude-code", "cursor", "codex"]
            : detection.agents.map((agent) => {
                  if (agent === "vscode") {
                      return "github-copilot";
                  }
                  return agent;
              });
    return [...new Set(targets)];
}

function docsSkillAction(detection: Detection): ActionPlan {
    const targets = docsSkillTargets(detection);
    const command = formatCommand({
        executable: "npx",
        args: ["-y", "skills@1.6.0", "add", "fern-api/skills", "--skill", "fern-docs", "-a", ...targets, "-y"]
    });
    return {
        id: "docs-skills",
        title: "Add the fern-docs skill",
        description:
            "Installs the fern-docs skill from fern-api/skills so your coding agent follows Fern's conventions for docs.yml, navigation, components, changelogs, redirects, and access control. Commit the files so your team gets it too.",
        commands: [command],
        files: [...new Set(targets.map((target) => DOCS_SKILL_PATHS[target])), "skills-lock.json"],
        selectedByDefault: true
    };
}

function agentMcpAction(detection: Detection, flags: WizardFlags): ActionPlan {
    return {
        id: "agent-mcp",
        title: "Connect Fern's MCP server to your coding agents",
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

function planInitApi(detection: Detection, flags: WizardFlags, notes: string[]): ActionPlan | undefined {
    const openApiSpecs = getOpenApiSpecs(detection.apiSpecs);
    const org = flags.org ?? ORG_PLACEHOLDER;
    if (openApiSpecs.length > 0) {
        const spec = openApiSpecs.length === 1 || flags.yes ? pickDefaultSpec(openApiSpecs) : undefined;
        return {
            id: "init-api",
            title:
                spec === undefined
                    ? "Create a Fern project from your API spec"
                    : `Create a Fern project from ${spec.path}`,
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
        notes.push(
            `Found ${nonOpenApiSpec.format} at ${nonOpenApiSpec.path} — skipping API init; see https://buildwithfern.com/learn/api-definitions/overview/what-is-an-api-definition to configure it`
        );
        return undefined;
    }
    const framework = detection.frameworks.find((candidate) => candidate.canGenerateOpenApi) ?? detection.frameworks[0];
    if (framework !== undefined) {
        notes.push(`Found ${framework.name} but no OpenAPI spec — skipping API init until you export one`);
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

    const detected = await showSplash(dir, detectRepository(dir), flags.splash);
    const spec = flags.spec === undefined ? undefined : findSpec(detected.apiSpecs, dir, flags.spec);
    if (flags.spec !== undefined && spec === undefined) {
        const found = detected.apiSpecs.map((candidate) => candidate.path).join(", ") || "none";
        console.error(`No API spec found at ${flags.spec}. Specs found: ${found}`);
        return 1;
    }
    // --spec narrows the run to that spec, so nothing asks which one to use.
    const detection = spec === undefined ? detected : { ...detected, apiSpecs: [spec] };
    const products = flags.products ?? (flags.yes ? defaultProducts(detection) : await chooseProducts(detection));
    const planned = planActions(detection, flags, products);
    // Publishing and generating SDKs need a person to make choices, so non-interactive runs stop short of them.
    const steps = planSteps(planned.actions).filter(
        (step) => !(flags.yes && (step.id === "publish" || step.id === "generate"))
    );
    // An existing Fern project already names its organization.
    const projectOrg = await readOrganization(dir);
    const validationError = validateFlags(planned.actions, flags, projectOrg);
    if (validationError !== undefined) {
        console.error(validationError);
        return 1;
    }
    if (flags.dryRun) {
        printPlan(steps, planned.notes);
        return 0;
    }

    let org = projectOrg ?? flags.org;
    let failed = false;
    let orgTaken = false;
    let scaffoldedDocsSite: DocsSiteChoices | undefined;
    const published: PublishResult = {};
    for (const [index, step] of steps.entries()) {
        printStepHeader(index + 1, steps.length, step.title);
        if (step.id === "cli-setup") {
            for (const note of planned.notes) {
                printSkipped(note);
            }
        }
        printStepPreview(step.actions.filter((action) => action.id !== "agent-mcp"));
        if (!flags.yes && !(await confirm(step.question))) {
            printSkipped("Skipped");
            continue;
        }

        let docsSiteChoices: DocsSiteChoices | undefined;
        if (step.id === "cli-setup") {
            const buildsDocsSite =
                step.actions.some((action) => action.id === "init-docs") && findMintJson(detection) === undefined;
            // Look up the brand first so the docs site, and the suggested org name, come pre-filled.
            const brand =
                buildsDocsSite && !flags.skipBrand
                    ? await chooseBrand({
                          dir,
                          org,
                          query: flags.brand,
                          yes: flags.yes,
                          login: () => runFernCommand(["login"], dir, detection)
                      })
                    : undefined;
            const needsOrg = step.actions.some((action) => action.id === "init-api" || action.id === "init-docs");
            // The brand lookup already offered to sign in; otherwise offer it here so the org name is
            // checked and created now, not when publishing in a later step.
            const offeredSignIn = buildsDocsSite && !flags.skipBrand;
            if (needsOrg && !flags.yes && !offeredSignIn && (await readFernToken()) === undefined) {
                if (await confirm("Sign in to Fern to check and reserve your organization name?")) {
                    await runFernCommand(["login"], dir, detection);
                }
            }
            const token = await readFernToken();
            const availability = token === undefined ? undefined : createAvailabilityChecker(token);
            if (needsOrg && org === undefined) {
                const brandSlug = brand?.brand.slug === undefined ? undefined : toSubdomain(brand.brand.slug);
                const typed = await promptForOrganization(brandSlug);
                org =
                    availability === undefined
                        ? typed
                        : await pickAvailableName({
                              name: typed,
                              noun: "organization name",
                              check: (name) => availability.organization(name),
                              reserve: (name) => reserveOrganization(name, availability)
                          });
            } else if (needsOrg && org !== undefined && availability !== undefined) {
                if (projectOrg !== undefined && flags.org !== undefined && flags.org !== projectOrg) {
                    printSkipped(`Using the organization ${projectOrg} from fern/fern.config.json instead of --org`);
                }
                if (!(await reserveOrganization(org, availability))) {
                    if (projectOrg === undefined || flags.yes) {
                        failed = true;
                        orgTaken = true;
                        printFailed(
                            projectOrg === undefined
                                ? `The Fern organization "${org}" belongs to another team. Re-run with a different --org, like "${org}-docs".`
                                : `fern/fern.config.json uses the Fern organization "${org}", which belongs to another team. Change "organization" there, then re-run.`
                        );
                        continue;
                    }
                    org = await switchProjectOrganization(dir, org, availability);
                }
            }
            if (buildsDocsSite) {
                const defaults = applyBrand(defaultDocsSiteChoices(org ?? ORG_PLACEHOLDER, flags.template), brand);
                const chosen =
                    flags.yes || !(await confirmCustomize()) ? defaults : await promptDocsSiteChoices(defaults, dir);
                docsSiteChoices =
                    availability === undefined
                        ? chosen
                        : await withFreeDocsUrl(chosen, availability, { interactive: !flags.yes, org });
            }
        }

        for (const action of step.actions) {
            if (action.id === "agent-mcp" && !flags.yes && !(await confirm(mcpQuestion(detection)))) {
                continue;
            }
            try {
                await runAction(
                    action,
                    dir,
                    detection,
                    { ...flags, org },
                    docsSiteChoices ?? scaffoldedDocsSite,
                    published
                );
                if (action.id === "init-docs" && docsSiteChoices !== undefined) {
                    scaffoldedDocsSite = docsSiteChoices;
                }
            } catch (error) {
                failed = true;
                printFailed(`${action.title} failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    printNextSteps(products, {
        // Prefer fern.config.json, but fall back to the organization this run used, so the Dashboard
        // link matches the one shown after publishing even if the file can't be read.
        organization: orgTaken ? undefined : ((await readOrganization(dir)) ?? org),
        docsUrl: await docsSiteUrl(dir, scaffoldedDocsSite),
        ...published
    });
    return failed ? 1 : 0;
}

async function chooseProducts(detection: Detection): Promise<Product[]> {
    const preselected = defaultProducts(detection);
    const answer = await inquirer.prompt<{ products: Product[] }>([
        {
            type: "checkbox",
            name: "products",
            message: "What do you want to set up?",
            choices: [
                { name: "SDK generation", value: "sdks", checked: preselected.includes("sdks") },
                { name: "API docs", value: "docs", checked: preselected.includes("docs") }
            ]
        }
    ]);
    return answer.products;
}

async function confirm(message: string): Promise<boolean> {
    const answer = await inquirer.prompt<{ proceed: boolean }>([
        { type: "confirm", name: "proceed", message, default: true }
    ]);
    return answer.proceed;
}

function mcpQuestion(detection: Detection): string {
    const names = detection.agents.map((agent) => AGENT_NAMES[agent]).join(", ");
    return `Also connect Fern's MCP server to ${names}? This signs you in to Fern.`;
}

const AGENT_NAMES: Record<Agent, string> = {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    codex: "Codex",
    vscode: "VS Code",
    windsurf: "Windsurf"
};

/** Runs one action quietly and prints a one-line result. */
async function runAction(
    action: ActionPlan,
    dir: string,
    detection: Detection,
    flags: WizardFlags,
    docsSiteChoices: DocsSiteChoices | undefined,
    published: PublishResult
): Promise<void> {
    switch (action.id) {
        case "install-cli":
            await withStatus("Installing the Fern CLI", () => runCommandQuietly(installCommand(detection), dir));
            if (!detection.hasPackageJson) {
                detection.fernCliVersion = await isFernCliInstalled(dir);
            }
            printDone("Installed the Fern CLI");
            return;
        case "init-api": {
            // planActions only offers init-api when there is an OpenAPI spec or nothing to import at all.
            const spec = await chooseSpec(getOpenApiSpecs(detection.apiSpecs), flags.yes);
            const args =
                spec === undefined
                    ? ["init", ...orgArgs(flags.org)]
                    : ["init", "--openapi", spec.path, ...orgArgs(flags.org)];
            await withStatus("Creating your Fern project", () => runFernQuietly(args, dir, detection));
            printDone(
                spec === undefined ? "Created a starter Fern project in fern/" : `Created fern/ from ${spec.path}`
            );
            return;
        }
        case "init-docs": {
            const mintJson = findMintJson(detection);
            if (mintJson !== undefined) {
                await withStatus("Importing your Mintlify docs", () =>
                    runFernQuietly(docsInitArgs(mintJson, flags.org), dir, detection)
                );
                printDone(`Imported your Mintlify docs from ${mintJson}`);
                return;
            }
            if (docsSiteChoices === undefined) {
                throw new Error("Docs site choices are missing.");
            }
            const choices = docsSiteChoices;
            const result = await withStatus("Building your docs site", () =>
                scaffoldDocsSite({ dir, org: flags.org ?? ORG_PLACEHOLDER, choices })
            );
            printDone(`Created your docs site in fern/ (${result.written.length} files)`);
            return;
        }
        case "docs-skills":
            await withStatus("Adding the fern-docs skill", () => runCommandQuietly(docsSkillCommand(detection), dir));
            printDone(
                `Added the fern-docs skill (${action.files.filter((file) => file !== "skills-lock.json").join(", ")})`
            );
            return;
        case "agent-handoff": {
            const result = await writeAgentHandoff(dir, detection);
            if (result.written.length > 0) {
                printDone(`Wrote ${result.written.join(", ")}`);
            }
            if (result.skipped.length > 0) {
                printSkipped(
                    `${result.skipped.join(", ")} already ${result.skipped.length === 1 ? "has" : "have"} Fern instructions`
                );
            }
            return;
        }
        case "agent-mcp":
            if (flags.yes && (await readFernToken()) === undefined) {
                // Signing in opens a browser and waits, which a non-interactive run can't do.
                printSkipped(
                    "Not signed in to Fern, so the MCP server wasn't connected. Run `fern login`, then `fern mcp install`."
                );
                return;
            }
            // Signing in may open a browser and wait for it, so it keeps the terminal.
            await runFernCommand(["login"], dir, detection);
            await withStatus("Connecting Fern's MCP server", () => runFernQuietly(["mcp", "install"], dir, detection));
            printDone("Connected Fern's MCP server to your coding agents");
            return;
        case "publish-docs":
            await previewAndPublish(dir, detection, docsSiteChoices, published);
            return;
        case "generate-sdks":
            await generateSdks(dir, detection, published);
            return;
        default:
            assertNever(action.id);
    }
}

export function validateFlags(selected: ActionPlan[], flags: WizardFlags, projectOrg?: string): string | undefined {
    const needsOrganization = selected.some((action) => action.id === "init-api" || action.id === "init-docs");
    if (needsOrganization && flags.yes && flags.org === undefined && projectOrg === undefined && !flags.dryRun) {
        return "--yes requires --org <name> when initializing a Fern project";
    }
    return undefined;
}

async function promptForOrganization(suggestion: string | undefined): Promise<string> {
    const answer = await inquirer.prompt<{ organization: string }>([
        {
            type: "input",
            name: "organization",
            message: "Fern organization name (used for fern.config.json)",
            default: suggestion,
            validate: (input: string) =>
                isValidName(input.trim()) || "Use lowercase letters, numbers, and hyphens (not at the start or end)."
        }
    ]);
    return answer.organization.trim();
}

/**
 * Creates the organization now if it's free, so a name another team owns is caught before setup
 * continues. Returns false only when another team owns it.
 */
async function reserveOrganization(name: string, availability: AvailabilityChecker): Promise<boolean> {
    const result = await withStatus(`Checking the organization name ${name}`, () =>
        availability.claimOrganization(name)
    );
    switch (result) {
        case "created":
            printDone(`Created the Fern organization ${name}`);
            return true;
        case "mine":
            printDone(`Using your Fern organization ${name}`);
            return true;
        case "taken":
            return false;
        case "unknown":
            printSkipped(`Couldn't create the Fern organization ${name} yet; Fern will try again when you publish`);
            return true;
        default:
            assertNever(result);
    }
}

/**
 * Keeps the chosen docs URL if it's free (or already the user's). Otherwise the user picks from free
 * alternatives (the organization name first), or, without prompts, a free one is chosen like the
 * Dashboard does.
 */
async function withFreeDocsUrl(
    choices: DocsSiteChoices,
    availability: AvailabilityChecker,
    { interactive, org }: { interactive: boolean; org: string | undefined }
): Promise<DocsSiteChoices> {
    if (interactive) {
        const subdomain = await pickAvailableName({
            name: choices.subdomain,
            noun: "docs URL",
            check: (name) => availability.docsUrl(name),
            display: (name) => `${name}.${DOCS_DOMAIN}`,
            preferred: org === undefined ? [] : [org]
        });
        return { ...choices, subdomain };
    }
    const usable = await findUsableName(choices.subdomain, (name) => availability.docsUrl(name));
    if (!usable.changed) {
        return choices;
    }
    printSkipped(
        `${choices.subdomain}.${DOCS_DOMAIN} belongs to another team, so your docs will use ${usable.name}.${DOCS_DOMAIN}`
    );
    return { ...choices, subdomain: usable.name };
}

/** The brand fills in the docs site; the detailed template questions are optional. */
async function confirmCustomize(): Promise<boolean> {
    const answer = await inquirer.prompt<{ customize: boolean }>([
        {
            type: "confirm",
            name: "customize",
            message: "Customize the docs site (title, URL, layout, colors, fonts, features)?",
            default: false
        }
    ]);
    return answer.customize;
}

/**
 * Publishes a preview of the docs and shows its link, then asks before publishing the public site.
 * `fern generate --docs` creates the Fern organization if it doesn't exist yet.
 */
async function previewAndPublish(
    dir: string,
    detection: Detection,
    docsSiteChoices: DocsSiteChoices | undefined,
    published: PublishResult
): Promise<void> {
    if ((await readFernToken()) === undefined) {
        // Signing in may open a browser and wait for it, so it keeps the terminal.
        await runFernCommand(["login"], dir, detection);
    }
    await checkProjectOrganization(dir);
    const previewOutput = await withStatus("Building a preview of your docs (this can take a minute)", () =>
        runFernQuietly(["generate", "--docs", "--preview", "--no-prompt"], dir, detection)
    );
    const previewUrl = parsePublishedUrl(previewOutput);
    published.previewUrl = previewUrl;
    printDone(previewUrl === undefined ? "Built a preview of your docs" : `Preview ready: ${chalk.cyan(previewUrl)}`);

    const siteUrl = await ensureFreeDocsUrl(dir, await docsSiteUrl(dir, docsSiteChoices));
    const dashboard = dashboardUrl(await readOrganization(dir));
    const publish = await inquirer.prompt<{ publish: boolean }>([
        {
            type: "confirm",
            name: "publish",
            message: `Publish your docs to ${siteUrl ?? "your docs site"}? They'll be public and appear in your Fern Dashboard.`,
            default: true
        }
    ]);
    if (!publish.publish) {
        printSkipped("Not published. Run `fern generate --docs` when you're ready to add them to your Fern Dashboard.");
        return;
    }
    let publishOutput: string;
    try {
        publishOutput = await withStatus("Publishing your docs", () =>
            runFernQuietly(["generate", "--docs", "--no-prompt"], dir, detection)
        );
    } catch (error) {
        const takenDomain = error instanceof FernCommandError ? error.takenDomain : undefined;
        if (takenDomain === undefined) {
            throw error;
        }
        // Someone else owns this docs URL: let the user pick another, update docs.yml, and try again.
        printFailed(`${takenDomain} belongs to another team on Fern`);
        const subdomain = await promptForDocsUrl(takenDomain);
        await setDocsUrl(dir, takenDomain, `${subdomain}.${DOCS_DOMAIN}`);
        publishOutput = await withStatus("Publishing your docs", () =>
            runFernQuietly(["generate", "--docs", "--no-prompt"], dir, detection)
        );
    }
    // Only report a published site when Fern says it published one.
    const publishedUrl = parsePublishedUrl(publishOutput);
    if (publishedUrl === undefined) {
        printSkipped(`Fern didn't report a published site. Check your Fern Dashboard: ${dashboard}`);
        return;
    }
    published.publishedUrl = publishedUrl;
    printDone(`Published to ${chalk.cyan(publishedUrl)}`);
    printDone(`Added to your Fern Dashboard: ${chalk.cyan(dashboard)}`);
}

async function promptForDocsUrl(takenDomain: string): Promise<string> {
    const token = await readFernToken();
    const taken = takenDomain.replace(`.${DOCS_DOMAIN}`, "");
    const availability = token === undefined ? undefined : createAvailabilityChecker(token);
    // The publish just proved this URL is taken, even if the registry hadn't caught up.
    const check = async (name: string): Promise<Availability> =>
        name === taken ? "taken" : (availability?.docsUrl(name) ?? "unknown");
    return pickAvailableName({ name: taken, noun: "docs URL", check, display: (name) => `${name}.${DOCS_DOMAIN}` });
}

/** Lets the user pick SDK languages, adds their generators, and generates the SDKs into this repository. */
async function generateSdks(dir: string, detection: Detection, results: PublishResult): Promise<void> {
    const apis = await listApis(dir);
    if (apis.length > 1) {
        printSkipped(
            `This project has several APIs (${apis.join(", ")}). Add SDKs to one with \`fern add <generator> --api <name>\`, then run \`fern generate --api <name>\`.`
        );
        return;
    }
    await checkProjectOrganization(dir);
    const group = await ensureSdkGroup(dir);
    const groupArgs = group === undefined ? [] : ["--group", group];
    const configured = await readConfiguredSdks(dir);
    const configuredGenerators = new Set(configured.map((sdk) => sdk.language.generator));
    const answer = await inquirer.prompt<{ generators: string[] }>([
        {
            type: "checkbox",
            name: "generators",
            message: "Which SDKs do you want?",
            pageSize: SDK_LANGUAGES.length + 1,
            choices: SDK_LANGUAGES.map((language) => ({
                name: language.free ? language.label : `${language.label} ${chalk.dim("(Enterprise plan)")}`,
                value: language.generator,
                // Languages already in generators.yml are always generated, so they can't be unchecked here.
                ...(configuredGenerators.has(language.generator)
                    ? { checked: true, disabled: "already set up" }
                    : { checked: configured.length === 0 && language.generator === "fern-typescript-sdk" })
            }))
        }
    ]);
    const added = SDK_LANGUAGES.filter(
        (language) => answer.generators.includes(language.generator) && !configuredGenerators.has(language.generator)
    );
    const enterprise = added.filter((language) => !language.free);
    const includeEnterprise =
        enterprise.length === 0 || (await continueWithEnterpriseLanguages(enterprise, await readOrganization(dir)));
    for (const language of added) {
        if (language.free || includeEnterprise) {
            await withStatus(`Adding the ${language.label} SDK`, () =>
                runFernQuietly(["add", language.generator, ...groupArgs], dir, detection)
            );
        }
    }

    const sdks = await readConfiguredSdks(dir);
    if (sdks.length === 0) {
        printSkipped("No SDKs to generate");
        return;
    }
    if (!(await sdkGroupWritesOnlyLocally(dir))) {
        printSkipped(
            `fern/generators.yml also publishes SDKs (for example to npm), so the wizard won't run it. Run \`fern generate${group === undefined ? "" : ` --group ${group}`}\` when you're ready.`
        );
        return;
    }
    const names = sdks.map((sdk) => sdk.language.label).join(", ");
    const output = await generateSdkFiles({ dir, detection, groupArgs, names });

    const generated: Array<{ label: string; path: string }> = [];
    const empty: string[] = [];
    for (const sdk of sdks) {
        if (sdk.outputPath === undefined) {
            continue;
        }
        if (!(await isNonEmptyDirectory(sdk.outputPath))) {
            empty.push(sdk.language.label);
            continue;
        }
        const relative = path.relative(dir, sdk.outputPath) || ".";
        generated.push({ label: sdk.language.label, path: relative });
        printDone(`${sdk.language.label} SDK  ${chalk.cyan(hyperlink(relative, pathToFileURL(sdk.outputPath).href))}`);
    }
    results.generatedSdks = generated;
    if (empty.length > 0) {
        // Fern can report success even when a generator crashed and wrote nothing.
        const reason = generatorError(output);
        throw new Error(
            `Fern wrote no files for the ${empty.join(", ")} SDK${empty.length === 1 ? "" : "s"}${reason === undefined ? "" : `. The generator reported: ${reason}`}. Run \`fern generate --log-level debug\` to see more.`
        );
    }
}

/** The version a first SDK build gets; it only names the generated package, since nothing is published. */
const FIRST_SDK_VERSION = "0.1.0";

/**
 * Generates with Docker when it's running, and on Fern's servers otherwise or if Docker fails (some
 * Docker setups, like Colima's defaults, can't see the files Fern shares with the generator).
 * Returns what Fern printed.
 */
async function generateSdkFiles({
    dir,
    detection,
    groupArgs,
    names
}: {
    dir: string;
    detection: Detection;
    groupArgs: string[];
    names: string;
}): Promise<string> {
    if (await isDockerRunning()) {
        try {
            return await withStatus(`Generating ${names} with Docker (this can take a few minutes)`, () =>
                runFernQuietly(["generate", ...groupArgs, "--local", "--no-prompt"], dir, detection)
            );
        } catch (error) {
            const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
            printSkipped(`Generating with Docker failed (${reason}), so Fern's servers will generate ${names}`);
        }
    }
    // Every output is a folder in this repository (checked above), so a version only names the package.
    const generate = (): Promise<string> =>
        withStatus(`Generating ${names} on Fern's servers (this can take a few minutes)`, () =>
            runFernQuietly(["generate", ...groupArgs, "--version", FIRST_SDK_VERSION, "--no-prompt"], dir, detection)
        );
    try {
        return await generate();
    } catch (error) {
        const unavailable =
            error instanceof FernCommandError ? parseUnavailableGeneratorVersion(error.output) : undefined;
        if (
            unavailable === undefined ||
            !(await setGeneratorVersion(dir, unavailable.generator, unavailable.requested, unavailable.available))
        ) {
            throw error;
        }
        // `fern init` pins the newest generator, which Fern's servers may not offer yet.
        printSkipped(
            `Fern's servers don't have ${unavailable.generator} ${unavailable.requested} yet, so fern/generators.yml now uses ${unavailable.available}`
        );
        return generate();
    }
}

/** Reads Fern's "version X is not currently available" error, which names the newest version it has. */
export function parseUnavailableGeneratorVersion(
    output: string
): { generator: string; requested: string; available: string } | undefined {
    const match = output.match(
        /Generator (\S+) version (\S+) is not currently available\. The latest available version in the same major line is (\d[\w.+-]*?)\.?(?:\s|$)/
    );
    if (match?.[1] === undefined || match[2] === undefined || match[3] === undefined) {
        return undefined;
    }
    return { generator: match[1], requested: match[2], available: match[3] };
}

/** The first error a generator printed, such as "Unsupported xml scalar type …". */
export function generatorError(output: string): string | undefined {
    return output.match(/\bError: ([^\n]+)/)?.[1]?.trim();
}

/**
 * The Free plan includes TypeScript and Python SDKs; other languages need the Enterprise plan. Sends
 * the user to the billing page in the Fern Dashboard to upgrade, unless their organization already has
 * it. Returns whether to set up the Enterprise languages now.
 */
async function continueWithEnterpriseLanguages(
    languages: SdkLanguage[],
    organization: string | undefined
): Promise<boolean> {
    const names = languages.map((language) => language.label).join(", ");
    const them = languages.length === 1 ? "it" : "them";
    const billing = billingUrl(organization);
    const answer = await inquirer.prompt<{ choice: "upgrade" | "enterprise" | "skip" }>([
        {
            type: "list",
            name: "choice",
            message: `${names} ${languages.length === 1 ? "SDK needs" : "SDKs need"} the Enterprise plan (TypeScript and Python are free). What next?`,
            choices: [
                { name: "Upgrade in the Fern Dashboard (opens the billing page)", value: "upgrade" },
                { name: `My organization already has Enterprise: set up ${names}`, value: "enterprise" },
                { name: `Skip ${names} for now`, value: "skip" }
            ]
        }
    ]);
    switch (answer.choice) {
        case "enterprise":
            return true;
        case "skip":
            printSkipped(`Skipped ${names}. Upgrade at ${billing} to add ${them} later.`);
            return false;
        case "upgrade": {
            if (await openInBrowser(billing)) {
                printDone(`Opened the billing page: ${chalk.cyan(billing)}`);
            } else {
                printDetail(`Open this page to upgrade: ${chalk.cyan(billing)}`);
            }
            if (await confirm(`Finished upgrading? Set up ${names} now?`)) {
                return true;
            }
            printSkipped(
                `Skipped ${names}. After upgrading, add ${them} with ${languages.map((language) => `\`fern add ${language.generator}\``).join(", ")}.`
            );
            return false;
        }
        default:
            assertNever(answer.choice);
    }
}

/**
 * Before publishing or generating, makes sure the organization in fern/fern.config.json is the user's,
 * creating it if it's free. When another team owns it, the user picks a different one.
 */
async function checkProjectOrganization(dir: string): Promise<void> {
    const token = await readFernToken();
    const organization = await readOrganization(dir);
    if (token === undefined || organization === undefined) {
        return;
    }
    const availability = createAvailabilityChecker(token);
    const result = await availability.claimOrganization(organization);
    switch (result) {
        case "mine":
        case "unknown":
            // Already the user's, or Fern can't say; `fern generate` reports any problem itself.
            return;
        case "created":
            printDone(`Created the Fern organization ${organization}`);
            return;
        case "taken":
            await switchProjectOrganization(dir, organization, availability);
            return;
        default:
            assertNever(result);
    }
}

/** Lets the user replace an organization another team owns, and updates fern/fern.config.json. */
async function switchProjectOrganization(
    dir: string,
    taken: string,
    availability: AvailabilityChecker
): Promise<string> {
    const organization = await pickAvailableName({
        name: taken,
        noun: "organization name",
        check: (name) => availability.organization(name),
        reserve: (name) => reserveOrganization(name, availability)
    });
    await setProjectOrganization(dir, organization);
    printDone(`Updated fern/fern.config.json to use ${organization}`);
    return organization;
}

/** Switches an existing project to a different organization. */
async function setProjectOrganization(dir: string, organization: string): Promise<void> {
    const configPath = path.join(dir, "fern", "fern.config.json");
    const config: unknown = JSON.parse(await readFile(configPath, "utf8"));
    if (typeof config !== "object" || config === null || Array.isArray(config)) {
        throw new Error("fern/fern.config.json isn't a JSON object.");
    }
    await writeFile(configPath, `${JSON.stringify({ ...config, organization }, null, 4)}\n`);
}

/** Points docs.yml's instance at a new URL. */
async function setDocsUrl(dir: string, from: string, to: string): Promise<void> {
    const docsPath = path.join(dir, "fern", "docs.yml");
    const contents = await readFile(docsPath, "utf8");
    await writeFile(docsPath, contents.split(from).join(to));
}

/** A failed fern command: its message is the few lines that explain why. */
class FernCommandError extends Error {
    constructor(
        message: string,
        /** Everything the command printed. */
        public readonly output: string,
        /** Set when the docs URL belongs to another organization. */
        public readonly takenDomain: string | undefined
    ) {
        super(message);
    }
}

/** Runs a fern command quietly; on failure, reports only the lines that explain it. */
async function runFernQuietly(args: string[], dir: string, detection: Detection): Promise<string> {
    try {
        return await runCommandQuietly(fernRunner(detection, args), dir);
    } catch (error) {
        if (!(error instanceof CommandFailedError)) {
            throw error;
        }
        const takenDomain = error.output.match(/domains belong to another organization:\s*(\S+)/)?.[1];
        throw new FernCommandError(summarizeFailure(error.output), error.output, takenDomain);
    }
}

/**
 * The few lines of fern's output that explain a failure, without the warnings and progress
 * messages that surround them.
 */
export function summarizeFailure(output: string): string {
    const lines = output
        .split("\n")
        .map((line) => line.trim())
        // Skip warnings and the "Upgrades available" box.
        .filter((line) => line.length > 0 && !/\[warning\]/i.test(line) && !/^[│╭╰]/.test(line));
    const explaining = lines.filter((line) =>
        /error|fail|denied|forbidden|unauthori[sz]ed|belong|not found|invalid|must|cannot|unsupported|not currently available|no such file/i.test(
            line
        )
    );
    const unique = [...new Set(explaining.map((line) => line.replace(/^\[[^\]]+\]:\s*/, "")))];
    if (unique.length === 0) {
        return lines.at(-1) ?? "fern exited with an error";
    }
    return unique.slice(-3).join("\n");
}

/** The link `fern generate --docs` prints after "Published docs to". */
export function parsePublishedUrl(output: string): string | undefined {
    return output.match(/Published docs to (https?:\/\/\S+)/)?.[1]?.replace(/[.,)]+$/, "");
}

/** The public docs URL, from the template choices or the first instance in fern/docs.yml. */
/** The docs site's URL from fern/docs.yml (which may have changed since setup), else the chosen one. */
async function docsSiteUrl(dir: string, docsSiteChoices: DocsSiteChoices | undefined): Promise<string | undefined> {
    const chosen = docsSiteChoices === undefined ? undefined : `https://${docsSiteChoices.subdomain}.${DOCS_DOMAIN}`;
    try {
        const docsConfig: unknown = parseYaml(await readFile(path.join(dir, "fern", "docs.yml"), "utf8"));
        const instances = isRecord(docsConfig) && Array.isArray(docsConfig.instances) ? docsConfig.instances : [];
        const first: unknown = instances[0];
        const url = isRecord(first) && typeof first.url === "string" ? first.url : undefined;
        return url === undefined ? chosen : url.startsWith("http") ? url : `https://${url}`;
    } catch {
        // No docs.yml yet.
        return chosen;
    }
}

/**
 * Before publishing, makes sure no other team owns the docs URL in fern/docs.yml (for example after
 * switching organizations). If one does, the user picks a free URL and docs.yml is updated.
 */
async function ensureFreeDocsUrl(dir: string, siteUrl: string | undefined): Promise<string | undefined> {
    const host = siteUrl?.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const token = await readFernToken();
    if (host === undefined || !host.endsWith(`.${DOCS_DOMAIN}`) || token === undefined) {
        return siteUrl;
    }
    const availability = createAvailabilityChecker(token);
    const subdomain = host.slice(0, -`.${DOCS_DOMAIN}`.length);
    if ((await availability.docsUrl(subdomain)) !== "taken") {
        return siteUrl;
    }
    const organization = await readOrganization(dir);
    const next = await pickAvailableName({
        name: subdomain,
        noun: "docs URL",
        check: (name) => availability.docsUrl(name),
        display: (name) => `${name}.${DOCS_DOMAIN}`,
        preferred: organization === undefined ? [] : [organization]
    });
    await setDocsUrl(dir, host, `${next}.${DOCS_DOMAIN}`);
    printDone(`Updated fern/docs.yml to use ${next}.${DOCS_DOMAIN}`);
    return `https://${next}.${DOCS_DOMAIN}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function docsSkillCommand(detection: Detection): Command {
    return {
        executable: "npx",
        args: [
            "-y",
            "skills@1.6.0",
            "add",
            "fern-api/skills",
            "--skill",
            "fern-docs",
            "-a",
            ...docsSkillTargets(detection),
            "-y"
        ]
    };
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

/** The detected spec at a path given relative to the repository (or absolute). */
export function findSpec(specs: ApiSpec[], dir: string, specPath: string): ApiSpec | undefined {
    const wanted = path.relative(dir, path.resolve(dir, specPath));
    return specs.find((spec) => path.normalize(spec.path) === wanted);
}

export function pickDefaultSpec(specs: ApiSpec[]): ApiSpec | undefined {
    return specs.find((spec) => spec.format === "openapi") ?? specs[0];
}

export function docsInitArgs(mintJson: string, org: string | undefined): string[] {
    return ["init", "--mintlify", mintJson, ...orgArgs(org)];
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
