import { getAccessToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

import {
    getFaiOrigin,
    getMcpServerUrl,
    MCP_CLIENT_LABELS,
    MCP_CLIENTS,
    MCP_SERVER_NAME,
    McpClient,
    upsertServerInCodexConfig,
    upsertServerInJsonConfig
} from "./mcpConfig.js";

interface McpClientTarget {
    /** Config file the client reads its MCP servers from. */
    configPath: string;
    /** Directory whose presence means the client is installed on this machine. */
    installationPath: string;
    upsertServer: (args: { existingContents: string | undefined; url: string; token: string }) => string;
}

function getClientTarget(client: McpClient): McpClientTarget {
    const home = homedir();
    switch (client) {
        case "claude":
            return {
                configPath: path.join(home, ".claude.json"),
                installationPath: path.join(home, ".claude"),
                upsertServer: (args) => upsertServerInJsonConfig({ ...args, includeTransportType: true })
            };
        case "cursor":
            return {
                configPath: path.join(home, ".cursor", "mcp.json"),
                installationPath: path.join(home, ".cursor"),
                upsertServer: (args) => upsertServerInJsonConfig({ ...args, includeTransportType: false })
            };
        case "codex":
            return {
                configPath: path.join(home, ".codex", "config.toml"),
                installationPath: path.join(home, ".codex"),
                upsertServer: upsertServerInCodexConfig
            };
    }
}

export async function installMcpServer({
    clients,
    organization,
    context
}: {
    clients: McpClient[] | undefined;
    organization: string | undefined;
    context: TaskContext;
}): Promise<void> {
    const token = await getUserToken(context);

    const url = getMcpServerUrl({ faiOrigin: getFaiOrigin(), organization });
    const targets = clients ?? detectInstalledClients();
    if (targets.length === 0) {
        context.failAndThrow(
            `Could not find Claude Code, Cursor, or Codex on this machine. Install one, or pass --client to configure it anyway (e.g. \`fern mcp install --client claude\`).`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    for (const client of targets) {
        const configPath = await writeClientConfig({ client, url, token });
        context.logger.info(
            chalk.green(`Configured the ${MCP_SERVER_NAME} MCP server for ${MCP_CLIENT_LABELS[client]}`) +
                chalk.dim(` (${configPath})`)
        );
    }

    context.logger.info(`\nMCP server URL: ${url}`);
    context.logger.info(
        chalk.dim(
            "Your Fern login token is written into these configs and expires eventually. Re-run `fern login && fern mcp install` if the server starts returning 401s."
        )
    );
}

async function writeClientConfig({
    client,
    url,
    token
}: {
    client: McpClient;
    url: string;
    token: string;
}): Promise<string> {
    const { configPath, upsertServer } = getClientTarget(client);
    const existingContents = existsSync(configPath) ? await readFile(configPath, "utf-8") : undefined;
    await mkdir(path.dirname(configPath), { recursive: true });
    // The config holds a bearer token, so a file we create is owner-only. An
    // existing file keeps whatever mode the client gave it.
    await writeFile(configPath, upsertServer({ existingContents, url, token }), { mode: 0o600 });
    return configPath;
}

function detectInstalledClients(): McpClient[] {
    return MCP_CLIENTS.filter((client) => {
        const { configPath, installationPath } = getClientTarget(client);
        return existsSync(configPath) || existsSync(installationPath);
    });
}

/**
 * The organization token is rejected up front: `askToLogin` would otherwise walk
 * the user through a whole login flow before we reach the same error, since it
 * prefers `FERN_TOKEN` over the stored user token.
 */
async function getUserToken(context: TaskContext): Promise<string> {
    if ((await getAccessToken()) != null) {
        failBecauseOrganizationToken(context);
    }
    const token = await askToLogin(context);
    if (token.type === "organization") {
        failBecauseOrganizationToken(context);
    }
    return token.value;
}

function failBecauseOrganizationToken(context: TaskContext): never {
    return context.failAndThrow(
        "The MCP server authenticates a user, so a FERN_TOKEN cannot be used. Run `fern login` first (or unset FERN_TOKEN).",
        undefined,
        { code: CliError.Code.AuthError }
    );
}
