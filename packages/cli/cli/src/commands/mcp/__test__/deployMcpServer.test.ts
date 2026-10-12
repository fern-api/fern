import { Logger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { createHash } from "crypto";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FDR_ORIGIN } from "../../docs-theme/themeOrigin.js";
import {
    deployHostedMcpServer,
    getModuleContentType,
    getSlugValidationError,
    getToolNameValidationErrors,
    isDeployableModuleFile,
    normalizeJsonc,
    suggestToolName
} from "../deployMcpServer.js";

describe("normalizeJsonc", () => {
    it("strips line and block comments from wrangler-style jsonc", () => {
        const jsonc = `{
  // the entry module
  "main": "index.mjs", /* inline */
  "compatibility_date": "2026-08-07"
}`;
        expect(JSON.parse(normalizeJsonc(jsonc))).toEqual({
            main: "index.mjs",
            compatibility_date: "2026-08-07"
        });
    });

    it("tolerates trailing commas in objects and arrays", () => {
        const jsonc = `{
  "main": "index.mjs",
  "compatibility_flags": ["nodejs_compat",],
}`;
        expect(JSON.parse(normalizeJsonc(jsonc))).toEqual({
            main: "index.mjs",
            compatibility_flags: ["nodejs_compat"]
        });
    });

    it("leaves slashes, escaped quotes, and commas inside strings alone", () => {
        const jsonc = `{"url": "https://example.com//path", "quote": "a \\" // not a comment", "csv": "a, }"}`;
        expect(JSON.parse(normalizeJsonc(jsonc))).toEqual({
            url: "https://example.com//path",
            quote: 'a " // not a comment',
            csv: "a, }"
        });
    });

    it("passes plain JSON through unchanged", () => {
        const json = `{"a": 1, "b": [true, null]}`;
        expect(normalizeJsonc(json)).toBe(json);
    });
});

describe("getSlugValidationError", () => {
    it("accepts valid slugs", () => {
        expect(getSlugValidationError("petstore", "The slug")).toBeUndefined();
        expect(getSlugValidationError("pet-store-2", "The slug")).toBeUndefined();
    });

    it("rejects empty and overlong values", () => {
        expect(getSlugValidationError("", "The slug")).toContain("1-30 characters");
        expect(getSlugValidationError("a".repeat(31), "The slug")).toContain("1-30 characters");
    });

    it("rejects uppercase, underscores, and doubled hyphens", () => {
        expect(getSlugValidationError("PetStore", "The slug")).toContain("lowercase");
        expect(getSlugValidationError("pet_store", "The slug")).toContain("lowercase");
        expect(getSlugValidationError("pet--store", "The slug")).toContain("lowercase");
        expect(getSlugValidationError("-petstore", "The slug")).toContain("lowercase");
    });
});

describe("getToolNameValidationErrors", () => {
    it("returns no errors for valid names, non-object metadata, and missing tools", () => {
        expect(getToolNameValidationErrors({ tools: [{ name: "get_pet" }] })).toEqual([]);
        expect(getToolNameValidationErrors(null)).toEqual([]);
        expect(getToolNameValidationErrors({ name: "petstore" })).toEqual([]);
    });

    it("flags overlong names with a method and path hint", () => {
        const name = "x".repeat(70);
        const [error] = getToolNameValidationErrors({
            tools: [{ name, method: "GET", path: "/attachments/{id}" }]
        });

        expect(error).toContain(
            `Tool name "${name}" is 70 characters; MCP tool names must be 1-64 characters of letters, digits, "_" or "-".`
        );
        expect(error).toContain(`$.paths['/attachments/{id}'].get`);
        expect(error).toContain("x-fern-mcp-name: x");
    });

    it("flags names containing disallowed characters", () => {
        const [error] = getToolNameValidationErrors({ tools: [{ name: "get.pet" }] });

        expect(error).toContain(
            'Tool name "get.pet" contains unsupported characters; MCP tool names must be 1-64 characters of letters, digits, "_" or "-".'
        );
        expect(error).toContain("x-fern-mcp-name: get_pet");
    });

    it("suggests an x-fern-mcp-name overlay for an operation", () => {
        const [error] = getToolNameValidationErrors({
            tools: [
                {
                    name: "get_attachment_point_attribute_mappings_attachment_point_form_type_id",
                    method: "GET",
                    path: "/AttachmentPoint/AttributeMappings/{attachmentPointFormTypeId}"
                }
            ]
        });

        expect(error).toContain("$.paths['/AttachmentPoint/AttributeMappings/{attachmentPointFormTypeId}'].get");
        expect(error).toContain("x-fern-mcp-name: get_attachment_point_attribute_mappings_attachment_point_form");
    });
});

