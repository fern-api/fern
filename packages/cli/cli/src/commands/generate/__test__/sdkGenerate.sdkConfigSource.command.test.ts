import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    filesTarget,
    GenerateWorld,
    generate,
    generatorsYml,
    localGenerator,
    OPENAPI,
    sdkConfigYml
} from "./sdkGenerateHarness.js";

vi.mock("@fern-api/login", async () => (await import("./sdkGenerateMocks.js")).loginModule());
vi.mock("@fern-api/posthog-manager", async (importOriginal) =>
    (await import("./sdkGenerateMocks.js")).posthogModule(
        await importOriginal<typeof import("@fern-api/posthog-manager")>()
    )
);

// `fern generate`, run for real, for every way a project can configure its SDKs: generators.yml, sdk-config.yml, both,
// an sdk-config.yml chosen with --sdk-config, generators.legacy.yml, the cli target, and several APIs. Only the network
// is replaced; what the command sends to Fiddle and sdk-gen-api, and what it writes to disk, is what these tests read.

const TS = "fernapi/fern-typescript-sdk";
const PY = "fernapi/fern-python-sdk";

const legacyTypescript = generatorsYml({
    groups: { sdks: [localGenerator(TS, "3.0.0", "./generated/legacy-typescript")] },
    defaultGroup: "sdks"
});
const legacyPython = generatorsYml({
    groups: { sdks: [localGenerator(PY, "4.0.0", "./generated/legacy-python")] },
    defaultGroup: "sdks"
});

