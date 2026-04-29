import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";

import { writeFile } from "fs/promises";
import mime from "mime-types";
import path from "path";
import tmp from "tmp-promise";

type RawDocsConfig = docsYml.RawSchemas.DocsConfiguration;

// Theme-eligible fields that can contain local file paths (strings that become
// { hash } sentinels on upload and presigned S3 URLs on GET from FDR).
// Presigned S3 URLs are identified by the presence of "X-Amz-" in the query string.
function isPresignedUrl(value: string): boolean {
    return (value.startsWith("http://") || value.startsWith("https://")) && value.includes("X-Amz-");
}

function isRemoteUrl(value: string): boolean {
    return value.startsWith("http://") || value.startsWith("https://");
}

function parseFilenameFromDisposition(value: string | null): string | undefined {
    if (value == null) {
        return undefined;
    }
    // e.g. attachment; filename="NVIDIA_symbol.svg"
    const match = value.match(/filename\*?=(?:"([^"]+)"|([^;]+))/i);
    const name = match?.[1] ?? match?.[2]?.trim();
    // Only return the name if it carries a recognisable extension — a bare hash
    // (no dot) isn't useful as a filename.
    return name != null && path.extname(name) !== "" ? name : undefined;
}

function filenameFromUrl(url: string): string | undefined {
    try {
        // S3 presigned URLs encode the intended filename in the
        // `response-content-disposition` query param, e.g.:
        //   response-content-disposition=attachment%3B%20filename%3D%22NVIDIA_symbol.svg%22
        const params = new URL(url).searchParams;
        const rcd = params.get("response-content-disposition");
        return parseFilenameFromDisposition(rcd);
    } catch {
        return undefined;
    }
}

