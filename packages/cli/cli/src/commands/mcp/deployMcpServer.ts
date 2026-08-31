import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { createHash } from "crypto";
import { readdir, readFile } from "fs/promises";
import path from "path";

import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "../docs-theme/themeOrigin.js";

/** Server-side constraints on orgId and slug, mirrored here for a friendly pre-flight message. */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 30;
const MAX_MODULES = 20;

/** Slug used when generators.yml sets no `output.slug`; the server is then served at https://<org>.fernmcp.dev/mcp. */
const DEFAULT_SLUG = "mcp";

/** The line shown under every deploy failure: a failed deploy never disturbs a serving one. */
const STILL_SERVING_LINE = "If this server was deployed before, that deployment is still serving — nothing changed.";

interface BundleModule {
    name: string;
    content: Buffer;
    contentType: string;
    hash: string;
}

interface Bundle {
    metadata: unknown;
    mainModule: string;
    compatibilityDate: string;
    compatibilityFlags: string[];
    modules: BundleModule[];
}

interface DeployResponse {
    slug: string;
    activeDeploymentId: string | null;
    latestDeployment?: { status?: string; error?: unknown };
    url: string;
}

export interface HostedMcpDeployResult {
    slug: string;
    url: string;
    deploymentStatus: string;
}

/**
 * Deploys a generated MCP server bundle to Fern's hosted platform. Called by the
 * `fern generate` pipeline for invocations with `output.location: fern-hosted`.
 *
 * The bundle directory is the generator's output: `metadata.json`, `wrangler.jsonc`,
 * and the server's module files.
 */
export async function deployHostedMcpServer({
    bundleDir,
    organization,
    slug,
    token,
    generatorName,
    generatorVersion,
    cliVersion,
    context
}: {
    bundleDir: string;
    organization: string;
    slug: string | undefined;
    token: string;
    generatorName: string;
    generatorVersion: string;
    cliVersion: string | undefined;
    context: TaskContext;
}): Promise<HostedMcpDeployResult> {
    const bundle = await readBundle(bundleDir, context);
    const resolvedSlug = slug ?? DEFAULT_SLUG;
    validateBeforeDeploy({ orgId: organization, slug: resolvedSlug, bundle, context });

    context.logger.info(`Deploying MCP server "${resolvedSlug}" to org "${organization}"...`);
    context.logger.debug(`Registry origin: ${FDR_ORIGIN}`);

    for (const module of bundle.modules) {
        await uploadModule({ module, orgId: organization, slug: resolvedSlug, token, context });
    }

    const result = await postDeploy({
        orgId: organization,
        slug: resolvedSlug,
        bundle,
        token,
        generatorName,
        generatorVersion,
        cliVersion,
        context
    });

    const deploymentStatus = result.latestDeployment?.status ?? "unknown";
    if (result.activeDeploymentId == null) {
        const error = result.latestDeployment?.error;
        const detail = error == null ? `deployment status: ${deploymentStatus}` : stringifyServerError(error);
        return context.failAndThrow(`${detail}\n${STILL_SERVING_LINE}`, undefined, {
            code: CliError.Code.NetworkError
        });
    }

    context.logger.info(chalk.green(`Deployed MCP server "${result.slug}"`));
    context.logger.info("");
    context.logger.info(`  ${chalk.bold(result.url)}`);
    context.logger.info("");
    context.logger.info("Connect a coding agent with:");
    context.logger.info(`  claude mcp add --transport http ${organization}-${result.slug} ${result.url}`);

    return { slug: result.slug, url: result.url, deploymentStatus };
}

// metadata.json/wrangler.jsonc describe the bundle; catalog.json is the raw
// catalog artifact (the worker imports catalog.js, never the .json); index.mjs
// is the generator's local Node runner (stdio/HTTP) — the Worker entrypoint
// is engine.mjs per wrangler.jsonc.
const NON_MODULE_FILES = new Set(["metadata.json", "wrangler.jsonc", "catalog.json", "index.mjs"]);

