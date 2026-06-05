import { isURL } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { execSync } from "child_process";
import { createHash } from "crypto";
import { access, readFile } from "fs/promises";
import mime from "mime-types";
import path from "path";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "./themeOrigin.js";

// ─── Theme config type definitions ───────────────────────────────────────────
// These mirror the Zod schemas in @fern-api/configuration (DocsYmlSchemas)
// using the raw YAML kebab-case key format.

export interface ThemeLogoConfig {
    dark?: string;
    light?: string;
    height?: number;
    href?: string;
    "right-text"?: string;
}

export interface ThemeFontPathEntry {
    path?: string;
    weight?: string | number;
    style?: string;
}

export interface ThemeFontConfig {
    name?: string;
    path?: string;
    weight?: string | number;
    style?: string;
    paths?: Array<string | ThemeFontPathEntry>;
    display?: string;
    fallback?: string[];
    "font-variation-settings"?: string;
}

export interface ThemeTypographyConfig {
    bodyFont?: ThemeFontConfig;
    headingsFont?: ThemeFontConfig;
    codeFont?: ThemeFontConfig;
}

export interface ThemeBackgroundImageConfig {
    dark?: string;
    light?: string;
}

export interface ThemeJsFileConfig {
    path: string;
    strategy?: string;
}

export interface ThemeJsRemoteConfig {
    url: string;
    strategy?: string;
}

export type ThemeJsEntry = string | ThemeJsFileConfig | ThemeJsRemoteConfig;

export interface ThemeMetadataConfig {
    "og:site_name"?: string;
    "og:title"?: string;
    "og:description"?: string;
    "og:url"?: string;
    "og:image"?: string;
    "og:image:width"?: number;
    "og:image:height"?: number;
    "og:locale"?: string;
    "og:logo"?: string;
    "twitter:title"?: string;
    "twitter:description"?: string;
    "twitter:handle"?: string;
    "twitter:image"?: string;
    "twitter:site"?: string;
    "twitter:url"?: string;
    "twitter:card"?: string;
    "og:dynamic"?: boolean;
    "og:dynamic:background-image"?: string;
    "og:dynamic:text-color"?: string;
    "og:dynamic:background-color"?: string;
    "og:dynamic:logo-color"?: string;
    "og:dynamic:show-logo"?: boolean;
    "og:dynamic:show-section"?: boolean;
    "og:dynamic:show-description"?: boolean;
    "og:dynamic:show-url"?: boolean;
    "og:dynamic:show-gradient"?: boolean;
    "canonical-host"?: string;
}

/**
 * The raw theme configuration as parsed from theme.yml.
 * Contains the file-bearing fields in their YAML (kebab-case) form.
 * Additional theme-eligible fields (colors, layout, settings, etc.)
 * pass through unchanged via the index signature.
 */
export interface RawThemeConfig {
    logo?: ThemeLogoConfig;
    favicon?: string;
    "background-image"?: string | ThemeBackgroundImageConfig;
    typography?: ThemeTypographyConfig;
    css?: string | string[];
    js?: ThemeJsEntry | ThemeJsEntry[];
    header?: string;
    footer?: string;
    metadata?: ThemeMetadataConfig;
    [key: string]: unknown;
}

/** A file reference after processing — either an unchanged URL or a CAS hash object. */
type FileRef = string | { hash: string } | undefined;

/** Metadata image keys that contain file paths eligible for CAS upload. */
const METADATA_IMAGE_KEYS = ["og:image", "twitter:image", "og:dynamic:background-image", "og:logo"] as const;

