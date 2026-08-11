import { getFernDirectory } from "@fern-api/configuration-loader";
import { bundleMdxComponents } from "@fern-api/docs-resolver";
import { resolveBuf, resolveProtocGenOpenAPI } from "@fern-api/lazy-fern-workspace";
import { CliError, TaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext.js";

export async function installDependencies({ cliContext }: { cliContext: CliContext }): Promise<void> {
    await cliContext.runTask(async (context) => {
        context.logger.info("Installing dependencies...");

        const results: { name: string; success: boolean; path?: string }[] = [];

        // Install buf
        context.logger.info("Resolving buf...");
        const bufPath = await resolveBuf(context.logger);
        if (bufPath != null) {
            results.push({ name: "buf", success: true, path: bufPath });
            context.logger.info(`buf installed: ${bufPath}`);
        } else {
            results.push({ name: "buf", success: false });
            context.logger.error("Failed to install buf");
        }

        // Install protoc-gen-openapi
        context.logger.info("Resolving protoc-gen-openapi...");
        const protocGenOpenAPIDir = await resolveProtocGenOpenAPI(context.logger);
        if (protocGenOpenAPIDir != null) {
            results.push({ name: "protoc-gen-openapi", success: true, path: protocGenOpenAPIDir });
            context.logger.info(`protoc-gen-openapi installed: ${protocGenOpenAPIDir}`);
        } else {
            results.push({ name: "protoc-gen-openapi", success: false });
            context.logger.error("Failed to install protoc-gen-openapi");
        }

        // Pre-bundle custom MDX components so `fern generate` doesn't need network for them
        results.push({ name: "mdx-components", success: await bundleDocsMdxComponents(context) });

        // Summary
        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
            context.failAndThrow(
                `Failed to install: ${failed.map((r) => r.name).join(", ")}. Check network connectivity and try again.`,
                undefined,
                { code: CliError.Code.EnvironmentError }
            );
        }

        context.logger.info("All dependencies installed successfully.");
    });
}

/**
 * Bundles the docs project's custom MDX components, if any. This is a no-op
 * unless the project has `experimental.mdx-components` whose files import
 * third-party libraries.
 */
async function bundleDocsMdxComponents(context: TaskContext): Promise<boolean> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return true;
    }

    let mdxComponents: string[] | undefined;
    try {
        const docsWorkspace = await loadDocsWorkspace({ fernDirectory, context });
        mdxComponents = docsWorkspace?.config.experimental?.mdxComponents;
    } catch (error) {
        // An unparseable docs config is not this command's concern; `fern generate` reports it.
        context.logger.debug(
            `Skipping custom MDX component bundling, failed to load the docs config: ${error instanceof Error ? error.message : error}`
        );
        return true;
    }

    if (mdxComponents == null || mdxComponents.length === 0) {
        return true;
    }

    context.logger.info("Bundling custom MDX components...");
    try {
        const count = await bundleMdxComponents({
            absolutePathToDocsWorkspace: fernDirectory,
            mdxComponents,
            context
        });
        context.logger.info(`Bundled ${count} custom MDX component(s)`);
        return true;
    } catch (error) {
        context.logger.error(
            `Failed to bundle custom MDX components: ${error instanceof Error ? error.message : error}`
        );
        return false;
    }
}
