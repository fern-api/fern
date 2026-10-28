/**
 * Coding agents the CLI can recognize from well-known environment variables.
 * The value is sent to Fern backends in the `X-Fern-Agent` header and attached
 * to CLI telemetry so agent-driven usage can be measured separately from human usage.
 */
export type CodingAgent = "claude-code" | "cursor" | "codex" | "devin" | "gemini-cli";

export const FERN_AGENT_HEADER = "X-Fern-Agent";

export function detectCodingAgent(): CodingAgent | undefined {
    if (process.env.CLAUDECODE === "1" || process.env.CLAUDE_CODE_ENTRYPOINT != null) {
        return "claude-code";
    }
    if (process.env.CURSOR_AGENT != null || process.env.CURSOR_TRACE_ID != null) {
        return "cursor";
    }
    if (process.env.CODEX_SANDBOX != null || process.env.CODEX_THREAD_ID != null) {
        return "codex";
    }
    if (process.env.DEVIN_SESSION_ID != null) {
        return "devin";
    }
    if (process.env.GEMINI_CLI != null) {
        return "gemini-cli";
    }
    return undefined;
}

export function getCodingAgentHeaders(): Record<string, string> {
    const agent = detectCodingAgent();
    return agent != null ? { [FERN_AGENT_HEADER]: agent } : {};
}
