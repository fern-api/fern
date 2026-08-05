import { describe, expect, it } from "vitest";

import { getMcpServerUrl, upsertServerInCodexConfig, upsertServerInJsonConfig } from "../mcpConfig.js";

const URL = "https://fai.buildwithfern.com/organizations/fern/mcp";
const TOKEN = "test-token";

describe("getMcpServerUrl", () => {
    it("scopes the url to the organization", () => {
        expect(getMcpServerUrl({ faiOrigin: "https://fai.buildwithfern.com", organization: "fern" })).toBe(URL);
    });

    it("omits the organization when there is none", () => {
        expect(getMcpServerUrl({ faiOrigin: "https://fai.buildwithfern.com" })).toBe(
            "https://fai.buildwithfern.com/mcp"
        );
    });

    it("does not double up slashes when the origin has a trailing one", () => {
        expect(getMcpServerUrl({ faiOrigin: "https://fai.buildwithfern.com/", organization: "fern" })).toBe(URL);
    });
});

describe("upsertServerInJsonConfig", () => {
    it("creates the config when there is none", () => {
        const contents = upsertServerInJsonConfig({
            existingContents: undefined,
            url: URL,
            token: TOKEN,
            includeTransportType: true
        });
        expect(JSON.parse(contents)).toEqual({
            mcpServers: {
                fern: { type: "http", url: URL, headers: { Authorization: `Bearer ${TOKEN}` } }
            }
        });
    });

    it("omits the transport type for clients that infer it from the url", () => {
        const contents = upsertServerInJsonConfig({
            existingContents: undefined,
            url: URL,
            token: TOKEN,
            includeTransportType: false
        });
        expect(JSON.parse(contents).mcpServers.fern).toEqual({
            url: URL,
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
    });

    it("preserves other servers and unrelated top-level keys", () => {
        const contents = upsertServerInJsonConfig({
            existingContents: JSON.stringify({
                theme: "dark",
                mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } }
            }),
            url: URL,
            token: TOKEN,
            includeTransportType: true
        });
        expect(JSON.parse(contents)).toEqual({
            theme: "dark",
            mcpServers: {
                linear: { url: "https://mcp.linear.app/mcp" },
                fern: { type: "http", url: URL, headers: { Authorization: `Bearer ${TOKEN}` } }
            }
        });
    });

    it("replaces a stale fern entry rather than merging into it", () => {
        const contents = upsertServerInJsonConfig({
            existingContents: JSON.stringify({
                mcpServers: { fern: { type: "http", url: URL, headers: { Authorization: "Bearer expired" } } }
            }),
            url: URL,
            token: TOKEN,
            includeTransportType: true
        });
        expect(JSON.parse(contents).mcpServers.fern.headers).toEqual({ Authorization: `Bearer ${TOKEN}` });
    });

    it("throws on a config that is not a JSON object", () => {
        expect(() =>
            upsertServerInJsonConfig({
                existingContents: "[]",
                url: URL,
                token: TOKEN,
                includeTransportType: true
            })
        ).toThrow();
    });
});

describe("upsertServerInCodexConfig", () => {
    const expectedTable = [
        "[mcp_servers.fern]",
        `url = "${URL}"`,
        `http_headers = { Authorization = "Bearer ${TOKEN}" }`
    ].join("\n");

    it("creates the config when there is none", () => {
        expect(upsertServerInCodexConfig({ existingContents: undefined, url: URL, token: TOKEN })).toBe(
            `${expectedTable}\n`
        );
    });

    it("appends to an existing config without touching comments or other tables", () => {
        const existingContents = [
            '# my settings\nmodel = "gpt-5"\n',
            "[mcp_servers.context7]",
            'command = "npx"\n'
        ].join("\n");
        expect(upsertServerInCodexConfig({ existingContents, url: URL, token: TOKEN })).toBe(
            `# my settings\nmodel = "gpt-5"\n\n[mcp_servers.context7]\ncommand = "npx"\n\n${expectedTable}\n`
        );
    });

    it("replaces an existing fern table, including its subtables", () => {
        const existingContents = [
            "[mcp_servers.fern]",
            'url = "https://stale.example.com/mcp"',
            "[mcp_servers.fern.tools.list_docs_sites]",
            'approval_mode = "auto"',
            "[mcp_servers.context7]",
            'command = "npx"'
        ].join("\n");
        expect(upsertServerInCodexConfig({ existingContents, url: URL, token: TOKEN })).toBe(
            `[mcp_servers.context7]\ncommand = "npx"\n\n${expectedTable}\n`
        );
    });

    it("replaces a fern table whose header is padded or carries a comment", () => {
        const existingContents = [
            "[ mcp_servers.fern ] # hand-edited",
            'url = "https://stale.example.com/mcp"',
            "",
            "[mcp_servers.context7]",
            'command = "npx"'
        ].join("\n");
        expect(upsertServerInCodexConfig({ existingContents, url: URL, token: TOKEN })).toBe(
            `[mcp_servers.context7]\ncommand = "npx"\n\n${expectedTable}\n`
        );
    });

    it("does not treat a similarly named table as the fern table", () => {
        const existingContents = '[mcp_servers.fernbot]\nurl = "https://other.example.com/mcp"';
        expect(upsertServerInCodexConfig({ existingContents, url: URL, token: TOKEN })).toBe(
            `${existingContents}\n\n${expectedTable}\n`
        );
    });
});
