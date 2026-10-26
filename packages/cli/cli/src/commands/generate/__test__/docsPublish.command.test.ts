import type { APIV1Write } from "@fern-api/fdr-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateDocsWorkspace } from "../generateDocsWorkspace.js";
import {
    createTestCliContext,
    createTestProject,
    FAKE_FDR_ORIGIN,
    FakeFdr,
    FakeSdkGenApi,
    type TestProject
} from "./commandHarness.js";

type ApiDefinition = APIV1Write.ApiDefinition;

// `fern generate --docs`, run through the real command with only the network stubbed. These pin what the command does
// with the `snippets:` section of docs.yml, so a change to the SDK snippet path cannot alter what it did before.

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

const TYPESCRIPT_GENERATOR = `groups:
  sdks:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 3.0.0
        output:
          location: npm
          package-name: "@acme/sdk"
`;

function docsYml({ snippets = "", experimental = "" }: { snippets?: string; experimental?: string } = {}): string {
    return `instances:
  - url: acme.docs.buildwithfern.com
navigation:
  - api: API Reference
${snippets}${experimental}`;
}

const TYPESCRIPT_SNIPPETS = `    snippets:
      typescript:
        package: "@acme/sdk"
        version: 1.0.0
`;

const PYTHON_GENERATOR = `        output:
          location: pypi
          package-name: acme-py
`;

const PACKAGES: Record<string, string> = {
    typescript: '      packageName: "@acme/sdk"',
    python: "      packageName: acme-py",
    java: "      groupId: com.acme\n      artifactId: sdk",
    go: "      modulePath: github.com/acme/sdk-go",
    ruby: "      packageName: acme",
    csharp: "      packageName: Acme.Sdk",
    php: "      packageName: acme/sdk"
};

function sdkConfig(languages: string[]): string {
    const targets = languages
        .map(
            (language) => `  - language: ${language}
    package:
${PACKAGES[language]}
    output:
      delivery: files
      path: ./generated/${language}
`
        )
        .join("");
    return `schemaVersion: sdk-config/v1
sdkName: acme
sdkVersion: 1.0.0
source:
  specs:
    - id: pets
      type: openapi
      path: ./openapi/openapi.yml
targets:
${targets}`;
}

function fernProject({ docs, generators = TYPESCRIPT_GENERATOR }: { docs: string; generators?: string }) {
    return createTestProject({
        "fern.config.json": '{"organization":"acme","version":"*"}',
        "openapi/openapi.yml": OPENAPI,
        "generators.yml": `api:\n  specs:\n    - openapi: openapi/openapi.yml\n${generators}`,
        "docs.yml": docs
    });
}

/** A project whose SDKs come from sdk-config.yml (no generators.yml); the API is read from docs.yml. */
function sdkConfigProject({ snippets, languages = ["typescript"] }: { snippets: string; languages?: string[] }) {
    return createTestProject({
        "fern.config.json": '{"organization":"acme","version":"*"}',
        "openapi/openapi.yml": OPENAPI,
        "sdk-config.yml": sdkConfig(languages),
        "docs.yml": `instances:
  - url: acme.docs.buildwithfern.com
navigation:
  - api: API Reference
    specs:
      - type: openapi
        path: openapi/openapi.yml
${snippets}`
    });
}

