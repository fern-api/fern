import { Project } from "@fern-api/project-loader";
import chalk from "chalk";

import { CliContext } from "../../../cli-context/CliContext.js";
import { findMcpGroup, parseToolsConfig, writeMcpGroupToGeneratorsYml } from "./mcpGeneratorsYml.js";
import { computeVerdict, formatVerdictLine, resolveTools, ToolsConfig } from "./toolset.js";
import { runTrimLoop } from "./trimLoop.js";
import { pickWorkspaceAndLoadSpec } from "./workspace.js";

export async function toolsMcp({
    project,
    cliContext,
    api,
    group,
    preset,
    json,
    refine
}: {
    project: Project;
    cliContext: CliContext;
    api: string | undefined;
    group: string;
    preset: string | undefined;
    json: boolean;
    refine: boolean;
}): Promise<void> {
    const workspaceSpec = await pickWorkspaceAndLoadSpec({
        project,
        cliContext,
        apiFilter: api,
        interactive: false
    });
    if (workspaceSpec == null) {
        return;
    }
    const { spec, absolutePathToWorkspace } = workspaceSpec;

    const found = await cliContext.runTask((context) =>
        findMcpGroup({ context, absolutePathToWorkspace, groupName: group })
    );
    if (found == null) {
        cliContext.failAndThrow(
            `No MCP generator found in group "${group}". Run \`fern mcp init\` to create one, or pass --group.`
        );
        return;
    }

    let toolsConfig: ToolsConfig = found.config.tools ?? {};
    let presetLabel = group;
    if (preset != null) {
        const presetConfig = found.config.tools?.presets?.[preset];
        if (presetConfig == null) {
            cliContext.failAndThrow(
                `Preset "${preset}" not found in group "${group}". Available presets: ${Object.keys(found.config.tools?.presets ?? {}).join(", ") || "(none)"}`
            );
            return;
        }
        toolsConfig = parseToolsConfig(presetConfig);
        presetLabel = `${group} (preset: ${preset})`;
    }

    if (refine) {
        toolsConfig = await runTrimLoop({
            cliContext,
            endpoints: spec.endpoints,
            initialConfig: toolsConfig
        });
        const refinedConfig = toolsConfig;
        const groupToolsConfig = preset != null ? (found.config.tools ?? {}) : refinedConfig;
        const updatedPresets =
            preset != null ? { ...found.config.tools?.presets, [preset]: refinedConfig } : found.config.tools?.presets;
        await cliContext.runTaskForWorkspace(workspaceSpec.workspace, async (context) => {
            await writeMcpGroupToGeneratorsYml({
                absolutePathToWorkspace,
                context,
                groupName: group,
                serverName: found.config["server-name"],
                toolsConfig: groupToolsConfig,
                presets: updatedPresets
            });
        });
        cliContext.logger.info(chalk.green(`Updated group "${group}" in generators.yml.`));
    }

    const tools = resolveTools(spec.endpoints, toolsConfig);
    const verdict = computeVerdict(tools);

    if (json) {
        cliContext.logger.info(
            JSON.stringify(
                {
                    group,
                    preset: preset ?? null,
                    serverName: found.config["server-name"],
                    tools: tools.map((tool) => ({
                        name: tool.name,
                        method: tool.endpoint.method,
                        path: tool.endpoint.path,
                        estimatedTokens: tool.endpoint.estimatedTokens
                    })),
                    toolCount: verdict.toolCount,
                    estimatedTokens: verdict.estimatedTokens,
                    verdict: verdict.level
                },
                null,
                2
            )
        );
        return;
    }

    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold(`Tool surface for ${presetLabel} — ${found.config["server-name"]}`));
    cliContext.logger.info("");
    for (const tool of tools) {
        cliContext.logger.info(
            `  ${tool.name}  ${chalk.dim(`${tool.endpoint.method} ${tool.endpoint.path} · ~${tool.endpoint.estimatedTokens} tokens`)}`
        );
    }
    cliContext.logger.info("");
    cliContext.logger.info(formatVerdictLine(verdict));
}
