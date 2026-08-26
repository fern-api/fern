import { loadRawGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { select } from "@inquirer/prompts";
import chalk from "chalk";

import { CliContext } from "../../../cli-context/CliContext.js";
import { proposeAiRuleset } from "./aiCurated.js";
import {
    DEFAULT_MCP_GROUP_NAME,
    getMcpGeneratorEntries,
    WriteMcpGroupResult,
    writeMcpGroupToGeneratorsYml
} from "./mcpGeneratorsYml.js";
import { EndpointSummary } from "./openapiSummary.js";
import { BuiltinPresetKey, buildBuiltinPresets, PresetResolution } from "./presets.js";
import { computeVerdict, formatTokens, formatVerdictLine, resolveTools, ToolsConfig } from "./toolset.js";
import { runTrimLoop } from "./trimLoop.js";
import { banner, command, hint, ICONS, sleep, styledVerdictLine, withSpinner } from "./ui.js";
import { pickWorkspaceAndLoadSpec } from "./workspace.js";

const AI_SPINNER_DELAY_MS = 1200;

export interface InitMcpArgs {
    project: Project;
    cliContext: CliContext;
    api: string | undefined;
    name: string | undefined;
    preset: BuiltinPresetKey | undefined;
    intent: string | undefined;
    group: string | undefined;
    yes: boolean;
    json: boolean;
}

function deriveServerName(title: string | undefined, workspaceName: string): string {
    const base = title ?? workspaceName;
    const slug = base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return slug.endsWith("-mcp") ? slug : `${slug}-mcp`;
}

async function promptForAiCuratedConfig({
    cliContext,
    endpoints,
    initialIntent,
    quiet = false
}: {
    cliContext: CliContext;
    endpoints: EndpointSummary[];
    initialIntent: string | undefined;
    quiet?: boolean;
}): Promise<ToolsConfig> {
    const intent =
        initialIntent ??
        (await cliContext.getInput({
            message: "Describe what this MCP should let an agent do (and anything it must never touch)"
        }));
    if (quiet) {
        return proposeAiRuleset(intent, endpoints).config;
    }
    cliContext.logger.info("");
    const proposal = await withSpinner(
        `${chalk.magenta("Fern Agent")} is picking tools for you… ${hint("(stubbed locally in this prototype)")}`,
        async () => {
            await sleep(AI_SPINNER_DELAY_MS);
            return proposeAiRuleset(intent, endpoints);
        }
    );
    cliContext.logger.info(
        `${ICONS.agent} ${chalk.bold("Proposed toolset")} ${hint("(exclusions first — that's the part worth reviewing)")}`
    );
    cliContext.logger.info("");
    if (proposal.excludeReasons.length > 0) {
        cliContext.logger.info(`  ${chalk.red("excluded")}`);
        for (const reason of proposal.excludeReasons) {
            cliContext.logger.info(`    ${chalk.red("−")} ${reason}`);
        }
    } else {
        cliContext.logger.info(hint("  (nothing excluded)"));
    }
    cliContext.logger.info(`  ${chalk.green("included")}`);
    for (const reason of proposal.includeReasons) {
        cliContext.logger.info(`    ${chalk.green("+")} ${reason}`);
    }
    return proposal.config;
}

interface JsonSummary {
    serverName: string;
    group: string;
    preset: string;
    toolCount: number;
    estimatedTokens: number;
    verdict: string;
    warnings: string[];
    generatorsYml: string;
}

export async function initMcp(args: InitMcpArgs): Promise<void> {
    const { project, cliContext, yes, json } = args;
    const interactive = !yes && !json;

    const workspaceSpec = await pickWorkspaceAndLoadSpec({
        project,
        cliContext,
        apiFilter: args.api,
        interactive
    });
    if (workspaceSpec == null) {
        return;
    }
    const { spec, workspaceName, absolutePathToWorkspace } = workspaceSpec;
    const endpoints = spec.endpoints;
    const allTools = resolveTools(endpoints, {});
    const everythingVerdict = computeVerdict(allTools);

    if (!json) {
        const title = spec.title ?? workspaceName;
        const tagless = endpoints.every((endpoint) => endpoint.tags.length === 0);
        cliContext.logger.info("");
        cliContext.logger.info(
            banner("Create an MCP server", [
                `${chalk.green(title)} ${ICONS.bullet} ${chalk.bold(endpoints.length)} endpoints ${ICONS.bullet} ~${chalk.bold(formatTokens(everythingVerdict.estimatedTokens))} tokens (est.) if all become tools${
                    tagless ? ` ${ICONS.bullet} no tags — grouping by path prefix` : ""
                }`,
                hint("Recommended budget: 40 tools · 60k tokens (adjustable later)")
            ])
        );
        cliContext.logger.info("");
    }

    const defaultServerName = deriveServerName(spec.title, workspaceName);
    const serverName =
        args.name ??
        (interactive
            ? await cliContext.getInput({ message: "Server name", default: defaultServerName })
            : defaultServerName);

    const presets = buildBuiltinPresets(endpoints);
    let presetKey: string;
    let toolsConfig: ToolsConfig;

    if (args.intent != null && args.preset == null) {
        presetKey = "ai-curated";
        toolsConfig = await promptForAiCuratedConfig({
            cliContext,
            endpoints,
            initialIntent: args.intent,
            quiet: json
        });
    } else if (!interactive || args.preset != null) {
        presetKey = args.preset ?? "read-only";
        const resolution = presets[args.preset ?? "read-only"];
        toolsConfig = resolution.config;
        if (args.intent != null) {
            toolsConfig = { ...toolsConfig, intent: args.intent };
        }
    } else {
        const existingPresets = await loadExistingPresets({ cliContext, absolutePathToWorkspace });
        const choice = await promptForToolsetChoice({ cliContext, presets, existingPresets, endpoints });
        presetKey = choice.presetKey;
        if (choice.presetKey === "ai-curated") {
            toolsConfig = await promptForAiCuratedConfig({ cliContext, endpoints, initialIntent: undefined });
        } else {
            toolsConfig = choice.config;
        }
    }

    let verdict = computeVerdict(resolveTools(endpoints, toolsConfig));
    const warnings: string[] = [];
    if (verdict.level !== "green") {
        if (interactive) {
            cliContext.logger.info("");
            cliContext.logger.info(`Your pick: ${styledVerdictLine(verdict)}`);
            cliContext.logger.info(hint("Agents handle ~40 tools well — let's trim it (or keep it as-is)."));
            toolsConfig = await runTrimLoop({ cliContext, endpoints, initialConfig: toolsConfig });
            verdict = computeVerdict(resolveTools(endpoints, toolsConfig));
        } else {
            warnings.push(`Toolset is over budget: ${formatVerdictLine(verdict)}`);
        }
    }

    const groupName = args.group ?? DEFAULT_MCP_GROUP_NAME;
    let written: WriteMcpGroupResult | undefined;
    await cliContext.runTaskForWorkspace(workspaceSpec.workspace, async (context) => {
        written = await writeMcpGroupToGeneratorsYml({
            absolutePathToWorkspace,
            context,
            groupName,
            serverName,
            toolsConfig
        });
    });
    if (written == null) {
        cliContext.failAndThrow("Could not find a generators.yml to write to in this workspace.");
        return;
    }
    const result = written;

    if (json) {
        const summary: JsonSummary = {
            serverName,
            group: groupName,
            preset: presetKey,
            toolCount: verdict.toolCount,
            estimatedTokens: verdict.estimatedTokens,
            verdict: verdict.level,
            warnings,
            generatorsYml: result.absolutePathToGeneratorsConfiguration
        };
        cliContext.logger.info(JSON.stringify(summary, null, 2));
        return;
    }

    for (const warning of warnings) {
        cliContext.logger.warn(`${ICONS.warning} ${chalk.yellow(warning)}`);
    }
    cliContext.logger.info("");
    cliContext.logger.info(
        `${ICONS.success} Wrote group ${chalk.bold(`"${groupName}"`)} to ${chalk.green(result.absolutePathToGeneratorsConfiguration)}`
    );
    cliContext.logger.info("");
    cliContext.logger.info(
        result.yamlBlock
            .trimEnd()
            .split("\n")
            .map((line) => `  ${chalk.dim("│")} ${line}`)
            .join("\n")
    );
    cliContext.logger.info("");
    cliContext.logger.info(styledVerdictLine(verdict));
    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold("Next steps"));
    cliContext.logger.info(`  ${ICONS.pointer} ${command(`fern generate --group ${groupName}`)}   ${hint("build it")}`);
    cliContext.logger.info(
        `  ${ICONS.pointer} ${command(`fern mcp dev --group ${groupName}`)}    ${hint("try it locally with an inspector")}`
    );
}

