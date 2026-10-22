import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadAndExtractZipToDirectory } from "../RemoteTaskHandler.js";
import {
    buildSnippetsCreateRequest,
    decideSdkGenSnippetsUpload,
    isUploadSdkGenSnippetsEnabled,
    parseSdkSnippetsJson,
    readSnippetsJsonFromArtifact,
    SDK_SNIPPETS_JSON_PATH,
    UPLOAD_SDK_GEN_SNIPPETS_ENV_VAR,
    uploadSdkGenSnippets
} from "../uploadSdkGenSnippets.js";

vi.mock("../RemoteTaskHandler.js", () => ({ downloadAndExtractZipToDirectory: vi.fn() }));

const SNIPPETS_JSON = JSON.stringify({
    endpoints: {
        "/pet": { post: "client.pet.create()", put: "client.pet.update()" },
        "/pet/{petId}": { get: "client.pet.get()" }
    }
});

afterEach(() => {
    delete process.env[UPLOAD_SDK_GEN_SNIPPETS_ENV_VAR];
});

describe("isUploadSdkGenSnippetsEnabled", () => {
    it.each([
        ["true", true],
        [" TRUE ", true],
        ["false", false],
        ["1", false],
        ["", false]
    ])("reads %j as %s", (value, expected) => {
        process.env[UPLOAD_SDK_GEN_SNIPPETS_ENV_VAR] = value;
        expect(isUploadSdkGenSnippetsEnabled()).toBe(expected);
    });

    it("is off when the variable is unset", () => {
        expect(isUploadSdkGenSnippetsEnabled()).toBe(false);
    });
});

describe("decideSdkGenSnippetsUpload", () => {
    const target = {
        isPreview: false,
        language: "typescript",
        package: { packageName: "@acme/sdk" },
        version: "1.2.3"
    };

    it.each([
        ["typescript", { packageName: "@acme/sdk" }, { package: "@acme/sdk" }],
        ["python", { packageName: "acme" }, { package: "acme" }],
        ["csharp", { packageName: "Acme" }, { package: "Acme" }],
        ["ruby", { packageName: "acme" }, { gem: "acme" }],
        ["go", { modulePath: "https://github.com/acme/sdk-go" }, { githubRepo: "github.com/acme/sdk-go" }],
        ["go", { packageName: "github.com/acme/sdk-go" }, { githubRepo: "github.com/acme/sdk-go" }],
        ["java", { groupId: "com.acme", artifactId: "sdk" }, { group: "com.acme", artifact: "sdk" }]
    ])("files %s by its package", (language, pkg, sdk) => {
        expect(decideSdkGenSnippetsUpload({ ...target, language, package: pkg })).toEqual({
            upload: true,
            language,
            sdk,
            version: "1.2.3"
        });
    });

    it.each([
        ["a preview", { isPreview: true }, "preview generation"],
        ["no language", { language: undefined }, "generator has no language"],
        ["php", { language: "php" }, "FDR's snippet store does not accept php yet"],
        ["a missing package", { package: undefined }, "the sdk-config has no package name for typescript"],
        ["a blank package", { package: { packageName: "  " } }, "the sdk-config has no package name for typescript"],
        [
            "java without an artifact",
            { language: "java", package: { groupId: "com.acme" } },
            "the sdk-config has no package name for java"
        ],
        ["no version", { version: undefined }, "no SDK version was resolved"],
        ["an AUTO version", { version: "AUTO" }, "no SDK version was resolved"]
    ])("skips %s", (_name, change, reason) => {
        expect(decideSdkGenSnippetsUpload({ ...target, ...change })).toEqual({ upload: false, reason });
    });
});

describe("parseSdkSnippetsJson", () => {
    it("reads endpoints, upper-casing the methods", () => {
        expect(parseSdkSnippetsJson(SNIPPETS_JSON)).toEqual([
            { path: "/pet", method: "POST", code: "client.pet.create()" },
            { path: "/pet", method: "PUT", code: "client.pet.update()" },
            { path: "/pet/{petId}", method: "GET", code: "client.pet.get()" }
        ]);
    });

    it("reads endpoints nested under snippets", () => {
        expect(parseSdkSnippetsJson('{"snippets":{"endpoints":{"/a":{"delete":"x"}}}}')).toEqual([
            { path: "/a", method: "DELETE", code: "x" }
        ]);
    });

    it("drops methods the store cannot take and empty code", () => {
        const text = '{"endpoints":{"/a":{"options":"x","get":"  ","post":"ok","patch":3}}}';
        expect(parseSdkSnippetsJson(text)).toEqual([{ path: "/a", method: "POST", code: "ok" }]);
    });

    it.each(["{}", "[]", "null", '{"endpoints":[]}', '{"endpoints":{"/a":"nope"}}'])("finds nothing in %s", (text) => {
        expect(parseSdkSnippetsJson(text)).toEqual([]);
    });

    it("throws on text that is not JSON", () => {
        expect(() => parseSdkSnippetsJson("not json")).toThrow();
    });
});

describe("buildSnippetsCreateRequest", () => {
    const endpoints = [{ path: "/pet", method: "POST" as const, code: "CODE" }];
    const request = (language: string, sdk: Record<string, string>) =>
        buildSnippetsCreateRequest({
            organization: "acme",
            apiId: "petstore",
            language,
            sdk,
            version: "1.0.0",
            endpoints
        });

    it.each(["typescript", "go", "ruby", "csharp"])("sends %s with one client", (language) => {
        expect(request(language, { package: "p" })).toEqual({
            orgId: "acme",
            apiId: "petstore",
            snippets: {
                type: language,
                sdk: { package: "p", version: "1.0.0" },
                snippets: [{ endpoint: { path: "/pet", method: "POST" }, snippet: { client: "CODE" } }]
            }
        });
    });

    it.each(["python", "java"])("sends %s with the same snippet as the sync and async client", (language) => {
        expect(request(language, { package: "p" }).snippets.snippets).toEqual([
            { endpoint: { path: "/pet", method: "POST" }, snippet: { sync_client: "CODE", async_client: "CODE" } }
        ]);
    });
});

