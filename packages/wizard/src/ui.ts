// biome-ignore-all lint/suspicious/noConsole: CLI output is intentionally written to stdout.
import chalk from "chalk";
import { dashboardOrigin } from "./fern-urls";
import type { ActionPlan, Product, SetupStep } from "./types";

export const Icons = {
    error: chalk.red("✗"),
    warning: chalk.yellow("⚠"),
    success: chalk.green("✓"),
    info: chalk.cyan("◆")
} as const;

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function printStepHeader(index: number, total: number, title: string): void {
    console.log(`\n${chalk.green.bold(`Step ${index} of ${total}`)}  ${chalk.bold(title)}`);
}

/**
 * What a step will do, one line per action. Dry runs also list the exact commands and files
 * underneath each action.
 */
export function printStepPreview(actions: ActionPlan[], { details = false }: { details?: boolean } = {}): void {
    for (const action of actions) {
        console.log(`  • ${action.title}`);
        if (details) {
            for (const detail of actionDetails(action)) {
                console.log(`    ${chalk.dim(detail)}`);
            }
        }
    }
}

/**
 * Makes text clickable in terminals that support OSC 8 hyperlinks. Callers print the URL or path
 * too, so other terminals can still open it.
 */
export function hyperlink(text: string, url: string): string {
    return process.stdout.isTTY === true ? `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007` : text;
}

export function printDone(message: string): void {
    console.log(`  ${Icons.success} ${message}`);
}

/** An indented line under a result, such as a link to what was found. */
export function printDetail(message: string): void {
    console.log(`      ${message}`);
}

export function printSkipped(message: string): void {
    console.log(`  ${chalk.dim(`– ${message}`)}`);
}

export function printFailed(message: string): void {
    console.log(`  ${Icons.error} ${message}`);
}

/** Shows a spinner next to the label while the task runs (interactive terminals only). */
export async function withStatus<T>(label: string, task: () => Promise<T>): Promise<T> {
    if (process.stdout.isTTY !== true) {
        return task();
    }
    let frame = 0;
    const render = (): void => {
        process.stdout.write(`\r\x1b[2K  ${chalk.cyan(SPINNER_FRAMES[frame % SPINNER_FRAMES.length])} ${label}…`);
        frame++;
    };
    render();
    const timer = setInterval(render, 80);
    try {
        return await task();
    } finally {
        clearInterval(timer);
        process.stdout.write("\r\x1b[2K");
    }
}

export function printPlan(steps: SetupStep[], notes: string[]): void {
    console.log(chalk.bold("\nDry run — nothing was changed. Without --dry-run, the wizard would:"));
    steps.forEach((step, index) => {
        printStepHeader(index + 1, steps.length, step.title);
        if (step.id === "cli-setup") {
            for (const note of notes) {
                printSkipped(note);
            }
        }
        printStepPreview(step.actions, { details: true });
    });
}

/** The Fern Dashboard, opened to the organization when there is one. */
export function dashboardUrl(organization: string | undefined): string {
    return organization === undefined ? dashboardOrigin() : `${dashboardOrigin()}/${organization}`;
}

/** The Fern Dashboard page where the organization changes its plan. */
export function billingUrl(organization: string | undefined): string {
    return organization === undefined ? dashboardUrl(undefined) : `${dashboardUrl(organization)}/billing`;
}

export function printNextSteps(
    products: Product[],
    results: {
        organization?: string;
        docsUrl?: string;
        previewUrl?: string;
        publishedUrl?: string;
        generatedSdks?: Array<{ label: string; path: string }>;
    }
): void {
    console.log(chalk.bold("\nNext steps\n"));
    if (results.organization !== undefined) {
        const dashboard = dashboardUrl(results.organization);
        console.log(
            `  ${Icons.success} Organization: ${chalk.bold(hyperlink(results.organization, dashboard))}  ${chalk.cyan(dashboard)}`
        );
    }
    if (results.publishedUrl !== undefined) {
        console.log(`  ${Icons.success} Your docs are live at ${chalk.cyan(results.publishedUrl)}`);
    } else if (results.previewUrl !== undefined) {
        console.log(`  ${Icons.success} Preview: ${chalk.cyan(results.previewUrl)}`);
    }
    for (const sdk of results.generatedSdks ?? []) {
        console.log(`  ${Icons.success} ${sdk.label} SDK: ${chalk.cyan(sdk.path)}`);
    }
    if (products.includes("docs")) {
        console.log(`  ${Icons.info} Edit your docs locally: fern docs dev`);
        if (results.publishedUrl === undefined) {
            console.log(
                `  ${Icons.info} Publish${results.docsUrl === undefined ? "" : ` to ${results.docsUrl}`}: fern generate --docs`
            );
        }
    }
    if (products.includes("sdks")) {
        console.log(
            `  ${Icons.info} ${(results.generatedSdks ?? []).length > 0 ? "Regenerate" : "Generate"} SDKs: fern generate`
        );
    }
    if (results.organization === undefined) {
        console.log(`  ${Icons.info} Dashboard: ${dashboardUrl(undefined)}`);
    }
}

function actionDetails(action: ActionPlan): string[] {
    return [...action.commands.map((command) => `$ ${command}`), ...action.files.map((file) => `writes ${file}`)];
}
