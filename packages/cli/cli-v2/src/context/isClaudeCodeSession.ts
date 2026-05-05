/**
 * Returns true when the CLI is running inside a Claude Code session.
 *
 * Claude Code sets `CLAUDE_CODE_ENTRYPOINT` in the environment of every
 * process it spawns (e.g. "cli", "claude-vscode"). We use this to skip
 * interactive "fix with AI?" prompts — in a Claude Code session the AI is
 * already right there in the IDE, so prompting the user to paste an API key
 * would be redundant and annoying.
 */
export function isClaudeCodeSession(): boolean {
    return process.env["CLAUDE_CODE_ENTRYPOINT"] != null;
}