/** Dotfiles (.DS_Store) and docs (README.md) don't count against the module budget. */
export function isDeployableModuleFile(fileName: string): boolean {
    return !NON_MODULE_FILES.has(fileName) && !fileName.startsWith(".") && !fileName.toLowerCase().endsWith(".md");
}

async function readBundle(bundleDir: string, context: TaskContext): Promise<Bundle> {
    const absoluteBundleDir = path.resolve(bundleDir);

    let entries;
    try {
        entries = await readdir(absoluteBundleDir, { withFileTypes: true });
    } catch {
        return context.failAndThrow(`Could not read the server bundle at ${absoluteBundleDir}.`, undefined, {
            code: CliError.Code.ConfigError
        });
    }

    const fileNames = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    for (const required of NON_MODULE_FILES) {
        if (!fileNames.includes(required)) {
            context.failAndThrow(
                `The server bundle is missing ${required} (looked in ${absoluteBundleDir}).`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
    }

    const rawMetadata = await readJsonFile({ absolutePath: path.join(absoluteBundleDir, "metadata.json"), context });
    const bundleConfig = await readJsonFile({
        absolutePath: path.join(absoluteBundleDir, "wrangler.jsonc"),
        context
    });
    if (typeof bundleConfig !== "object" || bundleConfig == null) {
        context.failAndThrow("The server bundle's wrangler.jsonc must contain a JSON object.", undefined, {
            code: CliError.Code.ConfigError
        });
    }
    const { main, compatibility_date, compatibility_flags } = bundleConfig as Record<string, unknown>;
    if (typeof main !== "string" || typeof compatibility_date !== "string") {
        context.failAndThrow(
            'The server bundle\'s wrangler.jsonc must set "main" and "compatibility_date".',
            undefined,
            {
                code: CliError.Code.ConfigError
            }
        );
    }

    const modules: BundleModule[] = await Promise.all(
        fileNames.filter(isDeployableModuleFile).map(async (name) => {
            const content = await readFile(path.join(absoluteBundleDir, name));
            return {
                name,
                content,
                contentType: getModuleContentType(name),
                hash: createHash("sha256").update(content).digest("hex")
            };
        })
    );

    return {
        metadata: normalizeMetadata(rawMetadata),
        mainModule: main,
        compatibilityDate: compatibility_date,
        compatibilityFlags: Array.isArray(compatibility_flags) ? compatibility_flags.map(String) : [],
        modules
    };
}

/**
 * GENERATOR TODO: the current fern-mcp-server generator does not emit
 * `followRedirects` / `maxRedirects` / `allowedRedirectHosts`, but the deploy
 * API requires them. Default them here until the generator emits them itself,
 * then delete this.
 */
function normalizeMetadata(metadata: unknown): unknown {
    if (typeof metadata !== "object" || metadata == null || Array.isArray(metadata)) {
        return metadata;
    }
    return {
        followRedirects: false,
        maxRedirects: 5,
        allowedRedirectHosts: [],
        ...(metadata as Record<string, unknown>)
    };
}

async function readJsonFile({
    absolutePath,
    context
}: {
    absolutePath: string;
    context: TaskContext;
}): Promise<unknown> {
    const contents = await readFile(absolutePath, "utf-8");
    try {
        return JSON.parse(normalizeJsonc(contents));
    } catch {
        return context.failAndThrow(`Could not parse ${absolutePath} as JSON.`, undefined, {
            code: CliError.Code.ConfigError
        });
    }
}

export function getModuleContentType(fileName: string): string {
    switch (path.extname(fileName)) {
        case ".mjs":
        case ".js":
            return "application/javascript+module";
        case ".wasm":
            return "application/wasm";
        default:
            return "application/octet-stream";
    }
}

/**
 * Makes JSONC parseable as JSON: removes `//` and `/* *\/` comments and
 * trailing commas. String contents (including escaped quotes) are untouched.
 */
export function normalizeJsonc(input: string): string {
    return stripTrailingCommas(stripComments(input));
}

function stripComments(input: string): string {
    let out = "";
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        const next = input[i + 1];
        if (char === '"') {
            const end = findStringEnd(input, i);
            out += input.slice(i, end);
            i = end;
        } else if (char === "/" && next === "/") {
            const end = input.indexOf("\n", i);
            i = end === -1 ? input.length : end;
        } else if (char === "/" && next === "*") {
            const end = input.indexOf("*/", i + 2);
            i = end === -1 ? input.length : end + 2;
        } else {
            out += char;
            i++;
        }
    }
    return out;
}

function stripTrailingCommas(input: string): string {
    let out = "";
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (char === '"') {
            const end = findStringEnd(input, i);
            out += input.slice(i, end);
            i = end;
        } else if (char === ",") {
            let j = i + 1;
            while (j < input.length && /\s/.test(input[j] ?? "")) {
                j++;
            }
            if (input[j] === "}" || input[j] === "]") {
                i++;
            } else {
                out += char;
                i++;
            }
        } else {
            out += char;
            i++;
        }
    }
    return out;
}

