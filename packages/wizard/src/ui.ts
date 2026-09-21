// biome-ignore-all lint/suspicious/noConsole: CLI output is intentionally written to stdout.
import chalk from "chalk";
import type { ActionPlan, Recommendation } from "./types";

const FERN_BANNER = [
    "███████╗███████╗██████╗ ███╗   ██╗",
    "██╔════╝██╔════╝██╔══██╗████╗  ██║",
    "█████╗  █████╗  ██████╔╝██╔██╗ ██║",
    "██╔══╝  ██╔══╝  ██╔══██╗██║╚██╗██║",
    "██║     ███████╗██║  ██║██║ ╚████║",
    "╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝"
]
    .map((line) => `  ${chalk.green(line)}`)
    .join("\n");

export const Icons = {
    error: chalk.red("\u2717"),
    warning: chalk.yellow("\u26a0"),
    success: chalk.green("\u2713"),
    info: chalk.cyan("\u25c6")
} as const;

export function printBanner(dir: string): void {
    console.log(FERN_BANNER);
    console.log(`\nLet's set up Fern in ${dir}\n`);
}

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

export function printPlan(actions: ActionPlan[]): void {
    console.log(chalk.bold("\nPlan\n"));
    for (const action of actions) {
        const prefix = action.id === "agent-handoff" ? "would write:" : "would run:";
        console.log(`  ${Icons.info} ${prefix} ${action.label}`);
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
