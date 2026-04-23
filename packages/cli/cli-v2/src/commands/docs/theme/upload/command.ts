import type { FernToken } from "@fern-api/auth";
import { createVenusService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";

import { createHash } from "crypto";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import mime from "mime-types";
import path from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { command } from "../../../_internal/command.js";

const FDR_ORIGIN = "http://localhost:8080";
const VENUS_ORIGIN = "http://localhost:8089";

// ── CAS helpers ───────────────────────────────────────────────────────────────

/**
 * Performs a CAS check + optional S3 upload, then binds the hash as the file
 * path in the files table.  Returns the 64-char hex SHA-256 hash.
 */
async function uploadToCas(
    content: Buffer,
    contentType: string,
    orgId: string,
    token: string,
    label: string
): Promise<string> {
    const hash = createHash("sha256").update(content).digest("hex");

    const casUrl = `${FDR_ORIGIN}/v2/registry/content/${hash}?orgId=${encodeURIComponent(orgId)}`;
    const checkRes = await fetch(casUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contentType, contentLength: content.byteLength })
    });
    if (!checkRes.ok) {
        const errorBody = await checkRes.text();
        throw new CliError({
            message: `CAS check failed for ${label}: HTTP ${checkRes.status} — ${errorBody}`,
            code: CliError.Code.NetworkError
        });
    }
    const checkBody = (await checkRes.json()) as { status: string; uploadUrl?: string };
    if (checkBody.status === "upload_required" && checkBody.uploadUrl != null) {
        const uploadRes = await fetch(checkBody.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": contentType },
            body: new Uint8Array(content.buffer as ArrayBuffer, content.byteOffset, content.byteLength)
        });
        if (!uploadRes.ok) {
            throw new CliError({
                message: `S3 upload failed for ${label}: HTTP ${uploadRes.status}`,
                code: CliError.Code.NetworkError
            });
        }
    }

    const bindRes = await fetch(`${FDR_ORIGIN}/v2/registry/files/${orgId}/${hash}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hash, contentType })
    });
    if (!bindRes.ok) {
        throw new CliError({
            message: `File bind failed for ${label}: HTTP ${bindRes.status}`,
            code: CliError.Code.NetworkError
        });
    }

    return hash;
}

async function uploadFileToCas(absolutePath: string, orgId: string, token: string): Promise<string> {
    const content = await readFile(absolutePath);
    const contentType = (mime.lookup(absolutePath) || "application/octet-stream") as string;
    return uploadToCas(content, contentType, orgId, token, path.basename(absolutePath));
}

// ── Theme config walking ──────────────────────────────────────────────────────

async function processFileField(
    value: string | undefined,
    themeDir: string,
    orgId: string,
    token: string,
    context: Context
): Promise<string | { hash: string } | undefined> {
    if (value == null) {
        return undefined;
    }
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }
    const abs = path.resolve(themeDir, value);
    context.stdout.debug(`  Uploading ${value}...`);
    const hash = await uploadFileToCas(abs, orgId, token);
    return { hash };
}

async function processThemeConfig(
    raw: Record<string, unknown>,
    themeDir: string,
    orgId: string,
    token: string,
    context: Context
): Promise<Record<string, unknown>> {
    const cfg: Record<string, unknown> = { ...raw };

    if (cfg.logo != null && typeof cfg.logo === "object") {
        const logo = { ...(cfg.logo as Record<string, unknown>) };
        logo.dark = await processFileField(logo.dark as string | undefined, themeDir, orgId, token, context);
        logo.light = await processFileField(logo.light as string | undefined, themeDir, orgId, token, context);
        cfg.logo = logo;
    }

    cfg.favicon = await processFileField(cfg.favicon as string | undefined, themeDir, orgId, token, context);

    if (cfg["background-image"] != null && typeof cfg["background-image"] === "object") {
        const bg = { ...(cfg["background-image"] as Record<string, unknown>) };
        bg.dark = await processFileField(bg.dark as string | undefined, themeDir, orgId, token, context);
        bg.light = await processFileField(bg.light as string | undefined, themeDir, orgId, token, context);
        cfg["background-image"] = bg;
    }

    if (cfg.typography != null && typeof cfg.typography === "object") {
        const typo = { ...(cfg.typography as Record<string, unknown>) };
        for (const fontKey of ["bodyFont", "headingsFont", "codeFont"]) {
            const font = typo[fontKey];
            if (font != null && typeof font === "object") {
                const fontObj = { ...(font as Record<string, unknown>) };
                if (Array.isArray(fontObj.paths)) {
                    fontObj.paths = await Promise.all(
                        (fontObj.paths as Array<Record<string, unknown>>).map(async (entry) => {
                            const p = entry.path as string | undefined;
                            if (p == null) {
                                return entry;
                            }
                            const uploaded = await processFileField(p, themeDir, orgId, token, context);
                            return { ...entry, path: uploaded };
                        })
                    );
                }
                typo[fontKey] = fontObj;
            }
        }
        cfg.typography = typo;
    }

    if (typeof cfg.css === "string") {
        cfg.css = await processFileField(cfg.css, themeDir, orgId, token, context);
    } else if (Array.isArray(cfg.css)) {
        cfg.css = await Promise.all(
            (cfg.css as unknown[]).map((item) => {
                if (typeof item === "string") {
                    return processFileField(item, themeDir, orgId, token, context);
                }
                return item;
            })
        );
    }

    const rawJs = cfg.js;
    const jsList: unknown[] = Array.isArray(rawJs) ? rawJs : rawJs != null ? [rawJs] : [];
    cfg.js = await Promise.all(
        jsList.map(async (entry) => {
            if (typeof entry === "string") {
                return processFileField(entry, themeDir, orgId, token, context);
            }
            if (entry != null && typeof entry === "object") {
                const e = { ...(entry as Record<string, unknown>) };
                if (typeof e.url === "string") {
                    return e;
                }
                if (typeof e.path === "string") {
                    e.path = await processFileField(e.path, themeDir, orgId, token, context);
                }
                return e;
            }
            return entry;
        })
    );

    cfg.header = await processFileField(cfg.header as string | undefined, themeDir, orgId, token, context);
    cfg.footer = await processFileField(cfg.footer as string | undefined, themeDir, orgId, token, context);

    return cfg;
}

// ── Command ───────────────────────────────────────────────────────────────────

export declare namespace UploadThemeCommand {
    export interface Args extends GlobalArgs {
        name: string;
        directory?: string;
        org?: string;
    }
}

export class UploadThemeCommand {
    public async handle(context: Context, args: UploadThemeCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();
        const orgId = await this.resolveOrg(context, args, token);
        const themeDir = args.directory
            ? path.resolve(process.cwd(), args.directory)
            : path.resolve(process.cwd(), "fern/theme");

        const themeYmlPath = path.join(themeDir, "theme.yml");
        let rawYaml: unknown;
        try {
            const content = await readFile(themeYmlPath, "utf-8");
            rawYaml = yaml.load(content);
        } catch {
            throw new CliError({
                message: `Could not read theme.yml at ${themeYmlPath}`,
                code: CliError.Code.ConfigError
            });
        }
        if (rawYaml == null || typeof rawYaml !== "object") {
            throw new CliError({ message: "theme.yml must be a YAML object", code: CliError.Code.ConfigError });
        }

        context.stderr.info(
            `[debug] FDR_ORIGIN = ${FDR_ORIGIN} (DEFAULT_FDR_ORIGIN env = ${process.env["DEFAULT_FDR_ORIGIN"] ?? "(not set)"})`
        );
        context.stdout.info(`Uploading theme "${args.name}" for org "${orgId}"...`);

        const processedConfig = await processThemeConfig(
            rawYaml as Record<string, unknown>,
            themeDir,
            orgId,
            token.value,
            context
        );

        const configBuffer = Buffer.from(JSON.stringify(processedConfig));
        context.stdout.debug(`  Uploading processed config...`);
        await uploadToCas(configBuffer, "application/json", orgId, token.value, "theme config");

        const themeUrl = `${FDR_ORIGIN}/v2/registry/themes/${orgId}`;
        context.stderr.info(`[debug] POST ${themeUrl}`);
        const res = await fetch(themeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.value}` },
            body: JSON.stringify({ name: args.name, config: processedConfig })
        });
        if (!res.ok) {
            const body = await res.text();
            context.stderr.info(`[debug] Response headers: ${JSON.stringify(Object.fromEntries(res.headers))}`);
            throw new CliError({
                message: `Failed to save theme: HTTP ${res.status} — ${body}`,
                code: CliError.Code.NetworkError
            });
        }

        context.stdout.info(`✓ Saved theme "${args.name}" for org "${orgId}"`);
    }

    private async resolveOrg(context: Context, args: UploadThemeCommand.Args, token: FernToken): Promise<string> {
        if (args.org != null) {
            return args.org;
        }

        const workspace = await context.loadWorkspace();
        if (workspace != null && workspace.success) {
            return workspace.workspace.org;
        }

        return this.resolveOrgFromToken(token);
    }

    private async resolveOrgFromToken(token: FernToken): Promise<string> {
        const venus = createVenusService({ token: token.value, environment: VENUS_ORIGIN });

        if (token.type === "organization") {
            const response = await venus.organization.getMyOrganizationFromScopedToken();
            if (response.ok) {
                return response.body.organizationId;
            }
            // Org-scoped call failed (e.g. local dev token against prod Venus).
            // Fall through to the user-token path as a best-effort fallback.
        }

        const response = await venus.user.getMyOrganizations({ pageId: 1 });
        process.stderr.write(`[debug] getMyOrganizations response: ${JSON.stringify(response)}\n`);
        if (!response.ok) {
            throw new CliError({
                message: "Failed to fetch your organizations. Use --org <id> to specify it explicitly.",
                code: CliError.Code.AuthError
            });
        }

        const orgs = response.body.organizations;
        if (orgs.length === 0) {
            throw new CliError({
                message: "You are not a member of any organizations. Use --org <id> to specify one.",
                code: CliError.Code.ConfigError
            });
        }
        if (orgs.length > 1) {
            throw new CliError({
                message: `You belong to multiple organizations (${orgs.join(", ")}). Use --org <id> to specify which one to use.`,
                code: CliError.Code.ConfigError
            });
        }

        return String(orgs[0]);
    }
}

export function addUploadThemeCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new UploadThemeCommand();
    command(
        cli,
        "upload",
        "Upload a theme to Fern's cloud (creates or updates)",
        (context, args) => cmd.handle(context, args as UploadThemeCommand.Args),
        (yargs) =>
            yargs
                .option("name", {
                    alias: "n",
                    type: "string",
                    description: 'Theme name (default: "default")',
                    default: "default"
                })
                .option("directory", {
                    alias: "d",
                    type: "string",
                    description: "Path to the theme directory containing theme.yml (default: ./fern/theme)"
                })
                .option("org", {
                    type: "string",
                    description: "Override the org ID from fern.config.json"
                })
                .example("$0 docs theme upload", 'Upload theme from ./fern/theme as "default"')
                .example("$0 docs theme upload --name dark", "Upload a named theme variant")
                .example("$0 docs theme upload --directory ./my-theme --name custom", "Upload from a custom directory")
    );
}
