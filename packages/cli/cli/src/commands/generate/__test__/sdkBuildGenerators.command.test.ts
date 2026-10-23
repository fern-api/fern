import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateAPIWorkspaces } from "../generateAPIWorkspaces.js";
import {
    createTestCliContext,
    createTestProject,
    FAKE_FDR_ORIGIN,
    FakeFdr,
    FakeFiddle,
    type TestProject
} from "./commandHarness.js";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn(async () => ({ type: "organization" as const, value: "token" }))
}));

vi.mock("@fern-api/posthog-manager", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/posthog-manager")>()),
    getFeatureFlagClient: () => ({ isEnabled: async () => false, getCachedValue: () => undefined })
}));

// `fern generate --group`, run through the real command for SDKs built by Fern's generators (generators.yml), with only
// the network stubbed. These pin what the command does with snippets there, so a change to the SDK Config snippet path
// cannot alter it.

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

function generatorsYml({ config = '          packageName: "@acme/sdk"\n', snippets = "" } = {}): string {
    return `api:
  specs:
    - openapi: openapi/openapi.yml
groups:
  sdks:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 3.0.0
        config:
${config}${snippets}        output:
          location: local-file-system
          path: ./generated/typescript
`;
}

describe("fern generate --group (generators.yml)", { timeout: 60_000 }, () => {
    let testProject: TestProject | undefined;
    let fdr: FakeFdr;
    let fiddle: FakeFiddle;

    beforeEach(() => {
        vi.stubEnv("FERN_FDR_ORIGIN", FAKE_FDR_ORIGIN);
        vi.stubEnv("FERN_TOKEN", "token");
        fdr = new FakeFdr();
        fdr.install();
        fiddle = new FakeFiddle();
        fiddle.install(fdr);
    });

    afterEach(async () => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        await testProject?.cleanup();
        testProject = undefined;
    });

    async function run({
        generators = generatorsYml(),
        preview = false,
        version = "2.0.0"
    }: {
        generators?: string;
        preview?: boolean;
        version?: string;
    } = {}) {
        testProject = await createTestProject({
            "fern.config.json": '{"organization":"acme","version":"*"}',
            "openapi/openapi.yml": OPENAPI,
            "generators.yml": generators
        });
        const { cliContext, logs, logged } = createTestCliContext();
        await generateAPIWorkspaces({
            project: testProject.project,
            cliContext,
            version,
            groupNames: ["sdks"],
            targetNames: undefined,
            generatorName: undefined,
            generatorIndex: undefined,
            shouldLogS3Url: false,
            keepDocker: false,
            useLocalDocker: false,
            preview,
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
        return { logs, logged, directory: testProject.directory };
    }

    const dynamicIrUploadRequests = () =>
        fdr.to("POST /registry/api/sdk-dynamic-ir-upload-urls").map(({ body }) => body);

    it("hands the generator's job to Fiddle, with the version it was asked for", async () => {
        await run();

        expect(fiddle.jobs).toHaveLength(1);
        expect(fiddle.jobs[0]).toMatchObject({
            version: "2.0.0",
            organizationName: "acme",
            generators: [{ id: "fernapi/fern-typescript-sdk", version: "3.0.0" }]
        });
    });

    it("uploads the SDK's dynamic IR to FDR under its package and version", async () => {
        await run();

        expect(dynamicIrUploadRequests()).toEqual([
            { orgId: "acme", version: "2.0.0", snippetConfiguration: { typescript: "@acme/sdk" } }
        ]);
        expect(fdr.to("PUT https://s3.test/dynamic-ir/typescript")).toHaveLength(1);
    });

    it("files the dynamic IR under the version Fiddle reports, which AUTO versioning picks", async () => {
        fiddle.willFinish({ actualVersion: "3.1.4" });

        await run({ version: "AUTO" });

        expect(dynamicIrUploadRequests()).toEqual([
            { orgId: "acme", version: "3.1.4", snippetConfiguration: { typescript: "@acme/sdk" } }
        ]);
    });

    it("uploads no dynamic IR for a preview", async () => {
        await run({ preview: true });

        expect(dynamicIrUploadRequests()).toEqual([]);
    });

    it("uploads no dynamic IR when the generator names no package", async () => {
        const { logged } = await run({ generators: generatorsYml({ config: "          namespaceExport: Acme\n" }) });

        expect(dynamicIrUploadRequests()).toEqual([]);
        expect(logged("no package name could be resolved")).toBe(true);
    });

    it("warns, and still delivers the SDK, when FDR cannot give upload URLs", async () => {
        fdr.respond("POST /registry/api/sdk-dynamic-ir-upload-urls", new Error("registry down"));

        const { logged } = await run();

        expect(logged("Failed to get dynamic IR upload URLs")).toBe(true);
        expect(logged("Downloaded to")).toBe(true);
    });

    it("saves the snippet.json Fiddle produced to the path generators.yml names", async () => {
        fiddle.willFinish({ snippets: '{"endpoints":[]}' });

        const { directory } = await run({
            generators: generatorsYml({ snippets: "        snippets:\n          path: ./snippet.json\n" })
        });

        expect(await readFile(path.join(directory, "fern", "snippet.json"), "utf-8")).toBe('{"endpoints":[]}');
    });

    it("saves no snippet.json when generators.yml names no path", async () => {
        fiddle.willFinish({ snippets: '{"endpoints":[]}' });

        const { logged } = await run();

        expect(logged("snippet.json")).toBe(false);
    });

    describe("with FERN_UPLOAD_SDK_GEN_SNIPPETS=true", () => {
        it("still uploads the dynamic IR, and sends nothing to FDR's snippet store", async () => {
            vi.stubEnv("FERN_UPLOAD_SDK_GEN_SNIPPETS", "true");
            fiddle.willFinish({ snippets: '{"endpoints":{"/pet/{petId}":{"GET":"client.getPet()"}}}' });

            await run();

            expect(dynamicIrUploadRequests()).toHaveLength(1);
            expect(fdr.to("POST /snippets/create")).toEqual([]);
        });
    });
});
