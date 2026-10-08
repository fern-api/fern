import { getCodingAgentHeaders } from "@fern-api/core";
import { getDashboardBaseUrl } from "@fern-api/login";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { createHash } from "crypto";
import { readdir, readFile } from "fs/promises";
import path from "path";

import { CISource, DeployerAuthor } from "../../utils/environment.js";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "../docs-theme/themeOrigin.js";

/** Server-side constraints on orgId and slug, mirrored here for a friendly pre-flight message. */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 30;
const MAX_MODULES = 20;
/** Server-side constraint on tool names, mirrored here for a friendly pre-flight message. */
const MAX_TOOL_NAME_LENGTH = 64;
const TOOL_NAME_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/** Slug used when generators.yml sets no `output.slug`; the server is then served at https://<org>.fernmcp.dev/mcp. */
const DEFAULT_SLUG = "mcp";

/** The line shown under every deploy failure: a failed deploy never disturbs a serving one. */
const STILL_SERVING_LINE = "If this server was deployed before, that deployment is still serving — nothing changed.";

/** A content-addressed file in the bundle: uploaded to the registry's content store and referenced by hash. */
interface BundleFile {
    name: string;
    content: Buffer;
    contentType: string;
    hash: string;
}

/** A Worker module the deployed server runs. */
type BundleModule = BundleFile;

/** A provenance input (spec archive, SDK config, build request) the server was generated from; stored, never run. */
type BundleInput = BundleFile;