async function downloadToTemp(url: string, tmpDir: string, index: number): Promise<string> {
    // Check the URL itself first — S3 presigned URLs embed the intended filename
    // in `response-content-disposition` before we even make the request.
    const urlFilename = filenameFromUrl(url);

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to download theme asset: ${res.status} ${url}`);
    }

    // Determine the best filename. Priority:
    //   1. filename from the URL's response-content-disposition query param
    //   2. filename from the Content-Disposition response header (with extension)
    //   3. extension from Content-Type + generic theme_asset_N base name
    //   4. extension from the URL pathname (last resort — CAS paths are bare hashes)
    const cdFilename = parseFilenameFromDisposition(res.headers.get("content-disposition"));
    const filename =
        urlFilename ??
        cdFilename ??
        (() => {
            const ext =
                (() => {
                    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim();
                    if (contentType) {
                        const mapped = mime.extension(contentType);
                        if (mapped) {
                            return `.${mapped}`;
                        }
                    }
                    return "";
                })() ||
                (() => {
                    try {
                        const pathname = new URL(url).pathname;
                        const dot = pathname.lastIndexOf(".");
                        return dot >= 0 ? pathname.slice(dot) : "";
                    } catch {
                        return "";
                    }
                })();
            return `theme_asset_${index}${ext}`;
        })();

    const dest = path.join(tmpDir, filename);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    return dest;
}

async function resolveThemeFileUrls(
    themeConfig: Record<string, unknown>,
    tmpDir: string
): Promise<Record<string, unknown>> {
    let idx = 0;
    // Deep clone so we don't mutate the fetched object
    const cfg: Record<string, unknown> = JSON.parse(JSON.stringify(themeConfig));

    async function maybeDownload(val: unknown): Promise<unknown> {
        if (typeof val === "string" && isPresignedUrl(val)) {
            return downloadToTemp(val, tmpDir, idx++);
        }
        return val;
    }

    // logo
    if (cfg.logo != null && typeof cfg.logo === "object") {
        const logo = cfg.logo as Record<string, unknown>;
        logo.dark = await maybeDownload(logo.dark);
        logo.light = await maybeDownload(logo.light);
    }

    // favicon
    cfg.favicon = await maybeDownload(cfg.favicon);

    // background-image
    if (cfg["background-image"] != null && typeof cfg["background-image"] === "object") {
        const bg = cfg["background-image"] as Record<string, unknown>;
        bg.dark = await maybeDownload(bg.dark);
        bg.light = await maybeDownload(bg.light);
    }

    // typography fonts
    if (cfg.typography != null && typeof cfg.typography === "object") {
        const typo = cfg.typography as Record<string, unknown>;
        for (const fontKey of ["bodyFont", "headingsFont", "codeFont"]) {
            const font = typo[fontKey];
            if (font != null && typeof font === "object") {
                const fontObj = font as Record<string, unknown>;
                if (Array.isArray(fontObj.paths)) {
                    for (const entry of fontObj.paths) {
                        if (entry != null && typeof entry === "object") {
                            const e = entry as Record<string, unknown>;
                            e.path = await maybeDownload(e.path);
                        }
                    }
                }
            }
        }
    }

    // css — string or array of strings; only download presigned ones, leave remote URLs as-is
    if (typeof cfg.css === "string") {
        cfg.css = isPresignedUrl(cfg.css) ? await downloadToTemp(cfg.css, tmpDir, idx++) : cfg.css;
    } else if (Array.isArray(cfg.css)) {
        cfg.css = await Promise.all(
            (cfg.css as unknown[]).map(async (item) => {
                if (typeof item === "string" && isPresignedUrl(item)) {
                    return downloadToTemp(item, tmpDir, idx++);
                }
                return item;
            })
        );
    }

    // js — remote entries (url field) stay as-is; local entries (path field or plain string) get downloaded
    const rawJs = cfg.js;
    const jsList: unknown[] = Array.isArray(rawJs) ? rawJs : rawJs != null ? [rawJs] : [];
    cfg.js = await Promise.all(
        jsList.map(async (entry) => {
            if (entry == null || typeof entry !== "object") {
                return entry;
            }
            const e = entry as Record<string, unknown>;
            // { url: "..." } → remote, leave alone
            if (typeof e.url === "string" && isRemoteUrl(e.url)) {
                return e;
            }
            // { path: "..." } → local file, may have been uploaded
            if (typeof e.path === "string" && isPresignedUrl(e.path)) {
                return { ...e, path: await downloadToTemp(e.path, tmpDir, idx++) };
            }
            return e;
        })
    );

    // header / footer (compiled component files)
    cfg.header = await maybeDownload(cfg.header);
    cfg.footer = await maybeDownload(cfg.footer);

    // metadata image fields
    if (cfg.metadata != null && typeof cfg.metadata === "object") {
        const meta = cfg.metadata as Record<string, unknown>;
        for (const imgKey of ["og:image", "twitter:image", "og:dynamic:background-image", "og:logo"]) {
            meta[imgKey] = await maybeDownload(meta[imgKey]);
        }
    }

    return cfg;
}

// "global" — the theme value always wins; local docs.yml cannot override it.
// "local"  — the local docs.yml value wins when present; theme is the fallback.
type ThemeFieldPolicy = "global" | "local";

// Controls, per eligible key, whether the global theme takes precedence or the
// local docs.yml can override. Add new theme-eligible keys here.
// Keys use the camelCase form that DocsConfiguration uses internally.
const THEME_FIELD_POLICIES: Readonly<Record<string, ThemeFieldPolicy>> = {
    logo: "global",
    favicon: "global",
    backgroundImage: "global",
    colors: "global",
    typography: "global",
    layout: "global",
    settings: "global",
    theme: "global",
    integrations: "global",
    css: "global",
    js: "global",
    header: "global",
    footer: "global",
    navbarLinks: "global",
    footerLinks: "global",
    aiSearch: "global",
    announcement: "global",
    metadata: "global"
};

const THEME_ELIGIBLE_KEYS = Object.keys(THEME_FIELD_POLICIES) as ReadonlyArray<keyof RawDocsConfig>;

function kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// Recursively convert kebab-case object keys to camelCase. The theme config
// from FDR uses kebab-case at every nesting level, but DocsConfiguration
// (the Fern SDK parsed type) expects camelCase throughout.
function deepNormalizeKeys(value: unknown): unknown {
    if (value == null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(deepNormalizeKeys);
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const camel = kebabToCamel(k);
        out[camel] = deepNormalizeKeys(v);
    }
    return out;
}

// Normalise the theme config (which arrives with kebab-case keys from FDR)
// into the camelCase shape expected by DocsConfiguration.
function normalizeThemeKeys(raw: Record<string, unknown>): Record<string, unknown> {
    return deepNormalizeKeys(raw) as Record<string, unknown>;
}

function mergeThemeOverride(local: RawDocsConfig, themeOverride: Record<string, unknown>): RawDocsConfig {
    const normalized = normalizeThemeKeys(themeOverride);
    const localRecord = local as unknown as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...localRecord };
    for (const key of THEME_ELIGIBLE_KEYS) {
        const themeValue = normalized[key];
        const localValue = localRecord[key];
        const policy = THEME_FIELD_POLICIES[key] ?? "global";

        const themeHasValue = themeValue !== undefined && themeValue !== null;
        const localHasValue = localValue !== undefined && localValue !== null;

        if (policy === "global") {
            // Theme wins when present, otherwise keep the local value.
            if (themeHasValue) {
                merged[key] = themeValue;
            }
        } else {
            // "local" — local wins when present, otherwise fall back to theme
            if (localHasValue) {
                merged[key] = localValue;
            } else if (themeHasValue) {
                merged[key] = themeValue;
            }
        }
    }
    return merged as unknown as RawDocsConfig;
}

interface StitchGlobalThemeArgs {
    docsWorkspace: DocsWorkspace;
    organization: string;
    fdrOrigin: string;
    token: string;
    taskContext: TaskContext;
}

/**
 * If the docs.yml declares `global-theme: <name>`, fetches that named theme from
 * FDR, downloads any file assets to a temp directory, and returns a new DocsWorkspace
 * whose raw config has the theme values merged in (theme wins for branding fields).
 *
 * The temp directory is cleaned up on process exit.
 * If no global-theme is declared, returns the workspace unchanged.
 */
export async function stitchGlobalTheme({
    docsWorkspace,
    organization,
    fdrOrigin,
    token,
    taskContext
}: StitchGlobalThemeArgs): Promise<DocsWorkspace> {
    const themeName = docsWorkspace.config.globalTheme;
    if (themeName == null) {
        return docsWorkspace;
    }

    taskContext.logger.info(`Fetching global theme "${themeName}" for org "${organization}"...`);

    const url = `${fdrOrigin}/v2/registry/themes/${encodeURIComponent(organization)}/${encodeURIComponent(themeName)}`;
    let themeConfig: Record<string, unknown>;
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                // Opt out of gzip/br compression — @fastify/compress v8 sets Content-Length: 0
                // when compressing, which causes undici to read an empty body.
                "Accept-Encoding": "identity"
            }
        });

        // Read as text first so we can give a useful error on empty / non-JSON bodies
        const rawText = await res.text();

        if (res.status === 404) {
            taskContext.failAndThrow(
                `Global theme "${themeName}" not found for org "${organization}". ` +
                    `Upload it first with: fern beta docs theme upload --name ${themeName}`
            );
        }
        if (!res.ok) {
            taskContext.failAndThrow(`Failed to fetch global theme "${themeName}": HTTP ${res.status}`);
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(rawText);
        } catch {
            taskContext.failAndThrow(
                `Failed to fetch global theme "${themeName}": unexpected response from server` +
                    (rawText.length > 0 ? ` — ${rawText.slice(0, 200)}` : " (empty body)")
            );
        }

        // ORPC can encode errors (e.g. NOT_FOUND) inside a 200 response body
        const body = parsed as {
            config?: Record<string, unknown>;
            error?: { code?: string; message?: string };
        };
        if (body.error != null) {
            if (body.error.code === "NOT_FOUND") {
                taskContext.failAndThrow(
                    `Global theme "${themeName}" not found for org "${organization}". ` +
                        `Upload it first with: fern beta docs theme upload --name ${themeName}`
                );
            }
            taskContext.failAndThrow(
                `Failed to fetch global theme "${themeName}": ${body.error.message ?? body.error.code ?? "unknown error"}`
            );
        }

        if (body.config == null) {
            taskContext.failAndThrow(`Failed to fetch global theme "${themeName}": response missing "config" field`);
            return docsWorkspace; // unreachable — TS needs this for definite-assignment of themeConfig
        }

        themeConfig = body.config;
    } catch (err) {
        if (err instanceof Error && err.message.includes("fetch failed")) {
            taskContext.failAndThrow(`Could not reach FDR at ${fdrOrigin} to fetch global theme "${themeName}"`);
        }
        throw err;
    }

    // Download file assets to a temp directory that lives for the duration of the process
    const { path: tmpDirPath } = await tmp.dir({ prefix: "fern-theme-", unsafeCleanup: true });
    taskContext.logger.debug(`Downloading theme assets to ${tmpDirPath}`);

    let resolvedConfig: Record<string, unknown>;
    try {
        resolvedConfig = await resolveThemeFileUrls(themeConfig, tmpDirPath);
    } catch (err) {
        const detail = err instanceof Error ? `: ${err.message}` : "";
        taskContext.failAndThrow(`Failed to download assets for global theme "${themeName}"${detail}`);
        return docsWorkspace; // unreachable — TS needs this for definite-assignment of resolvedConfig
    }

    const mergedRawConfig = mergeThemeOverride(docsWorkspace.config, resolvedConfig);

    taskContext.logger.info(
        `Applied global theme "${themeName}" — ${AbsoluteFilePath.of(tmpDirPath)} (cleaned up on exit)`
    );
    const stitchedPath = path.join(tmpDirPath, "stitched-docs.yml.json");
    await writeFile(stitchedPath, JSON.stringify(mergedRawConfig, null, 2));
    taskContext.logger.debug(`Stitched docs.yml after importing theme written to: ${stitchedPath}`);

    return { ...docsWorkspace, config: mergedRawConfig };
}
