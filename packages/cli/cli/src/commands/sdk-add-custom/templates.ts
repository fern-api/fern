import { capitalizeFirstLetter } from "@fern-api/core-utils";

const CUSTOM_DIR = "custom";

/** Path, relative to the fern directory, of a scaffolded custom tool module. */
export function customToolRelativePath(name: string): string {
    return `${CUSTOM_DIR}/tools/${name}.ts`;
}

/** Path, relative to the fern directory, of the scaffolded hooks module. */
export function hookRelativePath(): string {
    return `${CUSTOM_DIR}/hooks.ts`;
}

/**
 * A ready-to-edit custom tool module. Imports the authoring contract from `@fern-api/mcp-tooling` (so
 * it type-checks before `fern generate` runs) and calls `context.fetch` (the sanctioned outbound path:
 * hooks + timeout + origin-scoped credentials). Emitted only when the file does not already exist.
 */
export function customToolModule(name: string): string {
    const title = toTitle(name);
    return `import type { CallToolResult, RequestContext, ToolArgs, ToolDefinition } from "@fern-api/mcp-tooling";

export const definition: ToolDefinition = {
    name: "${name}",
    title: "${title}",
    description: "TODO: describe what this tool does and when an agent should call it.",
    inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
    },
    annotations: {}
};

export const handler = async (args: ToolArgs, context: RequestContext): Promise<CallToolResult> => {
    // context.fetch runs the server's hooks + request timeout, and attaches your API credentials when
    // the target is the configured baseUrl. Prefer it over the global fetch.
    const response = await context.fetch(context.baseUrl.replace(/\\/$/, "") + "/TODO", {
        method: "POST",
        body: JSON.stringify(args)
    });
    if (!response.ok) {
        return { isError: true, content: [{ type: "text", text: "HTTP " + response.status }] };
    }
    return { content: [{ type: "text", text: await response.text() }] };
};
`;
}

/**
 * A ready-to-edit hooks module exporting the four request/response hooks the generated server calls.
 */
export function hookModule(): string {
    return `import type { AuthInfo, CallToolResult } from "@fern-api/mcp-tooling";

// Runs before every outbound request; modify headers or the URL here. The caller's token is never
// forwarded upstream. (Unused params are prefixed with _; rename them when you use them.)
export async function beforeRequest(request: Request, _auth?: AuthInfo): Promise<Request> {
    return request;
}

// Runs after every response, before result processing.
export async function afterResponse(_request: Request, response: Response): Promise<Response> {
    return response;
}

// Observes transport and non-2xx failures.
export async function onError(_request: Request, error: unknown): Promise<void> {
    console.error("MCP tool request failed:", error);
}

// May reshape or redact a tool result before it is returned to the caller.
export async function transformResult(_toolName: string, result: CallToolResult): Promise<CallToolResult> {
    return result;
}
`;
}

function toTitle(name: string): string {
    return name
        .split(/[_-]/)
        .filter((part) => part.length > 0)
        .map((part) => capitalizeFirstLetter(part))
        .join(" ");
}
