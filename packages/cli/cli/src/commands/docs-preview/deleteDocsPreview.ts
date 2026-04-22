import { FernToken } from "@fern-api/auth";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { createFdrService } from "@fern-api/core";
import { buildPreviewDomain, isPreviewUrl } from "@fern-api/docs-preview";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";

async function resolvePreviewUrlFromId({
    cliContext,
    previewId
}: {
    cliContext: CliContext;
    previewId: string;
}): Promise<string> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(
            "No fern directory found. The --id flag requires a Fern project to resolve the organization.\n" +
                "Run this command from within a Fern project directory, or use the URL argument instead."
        );
    }

    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );

    return buildPreviewDomain({ orgId: projectConfig.organization, previewId });
}

function resolveTarget({
    target,
    url,
    id
}: {
    target?: string;
    url?: string;
    id?: string;
}): { type: "url"; value: string } | { type: "id"; value: string } {
    if (url != null) {
        return { type: "url", value: url };
    }
    if (id != null) {
        return { type: "id", value: id };
    }
    if (target == null) {
        throw new CliError({
            message: "Must provide a preview URL or --id.",
            code: CliError.Code.ConfigError
        });
    }
    if (isPreviewUrl(target)) {
        return { type: "url", value: target };
    }
    return { type: "id", value: target };
}

export async function deleteDocsPreview({
    cliContext,
    target,
    previewUrl,
    previewId
}: {
    cliContext: CliContext;
    target: string | undefined;
    previewUrl: string | undefined;
    previewId: string | undefined;
}): Promise<void> {
    const resolved = resolveTarget({ target, url: previewUrl, id: previewId });

    let resolvedUrl: string;

    if (resolved.type === "id") {
        resolvedUrl = await resolvePreviewUrlFromId({ cliContext, previewId: resolved.value });
        cliContext.logger.debug(`Resolved preview ID "${resolved.value}" to URL: ${resolvedUrl}`);
    } else {
        resolvedUrl = resolved.value;
    }

    // Validate that the URL is a preview URL before proceeding
    if (!isPreviewUrl(resolvedUrl)) {
        cliContext.failAndThrow(
            `Invalid preview URL: ${resolvedUrl}\n` +
                "Only preview sites can be deleted with this command.\n" +
                "Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com\n" +
                "Example: acme-preview-abc123.docs.buildwithfern.com",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
        return;
    }

    await cliContext.runTask(async (context) => {
        context.logger.info(`Deleting preview site: ${resolvedUrl}`);

        const fdr = createFdrService({ token: token.value });

        try {
            await fdr.docs.v2.write.deleteDocsSite({
                url: resolvedUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
            });
            context.logger.info(chalk.green(`Successfully deleted preview site: ${resolvedUrl}`));
        } catch (error) {
            const errorObj = error as Record<string, unknown>;
            const errorType = errorObj?.error as string | undefined;
            switch (errorType) {
                case "UnauthorizedError":
                    return context.failAndThrow(
                        "You do not have permissions to delete this preview site. Reach out to support@buildwithfern.com",
                        undefined,
                        { code: CliError.Code.NetworkError }
                    );
                case "DocsNotFoundError":
                    return context.failAndThrow(`Preview site not found: ${resolvedUrl}`, undefined, {
                        code: CliError.Code.ConfigError
                    });
                default:
                    return context.failAndThrow(`Failed to delete preview site: ${resolvedUrl}`, error, {
                        code: CliError.Code.NetworkError
                    });
            }
        }
    });
}
