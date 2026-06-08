import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";
import { FERN_CLAUDE_PLUGIN, FERN_SKILLS } from "../constants.js";

export declare namespace SkillsCommand {
    export interface Args extends GlobalArgs {
        json: boolean;
    }
}

export class SkillsCommand {
    public async handle(context: Context, args: SkillsCommand.Args): Promise<void> {
        if (args.json) {
            context.stdout.info(JSON.stringify({ skills: FERN_SKILLS }, null, 2));
            return;
        }

        context.stdout.info(chalk.bold(`Fern plugin skills (${FERN_SKILLS.length})`));
        context.stdout.info("");

        const maxNameWidth = Math.max(...FERN_SKILLS.map((s) => s.name.length));
        for (const skill of FERN_SKILLS) {
            const padded = skill.name.padEnd(maxNameWidth);
            context.stdout.info(`  ${chalk.cyan(padded)}  ${skill.description}`);
        }

        context.stdout.info("");
        context.stdout.info(chalk.dim(`  Source: ${FERN_CLAUDE_PLUGIN.sourceUrl}`));
    }
}

export function addSkillsCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new SkillsCommand();
    command(
        cli,
        "skills",
        "List the skills shipped by the Fern Claude Code plugin",
        (context, args) => cmd.handle(context, args as SkillsCommand.Args),
        (yargs) =>
            yargs.option("json", {
                type: "boolean",
                default: false,
                description: "Output as JSON"
            })
    );
}