/** Font config keys that contain font file definitions. */
const FONT_KEYS = ["bodyFont", "headingsFont", "codeFont"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGitRoot(): string {
    try {
        return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
    } catch {
        return process.cwd();
    }
}

function posixBindPath(gitRoot: string, absolutePath: string): string {
    const repoName = path.basename(gitRoot);
    const relative = path.relative(gitRoot, absolutePath);
    return [repoName, ...relative.split(path.sep)].join("/");
}

function isThemeJsFileConfig(entry: ThemeJsEntry): entry is ThemeJsFileConfig {
    return typeof entry === "object" && "path" in entry;
}

function isThemeJsRemoteConfig(entry: ThemeJsEntry): entry is ThemeJsRemoteConfig {
    return typeof entry === "object" && "url" in entry;
}

function isBackgroundImageObject(value: string | ThemeBackgroundImageConfig): value is ThemeBackgroundImageConfig {
    return typeof value === "object";
}

// ─── Public interface ────────────────────────────────────────────────────────

export interface ProcessedThemeConfig {
    config: Record<string, unknown>;
    filesUploaded: number;
}

export class ThemeConfigProcessor {
    private readonly themeDir: string;
    private readonly orgId: string;
    private readonly token: string;
    private readonly gitRoot: string;
    private readonly context: TaskContext;

    public constructor({
        docsWorkspace,
        orgId,
        token,
        context
    }: {
        docsWorkspace: DocsWorkspace;
        orgId: string;
        token: string;
        context: TaskContext;
    }) {
        this.themeDir = path.join(docsWorkspace.absoluteFilePath, "theme");
        this.orgId = orgId;
        this.token = token;
        this.gitRoot = getGitRoot();
        this.context = context;
    }

    public async process(raw: RawThemeConfig): Promise<ProcessedThemeConfig> {
        await this.validateAllFiles(raw);
        return this.uploadAllFiles(raw);
    }

    private async validateAllFiles(raw: RawThemeConfig): Promise<void> {
        const filePaths = this.collectFilePaths(raw);
        const errors: string[] = [];
        await Promise.all(
            filePaths.map(async (filePath) => {
                const abs = path.resolve(this.themeDir, filePath);
                try {
                    await access(abs);
                } catch {
                    errors.push(`Referenced file not found: ${abs}`);
                }
            })
        );
        if (errors.length > 0) {
            throw new CliError({
                message: `Theme validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
                code: CliError.Code.ConfigError
            });
        }
    }

    public collectFilePaths(raw: RawThemeConfig): string[] {
        const paths: string[] = [];

        const collect = (value: string | undefined): void => {
            if (value != null && !isURL(value)) {
                paths.push(value);
            }
        };

        if (raw.logo != null && typeof raw.logo === "object") {
            collect(raw.logo.dark);
            collect(raw.logo.light);
        }

        collect(raw.favicon);

        const bg = raw["background-image"];
        if (bg != null) {
            if (typeof bg === "string") {
                collect(bg);
            } else if (isBackgroundImageObject(bg)) {
                collect(bg.dark);
                collect(bg.light);
            }
        }

        if (raw.typography != null && typeof raw.typography === "object") {
            for (const fontKey of FONT_KEYS) {
                const font = raw.typography[fontKey];
                if (font != null && Array.isArray(font.paths)) {
                    for (const entry of font.paths) {
                        if (typeof entry === "object") {
                            collect(entry.path);
                        }
                    }
                }
            }
        }

        const cssList = raw.css != null ? (Array.isArray(raw.css) ? raw.css : [raw.css]) : [];
        for (const item of cssList) {
            if (typeof item === "string") {
                collect(item);
            }
        }

        const jsList = raw.js != null ? (Array.isArray(raw.js) ? raw.js : [raw.js]) : [];
        for (const entry of jsList) {
            if (typeof entry === "string") {
                collect(entry);
            } else if (isThemeJsFileConfig(entry)) {
                collect(entry.path);
            }
            // Remote JS entries (with url) are intentionally skipped.
        }

        collect(raw.header);
        collect(raw.footer);

        if (raw.metadata != null && typeof raw.metadata === "object") {
            for (const imgKey of METADATA_IMAGE_KEYS) {
                const value = raw.metadata[imgKey];
                if (typeof value === "string") {
                    collect(value);
                }
            }
        }

        return paths;
    }

    private async uploadAllFiles(raw: RawThemeConfig): Promise<ProcessedThemeConfig> {
        const cfg: Record<string, unknown> = { ...raw };
        let filesUploaded = 0;

        const field = async (value: string | undefined): Promise<FileRef> => {
            if (value == null) {
                return undefined;
            }
            if (isURL(value)) {
                return value;
            }
            const abs = path.resolve(this.themeDir, value);
            this.context.logger.debug(`  Uploading ${value}...`);
            const hash = await this.uploadFileToCas(abs);
            filesUploaded++;
            return { hash };
        };

        if (raw.logo != null && typeof raw.logo === "object") {
            cfg.logo = {
                ...raw.logo,
                dark: await field(raw.logo.dark),
                light: await field(raw.logo.light)
            };
        }

        cfg.favicon = await field(raw.favicon);

        const bg = raw["background-image"];
        if (bg != null) {
            if (typeof bg === "string") {
                cfg["background-image"] = await field(bg);
            } else if (isBackgroundImageObject(bg)) {
                cfg["background-image"] = {
                    ...bg,
                    dark: await field(bg.dark),
                    light: await field(bg.light)
                };
            }
        }

        if (raw.typography != null && typeof raw.typography === "object") {
            const typo = { ...raw.typography };
            for (const fontKey of FONT_KEYS) {
                const font = typo[fontKey];
                if (font != null && Array.isArray(font.paths)) {
                    const processedFont = { ...font };
                    processedFont.paths = await Promise.all(
                        font.paths.map(async (entry) => {
                            if (typeof entry === "object" && entry.path != null) {
                                return { ...entry, path: await field(entry.path) } as unknown as ThemeFontPathEntry;
                            }
                            return entry;
                        })
                    );
                    typo[fontKey] = processedFont;
                }
            }
            cfg.typography = typo;
        }

        if (raw.css != null) {
            const cssList: string[] = Array.isArray(raw.css) ? raw.css : [raw.css];
            cfg.css = await Promise.all(cssList.map((item) => field(item)));
        }

        if (raw.js != null) {
            const jsList: ThemeJsEntry[] = Array.isArray(raw.js) ? raw.js : [raw.js];
            cfg.js = await Promise.all(
                jsList.map(async (entry) => {
                    if (typeof entry === "string") {
                        return field(entry);
                    }
                    if (isThemeJsRemoteConfig(entry)) {
                        return entry;
                    }
                    if (isThemeJsFileConfig(entry)) {
                        return { ...entry, path: await field(entry.path) };
                    }
                    return entry;
                })
            );
        }

        cfg.header = await field(raw.header);
        cfg.footer = await field(raw.footer);

        if (raw.metadata != null && typeof raw.metadata === "object") {
            const meta: Record<string, unknown> = { ...raw.metadata };
            for (const imgKey of METADATA_IMAGE_KEYS) {
                const value = raw.metadata[imgKey];
                if (typeof value === "string") {
                    meta[imgKey] = await field(value);
                }
            }
            cfg.metadata = meta;
        }

        return { config: cfg, filesUploaded };
    }

    private async uploadFileToCas(absolutePath: string): Promise<string> {
        const content = await readFile(absolutePath);
        const contentType = (mime.lookup(absolutePath) || "application/octet-stream") as string;
        const bindPath = posixBindPath(this.gitRoot, absolutePath);
        return this.uploadToCas(content, contentType, bindPath, path.basename(absolutePath));
    }

    private async uploadToCas(content: Buffer, contentType: string, bindPath: string, label: string): Promise<string> {
        const hash = createHash("sha256").update(content).digest("hex");

        const casUrl = `${FDR_ORIGIN}/v2/registry/content/${hash}?orgId=${encodeURIComponent(this.orgId)}`;
        this.context.logger.debug(`  CAS check: PUT ${casUrl} (${contentType}, ${content.byteLength} bytes)`);

        let checkRes: Response;
        try {
            checkRes = await fetch(casUrl, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
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
        this.context.logger.debug(`  CAS status for ${label}: ${checkBody.status}`);

        if (checkBody.status === "upload_required" && checkBody.uploadUrl != null) {
            this.context.logger.debug(`  Uploading ${label} to S3 (${content.byteLength} bytes)...`);
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

        const encodedPath = bindPath.split("/").map(encodeURIComponent).join("/");
        const bindUrl = `${FDR_ORIGIN}/v2/registry/files/${encodeURIComponent(this.orgId)}/${encodedPath}`;
        this.context.logger.debug(`  Binding ${label} → ${bindPath}`);

        let bindRes: Response;
        try {
            bindRes = await fetch(bindUrl, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
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
}
