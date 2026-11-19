// Authoring types for Fern MCP custom tools and hooks.
//
// These mirror the contract the generated MCP server emits (sdk-gen-core's `manifest.ts` and
// `runtime.ts`). A custom-tool/hook module written against this package compiles on its own, before
// `fern generate` ever runs; the generator emits the module verbatim into the server, where the
// type-only imports are erased at bundle time, so the generated server takes no dependency on this
// package. Keep these definitions in sync with the generated `RequestContext`/`ToolDefinition`.

import type { AuthInfo, CallToolResult, Tool } from "@modelcontextprotocol/server";

export type { AuthInfo, CallToolResult, Tool } from "@modelcontextprotocol/server";

/** The arguments a tool handler receives, already validated against the tool's input schema. */
export type ToolArgs = Record<string, unknown>;

/** Where the server read the caller's credentials from. */
export type CredentialSource = "environment" | "headers" | "token";

export interface BasicCredential {
    username: string;
    password: string;
}

/** A single upstream credential: an API key / bearer string, or a username+password pair. */
export type Credential = string | BasicCredential;

/**
 * The context passed to every tool handler. Mirrors the generated server's `RequestContext`.
 */
export interface RequestContext {
    baseUrl: string;
    credentials: Record<string, Credential>;
    credentialSource: CredentialSource;
    /** The verified access token in OAuth mode. Identifies the caller and is never sent upstream. */
    auth?: AuthInfo;
    /** OAuth mode with token exchange: a token for the API, issued for the same user. */
    upstreamToken?: () => Promise<string>;
    /** OAuth mode: why the caller may not use a tool (see MCP_AUTH_TOOL_ROLES), or undefined. */
    authorizeTool?: (tool: string, args?: ToolArgs) => string | undefined;
    /**
     * Hardened outbound call: routes through the server's request/response hooks and request timeout,
     * and attaches the API credentials only when the target origin is the configured `baseUrl`. Prefer
     * this over the global `fetch` in a custom tool. Returns the upstream Response to read.
     */
    fetch: (input: Request | string | URL, init?: RequestInit) => Promise<Response>;
}

/** The static definition a custom tool exports; matches the generated `ToolDefinition`. */
export interface ToolDefinition {
    name: string;
    title: string;
    description: string;
    inputSchema: Tool["inputSchema"];
    outputSchema?: Tool["outputSchema"];
    annotations: Tool["annotations"];
    _meta?: Tool["_meta"];
}

/** The handler signature a custom tool exports. */
export type ToolHandler = (args: ToolArgs, context: RequestContext) => Promise<CallToolResult>;
