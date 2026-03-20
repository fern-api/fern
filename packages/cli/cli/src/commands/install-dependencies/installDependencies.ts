import { resolveBuf, resolveProtocGenOpenAPI } from "@fern-api/lazy-fern-workspace";
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

        // Summary
        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
            context.failAndThrow(
                `Failed to install: ${failed.map((r) => r.name).join(", ")}. Check network connectivity and try again.`
            );
        }

        context.logger.info("All dependencies installed successfully.");
    });
}
