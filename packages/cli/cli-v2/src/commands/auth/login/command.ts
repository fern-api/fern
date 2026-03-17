import { verifyAndDecodeJwt } from "@fern-api/auth";
import { LogLevel } from "@fern-api/logger";
import { type Auth0TokenResponse, getTokenFromAuth0 } from "@fern-api/login";
import chalk from "chalk";
import type { Argv } from "yargs";

import { TaskContextAdapter } from "../../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

export declare namespace LoginCommand {
    export interface Args extends GlobalArgs {
        "device-code": boolean;
    }
}

export class LoginCommand {
    public async handle(context: Context, args: LoginCommand.Args): Promise<void> {
        const useDeviceCodeFlow = args["device-code"];
        if (!useDeviceCodeFlow) {
            context.stdout.info("🌿 Welcome to Fern!");
            context.stdout.info("");
            context.stdout.info("Opening browser to log in to Fern...");
            context.stdout.info(chalk.dim("  If the browser doesn't open, try: fern auth login --device-code"));
        }

        // Use LogLevel.Info to show device code flow messages.
        const taskContext = new TaskContextAdapter({ context, logLevel: LogLevel.Info });
        const tokenResponse = await getTokenFromAuth0(taskContext, {
            useDeviceCodeFlow,
            forceReauth: true
        });
        await this.storeAndConfirmLogin(context, tokenResponse);
    }

    private async storeAndConfirmLogin(context: Context, tokenResponse: Auth0TokenResponse): Promise<void> {
        const { accessToken, idToken } = tokenResponse;

        const payload = await verifyAndDecodeJwt(idToken);
        if (payload == null) {
            context.stdout.error(`${Icons.error} Internal error; could not verify ID token`);
            throw CliError.exit();
        }

        const email = payload.email;
        if (email == null) {
            context.stdout.error(`${Icons.error} Internal error; ID token does not contain email claim`);
            throw CliError.exit();
        }

        const { isNew, totalAccounts } = await context.tokenService.login(email, accessToken);
        if (isNew) {
            context.stdout.info(`${Icons.success} Logged in as ${chalk.bold(email)}`);
            if (totalAccounts > 1) {
                context.stdout.info(chalk.dim(`  Account added. You now have ${totalAccounts} accounts.`));
                context.stdout.info(chalk.dim(`  Active account: ${email}`));
            } else {
                context.stdout.info(chalk.dim("  Account stored in ~/.fernrc"));
            }
            return;
        }

        context.stdout.info(`${Icons.success} Logged in as ${chalk.bold(email)}`);
    }
}

export function addLoginCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new LoginCommand();
    command(
        cli,
        "login",
        "Log in to Fern",
        (context, args) => cmd.handle(context, args as LoginCommand.Args),
        (yargs) =>
            yargs
                .option("device-code", {
                    type: "boolean",
                    default: false,
                    description: "Use device code flow (for environments where browser cannot open automatically)"
                })
                .example("$0 auth login", "Log in via browser")
                .example("$0 auth login --device-code", "Log in via device code")
    );
}
