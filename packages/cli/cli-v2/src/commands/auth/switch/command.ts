import chalk from "chalk";
import inquirer from "inquirer";
import type { Argv } from "yargs";

import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

export declare namespace SwitchCommand {
    export interface Args extends GlobalArgs {
        user?: string;
    }
}

export class SwitchCommand {
    public async handle(context: Context, args: SwitchCommand.Args): Promise<void> {
        const accounts = await context.tokenService.getAllAccountInfo();
        if (accounts.length === 0) {
            context.stdout.warn(`${chalk.yellow("⚠")} You are not logged in to Fern.`);
            context.stdout.info("");
            context.stdout.info(chalk.dim("  To log in, run: fern auth login"));
            throw CliError.exit();
        }

        if (accounts.length === 1) {
            const account = accounts[0];
            if (account == null) {
                context.stdout.error(`${Icons.error} Internal error; no accounts found`);
                throw CliError.exit();
            }

            context.stdout.warn(
                `${chalk.yellow("⚠")} You only have one account logged in: ${chalk.bold(account.user)}`
            );
            context.stdout.info("");
            context.stdout.info(chalk.dim("  To add another account, run: fern auth login"));
            return;
        }

        if (args.user != null) {
            await this.switchToUser(context, args.user);
            return;
        }
        if (accounts.length === 2) {
            const otherAccount = accounts.find((a) => !a.isActive);
            if (otherAccount != null) {
                await this.switchToUser(context, otherAccount.user);
            }
            return;
        }
        // If there are more than two accounts, we use an interactive selection.
        await this.handleInteractiveSwitch(context, accounts);
    }

    private async handleInteractiveSwitch(
        context: Context,
        accounts: Array<{ user: string; isActive: boolean }>
    ): Promise<void> {
        if (!context.isTTY) {
            context.stdout.error(`${Icons.error} Use --user to specify account in non-interactive mode`);
            throw CliError.exit();
        }

        const choices = accounts.map((account) => ({
            name: account.isActive ? `${account.user} ${chalk.dim("(current)")}` : account.user,
            value: account.user,
            disabled: account.isActive ? "(current)" : false
        }));

        const { selectedUser } = await inquirer.prompt<{ selectedUser: string }>([
            {
                type: "list",
                name: "selectedUser",
                message: "Select account:",
                choices
            }
        ]);

        await this.switchToUser(context, selectedUser);
    }

    private async switchToUser(context: Context, user: string): Promise<void> {
        const success = await context.tokenService.switchAccount(user);
        if (!success) {
            context.stdout.error(`${Icons.error} Account not found: ${user}`);
            throw CliError.exit();
        }
        context.stdout.info(`${Icons.success} Switched to ${chalk.bold(user)}`);
    }
}

export function addSwitchCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new SwitchCommand();
    command(
        cli,
        "switch",
        "Switch active account",
        (context, args) => cmd.handle(context, args as SwitchCommand.Args),
        (yargs) =>
            yargs.option("user", {
                type: "string",
                description: "Switch to specific account"
            })
    );
}
