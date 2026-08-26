import { createHash } from "crypto";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";

import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import yaml from "js-yaml";

import { CliContext } from "../../../cli-context/CliContext.js";
import { findMcpGroup, MCP_GENERATOR_NAME, MCP_GENERATOR_VERSION } from "./mcpGeneratorsYml.js";
import { computeVerdict, formatVerdictLine, resolveTools } from "./toolset.js";
import { pickWorkspaceAndLoadSpec } from "./workspace.js";

const STUB_STEP_DELAY_MS = 400;

async function sleep(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function generateMcp({
    project,
    cliContext,
    api,
    group
}: {
    project: Project;
    cliContext: CliContext;
    api: string | undefined;
    group: string;
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
        cliContext.failAndThrow(`No MCP generator found in group "${group}". Run \`fern mcp init\` first.`);
        return;
    }

    const tools = resolveTools(spec.endpoints, found.config.tools ?? {});
    const verdict = computeVerdict(tools);
    const serverName = found.config["server-name"];

    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold(`[mcp] Generating ${serverName} (group: ${group})`));
    cliContext.logger.info(chalk.dim("[mcp] NOTE: this is a stubbed prototype — no code is actually generated."));
    cliContext.logger.info(`[mcp] Using generator ${MCP_GENERATOR_NAME}@${MCP_GENERATOR_VERSION}`);
    await sleep(STUB_STEP_DELAY_MS);
    cliContext.logger.info(`[mcp] Parsed spec: ${spec.endpoints.length} endpoints`);
    cliContext.logger.info(`[mcp] Resolved tool surface: ${formatVerdictLine(verdict)}`);
    await sleep(STUB_STEP_DELAY_MS);
    cliContext.logger.info(`[mcp] Building tool schemas… ${tools.length}/${tools.length}`);
    await sleep(STUB_STEP_DELAY_MS);

    const schemaHash = createHash("sha256")
        .update(JSON.stringify(tools.map((tool) => [tool.name, tool.endpoint.method, tool.endpoint.path])))
        .digest("hex")
        .slice(0, 16);

    const lock = {
        version: 1,
        group,
        "server-name": serverName,
        generator: `${MCP_GENERATOR_NAME}@${MCP_GENERATOR_VERSION}`,
        "schema-hash": `sha256:${schemaHash}`,
        "generated-at": new Date().toISOString(),
        "tool-count": tools.length,
        "estimated-tokens": verdict.estimatedTokens,
        tools: tools.map((tool) => ({
            name: tool.name,
            endpoint: `${tool.endpoint.method} ${tool.endpoint.path}`,
            "estimated-tokens": tool.endpoint.estimatedTokens
        }))
    };
    const lockPath = join(dirname(found.absolutePathToGeneratorsConfiguration), "tools.lock");
    await writeFile(lockPath, yaml.dump(lock));

    cliContext.logger.info(`[mcp] Wrote lockfile: ${lockPath}`);
    cliContext.logger.info(chalk.green(`[mcp] Done. ${tools.length} tools locked for ${serverName}.`));
    cliContext.logger.info("");
    cliContext.logger.info(`Next: fern mcp dev --group ${group}`);
}

export async function devMcp({
    project,
    cliContext,
    api,
    group
}: {
    project: Project;
    cliContext: CliContext;
    api: string | undefined;
    group: string;
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
    const found = await cliContext.runTask((context) =>
        findMcpGroup({ context, absolutePathToWorkspace: workspaceSpec.absolutePathToWorkspace, groupName: group })
    );
    if (found == null) {
        cliContext.failAndThrow(`No MCP generator found in group "${group}". Run \`fern mcp init\` first.`);
        return;
    }
    const serverName = found.config["server-name"];
    const serverPath = found.outputLocation ?? `generated/${group}`;

    cliContext.logger.info("");
    cliContext.logger.info(chalk.bold(`Local dev for ${serverName} (group: ${group})`));
    cliContext.logger.info(chalk.dim("This prototype does not start a real MCP runtime — here's how you would:"));
    cliContext.logger.info("");
    cliContext.logger.info("1. Generate the server (stubbed in this prototype):");
    cliContext.logger.info(`     fern mcp generate --group ${group}`);
    cliContext.logger.info("");
    cliContext.logger.info("2. Inspect it with the MCP Inspector:");
    cliContext.logger.info(chalk.cyan(`     npx @modelcontextprotocol/inspector node ${serverPath}/server.js`));
    cliContext.logger.info("");
    cliContext.logger.info("3. Or wire it into your agent (e.g. Claude Desktop / Cursor) with:");
    cliContext.logger.info(`     { "command": "node", "args": ["${serverPath}/server.js"] }`);
    cliContext.logger.info("");
    cliContext.logger.info(`Tool surface: run \`fern mcp tools --group ${group}\` to review before shipping.`);
}
