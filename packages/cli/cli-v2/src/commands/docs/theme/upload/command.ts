import { CliError } from "@fern-api/task-context";
import { execSync } from "child_process";
import { createHash } from "crypto";
import { access, readFile } from "fs/promises";
import yaml from "js-yaml";
import mime from "mime-types";
import path from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { command } from "../../../_internal/command.js";

// FERN_FDR_ORIGIN is checked first because DEFAULT_FDR_ORIGIN is baked into the
// prod bundle at build time and cannot be overridden at runtime.
const FDR_ORIGIN =
    process.env.FERN_FDR_ORIGIN ?? process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";

// ── Network helpers ──────────────────────────────────────────────────────────

/**
 * Node's native `fetch` throws a bare `TypeError("fetch failed")` for network-
 * level errors (DNS, TLS, connection refused, etc.).  The actual root cause is
 * stashed in `error.cause`.  This helper extracts it into a human-readable
 * string so callers can surface an actionable message.
 */
function describeFetchError(error: unknown): string {
    if (!(error instanceof Error)) {
        return String(error);
    }
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
        // e.g. "getaddrinfo ENOTFOUND registry.buildwithfern.com"
        //      "connect ECONNREFUSED 127.0.0.1:443"
        return cause.message;
    }
    return error.message;
}

/**
 * Attempt to extract a human-readable message from a JSON error response body.
 * Returns `undefined` if the body isn't parseable JSON or has no recognisable
 * message field, so the caller can fall back to the raw text.
 */
function parseErrorDetail(body: string): string | undefined {
    try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const message = parsed.message ?? (parsed.error as Record<string, unknown> | undefined)?.message;
        if (typeof message === "string") {
            return message;
        }
    } catch {
        // not JSON
    }
    return undefined;
}

// ── CAS helpers ───────────────────────────────────────────────────────────────

function getGitRoot(): string {
    try {
        return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
    } catch {
        return process.cwd();
    }
}

/** Build a forward-slash bind path regardless of OS. */
function posixBindPath(gitRoot: string, absolutePath: string): string {
    const repoName = path.basename(gitRoot);
    const relative = path.relative(gitRoot, absolutePath);
    return [repoName, ...relative.split(path.sep)].join("/");
}

/**
 * Performs a CAS check + optional S3 upload, then binds the hash to a
 * repo-relative file path in the files table.  Returns the 64-char hex SHA-256 hash.
 */
async function uploadToCas(
    content: Buffer,
    contentType: string,
    bindPath: string,
    orgId: string,
    token: string,
    label: string,
    context: Context
): Promise<string> {
    const hash = createHash("sha256").update(content).digest("hex");

    const casUrl = `${FDR_ORIGIN}/v2/registry/content/${hash}?orgId=${encodeURIComponent(orgId)}`;
    context.stdout.debug(`  CAS check: PUT ${casUrl} (${contentType}, ${content.byteLength} bytes)`);
    let checkRes: Response;
    try {
        checkRes = await fetch(casUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ contentType, contentLength: content.byteLength })
        });
    } catch (err) {
        throw new CliError({
            message: `CAS check for ${label} failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
            code: CliError.Code.NetworkError
        });
    }
    if (!checkRes.ok) {
        const errorBody = await checkRes.text();
        const detail = parseErrorDetail(errorBody) ?? errorBody;
        throw new CliError({
            message: `CAS check failed for ${label}: HTTP ${checkRes.status} — ${detail}`,
            code: CliError.Code.NetworkError
        });
    }
    const checkBody = (await checkRes.json()) as { status: string; uploadUrl?: string };
    context.stdout.debug(`  CAS status for ${label}: ${checkBody.status}`);

    if (checkBody.status === "upload_required" && checkBody.uploadUrl != null) {
        context.stdout.debug(`  Uploading ${label} to S3 (${content.byteLength} bytes)...`);
        let uploadRes: Response;
        try {
            uploadRes = await fetch(checkBody.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": contentType },
                body: new Uint8Array(content.buffer as ArrayBuffer, content.byteOffset, content.byteLength)
            });
        } catch (err) {
            throw new CliError({
                message: `S3 upload for ${label} failed — could not reach upload URL: ${describeFetchError(err)}`,
                code: CliError.Code.NetworkError
            });
        }
        if (!uploadRes.ok) {
            const errorBody = await uploadRes.text().catch(() => "");
            throw new CliError({
                message: `S3 upload failed for ${label}: HTTP ${uploadRes.status}${errorBody ? ` — ${errorBody}` : ""}`,
                code: CliError.Code.NetworkError
            });
        }
    }

    const bindUrl = `${FDR_ORIGIN}/v2/registry/files/${orgId}/${bindPath}`;
    context.stdout.debug(`  Binding ${label} → ${bindPath}`);
    let bindRes: Response;
    try {
        bindRes = await fetch(bindUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ hash, contentType })
        });
    } catch (err) {
        throw new CliError({
            message: `File bind for ${label} failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
            code: CliError.Code.NetworkError
        });
    }
    if (!bindRes.ok) {
        const errorBody = await bindRes.text().catch(() => "");
        throw new CliError({
            message: `File bind failed for ${label}: HTTP ${bindRes.status}${errorBody ? ` — ${errorBody}` : ""}`,
            code: CliError.Code.NetworkError
        });
    }

    return hash;
}

