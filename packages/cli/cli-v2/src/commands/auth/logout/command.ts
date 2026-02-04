import chalk from "chalk";
import inquirer from "inquirer";
import type { Argv } from "yargs";

import { TokenService } from "../../../auth/TokenService";
import type { Context } from "../../../context/Context";
import type { GlobalArgs } from "../../../context/GlobalArgs";
import { CliError } from "../../../errors/CliError";
import { Icons } from "../../../ui/format";
import { command } from "../../_internal/command";

interface LogoutArgs extends GlobalArgs {
    user?: string;
    all: boolean;
    force: boolean;
}

export function addLogoutCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "logout", "Log out of Fern", handleLogout, (yargs) =>
        yargs
            .option("user", {
                type: "string",
                description: "Log out of a specific account"
            })
            .option("all", {
                type: "boolean",
                default: false,
                description: "Log out of all accounts"
            })
            .option("force", {
                type: "boolean",
                default: false,
                description: "Skip confirmation prompt"
            })
    );
}

async function handleLogout(context: Context, args: LogoutArgs): Promise<void> {
    const accounts = await context.tokenService.getAllAccountInfo();
    if (accounts.length === 0) {
        context.stdout.warn(`${chalk.yellow("⚠")} You are not logged in to Fern.`);
        context.stdout.info("");
        context.stdout.info(chalk.dim("  To log in, run: fern auth login"));
        return;
    }
    if (args.all) {
        await handleLogoutAll(context, accounts, args.force);
        return;
    }
    if (args.user != null) {
        await handleLogoutUser(context, args.user);
        return;
    }
    if (accounts.length === 1) {
        const singleAccount = accounts[0];
        if (singleAccount != null) {
            await handleLogoutUser(context, singleAccount.user);
        }
        return;
    }
    await handleLogoutInteractive(context, accounts);
}

async function handleLogoutAll(context: Context, accounts: TokenService.AccountInfo[], force: boolean): Promise<void> {
    if (force) {
        await context.tokenService.logoutAll();
        context.stdout.info(`${Icons.success} Logged out of all accounts`);
    }

    context.stdout.warn(`${chalk.yellow("⚠")} This will log out of all ${accounts.length} accounts:`);
    for (const account of accounts) {
        const activeMarker = account.isActive ? chalk.dim(" (active)") : "";
        context.stdout.info(`    - ${account.user}${activeMarker}`);
    }

    context.stdout.info("");

    if (!context.isTTY) {
        context.stdout.error(`${Icons.error} Use --force to skip confirmation in non-interactive mode`);
        throw CliError.exit();
    }

    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
        {
            type: "confirm",
            name: "confirmed",
            message: "Continue?",
            default: false
        }
    ]);

    if (!confirmed) {
        context.stdout.info("Cancelled.");
        return;
    }

    await context.tokenService.logoutAll();
    context.stdout.info(`${Icons.success} Logged out of all accounts`);
}

async function handleLogoutUser(context: Context, user: string): Promise<void> {
    const { removed, newActive } = await context.tokenService.logout(user);

    if (!removed) {
        context.stdout.error(`${Icons.error} Account not found: ${user}`);
        throw CliError.exit();
    }

    context.stdout.info(`${Icons.success} Logged out of ${chalk.bold(user)}`);

    if (newActive != null) {
        context.stdout.info(chalk.dim(`  Switched active account to ${newActive}`));
    }
}

async function handleLogoutInteractive(context: Context, accounts: TokenService.AccountInfo[]): Promise<void> {
    if (!context.isTTY) {
        context.stdout.error(`${Icons.error} Multiple accounts found. Use --user or --all in non-interactive mode.`);
        throw CliError.exit();
    }

    const choices = accounts.map((account) => ({
        name: account.isActive ? `${account.user} ${chalk.dim("(active)")}` : account.user,
        value: account.user
    }));

    const { selectedUser } = await inquirer.prompt<{ selectedUser: string }>([
        {
            type: "list",
            name: "selectedUser",
            message: "Select account to log out:",
            choices
        }
    ]);

    await handleLogoutUser(context, selectedUser);
}
