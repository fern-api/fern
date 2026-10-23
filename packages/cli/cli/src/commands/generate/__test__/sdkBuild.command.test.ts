import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateAPIWorkspaces } from "../generateAPIWorkspaces.js";
import {
    createTestCliContext,
    createTestProject,
    FAKE_FDR_ORIGIN,
    FakeFdr,
    FakeSdkGenApi,
    type TestProject
} from "./commandHarness.js";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn(async () => ({ type: "organization" as const, value: "token" }))
}));

vi.mock("@fern-api/posthog-manager", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/posthog-manager")>()),
    getFeatureFlagClient: () => ({ isEnabled: async () => false, getCachedValue: () => undefined })
}));

const OPENAPI = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /pet/{petId}:
    get:
      operationId: getPet
      parameters:
        - { name: petId, in: path, required: true, schema: { type: string } }
      responses:
        "200": { description: ok }
`;

function sdkConfig(targets: string): string {
    return `schemaVersion: sdk-config/v1
sdkName: acme
sdkVersion: 1.0.0
source:
  specs:
    - id: pets
      type: openapi
      path: ./openapi/openapi.yml
docs:
  snippets:
    enabled: true
    format: json
targets:
${targets}`;
}

/** A files-delivery target; `packageYaml` is the indented body of its `package:` section. */
function target(language: string, packageYaml?: string): string {
    const pkg = packageYaml == null ? "" : `    package:\n${packageYaml}\n`;
    return `  - language: ${language}
${pkg}    output:
      delivery: files
      path: ./generated/${language}