describe("readSnippetsJsonFromArtifact", () => {
    function extractInto(files: Record<string, string>) {
        vi.mocked(downloadAndExtractZipToDirectory).mockImplementation(async ({ outputPath }) => {
            for (const [name, content] of Object.entries(files)) {
                await mkdir(path.dirname(path.join(outputPath, name)), { recursive: true });
                await writeFile(path.join(outputPath, name), content);
            }
        });
    }

    it("reads the snippets file from the extracted SDK", async () => {
        extractInto({ "src/index.ts": "x", [SDK_SNIPPETS_JSON_PATH]: SNIPPETS_JSON });
        expect(await readSnippetsJsonFromArtifact("https://example.com/sdk.zip")).toBe(SNIPPETS_JSON);
        expect(downloadAndExtractZipToDirectory).toHaveBeenCalledWith(
            expect.objectContaining({ s3PreSignedReadUrl: "https://example.com/sdk.zip" })
        );
    });

    it("is undefined when the SDK has no snippets file", async () => {
        extractInto({ "src/index.ts": "x" });
        expect(await readSnippetsJsonFromArtifact("https://example.com/sdk.zip")).toBeUndefined();
    });

    it("rejects when the download fails", async () => {
        vi.mocked(downloadAndExtractZipToDirectory).mockRejectedValue(new Error("network down"));
        await expect(readSnippetsJsonFromArtifact("https://example.com/sdk.zip")).rejects.toThrow("network down");
    });
});

describe("uploadSdkGenSnippets", () => {
    const target = {
        token: "token",
        organization: "acme",
        apiId: "petstore",
        generatorName: "fernapi/fern-typescript-sdk",
        language: "typescript",
        package: { packageName: "@acme/sdk" },
        version: "1.2.3",
        artifactUrl: "https://example.com/sdk.zip",
        isPreview: false
    };

    function setup({
        enabled = true,
        snippetsJson = SNIPPETS_JSON,
        failure
    }: {
        enabled?: boolean;
        snippetsJson?: string | null;
        failure?: "download" | "create";
    } = {}) {
        const logger = { info: vi.fn(), warn: vi.fn() };
        const createSnippetsForSdk = vi.fn(async () => {
            if (failure === "create") {
                throw new Error("401 unauthorized");
            }
        });
        const readSnippetsJson = vi.fn(async () => {
            if (failure === "download") {
                throw new Error("network down");
            }
            return snippetsJson ?? undefined;
        });
        const dependencies = {
            isEnabled: () => enabled,
            readSnippetsJson,
            // The real client has many more members; the upload only uses `snippetsFactory`.
            createFdr: (() => ({ snippetsFactory: { createSnippetsForSdk } })) as never
        };
        const run = (change: Partial<typeof target> = {}) =>
            uploadSdkGenSnippets({ ...target, ...change, logger }, dependencies);
        return { logger, createSnippetsForSdk, readSnippetsJson, run };
    }

    it("does nothing and prints nothing while it is off", async () => {
        const { logger, readSnippetsJson, run } = setup({ enabled: false });
        await run();
        expect(readSnippetsJson).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("uploads the snippets of a successful target", async () => {
        const { logger, createSnippetsForSdk, run } = setup();
        await run();
        expect(createSnippetsForSdk).toHaveBeenCalledWith({
            orgId: "acme",
            apiId: "petstore",
            snippets: {
                type: "typescript",
                sdk: { package: "@acme/sdk", version: "1.2.3" },
                snippets: [
                    { endpoint: { path: "/pet", method: "POST" }, snippet: { client: "client.pet.create()" } },
                    { endpoint: { path: "/pet", method: "PUT" }, snippet: { client: "client.pet.update()" } },
                    { endpoint: { path: "/pet/{petId}", method: "GET" }, snippet: { client: "client.pet.get()" } }
                ]
            }
        });
        expect(logger.info).toHaveBeenCalledWith("Uploaded 3 typescript snippets to FDR (version 1.2.3)");
    });

    it.each([
        ["a preview", { isPreview: true }, "preview generation"],
        ["a language the store does not accept", { language: "php" }, "FDR's snippet store does not accept php yet"]
    ])("skips %s without reading the SDK", async (_name, change, reason) => {
        const { logger, readSnippetsJson, createSnippetsForSdk, run } = setup();
        await run(change);
        expect(readSnippetsJson).not.toHaveBeenCalled();
        expect(createSnippetsForSdk).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(reason));
    });

    it.each([
        ["has no snippets file", null, `the SDK has no ${SDK_SNIPPETS_JSON_PATH}`],
        ["has no endpoints", '{"endpoints":{}}', "has no endpoint snippets"]
    ])("skips when the SDK %s", async (_name, snippetsJson, reason) => {
        const { logger, createSnippetsForSdk, run } = setup({ snippetsJson });
        await run();
        expect(createSnippetsForSdk).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(reason));
    });

    it.each([
        ["the download fails", { failure: "download" as const }, "network down"],
        ["FDR rejects the upload", { failure: "create" as const }, "401 unauthorized"],
        ["the file is not JSON", { snippetsJson: "not json" }, "JSON"]
    ])("warns and resolves when %s", async (_name, options, message) => {
        const { logger, run } = setup(options);
        await expect(run()).resolves.toBeUndefined();
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining(message));
    });
});
