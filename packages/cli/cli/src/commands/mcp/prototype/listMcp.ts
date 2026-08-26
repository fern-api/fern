import { loadRawGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";

import { CliContext } from "../../../cli-context/CliContext.js";
import { getMcpGeneratorEntries } from "./mcpGeneratorsYml.js";
import { loadSpecSummaries } from "./openapiSummary.js";
import { computeVerdict, formatVerdictLine, resolveTools } from "./toolset.js";

interface McpListRow {
    api: string;
    group: string;
    serverName: string;
    presets: string[];
    output: string;
    toolCount: number;
    estimatedTokens: number;
    verdict: string;
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
                    verdict: formatVerdictLine(verdict)
                });
            }
        });
    }

    if (json) {
        cliContext.logger.info(JSON.stringify(rows, null, 2));
        return;
    }
    if (rows.length === 0) {
        cliContext.logger.info("No MCP servers are configured yet. Run `fern mcp init` to create one.");
        return;
    }
    cliContext.logger.info("");
    for (const row of rows) {
        cliContext.logger.info(chalk.bold(`${row.group} (${row.api})`));
        cliContext.logger.info(`  server-name: ${row.serverName}`);
        cliContext.logger.info(`  output:      ${row.output}`);
        if (row.presets.length > 0) {
            cliContext.logger.info(`  presets:     ${row.presets.join(", ")}`);
        }
        cliContext.logger.info(`  tools:       ${row.verdict}`);
        cliContext.logger.info("");
    }
}
