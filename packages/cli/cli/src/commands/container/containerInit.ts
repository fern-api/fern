import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { writeFile } from "fs/promises";

import { CliContext } from "../../cli-context/CliContext.js";

const DOCKERFILE_CONTENT = `FROM fernenterprise/fern-self-hosted:latest

COPY ./fern /fern
`;

export async function containerInit({
    cliContext,
    outputDir
}: {
    cliContext: CliContext;
    outputDir: AbsoluteFilePath;
}): Promise<void> {
    await cliContext.runTask(async (context) => {
        const dockerfilePath = join(outputDir, RelativeFilePath.of("Dockerfile"));

        if (await doesPathExist(dockerfilePath)) {
            return context.failAndThrow(
                `A Dockerfile already exists at ${dockerfilePath}. Use 'fern docs container upgrade' to update the image tag.`
            );
        }

        await writeFile(dockerfilePath, DOCKERFILE_CONTENT);

        context.logger.info(chalk.green(`Created Dockerfile at ${dockerfilePath}\n`));
        context.logger.info("Next steps:");
        context.logger.info(
            `  1. Run ${chalk.cyan("fern docs container login")} to authenticate with the container registry`
        );
        context.logger.info(`  2. Build your container: ${chalk.cyan("docker build -t my-docs .")}`);
        context.logger.info(`  3. Run your container: ${chalk.cyan("docker run -p 3000:3000 my-docs")}\n`);
    });
}