`;
}

const TARGETS = {
    typescript: target("typescript", '      packageName: "@acme/sdk"'),
    python: target("python", "      packageName: acme-py"),
    java: target("java", "      groupId: com.acme\n      artifactId: sdk"),
    go: target("go", "      modulePath: github.com/acme/sdk-go"),
    ruby: target("ruby", "      packageName: acme-gem"),
    csharp: target("csharp", "      packageName: Acme.Sdk"),
    php: target("php", "      packageName: acme/sdk")
};

const SNIPPETS = JSON.stringify({ endpoints: { "/pet/{petId}": { GET: "client.pets.getPet(petId)" } } });

// Each run builds a real source archive and runtime bundle, which takes a couple of seconds.
describe("fern generate (sdk-config.yml)", { timeout: 180_000 }, () => {
    let testProject: TestProject | undefined;
    let fdr: FakeFdr;
    let sdkGenApi: FakeSdkGenApi;

    beforeEach(() => {
        vi.stubEnv("FERN_FDR_ORIGIN", FAKE_FDR_ORIGIN);
        vi.stubEnv("FERN_TOKEN", "token");
        fdr = new FakeFdr();
        fdr.install();
        sdkGenApi = new FakeSdkGenApi();
        sdkGenApi.install();
    });

    afterEach(async () => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        await testProject?.cleanup();
        testProject = undefined;
    });

    async function run({
        targets,
        ...options
    }: {
        targets: string;
        preview?: boolean;
        targetNames?: string[];
        version?: string;
    }) {
        testProject = await createTestProject({
            "fern.config.json": '{"organization":"acme","version":"*"}',
            "openapi/openapi.yml": OPENAPI,
            "sdk-config.yml": sdkConfig(targets)
        });
        const { cliContext, logs, logged } = createTestCliContext();
        await generateAPIWorkspaces({
            project: testProject.project,
            cliContext,
            version: options.version,
            groupNames: undefined,
            targetNames: options.targetNames,
            generatorName: undefined,
            generatorIndex: undefined,
            shouldLogS3Url: false,
            keepDocker: false,
            useLocalDocker: false,
            preview: options.preview ?? false,
            mode: undefined,
            force: true,
            runner: undefined,
            inspect: false,
            lfsOverride: undefined,
            sdkConfigPath: undefined,
            fernignorePath: undefined,
            skipFernignore: false,
            dynamicIrOnly: false,
            outputDir: undefined,
            noReplay: false,
            verify: false,
            retryRateLimited: false,
            requireEnvVars: true
        });
        return { logs, logged };
    }

    /** What the command sent to FDR's snippet store, one entry per SDK. */
    function uploads(): Array<Record<string, unknown>> {
        return fdr
            .to("POST /snippets/create")
            .map(({ body }) => (body as { snippets: Record<string, unknown> }).snippets);
    }

    describe("without the flag", () => {
        it("builds the SDK and sends nothing to FDR's snippet store", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS });

            const { logged } = await run({ targets: TARGETS.typescript });

            expect(logged("Downloaded to")).toBe(true);
            expect(fdr.requests).toEqual([]);
            expect(logged("snippets")).toBe(false);
        });
    });

    describe("with FERN_UPLOAD_SDK_GEN_SNIPPETS=true", () => {
        beforeEach(() => {
            vi.stubEnv("FERN_UPLOAD_SDK_GEN_SNIPPETS", "true");
        });

        it("files the snippets of the SDK under its package and version", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS });

            const { logged } = await run({ targets: TARGETS.typescript });

            expect(fdr.to("POST /snippets/create").map(({ body }) => body)).toEqual([
                {
                    orgId: "acme",
                    apiId: "api",
                    snippets: {
                        type: "typescript",
                        sdk: { package: "@acme/sdk", version: "1.0.0" },
                        snippets: [
                            {
                                endpoint: { path: "/pet/{petId}", method: "GET" },
                                snippet: { client: "client.pets.getPet(petId)" }
                            }
                        ]
                    }
                }
            ]);
            expect(logged("Uploaded 1 typescript snippets to FDR (version 1.0.0)")).toBe(true);
        });

        it("files each language the way the store names its packages", async () => {
            for (const language of Object.keys(TARGETS)) {
                sdkGenApi.willBuild(language, { snippets: SNIPPETS });
            }

            await run({ targets: Object.values(TARGETS).join("") });

            const sdks = Object.fromEntries(
                uploads().map(({ type, sdk, snippets }) => [
                    type,
                    { sdk, snippet: (snippets as Array<{ snippet: unknown }>)[0]?.snippet }
                ])
            );
            expect(sdks).toEqual({
                typescript: {
                    sdk: { package: "@acme/sdk", version: "1.0.0" },
                    snippet: { client: "client.pets.getPet(petId)" }
                },
                python: {
                    sdk: { package: "acme-py", version: "1.0.0" },
                    snippet: { sync_client: "client.pets.getPet(petId)", async_client: "client.pets.getPet(petId)" }
                },
                java: {
                    sdk: { group: "com.acme", artifact: "sdk", version: "1.0.0" },
                    snippet: { sync_client: "client.pets.getPet(petId)", async_client: "client.pets.getPet(petId)" }
                },
                go: {
                    sdk: { githubRepo: "github.com/acme/sdk-go", version: "1.0.0" },
                    snippet: { client: "client.pets.getPet(petId)" }
                },
                ruby: { sdk: { gem: "acme-gem", version: "1.0.0" }, snippet: { client: "client.pets.getPet(petId)" } },
                csharp: {
                    sdk: { package: "Acme.Sdk", version: "1.0.0" },
                    snippet: { client: "client.pets.getPet(petId)" }
                }
            });
        });

        it("skips a language the store does not take, and still delivers the SDK", async () => {
            sdkGenApi.willBuild("php", { snippets: SNIPPETS });

            const { logged } = await run({ targets: TARGETS.php });

            expect(logged("Skipped uploading php snippets to FDR: FDR's snippet store does not accept php yet")).toBe(
                true
            );
            expect(logged("Downloaded to")).toBe(true);
            expect(uploads()).toEqual([]);
        });

        it("skips a target whose sdk-config names no package", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS });

            const { logged } = await run({ targets: target("typescript") });

            expect(logged("the sdk-config has no package name for typescript")).toBe(true);
            expect(uploads()).toEqual([]);
        });

        it("skips a build that saved no snippets file", async () => {
            const { logged } = await run({ targets: TARGETS.typescript });

            expect(logged("the build saved no snippets file")).toBe(true);
            expect(uploads()).toEqual([]);
        });

        it("files the snippets under the version the build reports, not the one it was asked for", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS, actualVersion: "7.7.7" });

            await run({ targets: TARGETS.typescript });

            expect(uploads().map(({ sdk }) => sdk)).toEqual([{ package: "@acme/sdk", version: "7.7.7" }]);
        });

        it("files the snippets under the version --version asks for", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS });

            await run({ targets: TARGETS.typescript, version: "2.5.0" });

            expect(uploads().map(({ sdk }) => sdk)).toEqual([{ package: "@acme/sdk", version: "2.5.0" }]);
        });

        it("uploads only the targets --target selects", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS });
            sdkGenApi.willBuild("python", { snippets: SNIPPETS });

            await run({ targets: TARGETS.typescript + TARGETS.python, targetNames: ["python"] });

            expect(uploads().map(({ type }) => type)).toEqual(["python"]);
        });

        it("uploads nothing for a preview", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS });

            const { logged } = await run({ targets: TARGETS.typescript, preview: true });

            expect(logged("Skipped uploading typescript snippets to FDR: preview generation")).toBe(true);
            expect(uploads()).toEqual([]);
        });

        it("uploads nothing for a target whose build failed", async () => {
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS, failure: "generator crashed" });

            await run({ targets: TARGETS.typescript }).catch(() => undefined);

            expect(uploads()).toEqual([]);
        });

        it("warns, and still delivers the SDK, when FDR rejects the snippets", async () => {
            fdr.respond("POST /snippets/create", new Error("store down"));
            sdkGenApi.willBuild("typescript", { snippets: SNIPPETS });

            const { logged } = await run({ targets: TARGETS.typescript });

            expect(logged("Could not upload typescript snippets to FDR (the SDK is not affected)")).toBe(true);
            expect(logged("Downloaded to")).toBe(true);
        });
    });
});