interface Bundle {
    metadata: unknown;
    mainModule: string;
    compatibilityDate: string;
    compatibilityFlags: string[];
    modules: BundleModule[];
    inputs: BundleInput[];
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

export interface GitProvenance {
    repoUrl: string;
    branch: string;
    commitSha?: string;
}

/**
 * Deploys a generated MCP server bundle to Fern's hosted platform. Called by the
 * `fern generate` pipeline for invocations with `output.location: fern-hosted`.
 *
 * The bundle directory is the generator's output: `metadata.json`, `wrangler.jsonc`,
 * the server's module files, and optionally an `inputs/` directory holding the
 * spec archive, SDK config, and build request the server was generated from.
 *
 * Provenance (`config`, `git`, `ciSource`, `deployerAuthor`, the inputs) is
 * recorded with the deployment so it can be explained later; every part of it
 * is optional and never blocks the deploy.
 */
export async function deployHostedMcpServer({
    bundleDir,
    organization,
    slug,
    token,
    generatorName,
    generatorVersion,
    cliVersion,
    config,
    git,
    ciSource,
    deployerAuthor,
    context
}: {
    bundleDir: string;
    organization: string;
    slug: string | undefined;
    token: string;
    generatorName: string;
    generatorVersion: string;
    cliVersion: string | undefined;
    /** The raw `config:` block of this generator's generators.yml entry. */
    config: unknown;
    git: GitProvenance | undefined;
    ciSource: CISource | undefined;
    deployerAuthor: DeployerAuthor | undefined;
    context: TaskContext;
}): Promise<HostedMcpDeployResult> {
    const bundle = await readBundle(bundleDir, context);
    const resolvedSlug = slug ?? DEFAULT_SLUG;
    validateBeforeDeploy({ orgId: organization, slug: resolvedSlug, bundle, context });

    context.logger.info(`Deploying MCP server "${resolvedSlug}" to org "${organization}"...`);
    context.logger.debug(`Registry origin: ${FDR_ORIGIN}`);

    for (const file of [...bundle.modules, ...bundle.inputs]) {
        await uploadContent({ file, orgId: organization, token, context });
    }

    const result = await postDeploy({
        orgId: organization,
        slug: resolvedSlug,
        bundle,
        token,
        generatorName,
        generatorVersion,
        cliVersion,
        config,
        git,
        ciSource,
        deployerAuthor,
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
    context.logger.info(`Manage it at ${getDashboardBaseUrl()}/${organization}/mcp/${result.slug}`);

    return { slug: result.slug, url: result.url, deploymentStatus };
}

// metadata.json/wrangler.jsonc are required bundle descriptors. catalog.json is
// the raw catalog artifact (the worker imports catalog.js, never the .json);
// index.mjs is the generator's local Node runner (stdio/HTTP) — the Worker
// entrypoint is engine.mjs per wrangler.jsonc.
const REQUIRED_BUNDLE_FILES = ["metadata.json", "wrangler.jsonc"] as const;
const NON_MODULE_FILES = new Set(["metadata.json", "wrangler.jsonc", "catalog.json", "index.mjs"]);

/** Dotfiles (.DS_Store) and docs (README.md) don't count against the module budget. */
export function isDeployableModuleFile(fileName: string): boolean {
    return !NON_MODULE_FILES.has(fileName) && !fileName.startsWith(".") && !fileName.toLowerCase().endsWith(".md");
}

/**
 * The generator's build writes what the server was generated from under
 * `inputs/`. Only these three files are deployed as provenance; anything else
 * in the directory is ignored so a newer generator cannot break an older CLI.
 */
const INPUTS_DIRECTORY = "inputs";
const INPUT_CONTENT_TYPES: ReadonlyMap<string, string> = new Map([
    ["specs.tar.gz", "application/gzip"],
    ["sdk-config.json", "application/json"],
    ["build-request.json", "application/json"]
]);

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
    for (const required of REQUIRED_BUNDLE_FILES) {
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
        fileNames.filter(isDeployableModuleFile).map((name) =>
            readBundleFile({
                absolutePath: path.join(absoluteBundleDir, name),
                name,
                contentType: getModuleContentType(name)
            })
        )
    );

    const hasInputsDirectory = entries.some((entry) => entry.isDirectory() && entry.name === INPUTS_DIRECTORY);
    const inputs = hasInputsDirectory
        ? await readBundleInputs(path.join(absoluteBundleDir, INPUTS_DIRECTORY), context)
        : [];

    return {
        metadata: normalizeMetadata(rawMetadata),
        mainModule: main,
        compatibilityDate: compatibility_date,
        compatibilityFlags: Array.isArray(compatibility_flags) ? compatibility_flags.map(String) : [],
        modules,
        inputs
    };
}

async function readBundleInputs(absoluteInputsDir: string, context: TaskContext): Promise<BundleInput[]> {
    let entries;
    try {
        entries = await readdir(absoluteInputsDir, { withFileTypes: true });
    } catch {
        return context.failAndThrow(`Could not read the server bundle's inputs at ${absoluteInputsDir}.`, undefined, {
            code: CliError.Code.ConfigError
        });
    }

    const inputs: BundleInput[] = [];
    for (const entry of entries) {
        const contentType = entry.isFile() ? INPUT_CONTENT_TYPES.get(entry.name) : undefined;
        if (contentType == null) {
            context.logger.debug(`  Ignoring unknown entry in ${INPUTS_DIRECTORY}/: ${entry.name}`);
            continue;
        }
        inputs.push(
            await readBundleFile({
                absolutePath: path.join(absoluteInputsDir, entry.name),
                name: entry.name,
                contentType
            })
        );
    }
    return inputs;
}

async function readBundleFile({
    absolutePath,
    name,
    contentType
}: {
    absolutePath: string;
    name: string;
    contentType: string;
}): Promise<BundleFile> {
    const content = await readFile(absolutePath);
    return {
        name,
        content,
        contentType,
        hash: createHash("sha256").update(content).digest("hex")
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

interface ToolEntry {
    name: string;
    method?: unknown;
    path?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function isToolEntry(value: unknown): value is ToolEntry {
    return isRecord(value) && typeof value.name === "string";
}

export function getToolNameValidationErrors(metadata: unknown): string[] {
    if (!isRecord(metadata) || !Array.isArray(metadata.tools)) {
        return [];
    }

    return metadata.tools.flatMap((tool): string[] => {
        if (!isToolEntry(tool) || TOOL_NAME_REGEX.test(tool.name)) {
            return [];
        }
        const suggested = suggestToolName(tool.name);
        const message =
            tool.name.length > MAX_TOOL_NAME_LENGTH
                ? `Tool name "${tool.name}" is ${tool.name.length} characters; MCP tool names must be 1-${MAX_TOOL_NAME_LENGTH} characters of letters, digits, "_" or "-".`
                : `Tool name "${tool.name}" contains unsupported characters; MCP tool names must be 1-${MAX_TOOL_NAME_LENGTH} characters of letters, digits, "_" or "-".`;
        const hint =
            typeof tool.method === "string" && typeof tool.path === "string"
                ? `  Set x-fern-mcp-name on ${tool.method} ${tool.path}, e.g. in an overlay:\n    - target: "$.paths['${tool.path}'].${tool.method.toLowerCase()}"\n      update:\n        x-fern-mcp-name: ${suggested}`
                : `  Set x-fern-mcp-name on the operation in your OpenAPI spec (or an overlay), e.g. x-fern-mcp-name: ${suggested}`;
        return [`${message}\n${hint}`];
    });
}

export function suggestToolName(name: string): string {
    const sanitized = name.replace(/[^a-zA-Z0-9_-]+/g, "_");
    const truncated = sanitized.length > MAX_TOOL_NAME_LENGTH ? sanitized.slice(0, MAX_TOOL_NAME_LENGTH) : sanitized;
    const boundary =
        sanitized.length > MAX_TOOL_NAME_LENGTH ? Math.max(truncated.lastIndexOf("_"), truncated.lastIndexOf("-")) : -1;
    const suggested = boundary >= 0 ? truncated.slice(0, boundary) : truncated;
    return suggested.replace(/[_-]+$/, "") || "tool";
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
    // Only Worker modules count toward the budget; provenance inputs are stored, not run.
    const errors = [
        getSlugValidationError(orgId, "The organization id"),
        getSlugValidationError(slug, "The slug"),
        bundle.modules.length === 0 || bundle.modules.length > MAX_MODULES
            ? `The server bundle must contain 1-${MAX_MODULES} module files (found ${bundle.modules.length}).`
            : undefined,
        !bundle.modules.some((module) => module.name === bundle.mainModule)
            ? `The server bundle's entry module ("${bundle.mainModule}" per wrangler.jsonc) is not a file in the bundle.`
            : undefined,
        ...getToolNameValidationErrors(bundle.metadata)
    ].filter((error) => error != null);
    if (errors.length > 0) {
        context.failAndThrow(errors.join("\n"), undefined, { code: CliError.Code.ConfigError });
    }
}

/**
 * Puts one file's bytes in the registry's content store. The check `PUT` on
 * `/v2/registry/content` returns a presigned upload URL only when the content
 * is not already stored. Nothing else is needed: the deploy request registers
 * every module and input hash for the org itself.
 */
async function uploadContent({
    file,
    orgId,
    token,
    context
}: {
    file: BundleFile;
    orgId: string;
    token: string;
    context: TaskContext;
}): Promise<void> {
    const checkUrl = `${FDR_ORIGIN}/v2/registry/content/${encodeURIComponent(orgId)}/${file.hash}`;
    context.logger.debug(`  Upload check: PUT ${checkUrl} (${file.contentType}, ${file.content.byteLength} bytes)`);

    let checkRes: Response;
    try {
        checkRes = await fetch(checkUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ contentType: file.contentType, contentLength: file.content.byteLength })
        });
    } catch (error) {
        return context.failAndThrow(
            `Upload check for ${file.name} failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(error)}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }

    if (!checkRes.ok) {
        const errorBody = await checkRes.text();
        const detail = describeServerError(errorBody);
        context.failAndThrow(`Upload check failed for ${file.name}: HTTP ${checkRes.status} — ${detail}`, undefined, {
            code: CliError.Code.NetworkError
        });
    }

    let checkBody: { status: string; uploadUrl?: string };
    try {
        checkBody = (await checkRes.json()) as { status: string; uploadUrl?: string };
    } catch {
        return context.failAndThrow(
            `Upload check for ${file.name} returned a non-JSON response — is a Fern registry running at ${FDR_ORIGIN}?`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }
    context.logger.debug(`  Upload status for ${file.name}: ${checkBody.status}`);

    if (checkBody.status !== "upload_required" || checkBody.uploadUrl == null) {
        return;
    }

    context.logger.debug(`  Uploading ${file.name} (${file.content.byteLength} bytes)...`);
    let uploadRes: Response;
    try {
        uploadRes = await fetch(checkBody.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.contentType },
            body: new Uint8Array(file.content.buffer as ArrayBuffer, file.content.byteOffset, file.content.byteLength)
        });
    } catch (error) {
        return context.failAndThrow(
            `Upload of ${file.name} failed — could not reach the upload URL: ${describeFetchError(error)}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }
    if (!uploadRes.ok) {
        const errorBody = await uploadRes.text().catch(() => "");
        context.failAndThrow(
            `Upload of ${file.name} failed: HTTP ${uploadRes.status}${errorBody ? ` — ${errorBody}` : ""}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }
}

/** Server error payloads can be objects; String() would print "[object Object]". */
function stringifyServerError(error: unknown): string {
    return typeof error === "string" ? error : (JSON.stringify(error) ?? String(error));
}

function describeServerError(body: string): string {
    let parsed: unknown;
    try {
        parsed = JSON.parse(body);
    } catch {
        return body;
    }

    const headline = parseErrorDetail(body) ?? body;
    if (!isRecord(parsed) || !isRecord(parsed.data) || !Array.isArray(parsed.data.issues)) {
        return headline;
    }

    const issues = parsed.data.issues.flatMap((issue): string[] => {
        if (!isRecord(issue) || typeof issue.message !== "string") {
            return [];
        }
        const path =
            Array.isArray(issue.path) &&
            issue.path.every((part): part is string | number => typeof part === "string" || typeof part === "number")
                ? `[${issue.path.join(".")}] `
                : "";
        return [`  - ${path}${issue.message}`];
    });
    return issues.length > 0 ? `${headline}\n${issues.join("\n")}` : headline;
}

async function postDeploy({
    orgId,
    slug,
    bundle,
    token,
    generatorName,
    generatorVersion,
    cliVersion,
    config,
    git,
    ciSource,
    deployerAuthor,
    context
}: {
    orgId: string;
    slug: string;
    bundle: Bundle;
    token: string;
    generatorName: string;
    generatorVersion: string;
    cliVersion: string | undefined;
    config: unknown;
    git: GitProvenance | undefined;
    ciSource: CISource | undefined;
    deployerAuthor: DeployerAuthor | undefined;
    context: TaskContext;
}): Promise<DeployResponse> {
    const deployUrl = `${FDR_ORIGIN}/mcp-hosting/deploy`;
    context.logger.debug(`Deploying to ${deployUrl}`);

    // Deployer identity headers, sent exactly as docs publishing sends them.
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...getCodingAgentHeaders()
    };
    if (cliVersion != null) {
        headers["X-CLI-Version"] = cliVersion;
    }
    if (ciSource != null) {
        headers["X-CI-Source"] = JSON.stringify(ciSource);
        context.logger.debug(`CI source detected: ${ciSource.type} (${ciSource.repo ?? "unknown repo"})`);
    }
    if (deployerAuthor?.username != null) {
        headers["X-Deployer-Author"] = deployerAuthor.username;
    }
    if (deployerAuthor?.email != null) {
        headers["X-Deployer-Author-Email"] = deployerAuthor.email;
    }

    const contentRef = (file: BundleFile): { name: string; hash: string; contentType: string } => ({
        name: file.name,
        hash: file.hash,
        contentType: file.contentType
    });

    let res: Response;
    try {
        res = await fetch(deployUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                orgId,
                slug,
                mainModule: bundle.mainModule,
                compatibilityDate: bundle.compatibilityDate,
                compatibilityFlags: bundle.compatibilityFlags,
                modules: bundle.modules.map(contentRef),
                metadata: bundle.metadata,
                generatorName,
                generatorVersion,
                ...(cliVersion != null ? { cliVersion } : {}),
                ...(config != null ? { config } : {}),
                ...(git != null ? { git } : {}),
                ...(bundle.inputs.length > 0 ? { inputs: bundle.inputs.map(contentRef) } : {})
            })
        });
    } catch (error) {
        return context.failAndThrow(
            `Deploy failed — could not reach ${FDR_ORIGIN}: ${describeFetchError(error)}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }

    if (!res.ok) {
        const body = await res.text();
        const detail = describeServerError(body);
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