async function loadExistingPresets({
    cliContext,
    absolutePathToWorkspace
}: {
    cliContext: CliContext;
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<{ name: string; config: ToolsConfig }[]> {
    const existing: { name: string; config: ToolsConfig }[] = [];
    await cliContext.runTask(async (context) => {
        const rawConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace, context });
        if (rawConfiguration == null) {
            return;
        }
        for (const entry of getMcpGeneratorEntries(rawConfiguration)) {
            for (const [name, presetConfig] of Object.entries(entry.config.tools?.presets ?? {})) {
                existing.push({ name: `${name} (from group ${entry.groupName})`, config: presetConfig });
            }
        }
    });
    return existing;
}

interface ToolsetChoice {
    presetKey: string;
    config: ToolsConfig;
}

async function promptForToolsetChoice({
    cliContext,
    presets,
    existingPresets,
    endpoints
}: {
    cliContext: CliContext;
    presets: Record<BuiltinPresetKey, PresetResolution>;
    existingPresets: { name: string; config: ToolsConfig }[];
    endpoints: EndpointSummary[];
}): Promise<ToolsetChoice> {
    interface Choice {
        name: string;
        value: ToolsetChoice;
        disabled?: string | boolean;
    }
    const choices: Choice[] = [];
    for (const existing of existingPresets) {
        const verdict = computeVerdict(resolveTools(endpoints, existing.config));
        choices.push({
            name: `${existing.name}\n       ${styledVerdictLine(verdict)}`,
            value: { presetKey: existing.name, config: existing.config }
        });
    }
    for (const key of ["read-only", "main-resources"] as const) {
        const preset = presets[key];
        if (!preset.available) {
            choices.push({
                name: preset.label,
                value: { presetKey: key, config: preset.config },
                disabled: `(${preset.unavailableReason ?? "unavailable"})`
            });
            continue;
        }
        const noteSuffix = preset.notes.length > 0 ? `\n       ${chalk.dim(preset.notes.join(" · "))}` : "";
        choices.push({
            name: `${preset.label}\n       ${styledVerdictLine(preset.verdict)}${noteSuffix}`,
            value: { presetKey: key, config: preset.config }
        });
    }
    choices.push({
        name: `AI-curated — ${chalk.magenta("Fern Agent")} picks tools from your description ${chalk.dim("(requires fern login)")}\n       ${chalk.dim("resolved after you describe what agents should do")}`,
        value: { presetKey: "ai-curated", config: {} }
    });
    const everything = presets.everything;
    choices.push({
        name: `${everything.label}\n       ${styledVerdictLine(everything.verdict)}`,
        value: { presetKey: "everything", config: everything.config }
    });

    cliContext.logger.info("");
    return await select<ToolsetChoice>({
        message: "Which tools should this server expose?",
        choices,
        pageSize: 12
    });
}