describe("suggestToolName", () => {
    it("truncates the real overlong example at a separator", () => {
        expect(suggestToolName("get_attachment_point_attribute_mappings_attachment_point_form_type_id")).toBe(
            "get_attachment_point_attribute_mappings_attachment_point_form"
        );
    });

    it("replaces unsupported characters", () => {
        expect(suggestToolName("get.pet")).toBe("get_pet");
    });

    it("hard cuts names without separators", () => {
        expect(suggestToolName("x".repeat(70))).toBe("x".repeat(64));
    });

    it("falls back to tool when sanitization is empty", () => {
        expect(suggestToolName(".")).toBe("tool");
    });
});

describe("isDeployableModuleFile", () => {
    it("excludes the bundle descriptors, dotfiles, markdown, and the local runner", () => {
        expect(isDeployableModuleFile("metadata.json")).toBe(false);
        expect(isDeployableModuleFile("wrangler.jsonc")).toBe(false);
        expect(isDeployableModuleFile("catalog.json")).toBe(false);
        expect(isDeployableModuleFile("index.mjs")).toBe(false);
        expect(isDeployableModuleFile(".DS_Store")).toBe(false);
        expect(isDeployableModuleFile("README.md")).toBe(false);
    });

    it("includes module files", () => {
        expect(isDeployableModuleFile("engine.mjs")).toBe(true);
        expect(isDeployableModuleFile("catalog.js")).toBe(true);
        expect(isDeployableModuleFile("lib.wasm")).toBe(true);
    });
});

describe("getModuleContentType", () => {
    it("maps javascript modules, wasm, and everything else", () => {
        expect(getModuleContentType("index.mjs")).toBe("application/javascript+module");
        expect(getModuleContentType("index.js")).toBe("application/javascript+module");
        expect(getModuleContentType("lib.wasm")).toBe("application/wasm");
        expect(getModuleContentType("data.bin")).toBe("application/octet-stream");
    });
});

// ---------------------------------------------------------------------------
// deployHostedMcpServer: the command itself, with fetch mocked.
// ---------------------------------------------------------------------------

const ORG = "acme";
const UPLOAD_ORIGIN = "https://uploads.example.test";
const CONTENT_URL_PREFIX = `${FDR_ORIGIN}/v2/registry/content/${ORG}/`;
const DEPLOY_URL = `${FDR_ORIGIN}/mcp-hosting/deploy`;

const ENGINE_SOURCE = "export default { fetch() { return new Response('ok'); } };";
const WRANGLER_JSONC = `{
  // the Worker entrypoint
  "main": "engine.mjs",
  "compatibility_date": "2026-08-07",
  "compatibility_flags": ["nodejs_compat",],
}`;

const SPECS_TAR_GZ = Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x01, 0x02, 0x03, 0x04]);
const SDK_CONFIG_JSON = JSON.stringify({ toolsets: { read: ["get_pet"] } });
const BUILD_REQUEST_JSON = JSON.stringify({ protocolVersion: 1, apiName: "petstore", targets: [{ id: "mcp" }] });
const STANDARD_INPUTS: Record<string, Buffer | string> = {
    "specs.tar.gz": SPECS_TAR_GZ,
    "sdk-config.json": SDK_CONFIG_JSON,
    "build-request.json": BUILD_REQUEST_JSON
};

function sha256(content: Buffer | string): string {
    return createHash("sha256").update(content).digest("hex");
}

interface RecordedRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: unknown;
}

function requestUrl(input: string | URL | Request): string {
    if (typeof input === "string") {
        return input;
    }
    if (input instanceof URL) {
        return input.toString();
    }
    return input.url;
}

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Stands in for the registry and the presigned upload host. Every content
 * check answers `upload_required`; the deploy answers with `deployResponse`.
 */
