import { FernToken } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { CompiledGlobalTheme, compileGlobalTheme } from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { ThemeConfigProcessor } from "./ThemeConfigProcessor.js";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "./themeOrigin.js";

export async function uploadDocsTheme({
    cliContext,
    name,
    org
}: {
    cliContext: CliContext;
    name: string;
    org?: string;
}): Promise<void> {
    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
        return;
    }

    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow(
            "No docs.yml found. Run this command from a directory containing a fern/ workspace.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    const orgId = org ?? project.config.organization;
    const themeDirectory = AbsoluteFilePath.of(path.join(docsWorkspace.absoluteFilePath, "theme"));
    const themeYmlPath = path.join(themeDirectory, "theme.yml");

    await cliContext.runTask(async (context) => {
        let rawYaml: unknown;
        try {
            const content = await readFile(themeYmlPath, "utf-8");
            rawYaml = yaml.load(content, { schema: yaml.JSON_SCHEMA });
        } catch {
            context.failAndThrow(
                `Could not read theme.yml at ${themeYmlPath}. Run 'fern docs theme export' first.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
            return;
        }

        if (rawYaml == null || typeof rawYaml !== "object") {
            context.failAndThrow("theme.yml must be a YAML object.", undefined, {
                code: CliError.Code.ConfigError
            });
            return;
        }

        context.logger.info(`Uploading theme "${name}" for org "${orgId}"...`);
        context.logger.debug(`FDR origin: ${FDR_ORIGIN}`);

        const rawTheme = rawYaml as Record<string, unknown>;
        const processor = new ThemeConfigProcessor({ docsWorkspace, orgId, token: token.value, context });
        const { config: processedConfig, filesUploaded } = await processor.process(rawTheme);

        if (filesUploaded > 0) {
            context.logger.info(`Uploaded ${filesUploaded} file asset(s) to CAS`);
        }

        // FDR merges this ledger-shaped fragment into every site that publishes
        // with `global-theme: <name>`, and re-merges them when it changes.
        // Without it, publishes fall back to stitching the theme locally.
        let compiled: CompiledGlobalTheme | undefined;
        try {
            compiled = await compileGlobalTheme({
                rawTheme,
                themeDirectory,
                taskContext: context,
                cliVersion: cliContext.environment.packageVersion
            });
            await processor.uploadFiles(compiled.files.values());
        } catch (err) {
            compiled = undefined;
            context.logger.warn(
                `Could not compile theme for server-side merging; sites using it will stitch it at publish instead: ${
                    err instanceof Error ? err.message : String(err)
                }`
            );
        }

        const saveUrl = `${FDR_ORIGIN}/v2/registry/themes/${orgId}`;
        context.logger.debug(`Saving theme to ${saveUrl}`);

        let res: Response;
        try {
            res = await fetch(saveUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.value}` },
                body: JSON.stringify({
                    name,
                    config: processedConfig,
                    ...(compiled != null && {
                        compiled: { config: compiled.config, fileManifest: compiled.fileManifest }
                    })
                })
            });
        } catch (err) {
            context.failAndThrow(
                `Failed to save theme "${name}" — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
            return;
        }

        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            context.failAndThrow(`Failed to save theme "${name}": HTTP ${res.status} — ${detail}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        context.logger.info(`Theme "${name}" saved for org "${orgId}"`);
    });
}
