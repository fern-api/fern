/**
 * Returns true when the CLI is running inside a Claude Code session.
 *
 * Claude Code sets two well-known env vars in every spawned process:
 *   - `CLAUDECODE=1`
 *   - `CLAUDE_CODE_ENTRYPOINT` (e.g. "cli", "claude-vscode")
 *
 * Either is sufficient. We use this to skip interactive "fix with AI?" prompts —
 * inside a Claude Code session the AI is already in the IDE, so prompting the
 * user to paste an API key is redundant.
 */
export function isClaudeCodeSession(): boolean {
    return process.env["CLAUDECODE"] === "1" || process.env["CLAUDE_CODE_ENTRYPOINT"] != null;
}
