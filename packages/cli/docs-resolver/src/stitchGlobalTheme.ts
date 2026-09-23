import { docsYml } from "@fern-api/configuration";
import { DocsConfigurationWithResolvedRedirects } from "@fern-api/configuration-loader";
import { isPlainObject } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";

import { createHash, randomUUID } from "crypto";
import { chmod, lstat, mkdir, rename, unlink, writeFile } from "fs/promises";
import { kebabCase } from "lodash-es";
import mime from "mime-types";
import { tmpdir } from "os";
import path from "path";

type RawDocsConfig = DocsConfigurationWithResolvedRedirects;

// Theme-eligible fields that can contain local file paths (strings that become
// { hash } sentinels on upload and presigned S3 URLs on GET from FDR).
// Presigned S3 URLs are identified by the presence of "X-Amz-" in the query string.
export function isPresignedUrl(value: string): boolean {
    return (value.startsWith("http://") || value.startsWith("https://")) && value.includes("X-Amz-");
}

export function isRemoteUrl(value: string): boolean {
    return value.startsWith("http://") || value.startsWith("https://");
}

export function parseFilenameFromDisposition(value: string | null): string | undefined {
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

export function filenameFromUrl(url: string): string | undefined {
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

export function getGlobalThemeAssetDirectoryPath(organization: string, themeName: string): string {
    const themeKey = `${organization}\0${themeName}`;
    const themeHash = createHash("sha256").update(themeKey).digest("hex").slice(0, 16);
    return path.join(tmpdir(), `fern-theme-${themeHash}`);
}

export async function ensureGlobalThemeAssetDirectory(directoryPath: string): Promise<void> {
    await mkdir(directoryPath, { mode: 0o700, recursive: true });

    const stats = await lstat(directoryPath);
    const processUid = typeof process.getuid === "function" ? process.getuid() : undefined;
    if (!stats.isDirectory() || (processUid !== undefined && stats.uid !== processUid)) {
        throw new Error(
            `Global theme asset directory "${directoryPath}" is not a secure directory. Remove it and retry.`
        );
    }

    if ((stats.mode & 0o777) !== 0o700) {
        await chmod(directoryPath, 0o700);
    }
}

async function writeFileAtomically(filePath: string, data: string | Uint8Array): Promise<void> {
    const tempPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${randomUUID()}.tmp`);
    try {
        await writeFile(tempPath, data);
        await rename(tempPath, filePath);
    } finally {
        await unlink(tempPath).catch(() => undefined);
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
    await writeFileAtomically(dest, buf);
    return dest;
}

export async function resolveThemeFileUrls(
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

    // products — icon/image may be uploaded assets
    if (Array.isArray(cfg.products)) {
        for (const product of cfg.products) {
            if (isPlainObject(product)) {
                product.icon = await maybeDownload(product.icon);
                product.image = await maybeDownload(product.image);
            }
        }
    }

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

// Deep merge where global wins on conflicting keys; local-only sub-fields survive.
export function deepMergeGlobalWins(
    local: Record<string, unknown>,
    global: Record<string, unknown>
): Record<string, unknown> {
    const result: Record<string, unknown> = { ...local };
    for (const [key, globalValue] of Object.entries(global)) {
        const localValue = local[key];
        if (isPlainObject(globalValue) && isPlainObject(localValue)) {
            result[key] = deepMergeGlobalWins(localValue, globalValue);
        } else {
            result[key] = globalValue;
        }
    }
    return result;
}

const { THEME_ELIGIBLE_FIELDS, THEME_FIELD_POLICIES } = docsYml;

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

// Theme products are always external (absolute href); a `path` cannot resolve
// outside the repo that owns it.
function isThemeProduct(value: unknown): value is docsYml.RawSchemas.ExternalProduct {
    return isPlainObject(value) && typeof value.href === "string" && typeof value.displayName === "string";
}

function isInternalProduct(value: docsYml.RawSchemas.ProductConfig): value is docsYml.RawSchemas.InternalProduct {
    return "path" in value && typeof value.path === "string";
}

/** Lower-cased `host/path` with scheme, query/hash and trailing slash stripped, e.g. `docs.example.com/repo-2`. */
export function normalizeSiteUrl(value: string): string {
    return value
        .trim()
        .replace(/[?#].*$/, "")
        .replace(/^https?:\/\//i, "")
        .replace(/\/+$/, "")
        .toLowerCase();
}

/**
 * Returns the path segments of `href` below one of `siteUrls`, or undefined when
 * `href` does not point into any of them. `https://docs.example.com/repo-2/product-b`
 * against `docs.example.com/repo-2` yields `["product-b"]`.
 */
export function getPathWithinSite(href: string, siteUrls: string[]): string[] | undefined {
    const normalizedHref = normalizeSiteUrl(href);
    // Longest site first so `docs.example.com/repo-2` wins over `docs.example.com`.
    const sites = siteUrls
        .map(normalizeSiteUrl)
        .filter((site) => site !== "")
        .sort((a, b) => b.length - a.length);
    for (const site of sites) {
        if (normalizedHref === site) {
            return [];
        }
        if (normalizedHref.startsWith(`${site}/`)) {
            return normalizedHref
                .slice(site.length + 1)
                .split("/")
                .filter(Boolean);
        }
    }
    return undefined;
}

/** Slug an internal product publishes under; must agree with `DocsDefinitionResolver.toProductNode`. */
export function getProductSlug({ slug, displayName }: { slug: string | undefined; displayName: string }): string {
    return slug ?? kebabCase(displayName);
}

/**
 * Builds the product switcher for a site from a theme-owned product catalog.
 *
 * Theme products are absolute URLs. Each theme entry that points into this site
 * (one of `siteUrls`) is swapped for the matching local internal product, so the
 * switcher keeps real in-site navigation and highlights the current product; other
 * theme entries stay external links. Local products not listed in the theme are
 * appended so nothing is lost. Theme ordering wins.
 *
 * A theme entry may also point at this site's root rather than at
 * `<root>/<product-slug>` — the natural thing to hand-write for a sibling repo
 * that serves a single product. That is still this site, so its own internal
 * product is adopted when there is exactly one. A site with no products of its
 * own keeps the entry as an external self-link.
 */
export function mergeThemeProducts({
    localProducts,
    themeProducts,
    siteUrls
}: {
    localProducts: docsYml.RawSchemas.ProductConfig[] | undefined;
    themeProducts: unknown;
    siteUrls: string[];
}): docsYml.RawSchemas.ProductConfig[] | undefined {
    if (!Array.isArray(themeProducts)) {
        return localProducts;
    }
    const remaining = [...(localProducts ?? [])];
    const takeLocal = (
        predicate: (product: docsYml.RawSchemas.ProductConfig) => boolean
    ): docsYml.RawSchemas.ProductConfig | undefined => {
        const index = remaining.findIndex(predicate);
        return index === -1 ? undefined : remaining.splice(index, 1)[0];
    };

    const merged: docsYml.RawSchemas.ProductConfig[] = [];
    const seenHrefs = new Set<string>();
    for (const themeProduct of themeProducts) {
        if (!isThemeProduct(themeProduct)) {
            continue;
        }
        // Two theme entries pointing at the same URL would otherwise leave the
        // second one behind as a dangling duplicate of the product the first
        // already claimed.
        const normalizedHref = normalizeSiteUrl(themeProduct.href);
        if (seenHrefs.has(normalizedHref)) {
            continue;
        }
        seenHrefs.add(normalizedHref);
        const pathWithinSite = getPathWithinSite(themeProduct.href, siteUrls);
        const productSlug = pathWithinSite?.[0];
        let localMatch: docsYml.RawSchemas.ProductConfig | undefined;
        if (productSlug != null) {
            // Compared case-insensitively: `getPathWithinSite` lower-cases the href,
            // while an explicit `slug:` keeps whatever casing it was authored with.
            const target = productSlug.toLowerCase();
            localMatch = takeLocal(
                (product) =>
                    isInternalProduct(product) &&
                    getProductSlug({ slug: product.slug, displayName: product.displayName }).toLowerCase() === target
            );
        } else if (pathWithinSite != null) {
            // Points at this site's root. Adopt this site's own internal product, but
            // only when there is exactly one — with several we cannot tell which was
            // meant, and with none there is nothing to adopt.
            localMatch = remaining.filter(isInternalProduct).length === 1 ? takeLocal(isInternalProduct) : undefined;
        } else {
            localMatch = takeLocal(
                (product) => !isInternalProduct(product) && normalizeSiteUrl(product.href) === normalizedHref
            );
        }
        merged.push(localMatch ?? themeProduct);
    }
    merged.push(...remaining);
    return merged;
}

export function mergeThemeOverride(
    local: RawDocsConfig,
    themeOverride: Record<string, unknown>,
    siteUrls: string[] = getSiteUrls(local)
): RawDocsConfig {
    const normalized = normalizeThemeKeys(themeOverride);
    const localRecord = local as unknown as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...localRecord };
    for (const key of THEME_ELIGIBLE_FIELDS) {
        const themeValue = normalized[key];
        const localValue = localRecord[key];
        const policy = THEME_FIELD_POLICIES[key] ?? "global";

        const themeHasValue = themeValue !== undefined && themeValue !== null;
        const localHasValue = localValue !== undefined && localValue !== null;

        if (key === "products") {
            merged[key] = mergeThemeProducts({
                localProducts: local.products,
                themeProducts: themeValue,
                siteUrls
            });
        } else if (policy === "global") {
            // Theme wins when present, otherwise keep the local value.
            // Object fields are deep-merged so local-only sub-fields survive.
            if (themeHasValue) {
                if (isPlainObject(themeValue) && isPlainObject(localValue)) {
                    merged[key] = deepMergeGlobalWins(localValue, themeValue);
                } else {
                    merged[key] = themeValue;
                }
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

/** Every URL this docs.yml publishes to: instance URLs plus their custom domains. */
export function getSiteUrls(config: RawDocsConfig): string[] {
    const urls: string[] = [];
    for (const instance of config.instances ?? []) {
        urls.push(instance.url);
        if (typeof instance.customDomain === "string") {
            urls.push(instance.customDomain);
        } else if (Array.isArray(instance.customDomain)) {
            urls.push(...instance.customDomain);
        }
    }
    return urls;
}

interface StitchGlobalThemeArgs {
    docsWorkspace: DocsWorkspace;
    organization: string;
    fdrOrigin: string;
    token: string;
    taskContext: TaskContext;
    /**
     * URLs of the site being published (domain plus custom domains), in addition to
     * the instance URLs declared in docs.yml. Theme products whose href points into
     * one of these are treated as this site's own products.
     */
    siteUrls?: string[];
}

/**
 * If the docs.yml declares `global-theme: <name>`, fetches that named theme from
 * FDR, downloads any file assets to a temp directory, and returns a new DocsWorkspace
 * whose raw config has the theme values merged in (theme wins for branding fields).
 *
 * The theme asset directory is reused across publishes of the same theme.
 * If no global-theme is declared, returns the workspace unchanged.
 */
export async function stitchGlobalTheme({
    docsWorkspace,
    organization,
    fdrOrigin,
    token,
    taskContext,
    siteUrls
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
                    `Upload it first with: fern beta docs theme upload --name ${themeName}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        if (!res.ok) {
            taskContext.failAndThrow(`Failed to fetch global theme "${themeName}": HTTP ${res.status}`, undefined, {
                code: CliError.Code.ConfigError
            });
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(rawText);
        } catch {
            taskContext.failAndThrow(
                `Failed to fetch global theme "${themeName}": unexpected response from server` +
                    (rawText.length > 0 ? ` — ${rawText.slice(0, 200)}` : " (empty body)"),
                undefined,
                { code: CliError.Code.NetworkError }
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
                        `Upload it first with: fern beta docs theme upload --name ${themeName}`,
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            taskContext.failAndThrow(
                `Failed to fetch global theme "${themeName}": ${body.error.message ?? body.error.code ?? "unknown error"}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }

        if (body.config == null) {
            taskContext.failAndThrow(
                `Failed to fetch global theme "${themeName}": response missing "config" field`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
            return docsWorkspace; // unreachable — TS needs this for definite-assignment of themeConfig
        }

        themeConfig = body.config;
    } catch (err) {
        if (err instanceof Error && err.message.includes("fetch failed")) {
            taskContext.failAndThrow(`Could not reach FDR at ${fdrOrigin} to fetch global theme "${themeName}"`, err, {
                code: CliError.Code.NetworkError
            });
        }
        throw err;
    }

    // Reuse a deterministic directory so asset paths remain stable across publishes.
    const tmpDirPath = getGlobalThemeAssetDirectoryPath(organization, themeName);
    try {
        await ensureGlobalThemeAssetDirectory(tmpDirPath);
    } catch (err) {
        taskContext.failAndThrow(
            `Could not prepare global theme asset directory "${tmpDirPath}". Remove it and retry.`,
            err,
            { code: CliError.Code.ConfigError }
        );
        return docsWorkspace;
    }
    taskContext.logger.debug(`Downloading theme assets to ${tmpDirPath}`);

    let resolvedConfig: Record<string, unknown>;
    try {
        resolvedConfig = await resolveThemeFileUrls(themeConfig, tmpDirPath);
    } catch (err) {
        const detail = err instanceof Error ? `: ${err.message}` : "";
        taskContext.failAndThrow(`Failed to download assets for global theme "${themeName}"${detail}`, err, {
            code: CliError.Code.NetworkError
        });
        return docsWorkspace; // unreachable — TS needs this for definite-assignment of resolvedConfig
    }

    const mergedRawConfig = mergeThemeOverride(docsWorkspace.config, resolvedConfig, [
        ...(siteUrls ?? []),
        ...getSiteUrls(docsWorkspace.config)
    ]);

    taskContext.logger.info(`Applied global theme "${themeName}" — ${AbsoluteFilePath.of(tmpDirPath)}`);
    const stitchedPath = path.join(tmpDirPath, "stitched-docs.yml.json");
    await writeFileAtomically(stitchedPath, JSON.stringify(mergedRawConfig, null, 2));
    taskContext.logger.debug(`Stitched docs.yml after importing theme written to: ${stitchedPath}`);

    return { ...docsWorkspace, config: mergedRawConfig };
}
