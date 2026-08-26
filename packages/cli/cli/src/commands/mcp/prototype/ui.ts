import { assertNever } from "@fern-api/core-utils";
import boxen from "boxen";
import chalk from "chalk";

import { formatTokens, ResolvedTool, Verdict } from "./toolset.js";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_INTERVAL_MS = 80;

export const ICONS = {
    success: chalk.green("✓"),
    warning: chalk.yellow("▲"),
    error: chalk.red("✗"),
    agent: chalk.magenta("✦"),
    bullet: chalk.dim("·"),
    pointer: chalk.green("➜")
} as const;

export function banner(title: string, lines: string[]): string {
    const body = [chalk.bold(title), ...lines].join("\n");
    return boxen(body, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderStyle: "round",
        borderColor: "green"
    });
}

export function sectionRule(title: string): string {
    const label = ` ${title} `;
    const width = Math.max(8, 56 - label.length);
    return chalk.dim(`──${chalk.reset(chalk.bold(label))}${chalk.dim("─".repeat(width))}`);
}

export function methodBadge(method: string): string {
    const padded = method.padEnd(6);
    switch (method) {
        case "GET":
            return chalk.green(padded);
        case "POST":
            return chalk.yellow(padded);
        case "PUT":
        case "PATCH":
            return chalk.blue(padded);
        case "DELETE":
            return chalk.red(padded);
        default:
            return chalk.dim(padded);
    }
}

export function verdictBadge(verdict: Verdict): string {
    switch (verdict.level) {
        case "green":
            return chalk.bgGreen.black(" PASS ");
        case "amber":
            return chalk.bgYellow.black(" WARN ");
        case "red":
            return chalk.bgRed.white(" OVER ");
        default:
            assertNever(verdict.level);
    }
}

export function styledVerdictLine(verdict: Verdict): string {
    const counts = `${chalk.bold(verdict.toolCount)} tools ${ICONS.bullet} ${chalk.bold(formatTokens(verdict.estimatedTokens))} tokens`;
    const label = verdict.level === "green" ? chalk.green(verdict.label) : chalk.yellow(verdict.label);
    return `${verdictBadge(verdict)} ${counts} ${chalk.dim("—")} ${verdict.level === "red" ? chalk.red(verdict.label) : label}`;
}

export function toolTable(tools: ResolvedTool[]): string[] {
    if (tools.length === 0) {
        return [];
    }
    const nameWidth = Math.max(...tools.map((tool) => tool.name.length), 4);
    return tools.map((tool) => {
        const tokens = `~${tool.endpoint.estimatedTokens} tok`.padStart(9);
        return `  ${chalk.cyan(tool.name.padEnd(nameWidth + 2))}${methodBadge(tool.endpoint.method)} ${tool.endpoint.path.padEnd(28)}${chalk.dim(tokens)}`;
    });
}

export function keyValueRows(rows: [string, string][]): string[] {
    const keyWidth = Math.max(...rows.map(([key]) => key.length));
    return rows.map(([key, value]) => `  ${chalk.dim(`${key.padEnd(keyWidth)}`)}  ${value}`);
}

export function command(text: string): string {
    return chalk.cyan(text);
}

export function hint(text: string): string {
    return chalk.dim(text);
}

/**
 * Runs `work` while animating a spinner on stdout (TTY only). Falls back to a
 * single static line when not attached to a terminal.
 */
export async function withSpinner<T>(text: string, work: () => Promise<T>): Promise<T> {
    if (!process.stdout.isTTY) {
        process.stdout.write(`${text}\n`);
        return await work();
    }
    let frame = 0;
    process.stdout.write(`${chalk.magenta(SPINNER_FRAMES[0])} ${text}`);
    const timer = setInterval(() => {
        frame = (frame + 1) % SPINNER_FRAMES.length;
        process.stdout.write(`\r${chalk.magenta(SPINNER_FRAMES[frame])} ${text}`);
    }, SPINNER_INTERVAL_MS);
    try {
        return await work();
    } finally {
        clearInterval(timer);
        process.stdout.write(`\r${" ".repeat(text.length + 2)}\r`);
    }
}

export async function sleep(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