describe("fern generate --docs", () => {
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

    async function run(project: Promise<TestProject>, options: { preview?: boolean } = {}) {
        testProject = await project;
        const { cliContext, logs, logged } = createTestCliContext();
        await generateDocsWorkspace({
            project: testProject.project,
            cliContext,
            instance: undefined,
            preview: options.preview ?? false,
            previewId: undefined,
            force: true,
            brokenLinks: false,
            strictBrokenLinks: false,
            disableTemplates: undefined,
            noPrompt: true,
            skipUpload: false
        });
        return { logs, logged };
    }

    /** What the command sent when it registered the API with FDR. */
    function registeredApi(): { definition: ApiDefinition; dynamicIRs?: Record<string, { dynamicIR: unknown }> } {
        const [request] = fdr.to("POST /registry/api/register");
        return request?.body as { definition: ApiDefinition; dynamicIRs?: Record<string, { dynamicIR: unknown }> };
    }

    describe("for SDKs built with generators.yml", () => {
        it("asks FDR whether the SDK's dynamic IR exists, by the package and version docs.yml names", async () => {
            await run(fernProject({ docs: docsYml({ snippets: TYPESCRIPT_SNIPPETS }) }));

            expect(fdr.to("POST /registry/api/check-sdk-dynamic-ir").map(({ body }) => body)).toEqual([
                { orgId: "acme", snippetConfiguration: { typescript: { packageName: "@acme/sdk", version: "1.0.0" } } }
            ]);
        });

        it("builds the SDK's dynamic IR from generators.yml when FDR has none, and registers it with the API", async () => {
            await run(fernProject({ docs: docsYml({ snippets: TYPESCRIPT_SNIPPETS }) }));

            expect(Object.keys(registeredApi().dynamicIRs ?? {})).toEqual(["typescript"]);
        });

        it("uploads the dynamic IR it built to the URL FDR gives for it", async () => {
            fdr.respond("POST /registry/api/register", {
                apiDefinitionId: "definition-1",
                dynamicIRs: { typescript: { uploadUrl: "https://s3.test/typescript" } }
            });

            await run(fernProject({ docs: docsYml({ snippets: TYPESCRIPT_SNIPPETS }) }));

            expect(fdr.to("PUT https://s3.test/typescript")).toHaveLength(1);
        });

        it("registers the SDK's stored dynamic IR instead of building one when FDR has it", async () => {
            fdr.respond("POST /registry/api/check-sdk-dynamic-ir", {
                existingDynamicIrs: { typescript: { downloadUrl: "https://s3.test/stored.json" } }
            });
            fdr.respond("GET https://s3.test/stored.json", { stored: true });

            await run(fernProject({ docs: docsYml({ snippets: TYPESCRIPT_SNIPPETS }) }));

            expect(registeredApi().dynamicIRs).toEqual({ typescript: { dynamicIR: { stored: true } } });
        });

        it("registers no dynamic IR when docs.yml turns dynamic snippets off", async () => {
            await run(
                fernProject({
                    docs: docsYml({
                        snippets: TYPESCRIPT_SNIPPETS,
                        experimental: "experimental:\n  dynamic-snippets: false\n"
                    })
                })
            );

            expect(fdr.to("POST /registry/api/check-sdk-dynamic-ir")).toEqual([]);
            expect(registeredApi().dynamicIRs).toBeUndefined();
        });

        it("registers no dynamic IR when docs.yml has no snippets section", async () => {
            await run(fernProject({ docs: docsYml() }));

            expect(fdr.to("POST /registry/api/check-sdk-dynamic-ir")).toEqual([]);
            expect(registeredApi().dynamicIRs).toBeUndefined();
        });

        it("asks FDR for the version when docs.yml names only the package", async () => {
            fdr.respond("POST /sdks/semantic-version/compute", { version: "2.3.4" });

            await run(fernProject({ docs: docsYml({ snippets: '    snippets:\n      typescript: "@acme/sdk"\n' }) }));

            expect(fdr.to("POST /sdks/semantic-version/compute").map(({ body }) => body)).toEqual([
                { language: "TypeScript", package: "@acme/sdk" }
            ]);
            expect(fdr.to("POST /registry/api/check-sdk-dynamic-ir").map(({ body }) => body)).toEqual([
                { orgId: "acme", snippetConfiguration: { typescript: { packageName: "@acme/sdk", version: "2.3.4" } } }
            ]);
        });

        it("warns, and registers no dynamic IR for the language, when no generator publishes the package", async () => {
            const { logs } = await run(
                fernProject({ docs: docsYml({ snippets: '    snippets:\n      python: "acme-py"\n' }) })
            );

            expect(logs).toContain("warn: Failed to upload python SDK snippets because of unknown package `acme-py`.");
            expect(registeredApi().dynamicIRs).toBeUndefined();
        });

        it("registers a dynamic IR for each language docs.yml names", async () => {
            await run(
                fernProject({
                    generators: `${TYPESCRIPT_GENERATOR}      - name: fernapi/fern-python-sdk
        version: 4.0.0
${PYTHON_GENERATOR}`,
                    docs: docsYml({
                        snippets: `    snippets:
      typescript:
        package: "@acme/sdk"
        version: 1.0.0
      python:
        package: acme-py
        version: 2.0.0
`
                    })
                })
            );

            expect(Object.keys(registeredApi().dynamicIRs ?? {}).sort()).toEqual(["python", "typescript"]);
        });

        it("publishes the same API registration in both deploy modes", async () => {
            vi.stubEnv("FERN_DOCS_DEPLOY_MODE", "legacy");
            await run(fernProject({ docs: docsYml({ snippets: TYPESCRIPT_SNIPPETS }) }));

            expect(fdr.to("POST /v2/registry/docs/register/registration-1")).toHaveLength(1);
            expect(fdr.to("POST /docs-ledger/register")).toEqual([]);
            expect(Object.keys(registeredApi().dynamicIRs ?? {})).toEqual(["typescript"]);
        });
    });

    describe("with FERN_UPLOAD_SDK_GEN_SNIPPETS=true", () => {
        const TYPESCRIPT_BUILD = {
            sdkName: "acme",
            version: "1.0.0",
            language: "typescript",
            snippets: JSON.stringify({ endpoints: { "/pet/{petId}": { GET: "client.pets.getPet(petId)" } } })
        };

        /** The code samples the command put on the example of the registered API's one endpoint. */
        function codeSamples(): Array<{ language: string; code: string }> {
            return registeredApi().definition.rootPackage.endpoints[0]?.examples[0]?.codeSamples ?? [];
        }

        beforeEach(() => {
            vi.stubEnv("FERN_UPLOAD_SDK_GEN_SNIPPETS", "true");
            sdkGenApi.hasBuilt(TYPESCRIPT_BUILD);
        });

        it("finds the SDK docs.yml names in sdk-gen-api, by the sdkName, version and language", async () => {
            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            const [request, ...others] = sdkGenApi.artifactListRequests;
            expect(others).toEqual([]);
            expect(request?.url.pathname).toBe("/v1/fern/artifacts");
            expect(Object.fromEntries(request?.url.searchParams ?? [])).toMatchObject({
                sdkName: "acme",
                version: "1.0.0",
                language: "typescript",
                status: "SUCCESS"
            });
            expect(request?.headers).toMatchObject({
                Authorization: "Bearer token",
                "X-Fern-Organization-Id": "acme"
            });
        });

        it("never asks FDR's snippet store for anything", async () => {
            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            expect(fdr.to("POST /snippets/load")).toEqual([]);
        });

        it("registers the code as a sample on the example of the endpoint with the same path and method", async () => {
            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            expect(codeSamples()).toEqual([{ language: "typescript", code: "client.pets.getPet(petId)" }]);
        });

        it("publishes the code in the API the default deploy mode uploads", async () => {
            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            const manifest = fdr.requests.find(
                (request) =>
                    request.method === "PUT" &&
                    request.url.startsWith("https://s3.test/blob/") &&
                    JSON.stringify(request.body ?? "").includes("client.pets.getPet(petId)")
            );
            expect(manifest).toBeDefined();
        });

        it("publishes the code in the legacy deploy mode too", async () => {
            vi.stubEnv("FERN_DOCS_DEPLOY_MODE", "legacy");

            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            expect(codeSamples()).toHaveLength(1);
            expect(fdr.to("POST /v2/registry/docs/register/registration-1")).toHaveLength(1);
        });

        it("adds the code of every language docs.yml names, php included, with one lookup for them all", async () => {
            const languages = ["typescript", "python", "java", "go", "ruby", "csharp", "php"];
            for (const language of languages) {
                sdkGenApi.hasBuilt({
                    sdkName: "acme",
                    version: "1.0.0",
                    language,
                    snippets: JSON.stringify({ endpoints: { "/pet/{petId}": { GET: `${language} code` } } })
                });
            }

            await run(
                sdkConfigProject({
                    languages,
                    snippets: `    snippets:
      typescript: { package: "@acme/sdk", version: 1.0.0 }
      python: { package: acme-py, version: 1.0.0 }
      java: { package: "com.acme:sdk", version: 1.0.0 }
      go: { package: "github.com/acme/sdk-go", version: 1.0.0 }
      ruby: { package: acme, version: 1.0.0 }
      csharp: { package: Acme.Sdk, version: 1.0.0 }
      php: { package: acme/sdk, version: 1.0.0 }
`
                })
            );

            expect(codeSamples().map(({ language, code }) => `${language}: ${code}`)).toEqual([
                "typescript: typescript code",
                "python: python code",
                "java: java code",
                "go: go code",
                "ruby: ruby code",
                "csharp: csharp code",
                "php: php code"
            ]);
            expect(sdkGenApi.artifactListRequests).toHaveLength(1);
        });

        it("uses the newest successful build of a language", async () => {
            sdkGenApi.hasBuilt({
                ...TYPESCRIPT_BUILD,
                snippets: JSON.stringify({ endpoints: { "/pet/{petId}": { GET: "newer code" } } })
            });
            sdkGenApi.hasBuilt({
                ...TYPESCRIPT_BUILD,
                status: "FAIL",
                snippets: JSON.stringify({ endpoints: { "/pet/{petId}": { GET: "failed build code" } } })
            });

            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            expect(codeSamples()).toEqual([{ language: "typescript", code: "newer code" }]);
        });

        it("looks nothing up for an entry docs.yml gives no version", async () => {
            await run(sdkConfigProject({ snippets: '    snippets:\n      typescript: "@acme/sdk"\n' }));

            expect(sdkGenApi.artifactListRequests).toEqual([]);
            expect(codeSamples()).toEqual([]);
        });

        it("says so, and publishes the docs, when no built SDK has the version docs.yml names", async () => {
            const { logged } = await run(
                sdkConfigProject({
                    snippets: '    snippets:\n      typescript:\n        package: "@acme/sdk"\n        version: 9.9.9\n'
                })
            );

            expect(logged("No built typescript SDK 9.9.9 with snippets was found")).toBe(true);
            expect(fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
            expect(codeSamples()).toEqual([]);
        });

        it("says so, and publishes the docs, when the build saved no snippets file", async () => {
            sdkGenApi.hasBuilt({ sdkName: "acme", version: "2.0.0", language: "typescript" });

            const { logged } = await run(
                sdkConfigProject({
                    snippets: '    snippets:\n      typescript:\n        package: "@acme/sdk"\n        version: 2.0.0\n'
                })
            );

            expect(logged("No built typescript SDK 2.0.0 with snippets was found")).toBe(true);
            expect(codeSamples()).toEqual([]);
        });

        it("still publishes the docs, and says so, when sdk-gen-api cannot list the builds", async () => {
            sdkGenApi.failArtifactList("sdk-gen-api down");

            const { logged } = await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            expect(logged('Could not find the snippets of SDK "acme" 1.0.0 in the sdk-gen-api')).toBe(true);
            expect(fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
            expect(codeSamples()).toEqual([]);
        });

        it("looks nothing up for a project built with generators.yml, which has no sdkName", async () => {
            await run(fernProject({ docs: docsYml({ snippets: TYPESCRIPT_SNIPPETS }) }));

            expect(sdkGenApi.artifactListRequests).toEqual([]);
            expect(codeSamples()).toEqual([]);
            expect(Object.keys(registeredApi().dynamicIRs ?? {})).toEqual(["typescript"]);
        });

        it("does the same for a preview", async () => {
            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }), { preview: true });

            expect(fdr.to("POST /docs-ledger/preview/init")).toHaveLength(1);
            expect(codeSamples()).toHaveLength(1);
        });
    });

    describe("without the flag", () => {
        it("asks sdk-gen-api and FDR's snippet store for nothing, and adds no code", async () => {
            sdkGenApi.hasBuilt({ sdkName: "acme", version: "1.0.0", language: "typescript", snippets: "{}" });

            await run(sdkConfigProject({ snippets: TYPESCRIPT_SNIPPETS }));

            expect(sdkGenApi.artifactListRequests).toEqual([]);
            expect(fdr.to("POST /snippets/load")).toEqual([]);
            expect(registeredApi().definition.rootPackage.endpoints[0]?.examples[0]?.codeSamples).toBeUndefined();
        });
    });
});
