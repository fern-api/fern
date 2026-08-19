import chalk from "chalk";
import inquirer from "inquirer";
import path from "path";
import type { Context } from "../../context/Context.js";
import { Icons } from "../../ui/format.js";
import type { MdxParseError } from "../errors/MdxParseError.js";
import { MdxFixer } from "./MdxFixer.js";

type BatchChoice = "apply-all" | "review" | "skip";
type PerErrorChoice = "yes" | "no" | "diff";

/**
 * Drive the interactive "fix with AI?" flow for a list of MDX parse errors.
 *
 * Behaviour:
 *   - For a single error, ask per-error directly: yes / no / show diff.
 *   - For 2+ errors, present a top-level batching prompt: "apply all / review
 *     each / skip all". Picking "review" then asks per-error for each one.
 *   - Picking "apply all" applies the deterministic fix when available, and
 *     falls back to the configured AI provider for the rest.
 *
 * Skipped automatically by callers when stdout is not a TTY, when the user
 * passed `--json`, or when running inside a Claude Code session.
 */
export async function offerAiFixes(context: Context, errors: MdxParseError[]): Promise<void> {
    if (errors.length === 0) {
        return;
    }

    const fixer = new MdxFixer();

    if (errors.length === 1) {
        const [only] = errors;
        if (only != null) {
            await offerSingleFix(context, fixer, only);
        }
        return;
    }

    // Batched flow.
    process.stderr.write(
        `\n${chalk.magenta("◆")} ${chalk.bold(`fix ${errors.length} MDX errors with AI?`)} ${chalk.dim("·")} ` +
            `${chalk.cyan(`${errors.length} files`)} affected\n`
    );

    const { batch } = await inquirer.prompt<{ batch: BatchChoice }>([
        {
            type: "list",
            name: "batch",
            message: "",
            choices: [
                { name: `apply all (${errors.length})`, value: "apply-all" },
                { name: "review each one", value: "review" },
                { name: "skip all", value: "skip" }
            ]
        }
    ]);

    if (batch === "skip") {
        return;
    }

    if (batch === "apply-all") {
        for (const error of errors) {
            await applyAndReport(context, fixer, error);
        }
        return;
    }

    // batch === "review"
    for (const error of errors) {
        await offerSingleFix(context, fixer, error);
    }
}

async function offerSingleFix(context: Context, fixer: MdxFixer, error: MdxParseError): Promise<void> {
    const absoluteFilepath = path.resolve(context.cwd, error.displayRelativeFilepath);

    process.stderr.write(
        `\n${chalk.magenta("◆")} ${chalk.bold("fix with AI?")} ${chalk.dim("·")} ` +
            `fern will patch ${chalk.cyan(error.displayRelativeFilepath)}\n`
    );

    const { action } = await inquirer.prompt<{ action: PerErrorChoice }>([
        {
            type: "list",
            name: "action",
            message: "",
            choices: [
                { name: "yes", value: "yes" },
                { name: "no", value: "no" },
                { name: "show me the diff first", value: "diff" }
            ]
        }
    ]);

    if (action === "no") {
        return;
    }

    if (action === "diff") {
        const preview = await fixer.previewFix({ error, absoluteFilepath });
        if (preview == null) {
            process.stderr.write(chalk.dim("  No diff available — skipping.\n"));
            return;
        }
        process.stderr.write(`\n${preview}\n`);

        const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
            { type: "confirm", name: "confirm", message: "Apply this fix?", default: true }
        ]);
        if (!confirm) {
            return;
        }
    }

    await applyAndReport(context, fixer, error);
}

async function applyAndReport(context: Context, fixer: MdxFixer, error: MdxParseError): Promise<void> {
    const absoluteFilepath = path.resolve(context.cwd, error.displayRelativeFilepath);
    const result = await fixer.applyFix({ error, absoluteFilepath });
    const where = chalk.cyan(error.displayRelativeFilepath);
    if (result.applied) {
        const tag = result.strategy != null ? chalk.dim(`[${result.strategy}] `) : "";
        process.stderr.write(`${Icons.success} ${chalk.green("Fixed")} ${tag}${where} — ${result.summary}\n`);
    } else {
        process.stderr.write(`${Icons.error} ${chalk.red("Could not fix")} ${where} — ${result.summary}\n`);
    }
}
