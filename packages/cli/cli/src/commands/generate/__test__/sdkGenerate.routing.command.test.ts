import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    filesTarget,
    GenerateWorld,
    generate,
    generator,
    generatorsYml,
    localGenerator,
    OPENAPI,
    sdkConfigYml
} from "./sdkGenerateHarness.js";
import { featureFlags } from "./sdkGenerateMocks.js";

vi.mock("@fern-api/login", async () => (await import("./sdkGenerateMocks.js")).loginModule());
vi.mock("@fern-api/posthog-manager", async (importOriginal) =>
    (await import("./sdkGenerateMocks.js")).posthogModule(
        await importOriginal<typeof import("@fern-api/posthog-manager")>()
    )
);

// Which backend builds an SDK: Fiddle (generators.yml generators before their cutover version) or sdk-gen-api (SDK Config
// targets, generators from their cutover version, and the generators that only exist there), and what the command does
// when the routes disagree with the configuration.

const TS = "fernapi/fern-typescript-sdk";
const PY = "fernapi/fern-python-sdk";
const MCP = "fernapi/fern-mcp-server";

const project = (generators: string[], extra: Record<string, string> = {}): Record<string, string> => ({
    "openapi/openapi.yml": OPENAPI,
    "generators.yml": generatorsYml({ groups: { sdks: generators }, defaultGroup: "sdks" }),
    ...extra
});

