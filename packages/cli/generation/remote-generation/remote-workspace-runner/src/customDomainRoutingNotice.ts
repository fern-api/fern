import chalk from "chalk";

// FDR's custom-domain routing check (and its older Vercel-only check) leads every message with one of these headlines.
const BLOCKED_HEADLINE = /^Publishing is blocked: your custom domains? /;
const WARNING_HEADLINE = /^(Action required|Published under a temporary bypass)\b.*?: your custom domains? /;
const MAX_SEARCH_DEPTH = 6;

/** Finds FDR's custom-domain routing rejection in an FDR client error, wherever the client put the message. */
export function findCustomDomainBlockedMessage(error: unknown): string | undefined {
    const visited = new Set<unknown>();
    const search = (value: unknown, depth: number): string | undefined => {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (BLOCKED_HEADLINE.test(trimmed)) {
                return trimmed;
            }
            // Some clients hand back the raw response body, e.g. `{"message":"Publishing is blocked: …"}`.
            if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && depth < MAX_SEARCH_DEPTH) {
                try {
                    return search(JSON.parse(trimmed), depth + 1);
                } catch {
                    return undefined;
                }
            }
            return undefined;
        }
        if (value == null || typeof value !== "object" || depth >= MAX_SEARCH_DEPTH || visited.has(value)) {
            return undefined;
        }
        visited.add(value);
        const record = value as Record<string, unknown>;
        // `message` and `cause` are non-enumerable on Error instances.
        for (const key of new Set(["message", "cause", ...Object.keys(record)])) {
            const found = search(record[key], depth + 1);
            if (found != null) {
                return found;
            }
        }
        return undefined;
    };
    return search(error, 0);
}

export function isCustomDomainRoutingWarning(warning: string): boolean {
    return WARNING_HEADLINE.test(warning.trim());
}

/** Draws FDR's plain-text message in a red (blocked) or yellow (warning) box with a bold headline. */
export function formatCustomDomainRoutingNotice(message: string, severity: "blocked" | "warning"): string {
    const color = severity === "blocked" ? chalk.red : chalk.yellow;
    const [headline = "", ...rest] = message.trim().split("\n");
    const lines = [chalk.bold(headline), ...rest];
    const width = Math.max(...lines.map((line) => stripAnsi(line).length)) + 2;
    const border = color("━".repeat(width));
    return ["", border, ...lines.map((line) => (line === "" ? "" : ` ${line}`)), border, ""].join("\n");
}

function stripAnsi(value: string): string {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: matching ANSI escape codes
    return value.replace(/\u001b\[[0-9;]*m/g, "");
}