function installFetchMock({
    deployResponse = jsonResponse(200, {
        slug: "mcp",
        activeDeploymentId: "dep-1",
        latestDeployment: { status: "active" },
        url: `https://${ORG}.fernmcp.dev/mcp`
    })
}: {
    deployResponse?: Response;
} = {}): RecordedRequest[] {
    const requests: RecordedRequest[] = [];
    vi.stubGlobal(
        "fetch",
        vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
            const url = requestUrl(input);
            requests.push({
                url,
                method: init?.method ?? "GET",
                headers: Object.fromEntries(new Headers(init?.headers).entries()),
                body: typeof init?.body === "string" ? JSON.parse(init.body) : init?.body
            });
            if (url.startsWith(CONTENT_URL_PREFIX)) {
                const hash = url.slice(CONTENT_URL_PREFIX.length);
                return jsonResponse(200, { status: "upload_required", uploadUrl: `${UPLOAD_ORIGIN}/${hash}` });
            }
            if (url.startsWith(`${UPLOAD_ORIGIN}/`)) {
                return new Response(null, { status: 200 });
            }
            if (url === DEPLOY_URL) {
                return deployResponse;
            }
            return jsonResponse(404, { message: `unexpected request: ${url}` });
        })
    );
    return requests;
}

function createTestLogger(): Logger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

function loggedMessages(logFunction: Logger["debug"]): string[] {
    return vi.mocked(logFunction).mock.calls.map((call) => call.join(" "));
}

const tempDirs: string[] = [];

async function writeBundle({
    inputs,
    moduleCount = 1,
    metadata = { name: "petstore", toolsets: {} }
}: {
    /** Files to write under `inputs/`; the directory is omitted when undefined. */
    inputs?: Record<string, Buffer | string>;
    /** Total Worker modules; the first is always `engine.mjs`. */
    moduleCount?: number;
    metadata?: Record<string, unknown>;
} = {}): Promise<string> {
    const dir = await mkdtemp(path.join(tmpdir(), "fern-mcp-deploy-test-"));
    tempDirs.push(dir);
    await writeFile(path.join(dir, "metadata.json"), JSON.stringify(metadata));
    await writeFile(path.join(dir, "wrangler.jsonc"), WRANGLER_JSONC);
    await writeFile(path.join(dir, "catalog.json"), "{}");
    await writeFile(path.join(dir, "index.mjs"), "// local stdio runner");
    await writeFile(path.join(dir, "README.md"), "# petstore");
    await writeFile(path.join(dir, "engine.mjs"), ENGINE_SOURCE);
    for (let index = 1; index < moduleCount; index++) {
        await writeFile(path.join(dir, `chunk-${index}.mjs`), `export const chunk = ${index};`);
    }
    if (inputs != null) {
        await mkdir(path.join(dir, "inputs"));
        for (const [name, content] of Object.entries(inputs)) {
            await writeFile(path.join(dir, "inputs", name), content);
        }
    }
    return dir;
}

type DeployArgs = Parameters<typeof deployHostedMcpServer>[0];

function deployArgs(bundleDir: string, logger: Logger, overrides: Partial<DeployArgs> = {}): DeployArgs {
    return {
        bundleDir,
        organization: ORG,
        slug: undefined,
        token: "fern-token",
        generatorName: "fernapi/fern-mcp-server",
        generatorVersion: "0.4.0",
        cliVersion: undefined,
        config: undefined,
        git: undefined,
        ciSource: undefined,
        deployerAuthor: undefined,
        context: createMockTaskContext({ logger }),
        ...overrides
    };
}

function contentChecks(requests: RecordedRequest[]): RecordedRequest[] {
    return requests.filter((request) => request.url.startsWith(CONTENT_URL_PREFIX));
}

function presignedUploads(requests: RecordedRequest[]): RecordedRequest[] {
    return requests.filter((request) => request.url.startsWith(`${UPLOAD_ORIGIN}/`));
}