describe("fern generate: routing between Fiddle and sdk-gen-api", { timeout: 120_000 }, () => {
    let world: GenerateWorld;

    beforeEach(async () => {
        world = new GenerateWorld();
        await world.setup();
        world.fiddle.willFinish({ files: { "from-fiddle.txt": "fiddle" } });
        world.sdkGenApi.willBuild("typescript", { files: { "from-sdk-gen-api.txt": "typescript" } });
        world.sdkGenApi.willBuild("python", { files: { "from-sdk-gen-api.txt": "python" } });
    });

    afterEach(() => world.teardown());

    const fiddleGenerators = (): string[] =>
        world.fiddle.requestBodies.map((body) => body.generators[0]?.id ?? "").sort();

    describe("a generators.yml generator before its SDK Config cutover", () => {
        const typescript = localGenerator(TS, "3.0.0", "./generated/typescript");

        it("goes to Fiddle when the use-sdk-gen-api flag is off", async () => {
            const result = await generate(world, { files: project([typescript]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([TS]);
            expect(world.sdkGenApi.builds).toEqual([]);
            expect(await result.generated("fern")).toEqual(["generated/typescript/from-fiddle.txt"]);
            // The flag is asked per generator and organization, with the generator's language.
            expect(featureFlags.isEnabled).toHaveBeenCalledWith("use-sdk-gen-api", {
                org: "acme",
                generator: TS,
                language: "typescript"
            });
        });

        it("goes to sdk-gen-api, as a runtime bundle, when the flag is on for the generator", async () => {
            featureFlags.isEnabled.mockImplementation(async (_flag, context) => context.generator === TS);
            const result = await generate(world, { files: project([typescript]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.submitted).toHaveLength(1);
            const [submitted] = world.sdkGenApi.submitted;
            expect(submitted).toMatchObject({
                language: "typescript",
                sdk: { name: "api", version: "1.0.0" },
                fernGenerator: { id: TS, version: "3.0.0" },
                payloadKind: "fern-runtime-bundle",
                requestedOutput: { type: "download" }
            });
            expect(world.sdkGenApi.builds[0]?.payloads.map((payload) => payload.filename)).toEqual([
                `${submitted?.targetId}.json.gz`
            ]);
            expect(await result.generated("fern")).toEqual(["generated/typescript/from-sdk-gen-api.txt"]);
            // The API is registered with FDR for this route, and the dynamic IR step has no package to file it under.
            expect(world.fdr.to("POST /registry/api/register")).toHaveLength(1);
        });

        it("sends generators.yml's own settings in the invocation, not an SDK Config document", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
            await generate(world, {
                files: project([
                    localGenerator(
                        TS,
                        "3.0.0",
                        "./generated/typescript",
                        "        config:\n          namespaceExport: Acme\n        smart-casing: false\n        disable-examples: true\n        keywords: [acme]\n"
                    )
                ]),
                args: { version: "1.0.0" }
            });

            expect(world.sdkGenApi.submitted[0]?.invocation).toMatchObject({
                customConfig: { namespaceExport: "Acme" },
                keywords: ["acme"],
                smartCasing: false,
                disableExamples: true
            });
        });

        it("goes to sdk-gen-api for every generator when FERN_USE_SDK_GEN_API=true, whatever the flag says", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
            const result = await generate(world, {
                files: project([typescript, localGenerator(PY, "4.0.0", "./generated/python")]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.submitted.map((submitted) => submitted.language).sort()).toEqual([
                "python",
                "typescript"
            ]);
            // Both generators of the group are one build.
            expect(world.sdkGenApi.builds).toHaveLength(1);
            expect(featureFlags.isEnabled).not.toHaveBeenCalled();
        });

        it("stays on Fiddle for every generator when FERN_USE_SDK_GEN_API=false, even if the flag is on", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "false");
            featureFlags.isEnabled.mockImplementation(async () => true);
            const result = await generate(world, { files: project([typescript]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([TS]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("splits one group between Fiddle and sdk-gen-api when the flag is on for only one generator", async () => {
            featureFlags.isEnabled.mockImplementation(async (_flag, context) => context.generator === PY);
            const result = await generate(world, {
                files: project([typescript, localGenerator(PY, "4.0.0", "./generated/python")]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([TS]);
            expect(world.sdkGenApi.submitted.map((submitted) => submitted.language)).toEqual(["python"]);
            expect(await result.generated("fern")).toEqual([
                "generated/python/from-sdk-gen-api.txt",
                "generated/typescript/from-fiddle.txt"
            ]);
        });

        it("fails, asking for --version, when sdk-gen-api is to build it and no version is known", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
            const result = await generate(world, { files: project([typescript]) });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                "Cannot submit SDK generation to sdk-gen-api: the SDK version could not be resolved. Pass one with --version (for example, --version 1.0.0)"
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("resolves 'latest' with sdk-gen-api's version discovery, and submits that exact version", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
            world.sdkGenApi.willDiscover({ compatibleVersion: "3.5.0" });
            const result = await generate(world, {
                files: project([localGenerator(TS, "latest", "./generated/typescript")]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.discoveryRequests).toEqual([
                {
                    targets: [
                        {
                            targetId: "generator",
                            generatorId: TS,
                            language: "typescript",
                            currentVersion: "latest",
                            includeMajor: true
                        }
                    ]
                }
            ]);
            expect(world.sdkGenApi.submitted[0]?.fernGenerator).toEqual({ id: TS, version: "3.5.0" });
        });

        it("fails when discovery has no version sdk-gen-api can run for 'latest'", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
            world.sdkGenApi.willDiscover({ unavailable: "VERSION_UNAVAILABLE" });
            const result = await generate(world, {
                files: project([localGenerator(TS, "latest", "./generated/typescript")]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                `SDK Gen API cannot resolve a latest executable version for ${TS} (VERSION_UNAVAILABLE)`
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("goes to Fiddle with version 'latest' when the flag is off", async () => {
            const result = await generate(world, {
                files: project([localGenerator(TS, "latest", "./generated/typescript")]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies[0]?.generators[0]).toMatchObject({ id: TS, version: "latest" });
            expect(world.sdkGenApi.discoveryRequests).toEqual([]);
        });
    });

    describe("falling back to Fiddle when sdk-gen-api cannot take the configuration", () => {
        beforeEach(() => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
        });

        it("says so, and uses Fiddle, for --verify with a download", async () => {
            const result = await generate(world, {
                files: project([localGenerator(TS, "3.0.0", "./generated/typescript")]),
                args: { version: "1.0.0", verify: true }
            });

            expect(result.failed).toBe(false);
            expect(result.warnings.join("\n")).toContain(
                `${TS} 3.0.0 will use legacy Fiddle generation instead of sdk-gen-api: verify=true is not implemented by sdk-gen-api for non-GitHub output`
            );
            expect(fiddleGenerators()).toEqual([TS]);
            expect(world.fiddle.requestBodies[0]?.verify).toBe(true);
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("says so, and uses Fiddle, for --skip-if-no-diff with a download", async () => {
            const result = await generate(world, {
                files: project([localGenerator(TS, "3.0.0", "./generated/typescript")]),
                args: { version: "1.0.0", skipIfNoDiff: true }
            });

            expect(result.failed).toBe(false);
            expect(result.warnings.join("\n")).toContain(
                "skipIfNoDiff=true is not implemented by sdk-gen-api for non-GitHub output"
            );
            expect(world.fiddle.requestBodies[0]?.skipIfNoDiff).toBe(true);
        });

        it("keeps --verify on sdk-gen-api for a GitHub output, and sends it with the delivery", async () => {
            world.sdkGenApi.willBuild("typescript", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-ts" },
                    output: {}
                }
            });
            const result = await generate(world, {
                files: project([generator(TS, "3.0.0", "        github:\n          repository: acme/sdk-ts\n")]),
                args: { version: "1.0.0", verify: true }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.submitted[0]?.requestedOutput).toEqual({
                type: "github",
                repository: "acme/sdk-ts",
                mode: "release",
                verify: true
            });
        });

        it("says so, and uses Fiddle, for a registry sdk-gen-api cannot publish to directly", async () => {
            vi.stubEnv("NUGET_KEY", "nuget-secret");
            const result = await generate(world, {
                files: project([
                    generator(
                        "fernapi/fern-csharp-sdk",
                        "2.0.0",
                        "        output:\n          location: nuget\n          package-name: Acme.Sdk\n          api-key: ${NUGET_KEY}\n"
                    )
                ]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(false);
            expect(result.warnings.join("\n")).toContain(
                "sdk-gen-api does not support direct nuget registry publication"
            );
            expect(fiddleGenerators()).toEqual(["fernapi/fern-csharp-sdk"]);
        });

        it("publishes to npm through sdk-gen-api, sending the token in the credentials file", async () => {
            vi.stubEnv("NPM_TOKEN", "npm-secret");
            const result = await generate(world, {
                files: project([
                    generator(
                        TS,
                        "3.0.0",
                        '        output:\n          location: npm\n          package-name: "@acme/sdk"\n          token: ${NPM_TOKEN}\n'
                    )
                ]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toEqual([]);
            const [build] = world.sdkGenApi.builds;
            expect(build?.request.targets[0]?.requestedOutput).toEqual({
                type: "publish",
                publish: { registry: "npm", url: "https://registry.npmjs.org" }
            });
            expect(build?.request.targets[0]?.package).toEqual({ packageName: "@acme/sdk" });
            expect(build?.credentials?.targets).toEqual([
                { targetId: build?.request.targets[0]?.targetId, registry: "npm", token: "npm-secret" }
            ]);
            expect(JSON.stringify(build?.request)).not.toContain("npm-secret");
        });

        it("hands a GitHub pull request to sdk-gen-api, with the reviewers", async () => {
            world.sdkGenApi.willBuild("python", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-py" },
                    output: { pullRequestUrl: "https://github.com/acme/sdk-py/pull/2" }
                }
            });
            const result = await generate(world, {
                files: project([
                    generator(
                        PY,
                        "4.0.0",
                        "        github:\n          repository: acme/sdk-py\n          mode: pull-request\n          reviewers:\n            users:\n              - name: alice\n"
                    )
                ]),
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.submitted[0]?.requestedOutput).toEqual({
                type: "github",
                repository: "acme/sdk-py",
                mode: "pull-request",
                reviewers: { users: ["alice"] }
            });
            expect(result.logged("Pull request: https://github.com/acme/sdk-py/pull/2")).toBe(true);
        });
    });

    describe("a generators.yml generator from its cutover version", () => {
        const typescript = localGenerator(TS, "4.0.0", "./generated/typescript");

        it("must use SDK Config: the command says to run fern sdk migrate", async () => {
            const result = await generate(world, { files: project([typescript]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                "Generator fernapi/fern-typescript-sdk 4.0.0 requires SDK Config v1"
            );
            expect(result.errors.join("\n")).toContain(
                "Run `fern sdk migrate`, then pass the generated document with `fern generate --sdk-config <path>`"
            );
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("does not go to Fiddle even when sdk-gen-api is turned off, and says what turned it off", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "false");
            const result = await generate(world, { files: project([typescript]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                `${TS} 4.0.0 requires sdk-gen-api generation, which FERN_USE_SDK_GEN_API=false turns off. Unset FERN_USE_SDK_GEN_API to generate it.`
            );
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("does not ask the flag about it: the version decides", async () => {
            await generate(world, { files: project([typescript]), args: { version: "1.0.0" } });

            expect(featureFlags.isEnabled).not.toHaveBeenCalled();
        });

        it("stops the whole group, including a sibling generator that is fine", async () => {
            const result = await generate(world, {
                files: project([typescript, localGenerator(PY, "4.0.0", "./generated/python")]),
                args: { version: "1.0.0" }
            });

            // The configuration is checked for every generator before any is started, so the group does not run at all.
            expect(result.failed).toBe(true);
            expect(world.fiddle.jobs).toEqual([]);
            expect(await result.generated("fern")).toEqual([]);
        });
    });

    describe("an SDK Config target", () => {
        const config = (language: string, extra = ""): Record<string, string> => ({
            "openapi/openapi.yml": OPENAPI,
            "sdk-config.yml": sdkConfigYml(filesTarget(language, extra))
        });

        it("always goes to sdk-gen-api, and never asks the flag", async () => {
            const result = await generate(world, { files: config("typescript") });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.builds).toHaveLength(1);
            expect(featureFlags.isEnabled).not.toHaveBeenCalled();
        });

        it("fails when FERN_USE_SDK_GEN_API=false turns sdk-gen-api off", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "false");
            const result = await generate(world, { files: config("typescript") });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                "SDK Config v1 generation requires the sdk-gen-api generation backend"
            );
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("asks sdk-gen-api for its newest generator when the target pins no generatorVersion", async () => {
            await generate(world, { files: config("typescript") });

            expect(world.sdkGenApi.submitted[0]?.fernGenerator).toEqual({ id: TS });
        });

        it("asks for the generator version the target pins", async () => {
            await generate(world, { files: config("typescript", "    generatorVersion: 4.2.0\n") });

            expect(world.sdkGenApi.submitted[0]?.fernGenerator).toEqual({ id: TS, version: "4.2.0" });
        });

        it("fails for a pinned version from before the cutover, when the file is the default sdk-config.yml", async () => {
            const result = await generate(world, { files: config("typescript", "    generatorVersion: 3.9.0\n") });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                "Generator fernapi/fern-typescript-sdk 3.9.0 requires legacy Fern configuration"
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails for the same version with a clearer message when the file is chosen with --sdk-config", async () => {
            const result = await generate(world, {
                files: config("typescript", "    generatorVersion: 3.9.0\n"),
                args: (directory) => ({ sdkConfigPath: `${directory}/fern/sdk-config.yml` })
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "--sdk-config cannot be used with fernapi/fern-typescript-sdk 3.9.0 because SDK Config support starts at 4.0.0. Use 4.0.0 or later, or remove --sdk-config and configure the pre-cutover generator in generators.yml."
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("does not check a pre-cutover target that --generator-index leaves out", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": sdkConfigYml(
                        filesTarget("typescript", "    generatorVersion: 3.9.0\n") +
                            filesTarget("python", "    generatorVersion: 6.0.0\n")
                    )
                },
                args: (directory) => ({ sdkConfigPath: `${directory}/fern/sdk-config.yml`, generatorIndex: 1 })
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.submitted.map((submitted) => submitted.fernGenerator)).toEqual([
                { id: PY, version: "6.0.0" }
            ]);
        });

        // NOTE: unlike every other SDK Config target, an mcp target is routed by the use-sdk-gen-api flag, and with the
        // flag off the error says the sdk-gen-api backend is required, not that the flag is off for this generator.
        it("builds an mcp target only when the flag is on for the MCP generator", async () => {
            const files = {
                "openapi/openapi.yml": OPENAPI,
                "sdk-config.yml": sdkConfigYml(filesTarget("typescript") + filesTarget("mcp"))
            };

            const flagOff = await generate(world, { files });
            expect(flagOff.failed).toBe(true);
            expect(flagOff.errors.join("\n")).toContain(
                `Cannot prepare sdk-gen-api target ${MCP}: SDK Config v1 generation requires the sdk-gen-api generation backend`
            );
            expect(world.sdkGenApi.builds).toEqual([]);

            featureFlags.isEnabled.mockImplementation(async (_flag, context) => context.generator === MCP);
            const flagOn = await generate(world, { files });
            expect(flagOn.failed).toBe(false);
            expect(world.sdkGenApi.builds).toHaveLength(1);
            expect(world.sdkGenApi.submitted.map((submitted) => submitted.language).sort()).toEqual([
                "mcp",
                "typescript"
            ]);
        });
    });

    describe("a generator that only sdk-gen-api runs (the MCP server)", () => {
        const mcp = localGenerator(MCP, "0.1.0", "./generated/mcp");

        it("fails, saying it is not enabled for the organization, when the flag is off", async () => {
            const result = await generate(world, { files: project([mcp]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                `${MCP} requires sdk-gen-api generation, which is not enabled for this generator in this organization (or the feature flag service could not be reached). Retry, or contact Fern support to enable it.`
            );
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails, saying what turned it off, when FERN_USE_SDK_GEN_API=false", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "false");
            const result = await generate(world, { files: project([mcp]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                `${MCP} requires sdk-gen-api generation, which FERN_USE_SDK_GEN_API=false turns off. Unset FERN_USE_SDK_GEN_API to generate it.`
            );
        });

        it("runs through sdk-gen-api, with an SDK Config built from generators.yml, when the flag is on", async () => {
            featureFlags.isEnabled.mockImplementation(async (_flag, context) => context.generator === MCP);
            const result = await generate(world, { files: project([mcp]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toEqual([]);
            const [submitted] = world.sdkGenApi.submitted;
            expect(submitted).toMatchObject({
                language: "mcp",
                sdk: { name: "api", version: "1.0.0" },
                fernGenerator: { id: MCP, version: "0.1.0" },
                payloadKind: "sdk-config-v1",
                requestedOutput: { type: "download" }
            });
            const document = JSON.parse(world.sdkGenApi.builds[0]?.payloads[0]?.body.toString("utf8") ?? "{}");
            expect(document.schemaVersion).toBe("sdk-config/v1");
            expect(document.targets).toHaveLength(1);
            expect(document.targets[0].language).toBe("mcp");
            // The flag is still asked for it: only the flag decides access to an sdk-gen-api-only generator.
            expect(featureFlags.isEnabled).toHaveBeenCalledWith("use-sdk-gen-api", {
                org: "acme",
                generator: MCP,
                language: "mcp"
            });
            expect(await result.generated("fern")).toEqual(["generated/mcp/README.md"]);
        });

        it("runs through sdk-gen-api when FERN_USE_SDK_GEN_API=true", async () => {
            vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
            const result = await generate(world, { files: project([mcp]), args: { version: "1.0.0" } });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.submitted.map((submitted) => submitted.language)).toEqual(["mcp"]);
        });

        it("cannot run locally", async () => {
            const result = await generate(world, {
                files: project([mcp]),
                args: { version: "1.0.0", useLocalDocker: true }
            });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                `${MCP} does not support --local. Remove --local to run this generator through the remote pipeline.`
            );
        });
    });

    describe("a generator the remote pipeline cannot run", () => {
        it("refuses a custom container image before starting anything", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": `api:
  specs:
    - openapi: openapi/openapi.yml
default-group: sdks
groups:
  sdks:
    generators:
      - image:
          name: acme/custom-generator
          registry: registry.acme.test
        version: 1.0.0
        output:
          location: local-file-system
          path: ./generated/custom
`
                },
                args: { version: "1.0.0" }
            });

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                "Custom image configurations are only supported with local generation (--local). The following generators use custom images: acme/custom-generator"
            );
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });
    });
});
