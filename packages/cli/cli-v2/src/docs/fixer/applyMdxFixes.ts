import chalk from "chalk";
import path from "path";
import type { Context } from "../../context/Context.js";
import { Icons } from "../../ui/format.js";
import type { MdxParseError } from "../errors/MdxParseError.js";
import { MdxFixer } from "./MdxFixer.js";

/**
 * Non-interactive MDX fix application for the `--fix` flag.
 *
 * Applies all available fixes without prompting. Deterministic fixes are
 * applied first; AI fallback is used when a deterministic fix is not
 * available and an AI provider is configured.
 */
export async function applyMdxFixes(context: Context, errors: MdxParseError[]): Promise<number> {
    if (errors.length === 0) {
        return 0;
    }

    const fixer = new MdxFixer();
    let fixedCount = 0;

    for (const error of errors) {
        const absoluteFilepath = path.resolve(context.cwd, error.displayRelativeFilepath);
        const result = await fixer.applyFix({ error, absoluteFilepath });
        const where = chalk.cyan(error.displayRelativeFilepath);
        if (result.applied) {
            fixedCount++;
            const tag = result.strategy != null ? chalk.dim(`[${result.strategy}] `) : "";
            context.stderr.info(`${Icons.success} ${chalk.green("Fixed")} ${tag}${where} — ${result.summary}`);
        } else {
            context.stderr.info(`${Icons.warning} ${chalk.yellow("Could not fix")} ${where} — ${result.summary}`);
        }
    }

    return fixedCount;
}
