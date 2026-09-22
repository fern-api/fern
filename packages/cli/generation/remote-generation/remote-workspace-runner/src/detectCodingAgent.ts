/**
 * Coding agents the CLI can recognize from well-known environment variables.
 * The value is sent to FDR in the `X-Fern-Agent` header so agent-driven docs
 * publishes can be counted separately from human ones.
 */
export type CodingAgent = "claude-code" | "cursor" | "codex" | "devin" | "gemini-cli";

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
