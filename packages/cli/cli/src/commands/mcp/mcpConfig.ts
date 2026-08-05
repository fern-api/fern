export const MCP_SERVER_NAME = "fern";

export const MCP_CLIENTS = ["claude", "cursor", "codex"] as const;
export type McpClient = (typeof MCP_CLIENTS)[number];

export const MCP_CLIENT_LABELS: Record<McpClient, string> = {
    claude: "Claude Code",
    cursor: "Cursor",
    codex: "Codex"
};

export function getFaiOrigin(): string {
    return process.env.FERN_FAI_ORIGIN ?? process.env.DEFAULT_FAI_ORIGIN ?? "https://fai.buildwithfern.com";
}

/**
 * The org-scoped URL is preferred: a token with access to multiple orgs is
 * ambiguous on the unscoped endpoint, and the server rejects it rather than
 * guessing.
 */
export function getMcpServerUrl({ faiOrigin, organization }: { faiOrigin: string; organization?: string }): string {
    const origin = faiOrigin.replace(/\/+$/, "");
    return organization != null ? `${origin}/organizations/${organization}/mcp` : `${origin}/mcp`;
}

function getAuthorizationHeaderValue(token: string): string {
    return `Bearer ${token}`;
}

/**
 * Upserts the Fern server into the `mcpServers` map of a Claude Code or Cursor
 * config, leaving every other key in the file untouched. Both clients read the
 * same shape, except that Claude Code requires an explicit transport `type`.
 */
export function upsertServerInJsonConfig({
    existingContents,
    url,
    token,
    includeTransportType
}: {
    existingContents: string | undefined;
    url: string;
    token: string;
    includeTransportType: boolean;
}): string {
    const config = parseJsonConfig(existingContents);
    const mcpServers = isRecord(config.mcpServers) ? config.mcpServers : {};
    config.mcpServers = {
        ...mcpServers,
        [MCP_SERVER_NAME]: {
            ...(includeTransportType ? { type: "http" } : {}),
            url,
            headers: { Authorization: getAuthorizationHeaderValue(token) }
        }
    };
    return `${JSON.stringify(config, undefined, 2)}\n`;
}

function parseJsonConfig(existingContents: string | undefined): Record<string, unknown> {
    if (existingContents == null || existingContents.trim().length === 0) {
        return {};
    }
    const parsed: unknown = JSON.parse(existingContents);
    if (!isRecord(parsed)) {
        throw new Error("Expected the config to contain a JSON object");
    }
    return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

const CODEX_SERVER_TABLE_HEADER = `[mcp_servers.${MCP_SERVER_NAME}]`;
const CODEX_SERVER_TABLE_PATTERN = new RegExp(`^\\[mcp_servers\\.${MCP_SERVER_NAME}(\\..+)?\\]$`);
const TOML_TABLE_HEADER_PATTERN = /^\[\[?[^[\]]+\]?\]$/;

/**
 * Upserts the `[mcp_servers.fern]` table into Codex's `config.toml`. Codex has
 * no JSON config, and a full TOML parse/serialize round trip would drop the
 * user's comments and formatting, so this rewrites only the lines belonging to
 * that table and leaves the rest of the file byte-for-byte intact.
 */
export function upsertServerInCodexConfig({
    existingContents,
    url,
    token
}: {
    existingContents: string | undefined;
    url: string;
    token: string;
}): string {
    const table = [
        CODEX_SERVER_TABLE_HEADER,
        `url = ${toTomlString(url)}`,
        `http_headers = { Authorization = ${toTomlString(getAuthorizationHeaderValue(token))} }`
    ].join("\n");

    const remainingLines = withoutCodexServerTable(existingContents ?? "");
    if (remainingLines.length === 0) {
        return `${table}\n`;
    }
    return `${remainingLines.join("\n")}\n\n${table}\n`;
}

function withoutCodexServerTable(contents: string): string[] {
    const kept: string[] = [];
    let isInsideServerTable = false;
    for (const line of contents.split("\n")) {
        const trimmed = line.trim();
        if (TOML_TABLE_HEADER_PATTERN.test(trimmed)) {
            isInsideServerTable = CODEX_SERVER_TABLE_PATTERN.test(trimmed);
        }
        if (!isInsideServerTable) {
            kept.push(line);
        }
    }
    while (kept.length > 0 && kept[kept.length - 1]?.trim() === "") {
        kept.pop();
    }
    return kept;
}

function toTomlString(value: string): string {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
