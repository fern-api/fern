import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { createHash } from "crypto";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { dirname, join } from "path";

import { CliContext } from "../../../cli-context/CliContext.js";
import { findMcpGroup, MCP_GENERATOR_NAME, MCP_GENERATOR_VERSION } from "./mcpGeneratorsYml.js";
import { computeVerdict, resolveTools } from "./toolset.js";
import { banner, command, hint, ICONS, sleep, styledVerdictLine, withSpinner } from "./ui.js";
import { pickWorkspaceAndLoadSpec } from "./workspace.js";

const STUB_STEP_DELAY_MS = 400;

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
    cliContext.logger.info(
        banner(`Generating ${serverName}`, [
            `group ${chalk.bold(group)} ${ICONS.bullet} ${MCP_GENERATOR_NAME}@${MCP_GENERATOR_VERSION}`,
            hint("stubbed prototype — no code is actually generated")
        ])
    );
    cliContext.logger.info("");
    await withSpinner(`Parsing spec…`, () => sleep(STUB_STEP_DELAY_MS));
    cliContext.logger.info(`${ICONS.success} Parsed spec ${hint(`· ${spec.endpoints.length} endpoints`)}`);
    await withSpinner(`Resolving tool surface…`, () => sleep(STUB_STEP_DELAY_MS));
    cliContext.logger.info(`${ICONS.success} Resolved tool surface  ${styledVerdictLine(verdict)}`);
    await withSpinner(`Building tool schemas…`, () => sleep(STUB_STEP_DELAY_MS));
    cliContext.logger.info(`${ICONS.success} Built tool schemas ${hint(`· ${tools.length}/${tools.length}`)}`);

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

    cliContext.logger.info(`${ICONS.success} Wrote lockfile ${hint(`· ${lockPath}`)}`);
    cliContext.logger.info("");
    cliContext.logger.info(chalk.green(`${tools.length} tools locked for ${chalk.bold(serverName)}.`));
    cliContext.logger.info("");
    cliContext.logger.info(`${ICONS.pointer} Next: ${command(`fern mcp dev --group ${group}`)}`);
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
    cliContext.logger.info(
        banner(`Local dev for ${serverName}`, [
            `group ${chalk.bold(group)}`,
            hint("this prototype does not start a real MCP runtime — here's how you would")
        ])
    );
    cliContext.logger.info("");
    cliContext.logger.info(`${chalk.bold("1.")} Generate the server ${hint("(stubbed in this prototype)")}`);
    cliContext.logger.info(`   ${command(`fern mcp generate --group ${group}`)}`);
    cliContext.logger.info("");
    cliContext.logger.info(`${chalk.bold("2.")} Inspect it with the MCP Inspector`);
    cliContext.logger.info(`   ${command(`npx @modelcontextprotocol/inspector node ${serverPath}/server.js`)}`);
    cliContext.logger.info("");
    cliContext.logger.info(`${chalk.bold("3.")} Or wire it into your agent ${hint("(e.g. Claude Desktop / Cursor)")}`);
    cliContext.logger.info(`   ${hint(`{ "command": "node", "args": ["${serverPath}/server.js"] }`)}`);
    cliContext.logger.info("");
    cliContext.logger.info(
        `${ICONS.pointer} Review the tool surface before shipping: ${command(`fern mcp tools --group ${group}`)}`
    );
}
