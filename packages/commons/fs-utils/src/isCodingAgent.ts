// Variables that coding agents set in the shells they run commands in. Mirrors the agent list in
// std-env's `detectAgent`, minus signals that also appear in human sessions (e.g. Replit's REPL_ID).
const CODING_AGENT_ENV_VARS = [
    "AI_AGENT", // Explicit opt-in, honored by several tools
    "CLAUDECODE", // Claude Code
    "CLAUDE_CODE", // Claude Code
    "CURSOR_AGENT", // Cursor agent
    "CODEX_SANDBOX", // OpenAI Codex
    "CODEX_THREAD_ID", // OpenAI Codex
    "GEMINI_CLI", // Gemini CLI
    "OPENCODE", // opencode
    "AUGMENT_AGENT", // Augment
    "GOOSE_PROVIDER" // Goose
];

/**
 * Checks if the current process was started by an AI coding agent rather than a person.
 * @returns true if a known coding-agent environment variable is set
 */
export function isCodingAgent(): boolean {
    if (CODING_AGENT_ENV_VARS.some((name) => (process.env[name]?.trim() ?? "") !== "")) {
        return true;
    }
    // Devin points EDITOR at its own editor binary instead of setting a dedicated variable.
    return /devin/i.test(process.env.EDITOR ?? "");
}