function findStringEnd(input: string, start: number): number {
    for (let i = start + 1; i < input.length; i++) {
        if (input[i] === "\\") {
            i++;
        } else if (input[i] === '"') {
            return i + 1;
        }
    }
    return input.length;
}

export function getSlugValidationError(value: string, label: string): string | undefined {
    if (value.length === 0 || value.length > MAX_SLUG_LENGTH) {
        return `${label} must be 1-${MAX_SLUG_LENGTH} characters (got "${value}").`;
    }
    if (!SLUG_REGEX.test(value)) {
        return `${label} must be lowercase letters, digits, and single hyphens (got "${value}").`;
    }
    return undefined;
}

function validateBeforeDeploy({
    orgId,
    slug,
    bundle,
    context
}: {
    orgId: string;
    slug: string;
    bundle: Bundle;
    context: TaskContext;
}): void {
    const errors = [
        getSlugValidationError(orgId, "The organization id"),
        getSlugValidationError(slug, "The slug"),
        bundle.modules.length === 0 || bundle.modules.length > MAX_MODULES
            ? `The server bundle must contain 1-${MAX_MODULES} module files (found ${bundle.modules.length}).`
            : undefined,
        !bundle.modules.some((module) => module.name === bundle.mainModule)
            ? `The server bundle's entry module ("${bundle.mainModule}" per wrangler.jsonc) is not a file in the bundle.`
            : undefined
    ].filter((error) => error != null);
    if (errors.length > 0) {
        context.failAndThrow(errors.join("\n"), undefined, { code: CliError.Code.ConfigError });
    }
}

/**
 * Uploads one module to the registry's content store: a check `PUT` returns an
 * upload URL only when the content is not already stored. The final register
 * `PUT` creates the org-scoped content record that the deploy resolves module
 * hashes against, so it always runs — even when the bytes were already present.
 */