async function uploadFileToCas(
    absolutePath: string,
    orgId: string,
    token: string,
    gitRoot: string,
    context: Context
): Promise<string> {
    try {
        await access(absolutePath);
    } catch {
        throw new CliError({
            message: `Referenced file not found: ${absolutePath}`,
            code: CliError.Code.ConfigError
        });
    }
    const content = await readFile(absolutePath);
    const contentType = (mime.lookup(absolutePath) || "application/octet-stream") as string;
    const bindPath = posixBindPath(gitRoot, absolutePath);
    return uploadToCas(content, contentType, bindPath, orgId, token, path.basename(absolutePath), context);
}

// ── Theme config walking ──────────────────────────────────────────────────────

async function processFileField(
    value: string | undefined,
    themeDir: string,
    orgId: string,
    token: string,
    gitRoot: string,
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
    const hash = await uploadFileToCas(abs, orgId, token, gitRoot, context);
    return { hash };
}

async function processThemeConfig(
    raw: Record<string, unknown>,
    themeDir: string,
    orgId: string,
    token: string,
    gitRoot: string,
    context: Context
): Promise<{ config: Record<string, unknown>; filesUploaded: number }> {
    const cfg: Record<string, unknown> = { ...raw };
    let filesUploaded = 0;

    const field = async (v: string | undefined): Promise<string | { hash: string } | undefined> => {
        const result = await processFileField(v, themeDir, orgId, token, gitRoot, context);
        if (result != null && typeof result === "object") {
            filesUploaded++;
        }
        return result;
    };

    if (cfg.logo != null && typeof cfg.logo === "object") {
        context.stdout.debug("Processing logo...");
        const logo = { ...(cfg.logo as Record<string, unknown>) };
        logo.dark = await field(logo.dark as string | undefined);
        logo.light = await field(logo.light as string | undefined);
        cfg.logo = logo;
    }

    if (cfg.favicon != null) {
        context.stdout.debug("Processing favicon...");
    }
    cfg.favicon = await field(cfg.favicon as string | undefined);

    if (cfg["background-image"] != null && typeof cfg["background-image"] === "object") {
        context.stdout.debug("Processing background-image...");
        const bg = { ...(cfg["background-image"] as Record<string, unknown>) };
        bg.dark = await field(bg.dark as string | undefined);
        bg.light = await field(bg.light as string | undefined);
        cfg["background-image"] = bg;
    }

    if (cfg.typography != null && typeof cfg.typography === "object") {
        context.stdout.debug("Processing typography fonts...");
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
                            return { ...entry, path: await field(p) };
                        })
                    );
                }
                typo[fontKey] = fontObj;
            }
        }
        cfg.typography = typo;
    }

    if (cfg.css != null) {
        const cssList: unknown[] = Array.isArray(cfg.css) ? cfg.css : [cfg.css];
        context.stdout.debug(`Processing ${cssList.length} CSS file(s)...`);
        cfg.css = await Promise.all(cssList.map((item) => (typeof item === "string" ? field(item) : item)));
    }

    if (cfg.js != null) {
        const jsList: unknown[] = Array.isArray(cfg.js) ? cfg.js : [cfg.js];
        context.stdout.debug(`Processing ${jsList.length} JS file(s)...`);
        cfg.js = await Promise.all(
            jsList.map(async (entry) => {
                if (typeof entry === "string") {
                    return field(entry);
                }
                if (entry != null && typeof entry === "object") {
                    const e = { ...(entry as Record<string, unknown>) };
                    if (typeof e.url === "string") {
                        return e;
                    }
                    if (typeof e.path === "string") {
                        e.path = await field(e.path);
                    }
                    return e;
                }
                return entry;
            })
        );
    }

    if (cfg.header != null) {
        context.stdout.debug("Processing header component...");
    }
    cfg.header = await field(cfg.header as string | undefined);

    if (cfg.footer != null) {
        context.stdout.debug("Processing footer component...");
    }
    cfg.footer = await field(cfg.footer as string | undefined);

    if (cfg.metadata != null && typeof cfg.metadata === "object") {
        context.stdout.debug("Processing metadata images...");
        const meta = { ...(cfg.metadata as Record<string, unknown>) };
        for (const imgKey of ["og:image", "twitter:image", "og:background-image", "og:logo"]) {
            if (typeof meta[imgKey] === "string") {
                meta[imgKey] = await field(meta[imgKey] as string);
            }
        }
        cfg.metadata = meta;
    }

    return { config: cfg, filesUploaded };
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
        const orgId = await this.resolveOrg(context, args);
        const gitRoot = getGitRoot();
        const themeDir = args.directory
            ? path.resolve(process.cwd(), args.directory)
            : path.resolve(process.cwd(), "fern/theme");

        const themeYmlPath = path.join(themeDir, "theme.yml");
        let rawYaml: unknown;
        try {
            const content = await readFile(themeYmlPath, "utf-8");
            rawYaml = yaml.load(content, { schema: yaml.JSON_SCHEMA });
        } catch {
            throw new CliError({
                message: `Could not read theme.yml at ${themeYmlPath}`,
                code: CliError.Code.ConfigError
            });
        }
        if (rawYaml == null || typeof rawYaml !== "object") {
            throw new CliError({ message: "theme.yml must be a YAML object", code: CliError.Code.ConfigError });
        }

        context.stdout.info(`Uploading theme "${args.name}" for org "${orgId}"...`);
        context.stdout.debug(`FDR origin: ${FDR_ORIGIN}`);
        context.stdout.debug(`Theme directory: ${themeDir}`);

        const { config: processedConfig, filesUploaded } = await processThemeConfig(
            rawYaml as Record<string, unknown>,
            themeDir,
            orgId,
            token.value,
            gitRoot,
            context
        );

        if (filesUploaded > 0) {
            context.stdout.info(`Uploaded ${filesUploaded} file asset(s) to CAS`);
        }

        const saveUrl = `${FDR_ORIGIN}/v2/registry/themes/${orgId}`;
        context.stdout.debug(`Saving theme to ${saveUrl}`);
        let res: Response;
        try {
            res = await fetch(saveUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.value}` },
                body: JSON.stringify({ name: args.name, config: processedConfig })
            });
        } catch (err) {
            throw new CliError({
                message: `Failed to save theme "${args.name}" — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
                code: CliError.Code.NetworkError
            });
        }
        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            throw new CliError({
                message: `Failed to save theme "${args.name}": HTTP ${res.status} — ${detail}`,
                code: CliError.Code.NetworkError
            });
        }

        context.stdout.info(`✓ Saved theme "${args.name}" for org "${orgId}"`);
    }

    private async resolveOrg(context: Context, args: UploadThemeCommand.Args): Promise<string> {
        if (args.org != null) {
            return args.org;
        }
        const org = await context.loadOrg();
        if (org != null) {
            return org;
        }
        throw new CliError({
            message: "Could not determine organization. Add an 'org' field to fern.yml or run from a Fern workspace.",
            code: CliError.Code.ConfigError
        });
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
