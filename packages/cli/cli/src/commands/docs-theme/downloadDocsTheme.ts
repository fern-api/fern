import { resolveThemeFileUrls } from "@fern-api/docs-resolver";
import { CliError, TaskContext } from "@fern-api/task-context";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "./themeOrigin.js";

/**
 * Downloads a named org-level theme from Fern's cloud into a local theme
 * directory (theme.yml + referenced assets) — the inverse of `theme upload`.
 * The resulting directory is what `theme upload` reads, so it can be committed
 * or vendored into a self-hosted image to resolve `global-theme` offline.
 */
export async function downloadDocsTheme({
    cliContext,
    name,
    org,
    output
}: {
    cliContext: CliContext;
    name: string;
    org?: string;
    output?: string;
}): Promise<void> {
    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    const orgId = org ?? project.config.organization;
    const outDir = path.resolve(
        output ??
            (project.docsWorkspaces != null
                ? path.join(project.docsWorkspaces.absoluteFilePath, "theme")
                : path.join(process.cwd(), "fern", "theme"))
    );

    await cliContext.runTask(async (context) => {
        const config = await fetchThemeConfig({ context, orgId, name });

        await mkdir(outDir, { recursive: true });
        context.logger.info(`Downloading theme "${name}" for org "${orgId}" to ${outDir}...`);

        const resolved = await resolveThemeFileUrls(config, outDir).catch((err: unknown) =>
            context.failAndThrow(
                `Failed to download assets for theme "${name}": ${describeFetchError(err)}`,
                undefined,
                { code: CliError.Code.NetworkError }
            )
        );

        const themeYml = relativizeAssetPaths(resolved, outDir);
        await writeFile(path.join(outDir, "theme.yml"), yaml.dump(themeYml), "utf-8");
        context.logger.info(`Theme "${name}" downloaded to ${outDir}/theme.yml`);
    });
}

async function fetchThemeConfig({
    context,
    orgId,
    name
}: {
    context: TaskContext;
    orgId: string;
    name: string;
}): Promise<Record<string, unknown>> {
    const url = `${FDR_ORIGIN}/v2/registry/themes/${encodeURIComponent(orgId)}/${encodeURIComponent(name)}`;
    context.logger.debug(`Fetching theme from ${url}`);

    let res: Response;
    try {
        res = await fetch(url, { headers: { Accept: "application/json", "Accept-Encoding": "identity" } });
    } catch (err) {
        return context.failAndThrow(
            `Failed to fetch theme "${name}" — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }

    if (!res.ok) {
        const body = await res.text();
        const detail = parseErrorDetail(body) ?? body;
        return context.failAndThrow(`Failed to fetch theme "${name}": HTTP ${res.status} — ${detail}`, undefined, {
            code: CliError.Code.NetworkError
        });
    }

    const body: unknown = await res.json();
    if (!isThemeResponse(body)) {
        return context.failAndThrow(`Failed to fetch theme "${name}": response missing "config" object`, undefined, {
            code: CliError.Code.NetworkError
        });
    }
    return body.config;
}

export function isThemeResponse(value: unknown): value is { config: Record<string, unknown> } {
    if (value == null || typeof value !== "object" || !("config" in value)) {
        return false;
    }
    const config = (value as { config: unknown }).config;
    return config != null && typeof config === "object" && !Array.isArray(config);
}

/**
 * resolveThemeFileUrls writes assets into outDir and leaves absolute paths in
 * the config; rewrite them relative to theme.yml so the directory is portable.
 */
export function relativizeAssetPaths(value: unknown, outDir: string): unknown {
    if (typeof value === "string") {
        if (!path.isAbsolute(value)) {
            return value;
        }
        const rel = path.relative(outDir, value);
        if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
            return value;
        }
        return rel.split(path.sep).join("/");
    }
    if (Array.isArray(value)) {
        return value.map((item) => relativizeAssetPaths(item, outDir));
    }
    if (value != null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, relativizeAssetPaths(v, outDir)])
        );
    }
    return value;
}