async function uploadModule({
    module,
    orgId,
    slug,
    token,
    context
}: {
    module: BundleModule;
    orgId: string;
    slug: string;
    token: string;
    context: TaskContext;
}): Promise<void> {
    const checkUrl = `${FDR_ORIGIN}/v2/registry/content/${encodeURIComponent(orgId)}/${module.hash}`;
    context.logger.debug(`  Upload check: PUT ${checkUrl} (${module.contentType}, ${module.content.byteLength} bytes)`);

    let checkRes: Response;
    try {
        checkRes = await fetch(checkUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ contentType: module.contentType, contentLength: module.content.byteLength })
        });
    } catch (err) {
        return context.failAndThrow(
            `Upload check for ${module.name} failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }

    if (!checkRes.ok) {
        const errorBody = await checkRes.text();
        const detail = parseErrorDetail(errorBody) ?? errorBody;
        context.failAndThrow(`Upload check failed for ${module.name}: HTTP ${checkRes.status} — ${detail}`, undefined, {
            code: CliError.Code.NetworkError
        });
    }

    let checkBody: { status: string; uploadUrl?: string };
    try {
        checkBody = (await checkRes.json()) as { status: string; uploadUrl?: string };
    } catch {
        return context.failAndThrow(
            `Upload check for ${module.name} returned a non-JSON response — is a Fern registry running at ${FDR_ORIGIN}?`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }
    context.logger.debug(`  Upload status for ${module.name}: ${checkBody.status}`);

    if (checkBody.status === "upload_required" && checkBody.uploadUrl != null) {
        context.logger.debug(`  Uploading ${module.name} (${module.content.byteLength} bytes)...`);
        let uploadRes: Response;
        try {
            uploadRes = await fetch(checkBody.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": module.contentType },
                body: new Uint8Array(
                    module.content.buffer as ArrayBuffer,
                    module.content.byteOffset,
                    module.content.byteLength
                )
            });
        } catch (err) {
            return context.failAndThrow(
                `Upload of ${module.name} failed — could not reach the upload URL: ${describeFetchError(err)}`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
        }
        if (!uploadRes.ok) {
            const errorBody = await uploadRes.text().catch(() => "");
            context.failAndThrow(
                `Upload of ${module.name} failed: HTTP ${uploadRes.status}${errorBody ? ` — ${errorBody}` : ""}`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
        }
    }

    const registerPath = ["mcp-servers", slug, module.name].map(encodeURIComponent).join("/");
    const registerUrl = `${FDR_ORIGIN}/v2/registry/files/${encodeURIComponent(orgId)}/${registerPath}`;
    context.logger.debug(`  Registering ${module.name} → mcp-servers/${slug}/${module.name}`);

    let registerRes: Response;
    try {
        registerRes = await fetch(registerUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ hash: module.hash, contentType: module.contentType })
        });
    } catch (err) {
        return context.failAndThrow(
            `Registering ${module.name} failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }

    if (!registerRes.ok) {
        const errorBody = await registerRes.text().catch(() => "");
        const detail = parseErrorDetail(errorBody) ?? errorBody;
        context.failAndThrow(
            `Registering ${module.name} failed: HTTP ${registerRes.status}${detail ? ` — ${detail}` : ""}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }
}

/** Server error payloads can be objects; String() would print "[object Object]". */
function stringifyServerError(error: unknown): string {
    return typeof error === "string" ? error : (JSON.stringify(error) ?? String(error));
}

async function postDeploy({
    orgId,
    slug,
    bundle,
    token,
    generatorName,
    generatorVersion,
    cliVersion,
    context
}: {
    orgId: string;
    slug: string;
    bundle: Bundle;
    token: string;
    generatorName: string;
    generatorVersion: string;
    cliVersion: string | undefined;
    context: TaskContext;
}): Promise<DeployResponse> {
    const deployUrl = `${FDR_ORIGIN}/mcp-hosting/deploy`;
    context.logger.debug(`Deploying to ${deployUrl}`);

    let res: Response;
    try {
        res = await fetch(deployUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                orgId,
                slug,
                mainModule: bundle.mainModule,
                compatibilityDate: bundle.compatibilityDate,
                compatibilityFlags: bundle.compatibilityFlags,
                modules: bundle.modules.map((module) => ({
                    name: module.name,
                    hash: module.hash,
                    contentType: module.contentType
                })),
                metadata: bundle.metadata,
                generatorName,
                generatorVersion,
                ...(cliVersion != null ? { cliVersion } : {})
            })
        });
    } catch (err) {
        return context.failAndThrow(
            `Deploy failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }

    if (!res.ok) {
        const body = await res.text();
        const detail = parseErrorDetail(body) ?? body;
        return context.failAndThrow(`${detail}\n${STILL_SERVING_LINE}`, undefined, {
            code: CliError.Code.NetworkError
        });
    }

    try {
        return (await res.json()) as DeployResponse;
    } catch {
        return context.failAndThrow(
            `Deploy returned a non-JSON response — is a Fern registry running at ${FDR_ORIGIN}?`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }
}
