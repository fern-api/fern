import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { isClaudeCodeSession } from "../../../context/isClaudeCodeSession.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import {
  FERN_CLAUDE_PLUGIN,
  FERN_SKILLS,
  getInstallSlashCommands,
} from "../constants.js";

export declare namespace StatusCommand {
  export interface Args extends GlobalArgs {
    json: boolean;
  }
}

export class StatusCommand {
  public async handle(
    context: Context,
    args: StatusCommand.Args,
  ): Promise<void> {
    const inSession = isClaudeCodeSession();
    const entrypoint = process.env["CLAUDE_CODE_ENTRYPOINT"] ?? null;

    if (args.json) {
      context.stdout.info(
        JSON.stringify(
          {
            inClaudeCodeSession: inSession,
            entrypoint,
            plugin: {
              name: FERN_CLAUDE_PLUGIN.pluginName,
              marketplace: FERN_CLAUDE_PLUGIN.marketplaceName,
              source: FERN_CLAUDE_PLUGIN.sourceUrl,
            },
            skillCount: FERN_SKILLS.length,
          },
          null,
          2,
        ),
      );
      return;
    }

    context.stdout.info(chalk.bold("Fern Claude Code plugin"));
    context.stdout.info("");
    context.stdout.info(
      `  Marketplace:  ${FERN_CLAUDE_PLUGIN.marketplaceRepo}`,
    );
    context.stdout.info(
      `  Plugin:       ${FERN_CLAUDE_PLUGIN.pluginName}@${FERN_CLAUDE_PLUGIN.marketplaceName}`,
    );
    context.stdout.info(`  Skills:       ${FERN_SKILLS.length}`);
    context.stdout.info("");

    if (inSession) {
      const entrypointLabel = entrypoint != null ? ` (${entrypoint})` : "";
      context.stdout.info(
        `  ${Icons.success} Running inside a Claude Code session${entrypointLabel}.`,
      );
      context.stdout.info("");
      context.stdout.info(
        chalk.dim(
          "  Fern cannot detect from outside whether the plugin is installed.",
        ),
      );
      context.stdout.info(
        chalk.dim(
          "  Inside Claude Code, run /plugin to see installed plugins.",
        ),
      );
    } else {
      context.stdout.info(
        `  ${Icons.info} Not running inside a Claude Code session.`,
      );
      context.stdout.info("");
      context.stdout.info("  To install the plugin, open Claude Code and run:");
      context.stdout.info("");
      for (const slash of getInstallSlashCommands()) {
        context.stdout.info(`    ${chalk.cyan(slash)}`);
      }
    }
  }
}

export function addStatusCommand(cli: Argv<GlobalArgs>): void {
  const cmd = new StatusCommand();
  command(
    cli,
    "status",
    "Show Fern Claude Code plugin status",
    (context, args) => cmd.handle(context, args as StatusCommand.Args),
    (yargs) =>
      yargs.option("json", {
        type: "boolean",
        default: false,
        description: "Output as JSON",
      }),
  );
}
