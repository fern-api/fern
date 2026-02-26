import type { FernToken } from "@fern-api/auth";
import { type AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";

import { CliContext } from "../../cli-context/CliContext.js";

const IMAGE_NAME = "fernenterprise/fern-self-hosted";
const FROM_REGEX = new RegExp(`^(FROM\\s+${IMAGE_NAME.replace("/", "\\/")}):([^\\s]+)(.*)$`, "m");

export async function containerUpgrade({
    cliContext,
    dockerfilePath
}: {
    cliContext: CliContext;
    dockerfilePath: AbsoluteFilePath;
}): Promise<void> {
    if (!(await doesPathExist(dockerfilePath))) {
        cliContext.failAndThrow(
            `No Dockerfile found at ${dockerfilePath}. Use 'fern docs container init' to create one.`
        );
        return;
    }

    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return;
    }

    await cliContext.runTask(async (context) => {
        const content = await readFile(dockerfilePath, "utf-8");

        const match = FROM_REGEX.exec(content);
        if (match == null) {
            return context.failAndThrow(`Could not find a FROM ${IMAGE_NAME}:<tag> line in ${dockerfilePath}`);
        }

        const currentTag = match[2] ?? "unknown";

        context.logger.info("Fetching latest container tag...");

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
        const latestTag = data.tag;

        if (currentTag.trim() === latestTag) {
            context.logger.info(chalk.green(`Already up to date at ${IMAGE_NAME}:${latestTag}`));
            return;
        }

        const updatedContent = content.replace(FROM_REGEX, `$1:${latestTag}$3`);
        await writeFile(dockerfilePath, updatedContent);

        context.logger.info(
            chalk.green(`Updated ${dockerfilePath}: ${IMAGE_NAME}:${currentTag.trim()} → ${IMAGE_NAME}:${latestTag}`)
        );
    });
}
