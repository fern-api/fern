import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import {
  FERN_CLAUDE_PLUGIN,
  FERN_SKILLS,
  getInstallSlashCommands,
} from "../constants.js";

export declare namespace InstallCommand {
  export interface Args extends GlobalArgs {
    json: boolean;
  }
}

export class InstallCommand {
  public async handle(
    context: Context,
    args: InstallCommand.Args,
  ): Promise<void> {
    if (args.json) {
      context.stdout.info(
        JSON.stringify(
          {
            marketplace: {
              repo: FERN_CLAUDE_PLUGIN.marketplaceRepo,
              name: FERN_CLAUDE_PLUGIN.marketplaceName,
            },
            plugin: {
              name: FERN_CLAUDE_PLUGIN.pluginName,
              source: FERN_CLAUDE_PLUGIN.sourceUrl,
            },
            commands: getInstallSlashCommands(),
            skills: FERN_SKILLS.map((s) => s.name),
          },
          null,
          2,
        ),
      );
      return;
    }

    const [addMarketplace, installPlugin] = getInstallSlashCommands();
    context.stdout.info(chalk.bold("Install the Fern plugin in Claude Code"));
    context.stdout.info("");
    context.stdout.info("  Open Claude Code and run:");
    context.stdout.info("");
    context.stdout.info(`    ${chalk.cyan(addMarketplace)}`);
    context.stdout.info(`    ${chalk.cyan(installPlugin)}`);
    context.stdout.info("");
    context.stdout.info(
      chalk.dim(`  Source:  ${FERN_CLAUDE_PLUGIN.sourceUrl}`),
    );
    context.stdout.info(
      chalk.dim(`  Docs:    ${FERN_CLAUDE_PLUGIN.claudeDocsUrl}`),
    );
    context.stdout.info("");
    context.stdout.info(
      `  ${Icons.info} Run 'fern claude skills' to see what the plugin can do.`,
    );
  }
}

export function addInstallCommand(cli: Argv<GlobalArgs>): void {
  const cmd = new InstallCommand();
  command(
    cli,
    "install",
    "Show how to install the Fern plugin in Claude Code",
    (context, args) => cmd.handle(context, args as InstallCommand.Args),
    (yargs) =>
      yargs
        .option("json", {
          type: "boolean",
          default: false,
          description: "Output as JSON",
        })
        .example(
          "$0 claude install",
          "Print the slash commands to run inside Claude Code",
        )
        .example(
          "$0 claude install --json",
          "Output marketplace/plugin metadata as JSON",
        ),
  );
}
