import { FernToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext";

export async function deleteDocsPreview({
    cliContext,
    previewUrl
}: {
    cliContext: CliContext;
    previewUrl: string;
}): Promise<void> {
    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return;
    }

    await cliContext.runTask(async (context) => {
        context.logger.info(`Deleting preview site: ${previewUrl}`);

        const fdr = createFdrService({ token: token.value });

        const deleteResponse = await fdr.docs.v2.write.deleteDocsSite({
            url: previewUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
        });

        if (deleteResponse.ok) {
            context.logger.info(chalk.green(`Successfully deleted preview site: ${previewUrl}`));
        } else {
            switch (deleteResponse.error.error) {
                case "UnauthorizedError":
                    return context.failAndThrow(
                        "You do not have permissions to delete this preview site. Reach out to support@buildwithfern.com"
                    );
                case "DocsNotFoundError":
                    return context.failAndThrow(`Preview site not found: ${previewUrl}`);
                default:
                    return context.failAndThrow(`Failed to delete preview site: ${previewUrl}`, deleteResponse.error);
            }
        }
    });
}
