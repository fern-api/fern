import { loadRawGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";

import { CliContext } from "../../../cli-context/CliContext.js";
import { getMcpGeneratorEntries } from "./mcpGeneratorsYml.js";
import { loadSpecSummaries } from "./openapiSummary.js";
import { computeVerdict, resolveTools, Verdict } from "./toolset.js";
import { budgetLine, command, hint, keyValueRows } from "./ui.js";

interface McpListRow {
    api: string;
    group: string;
    serverName: string;
    presets: string[];
    output: string;
    toolCount: number;
    estimatedTokens: number;
    verdict: Verdict;
}

export async function listMcp({
    project,
    cliContext,
    json
}: {
    project: Project;
    cliContext: CliContext;
    json: boolean;
}): Promise<void> {
    const rows: McpListRow[] = [];
    for (const workspace of project.apiWorkspaces) {
        await cliContext.runTaskForWorkspace(workspace, async (context) => {
            const rawConfiguration = await loadRawGeneratorsConfiguration({
                absolutePathToWorkspace: workspace.absoluteFilePath,
                context
            });
            if (rawConfiguration == null) {
                return;
            }
            const entries = getMcpGeneratorEntries(rawConfiguration);
            if (entries.length === 0) {
                return;
            }
            const specs = await loadSpecSummaries(workspace.absoluteFilePath);
            const endpoints = specs[0]?.endpoints ?? [];
            for (const entry of entries) {
                const tools = resolveTools(endpoints, entry.config.tools ?? {});
                const verdict = computeVerdict(tools);
                rows.push({
                    api: workspace.workspaceName ?? "api",
                    group: entry.groupName,
                    serverName: entry.config["server-name"],
                    presets: Object.keys(entry.config.tools?.presets ?? {}),
                    output: entry.outputLocation ?? "local-file-system",
                    toolCount: verdict.toolCount,
                    estimatedTokens: verdict.estimatedTokens,
                    verdict
                });
            }
        });
    }

    if (json) {
        cliContext.logger.info(
            JSON.stringify(
                rows.map((row) => ({ ...row, verdict: row.verdict.level })),
                null,
                2
            )
        );
        return;
    }
    if (rows.length === 0) {
        cliContext.logger.info(`No MCP servers are configured yet. Run ${command("fern mcp init")} to create one.`);
        return;
    }
    cliContext.logger.info("");
    for (const row of rows) {
        cliContext.logger.info(`${chalk.bold.green(row.group)} ${hint(`(${row.api})`)}`);
        const kvRows: [string, string][] = [
            ["server", chalk.bold(row.serverName)],
            ["output", row.output]
        ];
        if (row.presets.length > 0) {
            kvRows.push(["presets", row.presets.map((preset) => chalk.cyan(preset)).join(", ")]);
        }
        kvRows.push(["tools", budgetLine(row.verdict)]);
        for (const line of keyValueRows(kvRows)) {
            cliContext.logger.info(line);
        }
        cliContext.logger.info("");
    }
}