describe("fern generate: where the configuration comes from", { timeout: 120_000 }, () => {
    let world: GenerateWorld;

    beforeEach(async () => {
        world = new GenerateWorld();
        await world.setup();
        world.fiddle.willFinish({ files: { "from-fiddle.txt": "fiddle" } });
        world.sdkGenApi.willBuild("typescript", { files: { "from-sdk-gen-api.txt": "typescript" } });
        world.sdkGenApi.willBuild("python", { files: { "from-sdk-gen-api.txt": "python" } });
    });

    afterEach(() => world.teardown());

    describe("generators.yml only", () => {
        it("runs the default group through Fiddle and nothing through sdk-gen-api", async () => {
            const result = await generate(world, {
                files: { "openapi/openapi.yml": OPENAPI, "generators.yml": legacyTypescript }
            });

            expect(result.failed).toBe(false);
            expect(
                world.fiddle.requestBodies.map((body) => body.generators.map(({ id, version }) => ({ id, version })))
            ).toEqual([[{ id: TS, version: "3.0.0" }]]);
            expect(world.sdkGenApi.builds).toEqual([]);
            expect(await result.list("fern/generated")).toEqual(["legacy-typescript/from-fiddle.txt"]);
            expect(result.logged("Using default group 'sdks' from generators.yml")).toBe(true);
        });
    });

    describe("sdk-config.yml only", () => {
        it("builds every target through sdk-gen-api, and runs no generators.yml group", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": sdkConfigYml(filesTarget("typescript") + filesTarget("python"))
                }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.submitted.map((target) => target.language).sort()).toEqual(["python", "typescript"]);
            expect(await result.list("fern/generated")).toEqual([
                "python/from-sdk-gen-api.txt",
                "typescript/from-sdk-gen-api.txt"
            ]);
            expect(await result.read("fern/generated/python/from-sdk-gen-api.txt")).toBe("python");
            expect(await result.read("fern/generated/typescript/from-sdk-gen-api.txt")).toBe("typescript");
        });

        it("sends the sdk-config.yml source and the target's own settings, not a generators.yml translation", async () => {
            await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": sdkConfigYml(
                        `  - language: typescript
    sdkName: acme-ts
    package:
      packageName: "@acme/sdk"
    output:
      delivery: files
      path: ./generated/typescript
`
                    )
                }
            });

            const [build] = world.sdkGenApi.builds;
            expect(build?.hasSources).toBe(true);
            expect(build?.request.targets).toHaveLength(1);
            expect(build?.request.targets[0]).toMatchObject({
                language: "typescript",
                sdk: { name: "acme-ts", version: "1.0.0" },
                fernGenerator: { id: TS },
                payloadKind: "sdk-config-v1",
                package: { packageName: "@acme/sdk" },
                requestedOutput: { type: "download" }
            });
            const payload = JSON.parse(build?.payloads[0]?.body.toString("utf8") ?? "{}");
            expect(payload).toMatchObject({ schemaVersion: "sdk-config/v1", sdkName: "acme" });
            expect(payload.targets).toHaveLength(1);
        });
    });

    describe("generators.yml and sdk-config.yml together", () => {
        it("runs the legacy default group AND the sdk-config targets when nothing is selected", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": legacyPython,
                    "sdk-config.yml": sdkConfigYml(filesTarget("typescript"))
                }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies.map((body) => body.generators[0]?.id)).toEqual([PY]);
            expect(world.sdkGenApi.submitted.map((target) => target.language)).toEqual(["typescript"]);
            expect(await result.list("fern/generated")).toEqual([
                "legacy-python/from-fiddle.txt",
                "typescript/from-sdk-gen-api.txt"
            ]);
        });

        it("fails before generating anything when both name the same language", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": legacyPython,
                    "sdk-config.yml": sdkConfigYml(filesTarget("python"))
                }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain(
                "API 'default' selects language 'python' from both legacy group 'sdks' and "
            );
            expect(result.failureMessage).toContain("sdk-config.yml. Remove one selector before generating.");
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
            expect(await result.list("fern/generated")).toEqual([]);
        });

        it("does not call two languages a conflict", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": legacyTypescript,
                    "sdk-config.yml": sdkConfigYml(filesTarget("python"))
                }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toHaveLength(1);
            expect(world.sdkGenApi.submitted).toHaveLength(1);
        });

        it("lets two sdk-config targets of one language coexist, and keeps their output apart", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": sdkConfigYml(
                        `  - language: python
    sdkName: acme-one
    output:
      delivery: files
  - language: python
    sdkName: acme-two
    output:
      delivery: files
`
                    )
                }
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.submitted.map((target) => target.sdk.name).sort()).toEqual(["acme-one", "acme-two"]);
            // The first duplicate is numbered 0.
            expect(await result.list("fern/generated")).toEqual([
                "python-0/from-sdk-gen-api.txt",
                "python-1/from-sdk-gen-api.txt"
            ]);
        });
    });

    describe("--sdk-config (an sdk-config.yml chosen by path)", () => {
        const files = {
            "openapi/openapi.yml": OPENAPI,
            "generators.yml": legacyPython,
            "sdk-config.yml": sdkConfigYml(filesTarget("python")),
            "internal-sdk-config.yml": sdkConfigYml(filesTarget("typescript"))
        };

        it("builds only that file's targets: neither the legacy group nor the default sdk-config.yml runs", async () => {
            const result = await generate(world, {
                files,
                args: (directory) => ({ sdkConfigPath: path.join(directory, "fern", "internal-sdk-config.yml") })
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.submitted.map((target) => target.language)).toEqual(["typescript"]);
            expect(await result.list("fern/generated")).toEqual(["typescript/from-sdk-gen-api.txt"]);
        });

        it("adds the legacy group when --group is also passed", async () => {
            const result = await generate(world, {
                files,
                args: (directory) => ({
                    sdkConfigPath: path.join(directory, "fern", "internal-sdk-config.yml"),
                    groupNames: ["sdks"]
                })
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies.map((body) => body.generators[0]?.id)).toEqual([PY]);
            expect(world.sdkGenApi.submitted.map((target) => target.language)).toEqual(["typescript"]);
            expect(await result.list("fern/generated")).toEqual([
                "legacy-python/from-fiddle.txt",
                "typescript/from-sdk-gen-api.txt"
            ]);
        });

        it("resolves a relative path against the working directory", async () => {
            const result = await generate(world, {
                files,
                cwd: "fern",
                args: { sdkConfigPath: "internal-sdk-config.yml" }
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.submitted.map((target) => target.language)).toEqual(["typescript"]);
        });

        it("fails, naming the file, when it does not exist", async () => {
            const result = await generate(world, {
                files,
                args: (directory) => ({ sdkConfigPath: path.join(directory, "fern", "missing-sdk-config.yml") })
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("missing-sdk-config.yml");
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails, naming the file, when it is not valid SDK Config", async () => {
            const result = await generate(world, {
                files: { ...files, "internal-sdk-config.yml": "schemaVersion: sdk-config/v1\nsdkName: acme\n" },
                args: (directory) => ({ sdkConfigPath: path.join(directory, "fern", "internal-sdk-config.yml") })
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("failed validation");
            expect(result.failureMessage).toContain("internal-sdk-config.yml");
            expect(world.sdkGenApi.builds).toEqual([]);
        });
    });

    describe("generators.legacy.yml", () => {
        it("is read as the generators configuration", async () => {
            const result = await generate(world, {
                files: { "openapi/openapi.yml": OPENAPI, "generators.legacy.yml": legacyTypescript }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies.map((body) => body.generators[0]?.id)).toEqual([TS]);
            expect(await result.list("fern/generated")).toEqual(["legacy-typescript/from-fiddle.txt"]);
        });

        it("cannot sit beside generators.yml: the project does not even load", async () => {
            await expect(
                generate(world, {
                    files: {
                        "openapi/openapi.yml": OPENAPI,
                        "generators.yml": legacyTypescript,
                        "generators.legacy.yml": legacyPython
                    }
                })
            ).rejects.toThrow("Keep only one active legacy generators configuration");
        });
    });

    describe("no configuration", () => {
        it("fails with guidance when the project has neither generators.yml nor sdk-config.yml", async () => {
            const result = await generate(world, {
                files: { "docs.yml": "instances:\n  - url: acme.docs.buildwithfern.com\n" }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "No generation configuration was selected. Check the --api selection and confirm the workspace contains generators.yml, generators.legacy.yml, or sdk-config.yml; use --group for a legacy group or --target for an SDK Config target."
            );
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });
    });

    describe("several APIs (apis/<name>)", () => {
        const files = {
            "apis/pets/openapi/openapi.yml": OPENAPI,
            "apis/pets/generators.yml": legacyPython,
            "apis/store/openapi/openapi.yml": OPENAPI,
            "apis/store/generators.yml": legacyTypescript
        };

        it("runs the default group of every API when none is selected", async () => {
            const result = await generate(world, { files });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies.map((body) => body.generators[0]?.id).sort()).toEqual([PY, TS].sort());
            expect(await result.generated("fern/apis")).toEqual([
                "pets/generated/legacy-python/from-fiddle.txt",
                "store/generated/legacy-typescript/from-fiddle.txt"
            ]);
        });

        it("runs only the API --api selects", async () => {
            const result = await generate(world, { files, api: "store" });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies.map((body) => body.generators[0]?.id)).toEqual([TS]);
            expect(await result.generated("fern/apis")).toEqual(["store/generated/legacy-typescript/from-fiddle.txt"]);
        });

        it("fails when --api names an API that does not exist", async () => {
            await expect(generate(world, { files, api: "missing" })).rejects.toThrow();
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("reads each API's own sdk-config.yml", async () => {
            const result = await generate(world, {
                files: {
                    ...files,
                    "apis/pets/sdk-config.yml": sdkConfigYml(filesTarget("go")),
                    "apis/store/sdk-config.yml": sdkConfigYml(filesTarget("java"))
                }
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.submitted.map((target) => target.language).sort()).toEqual(["go", "java"]);
            expect(await result.generated("fern/apis")).toEqual([
                "pets/generated/go/README.md",
                "pets/generated/legacy-python/from-fiddle.txt",
                "store/generated/java/README.md",
                "store/generated/legacy-typescript/from-fiddle.txt"
            ]);
        });

        it("rejects --sdk-config when several APIs are selected, without generating", async () => {
            const result = await generate(world, {
                files: {
                    ...files,
                    "apis/pets/sdk-config.yml": sdkConfigYml(filesTarget("go")),
                    "apis/store/sdk-config.yml": sdkConfigYml(filesTarget("java"))
                },
                args: (directory) => ({ sdkConfigPath: path.join(directory, "elsewhere", "sdk-config.yml") })
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "--sdk-config selects one file, but 2 API workspaces are selected. Use --api to select exactly one API."
            );
            expect(world.sdkGenApi.builds).toEqual([]);
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("accepts --sdk-config for the one API --api selects", async () => {
            const result = await generate(world, {
                files: { ...files, "apis/store/sdk-config.yml": sdkConfigYml(filesTarget("java")) },
                api: "store",
                args: (directory) => ({
                    sdkConfigPath: path.join(directory, "fern", "apis", "store", "sdk-config.yml")
                })
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.submitted.map((target) => target.language)).toEqual(["java"]);
        });

        it("keeps the same language in two APIs apart: ownership is checked per API", async () => {
            const result = await generate(world, {
                files: {
                    "apis/pets/openapi/openapi.yml": OPENAPI,
                    "apis/pets/generators.yml": legacyPython,
                    "apis/store/openapi/openapi.yml": OPENAPI,
                    "apis/store/generators.yml": legacyPython
                }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.jobs).toHaveLength(2);
        });

        it("fails when the same language is claimed by generators.yml and sdk-config.yml of one API", async () => {
            const result = await generate(world, {
                files: { ...files, "apis/pets/sdk-config.yml": sdkConfigYml(filesTarget("python")) }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain(
                "API 'pets' selects language 'python' from both legacy group 'sdks'"
            );
            expect(world.fiddle.jobs).toEqual([]);
        });
    });

    describe("the cli target", () => {
        const cliConfig = sdkConfigYml(
            `  - language: cli
    package:
      packageName: acme-cli
    output:
      delivery: files
      path: ./generated/cli
`
        );

        it("is translated to a fern-cli-generator group and generated through Fiddle, not sdk-gen-api", async () => {
            const result = await generate(world, {
                files: { "openapi/openapi.yml": OPENAPI, "sdk-config.yml": cliConfig }
            });

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.builds).toEqual([]);
            const [job] = world.fiddle.requestBodies;
            expect(job?.generators[0]).toMatchObject({ id: "fernapi/fern-cli-generator", version: "latest" });
            expect(job?.version).toBe("1.0.0");
            expect(await result.list("fern/generated")).toEqual(["cli/from-fiddle.txt"]);
        });

        it("is generated beside the SDK Config targets that other generators build", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": sdkConfigYml(
                        `  - language: cli
    package:
      packageName: acme-cli
    output:
      delivery: files
      path: ./generated/cli
${filesTarget("typescript")}`
                    )
                }
            });

            expect(result.failed).toBe(false);
            expect(world.fiddle.requestBodies.map((body) => body.generators[0]?.id)).toEqual([
                "fernapi/fern-cli-generator"
            ]);
            expect(world.sdkGenApi.submitted.map((target) => target.language)).toEqual(["typescript"]);
        });

        it("counts as owned by sdk-config.yml, so a generators.yml group cannot claim cli too", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": generatorsYml({
                        groups: {
                            sdks: [localGenerator("fernapi/fern-cli-generator", "0.54.3", "./generated/legacy-cli")]
                        },
                        defaultGroup: "sdks"
                    }),
                    "sdk-config.yml": cliConfig
                }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("selects language 'cli' from both");
        });

        it("fails, listing every problem, when the target cannot be translated, and generates nothing", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "sdk-config.yml": `schemaVersion: sdk-config/v1
sdkName: acme
source:
  specs:
    - id: pets
      type: openapi
      url: https://example.com/openapi.yml
targets:
  - language: cli
    package:
      packageName: acme-cli
    output:
      delivery: files
      path: ./generated/cli
`
                }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("The cli target in ");
            expect(result.failureMessage).toContain("cannot be generated:");
            expect(result.failureMessage).toContain("[error] [CLI_TARGET_URL_SOURCE]");
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });
    });
});
