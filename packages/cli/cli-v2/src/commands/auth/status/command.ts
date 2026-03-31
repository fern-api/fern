import { getAccessToken } from "@fern-api/auth";
import chalk from "chalk";
import type { Argv } from "yargs";
import { TokenService } from "../../../auth/TokenService.js";
import { FERN_TOKEN_ENV_VAR } from "../../../constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

export declare namespace StatusCommand {
    export interface Args extends GlobalArgs {
        json: boolean;
        active: boolean;
    }
}

export class StatusCommand {
    public async handle(context: Context, args: StatusCommand.Args): Promise<void> {
        const envToken = await getAccessToken();
        if (envToken != null) {
            await this.displayEnvTokenStatus(context, envToken.value, args);
            return;
        }

        const accounts = await context.tokenService.getAllAccountInfo();
        if (accounts.length === 0) {
            if (args.json) {
                context.stdout.info(JSON.stringify({ accounts: [], activeAccount: null }, null, 2));
            } else {
                context.stdout.warn(`${chalk.yellow("⚠")} You are not logged in to Fern.`);
                context.stdout.info("");
                context.stdout.info(chalk.dim("  To log in, run: fern auth login"));
            }
            return;
        }

        if (args.json) {
            await this.displayJsonStatus(context, accounts);
            return;
        }
        if (args.active) {
            const activeAccount = accounts.find((a) => a.isActive);
            if (activeAccount != null) {
                await this.displaySingleAccountStatus(context, activeAccount);
            }
            return;
        }
        if (accounts.length === 1) {
            const singleAccount = accounts[0];
            if (singleAccount != null) {
                await this.displaySingleAccountStatus(context, singleAccount);
            }
            return;
        }
        await this.displayMultiAccountStatus(context, accounts);
    }

    private async displayEnvTokenStatus(context: Context, token: string, args: StatusCommand.Args): Promise<void> {
        if (args.json) {
            context.stdout.info(
                JSON.stringify(
                    {
                        source: FERN_TOKEN_ENV_VAR,
                        token: this.maskToken(token)
                    },
                    null,
                    2
                )
            );
            return;
        }

        context.stdout.info(chalk.bold(`Using ${FERN_TOKEN_ENV_VAR} environment variable`));
        context.stdout.info("");
        context.stdout.info(chalk.dim(`  The ${FERN_TOKEN_ENV_VAR} environment variable overrides stored accounts.`));
        context.stdout.info(chalk.dim(`  To use stored accounts, unset ${FERN_TOKEN_ENV_VAR}.`));
        context.stdout.info("");
    }

    private async displaySingleAccountStatus(context: Context, account: TokenService.AccountInfo): Promise<void> {
        context.stdout.info(chalk.bold("Logged in to Fern"));
        context.stdout.info("");
        context.stdout.info(`  Account:   ${account.user}`);

        const statusText = account.tokenInfo?.isExpired === true ? chalk.yellow("Expired") : chalk.green("Active");
        context.stdout.info(`  Status:    ${statusText}`);

        if (account.tokenInfo != null) {
            context.stdout.info(`  Expires:   ${account.tokenInfo.expiresIn}`);
        }
    }

    private async displayMultiAccountStatus(context: Context, accounts: TokenService.AccountInfo[]): Promise<void> {
        context.stdout.info(chalk.bold("Logged in to Fern"));
        context.stdout.info("");

        // Calculate column widths for alignment.
        const maxNameWidth = Math.max(...accounts.map((a) => a.user.length));

        for (const account of accounts) {
            const prefix = account.isActive ? chalk.cyan(">") : " ";
            const statusText = account.tokenInfo?.isExpired === true ? chalk.yellow("Expired") : chalk.green("Active");
            const expiryText = account.tokenInfo != null ? `expires ${account.tokenInfo.expiresIn}` : "";
            const expiredHint = account.tokenInfo?.isExpired === true ? chalk.dim("  run: fern auth login") : "";

            const paddedName = account.user.padEnd(maxNameWidth);
            context.stdout.info(`  ${prefix} ${paddedName}  ${statusText}    ${expiryText}${expiredHint}`);
        }
    }

    private async displayJsonStatus(context: Context, accounts: TokenService.AccountInfo[]): Promise<void> {
        const activeAccount = accounts.find((a) => a.isActive);

        const output = {
            accounts: accounts.map((account) => ({
                user: account.user,
                active: account.isActive,
                status: account.tokenInfo?.isExpired === true ? "expired" : "valid",
                expiresAt: account.tokenInfo?.expiresAt?.toISOString() ?? null,
                token: account.tokenInfo != null ? this.maskToken(account.tokenInfo.token) : null
            })),
            activeAccount: activeAccount?.user ?? null
        };

        context.stdout.info(JSON.stringify(output, null, 2));
    }

    private maskToken(token: string): string {
        if (token.length <= 10) {
            return "***";
        }
        return `${token.slice(0, 4)}...${token.slice(-4)}`;
    }
}

export function addStatusCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new StatusCommand();
    command(
        cli,
        "status",
        "Show authentication status",
        (context, args) => cmd.handle(context, args as StatusCommand.Args),
        (yargs) =>
            yargs
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output as JSON"
                })
                .option("active", {
                    type: "boolean",
                    default: false,
                    description: "Show active account only"
                })
    );
}
