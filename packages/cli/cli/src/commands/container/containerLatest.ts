import type { FernToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";

import { CliContext } from "../../cli-context/CliContext.js";

export async function containerLatest({ cliContext }: { cliContext: CliContext }): Promise<void> {
    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return;
    }

    await cliContext.runTask(async (context) => {
        const response = await fetch(
            `${process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com"}/registry/docs/container/latest`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token.value}`
                }
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            return context.failAndThrow(`Failed to fetch latest container tag: ${errorBody}`);
        }

        const data = (await response.json()) as { tag: string; image: string };

        context.logger.info(`${data.image}:${data.tag}`);
    });
}