function deployRequest(requests: RecordedRequest[]): RecordedRequest {
    const deploys = requests.filter((request) => request.url === DEPLOY_URL);
    const [deploy] = deploys;
    if (deploy == null || deploys.length !== 1) {
        throw new Error(`expected exactly one deploy request, saw ${deploys.length}`);
    }
    return deploy;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function deployBody(requests: RecordedRequest[]): Record<string, unknown> {
    const body = deployRequest(requests).body;
    if (!isRecord(body)) {
        throw new Error("deploy body is not a JSON object");
    }
    return body;
}

interface ContentRef {
    name: string;
    hash: string;
    contentType: string;
}

function isContentRef(value: unknown): value is ContentRef {
    return (
        isRecord(value) &&
        typeof value.name === "string" &&
        typeof value.hash === "string" &&
        typeof value.contentType === "string"
    );
}

/** The `inputs` (or `modules`) array of a deploy body, checked for shape. */
function contentRefs(body: Record<string, unknown>, key: "inputs" | "modules"): ContentRef[] {
    const value = body[key];
    if (!Array.isArray(value) || !value.every(isContentRef)) {
        throw new Error(`deploy body "${key}" is not an array of content references`);
    }
    return value;
}

function bytesOf(request: RecordedRequest | undefined): Buffer {
    if (!(request?.body instanceof Uint8Array)) {
        throw new Error("request body is not binary");
    }
    return Buffer.from(request.body);
}

function sortedByName<T extends { name: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

describe("deployHostedMcpServer", () => {
    afterEach(async () => {
        vi.unstubAllGlobals();
        await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
    });

    it("uploads modules and inputs to the content store and links them in the deploy body", async () => {
        const requests = installFetchMock();
        const logger = createTestLogger();
        const bundleDir = await writeBundle({ inputs: STANDARD_INPUTS });
        const config = { toolsets: ["read"], "auth-header": "X-Api-Key" };
        const git = { repoUrl: "https://github.com/acme/api", branch: "main", commitSha: "a".repeat(40) };

        const result = await deployHostedMcpServer(deployArgs(bundleDir, logger, { config, git }));

        expect(result).toEqual({ slug: "mcp", url: `https://${ORG}.fernmcp.dev/mcp`, deploymentStatus: "active" });

        // One check + one presigned upload per module and per input; nothing is bound to a file path.
        const checks = contentChecks(requests);
        expect(checks).toHaveLength(4);
        expect(presignedUploads(requests)).toHaveLength(4);
        expect(requests.filter((request) => request.url.includes("/v2/registry/files"))).toHaveLength(0);
        expect(requests.filter((request) => request.url.includes("mcp-servers"))).toHaveLength(0);

        const specsHash = sha256(SPECS_TAR_GZ);
        const specsCheck = checks.find((request) => request.url === `${CONTENT_URL_PREFIX}${specsHash}`);
        expect(specsCheck).toMatchObject({
            method: "PUT",
            headers: expect.objectContaining({ authorization: "Bearer fern-token" }),
            body: { contentType: "application/gzip", contentLength: SPECS_TAR_GZ.byteLength }
        });
        const specsUpload = presignedUploads(requests).find(
            (request) => request.url === `${UPLOAD_ORIGIN}/${specsHash}`
        );
        expect(specsUpload).toMatchObject({ method: "PUT", headers: { "content-type": "application/gzip" } });
        expect(bytesOf(specsUpload)).toEqual(SPECS_TAR_GZ);

        const body = deployBody(requests);
        expect(body.orgId).toBe(ORG);
        expect(body.slug).toBe("mcp");
        expect(body.mainModule).toBe("engine.mjs");
        expect(body.compatibilityFlags).toEqual(["nodejs_compat"]);
        expect(body.modules).toEqual([
            { name: "engine.mjs", hash: sha256(ENGINE_SOURCE), contentType: "application/javascript+module" }
        ]);
        expect(sortedByName(contentRefs(body, "inputs"))).toEqual([
            { name: "build-request.json", hash: sha256(BUILD_REQUEST_JSON), contentType: "application/json" },
            { name: "sdk-config.json", hash: sha256(SDK_CONFIG_JSON), contentType: "application/json" },
            { name: "specs.tar.gz", hash: specsHash, contentType: "application/gzip" }
        ]);
        expect(body.config).toEqual(config);
        expect(body.git).toEqual(git);
        expect(body.generatorName).toBe("fernapi/fern-mcp-server");
        expect(body.generatorVersion).toBe("0.4.0");
    });

    it("ignores unknown entries in inputs/", async () => {
        const requests = installFetchMock();
        const logger = createTestLogger();
        const bundleDir = await writeBundle({ inputs: { ...STANDARD_INPUTS, "notes.txt": "scratch" } });
        await mkdir(path.join(bundleDir, "inputs", "nested"));
        await writeFile(path.join(bundleDir, "inputs", "nested", "specs.tar.gz"), SPECS_TAR_GZ);

        await deployHostedMcpServer(deployArgs(bundleDir, logger));

        expect(contentChecks(requests)).toHaveLength(4);
        const inputs = contentRefs(deployBody(requests), "inputs");
        expect(sortedByName(inputs).map((input) => input.name)).toEqual([
            "build-request.json",
            "sdk-config.json",
            "specs.tar.gz"
        ]);
        const debugLines = loggedMessages(logger.debug);
        expect(debugLines.some((line) => line.includes("notes.txt"))).toBe(true);
        expect(debugLines.some((line) => line.includes("nested"))).toBe(true);
    });

    it("omits inputs, config, and git from the body when there is nothing to send", async () => {
        const requests = installFetchMock();
        const bundleDir = await writeBundle();

        await deployHostedMcpServer(deployArgs(bundleDir, createTestLogger(), { config: null }));

        expect(contentChecks(requests)).toHaveLength(1);
        const body = deployBody(requests);
        expect(body).not.toHaveProperty("inputs");
        expect(body).not.toHaveProperty("config");
        expect(body).not.toHaveProperty("git");
        expect(body).not.toHaveProperty("cliVersion");
    });

    it("deploys when optional local runner and catalog files are absent", async () => {
        const requests = installFetchMock();
        const bundleDir = await writeBundle();
        await rm(path.join(bundleDir, "index.mjs"));
        await rm(path.join(bundleDir, "catalog.json"));

        await deployHostedMcpServer(deployArgs(bundleDir, createTestLogger()));

        expect(deployRequest(requests)).toBeDefined();
    });

    it("rejects a bundle missing wrangler.jsonc", async () => {
        const requests = installFetchMock();
        const bundleDir = await writeBundle();
        const logger = createTestLogger();
        await rm(path.join(bundleDir, "wrangler.jsonc"));

        await expect(deployHostedMcpServer(deployArgs(bundleDir, logger))).rejects.toThrow();
        expect(loggedMessages(logger.error).join("\n")).toContain("The server bundle is missing wrangler.jsonc");
        expect(requests).toHaveLength(0);
    });

    it("does not count inputs toward the module budget", async () => {
        const requests = installFetchMock();
        const bundleDir = await writeBundle({ inputs: STANDARD_INPUTS, moduleCount: 20 });

        await deployHostedMcpServer(deployArgs(bundleDir, createTestLogger()));

        const body = deployBody(requests);
        expect(body.modules).toHaveLength(20);
        expect(body.inputs).toHaveLength(3);
    });

    it("still rejects a bundle with too many modules", async () => {
        const requests = installFetchMock();
        const logger = createTestLogger();
        const bundleDir = await writeBundle({ moduleCount: 21 });

        await expect(deployHostedMcpServer(deployArgs(bundleDir, logger))).rejects.toThrow();

        expect(loggedMessages(logger.error).join("\n")).toContain("1-20 module files (found 21)");
        expect(requests).toHaveLength(0);
    });

    it("rejects a bundle with an overlong tool name before uploading anything", async () => {
        const requests = installFetchMock();
        const logger = createTestLogger();
        const toolName = "x".repeat(65);
        const bundleDir = await writeBundle({
            metadata: { name: "petstore", toolsets: {}, tools: [{ name: toolName, method: "GET", path: "/x" }] }
        });

        await expect(deployHostedMcpServer(deployArgs(bundleDir, logger))).rejects.toThrow();

        expect(requests).toHaveLength(0);
        const errorText = loggedMessages(logger.error).join("\n");
        expect(errorText).toContain(toolName);
        expect(errorText).toContain("x-fern-mcp-name");
    });

    it("sends the CLI version, CI source, and deployer identity headers when known", async () => {
        const requests = installFetchMock();
        const bundleDir = await writeBundle();
        const ciSource = {
            type: "github" as const,
            repo: "acme/api",
            runId: "42",
            runUrl: "https://github.com/acme/api/actions/runs/42",
            commitSha: "b".repeat(40),
            branch: "main",
            actor: "alice"
        };

        await deployHostedMcpServer(
            deployArgs(bundleDir, createTestLogger(), {
                cliVersion: "3.2.1",
                ciSource,
                deployerAuthor: { username: "alice", email: "alice@example.com" }
            })
        );

        const { headers } = deployRequest(requests);
        expect(headers["x-cli-version"]).toBe("3.2.1");
        expect(JSON.parse(headers["x-ci-source"] ?? "null")).toEqual(ciSource);
        expect(headers["x-deployer-author"]).toBe("alice");
        expect(headers["x-deployer-author-email"]).toBe("alice@example.com");
        expect(headers.authorization).toBe("Bearer fern-token");
        expect(deployBody(requests).cliVersion).toBe("3.2.1");
    });

    it("sends only the deployer header it knows and none when nothing is known", async () => {
        const partial = installFetchMock();
        await deployHostedMcpServer(
            deployArgs(await writeBundle(), createTestLogger(), { deployerAuthor: { username: "bob" } })
        );
        const partialHeaders = deployRequest(partial).headers;
        expect(partialHeaders["x-deployer-author"]).toBe("bob");
        expect(partialHeaders).not.toHaveProperty("x-deployer-author-email");
        expect(partialHeaders).not.toHaveProperty("x-cli-version");
        expect(partialHeaders).not.toHaveProperty("x-ci-source");

        vi.unstubAllGlobals();
        const none = installFetchMock();
        await deployHostedMcpServer(deployArgs(await writeBundle(), createTestLogger()));
        const noneHeaders = deployRequest(none).headers;
        expect(Object.keys(noneHeaders).filter((name) => name.startsWith("x-"))).toEqual([]);
    });

    it("surfaces the server's detail on a 422 and says the previous deployment still serves", async () => {
        const hash = sha256(SPECS_TAR_GZ);
        const serverMessage = `Content for specs.tar.gz (${hash}) has not been uploaded. Call PUT /v2/registry/content/${ORG}/${hash} and upload the bytes first.`;
        installFetchMock({ deployResponse: jsonResponse(422, { message: serverMessage }) });
        const logger = createTestLogger();
        const bundleDir = await writeBundle({ inputs: STANDARD_INPUTS });

        await expect(deployHostedMcpServer(deployArgs(bundleDir, logger))).rejects.toThrow();

        const errorText = loggedMessages(logger.error).join("\n");
        expect(errorText).toContain(serverMessage);
        expect(errorText).toContain("that deployment is still serving");
    });

    it("prints each validation issue from a 400 deploy response", async () => {
        installFetchMock({
            deployResponse: jsonResponse(400, {
                defined: false,
                code: "BAD_REQUEST",
                status: 400,
                message: "Input validation failed",
                data: {
                    issues: [
                        {
                            code: "custom",
                            path: ["metadata", "toolsets", "default", 29],
                            message:
                                'tool name "get_attachment_point_attribute_mappings_attachment_point_form_type_id" must match /^[a-zA-Z0-9_-]{1,64}$/'
                        },
                        {
                            code: "custom",
                            path: ["metadata", "tools", 29, "name"],
                            message: 'tool name "..." must match /^[a-zA-Z0-9_-]{1,64}$/'
                        }
                    ]
                }
            })
        });
        const logger = createTestLogger();
        const bundleDir = await writeBundle();

        await expect(deployHostedMcpServer(deployArgs(bundleDir, logger))).rejects.toThrow();

        const errorText = loggedMessages(logger.error).join("\n");
        expect(errorText).toContain("Input validation failed");
        expect(errorText).toContain("must match /^[a-zA-Z0-9_-]{1,64}$/");
        expect(errorText).toContain("metadata.tools.29.name");
    });
});
