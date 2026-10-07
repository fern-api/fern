// biome-ignore-all lint/suspicious/noConsole: CLI output is intentionally written to stdout.
import chalk from "chalk";
import type { ActionPlan, Recommendation } from "./types";

export const Icons = {
    error: chalk.red("\u2717"),
    warning: chalk.yellow("\u26a0"),
    success: chalk.green("\u2713"),
    info: chalk.cyan("\u25c6")
} as const;

export function printRecommendations(recommendations: Recommendation[]): void {
    console.log(chalk.bold("\nWhat Fern can do for this repo\n"));
    if (recommendations.length === 0) {
        console.log(`  ${Icons.info} No product recommendations yet.`);
        return;
    }
    for (const recommendation of recommendations) {
        console.log(`  ${Icons.success} ${chalk.bold(recommendation.title)} — ${recommendation.why}`);
        console.log(`    ${chalk.dim(recommendation.link)}`);
    }
}

/** A step's title, what it does, and the exact commands or files involved, one per line. */
export function formatAction(action: ActionPlan, indent: string): string {
    // Leave room for inquirer's "❯◉ " prefix; some pseudo-terminals report 0 columns.
    const width = Math.max(40, (process.stdout.columns || 100) - indent.length - 4);
    return [
        chalk.bold(action.title),
        ...wrap(action.description, width).map((line) => `${indent}${line}`),
        ...action.commands.map((command) => `${indent}${chalk.dim(`$ ${command}`)}`),
        ...action.files.map((file) => `${indent}${chalk.dim(`writes ${file}`)}`)
    ].join("\n");
}

function wrap(text: string, width: number): string[] {
    const lines: string[] = [];
    let current = "";
    for (const word of text.split(" ")) {
        if (current.length > 0 && current.length + 1 + word.length > width) {
            lines.push(current);
            current = word;
        } else {
            current = current.length === 0 ? word : `${current} ${word}`;
        }
    }
    return current.length > 0 ? [...lines, current] : lines;
}

export function printPlan(actions: ActionPlan[]): void {
    console.log(chalk.bold("\nDry run — nothing was changed. Without --dry-run, the wizard would:\n"));
    for (const action of actions) {
        console.log(`  ${Icons.info} ${formatAction(action, "    ")}\n`);
    }
}

export function printNextSteps(cliInterest: boolean): void {
    console.log(chalk.bold("\nNext steps\n"));
    console.log(`  ${Icons.success} fern check`);
    console.log(`  ${Icons.success} fern generate (or fern docs dev)`);
    console.log(`  ${Icons.info} Dashboard: https://dashboard.buildwithfern.com`);
    if (cliInterest) {
        console.log(
            `  ${Icons.info} CLI generator is early access: https://buildwithfern.com/learn/cli-generator/get-started/quickstart`
        );
        console.log("    Book a demo: https://buildwithfern.com/book-demo?type=cli");
    }
    console.log(`\n${chalk.bold("Hand this to your coding agent:")}`);
    console.log(
        chalk.cyan(
            "Help me get started with Fern. Read https://buildwithfern.com/learn/home/get-started.md and follow it step by step."
        )
    );
}
