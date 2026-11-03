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

    describe("with snippets enabled in sdk-config.yml", () => {
        // The snippets reach the docs at `fern generate --docs`, which finds them in sdk-gen-api.
        it.each(Object.keys(TARGETS))("builds a %s SDK and sends nothing to FDR's snippet store", async (language) => {
            sdkGenApi.willBuild(language, { snippets: SNIPPETS });

            const { logged } = await run({ targets: TARGETS[language as keyof typeof TARGETS] });

            expect(logged("Downloaded to")).toBe(true);
            expect(fdr.requests).toEqual([]);
            expect(logged("snippets")).toBe(false);
        });
    });
});
