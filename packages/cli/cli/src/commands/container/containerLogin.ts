import type { FernToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

export async function containerLogin({ cliContext, orgId }: { cliContext: CliContext; orgId: string }): Promise<void> {
    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return;
    }

    await cliContext.runTask(async (context) => {
        context.logger.info("Requesting container registry credentials...");

        const response = await fetch(
            `${process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com"}/registry/docs/container/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.value}`
                },
                body: JSON.stringify({ orgId })
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            if (response.status === 403) {
                return context.failAndThrow(
                    `Your organization "${orgId}" is not enabled for self-hosted deployments. Please contact support@buildwithfern.com`
                );
            }
            return context.failAndThrow(`Failed to get container credentials: ${errorBody}`);
        }

        const data = (await response.json()) as { username: string; token: string };

        context.logger.info(chalk.green("\nContainer registry credentials:\n"));
        context.logger.info(`  Username: ${chalk.cyan(data.username)}`);
        context.logger.info(`  Token:    ${chalk.cyan(data.token)}`);
        context.logger.info(chalk.green("\nTo authenticate with Docker, run:\n"));
        context.logger.info(
            chalk.white(`  echo "${data.token}" | docker login --username ${data.username} --password-stdin\n`)
        );
        context.logger.info(chalk.gray("You can then pull the self-hosted container with:\n"));
        context.logger.info(chalk.white("  docker pull fernenterprise/fern-self-hosted:latest\n"));
    });
}
