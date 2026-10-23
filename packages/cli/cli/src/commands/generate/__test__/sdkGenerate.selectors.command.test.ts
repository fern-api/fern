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

// The selectors of `fern generate` (--group, --target, --generator, --generator-index, --sdk-config), run end to end:
// what is asked of Fiddle and sdk-gen-api, and what lands on disk, for every selection.

const TS = "fernapi/fern-typescript-sdk";
const PY = "fernapi/fern-python-sdk";
const JAVA = "fernapi/fern-java-sdk";
const GO = "fernapi/fern-go-sdk";

const GENERATORS = generatorsYml({
    defaultGroup: "sdks",
    extra: `aliases:
  everything: [sdks, extra]
  broken: [sdks, nope]
`,
    groups: {
        sdks: [
            localGenerator(TS, "3.0.0", "./generated/sdks-typescript"),
            localGenerator(PY, "4.0.0", "./generated/sdks-python")
        ],
        extra: [localGenerator(JAVA, "3.0.0", "./generated/extra-java")]
    }
});

const SDK_CONFIG = sdkConfigYml(filesTarget("typescript") + filesTarget("python") + filesTarget("go"));

const PROJECT = {
    "openapi/openapi.yml": OPENAPI,
    "generators.yml": GENERATORS,
    "sdk-config.yml": SDK_CONFIG
};

describe("fern generate: selectors", { timeout: 120_000 }, () => {
    let world: GenerateWorld;

    beforeEach(async () => {
        world = new GenerateWorld();
        await world.setup();
        world.fiddle.willFinish({ files: { "from-fiddle.txt": "fiddle" } });
    });

    afterEach(() => world.teardown());

    const fiddleGenerators = (): string[] =>
        world.fiddle.requestBodies.map((body) => body.generators[0]?.id ?? "").sort();
    const builtLanguages = (): string[] => world.sdkGenApi.submitted.map((target) => target.language).sort();

    describe("--group", () => {
        it("runs the generators of the one group it names, and no sdk-config.yml target", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["extra"] } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([JAVA]);
            expect(world.sdkGenApi.builds).toEqual([]);
            expect(await result.generated("fern")).toEqual(["generated/extra-java/from-fiddle.txt"]);
        });

        it("runs every group when it is passed several times", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["sdks", "extra"] } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([JAVA, PY, TS].sort());
            expect(await result.generated("fern")).toEqual([
                "generated/extra-java/from-fiddle.txt",
                "generated/sdks-python/from-fiddle.txt",
                "generated/sdks-typescript/from-fiddle.txt"
            ]);
        });

        it("expands an alias to the groups it names", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["everything"] } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([JAVA, PY, TS].sort());
        });

        it("runs a group once when a group and an alias both name it", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: { groupNames: ["sdks", "everything", "sdks"] }
            });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([JAVA, PY, TS].sort());
        });

        it("uses default-group when none is passed, and says so", async () => {
            const result = await generate(world, {
                files: { "openapi/openapi.yml": OPENAPI, "generators.yml": GENERATORS }
            });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([PY, TS].sort());
            expect(result.logged("Using default group 'sdks' from generators.yml")).toBe(true);
        });

        it("fails, listing the groups and aliases, for a name that is neither", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["sdks", "nope"] } });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "'nope' is not a valid group or alias. Available groups: sdks, extra. Available aliases: everything, broken"
            );
            // Nothing runs, not even the valid group named before it.
            expect(world.fiddle.jobs).toEqual([]);
            expect(await result.generated("fern")).toEqual([]);
        });

        it("fails for an alias that names a group that does not exist", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["broken"] } });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "Group alias 'broken' references non-existent group 'nope'. Available groups: sdks, extra"
            );
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails, with a suggestion per group, when no group is passed and there is no default-group", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": generatorsYml({
                        groups: {
                            sdks: [localGenerator(TS, "3.0.0", "./generated/sdks-typescript")],
                            extra: [localGenerator(JAVA, "3.0.0", "./generated/extra-java")]
                        }
                    })
                }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain(
                'No group specified. Use the --group option, or set "default-group" in generators.yml:'
            );
            expect(result.failureMessage).toContain("sdks");
            expect(result.failureMessage).toContain("extra");
            expect(world.fiddle.jobs).toEqual([]);
        });

        // NOTE: with no flags, a generators.yml that has groups but no default-group aborts the whole command, so the
        // targets of a valid sdk-config.yml are not built either, although only the legacy half is misconfigured.
        it("also stops the sdk-config.yml targets when the default selection finds no default-group", async () => {
            const result = await generate(world, {
                files: {
                    "openapi/openapi.yml": OPENAPI,
                    "generators.yml": generatorsYml({
                        groups: { sdks: [localGenerator(TS, "3.0.0", "./generated/sdks-typescript")] }
                    }),
                    "sdk-config.yml": SDK_CONFIG
                }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("No group specified.");
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails before generating when one of several APIs lacks the group", async () => {
            const result = await generate(world, {
                files: {
                    "apis/pets/openapi/openapi.yml": OPENAPI,
                    "apis/pets/generators.yml": GENERATORS,
                    "apis/store/openapi/openapi.yml": OPENAPI,
                    "apis/store/generators.yml": generatorsYml({
                        groups: { web: [localGenerator(TS, "3.0.0", "./generated/web-typescript")] }
                    })
                },
                args: { groupNames: ["sdks"] }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("'sdks' is not a valid group or alias. Available groups: web");
            expect(world.fiddle.jobs).toEqual([]);
        });
    });

    describe("--target", () => {
        it("builds only the target it names, and no legacy group", async () => {
            const result = await generate(world, { files: PROJECT, args: { targetNames: ["python"] } });

            expect(result.failed).toBe(false);
            expect(builtLanguages()).toEqual(["python"]);
            expect(world.fiddle.jobs).toEqual([]);
            expect(await result.generated("fern")).toEqual(["generated/python/README.md"]);
        });

        it("builds each target it names, once, in one build", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: { targetNames: ["go", "typescript", "go"] }
            });

            expect(result.failed).toBe(false);
            expect(builtLanguages()).toEqual(["go", "typescript"]);
            expect(world.sdkGenApi.builds).toHaveLength(1);
        });

        it("builds both the legacy group and the target when --group is passed too", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: { groupNames: ["extra"], targetNames: ["go"] }
            });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([JAVA]);
            expect(builtLanguages()).toEqual(["go"]);
        });

        it("fails, listing the available targets, for a language the sdk-config.yml has no target for", async () => {
            const result = await generate(world, { files: PROJECT, args: { targetNames: ["python", "ruby"] } });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain(
                "SDK Config target 'ruby' not found. Available targets: typescript, python, go"
            );
            expect(world.sdkGenApi.builds).toEqual([]);
            expect(await result.generated("fern")).toEqual([]);
        });

        it("names every unknown target", async () => {
            const result = await generate(world, { files: PROJECT, args: { targetNames: ["ruby", "swift"] } });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("SDK Config targets 'ruby', 'swift' not found");
        });

        it("builds every target when the list is empty, without running the legacy group", async () => {
            const result = await generate(world, { files: PROJECT, args: { targetNames: [] } });

            expect(result.failed).toBe(false);
            expect(builtLanguages()).toEqual(["go", "python", "typescript"]);
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails, naming the API, when the API has no sdk-config.yml", async () => {
            const result = await generate(world, {
                files: { "openapi/openapi.yml": OPENAPI, "generators.yml": GENERATORS },
                args: { targetNames: ["typescript"] }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "No sdk-config.yml found for API 'default'. Use --sdk-config to select another file."
            );
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails, naming the API, when only one of several APIs has an sdk-config.yml", async () => {
            const result = await generate(world, {
                files: {
                    "apis/pets/openapi/openapi.yml": OPENAPI,
                    "apis/pets/generators.yml": GENERATORS,
                    "apis/pets/sdk-config.yml": SDK_CONFIG,
                    "apis/store/openapi/openapi.yml": OPENAPI,
                    "apis/store/generators.yml": GENERATORS
                },
                args: { targetNames: ["typescript"] }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "No sdk-config.yml found for API 'store'. Use --sdk-config to select another file."
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails when the project has no API workspace and no sdk-config.yml", async () => {
            const result = await generate(world, {
                files: { "docs.yml": "instances:\n  - url: acme.docs.buildwithfern.com\n" },
                args: { targetNames: ["typescript"] }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "No sdk-config.yml found. Use --sdk-config to select an SDK Config file."
            );
        });
    });

    describe("--generator and --generator-index on a legacy group", () => {
        it("runs the one generator of the group it names", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["sdks"], generatorName: PY } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([PY]);
            expect(await result.generated("fern")).toEqual(["generated/sdks-python/from-fiddle.txt"]);
        });

        it("runs the generator at the index", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["sdks"], generatorIndex: 0 } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([TS]);
        });

        it("prefers the index when both are passed", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: { groupNames: ["sdks"], generatorIndex: 1, generatorName: TS }
            });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([PY]);
        });

        it("filters the default group when no group is passed", async () => {
            const result = await generate(world, { files: PROJECT, args: { generatorName: TS } });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([TS]);
            expect(result.logged("Using default group 'sdks'")).toBe(true);
        });

        // NOTE: passing --generator without --group or --target skips sdk-config.yml, unlike the same command without
        // --generator, which builds the legacy default group and every sdk-config.yml target.
        it("does not build sdk-config.yml targets", async () => {
            await generate(world, { files: PROJECT, args: { generatorName: TS } });

            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails, listing the group's generators, for a name it does not have", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: { groupNames: ["sdks"], generatorName: JAVA }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                `Generator '${JAVA}' not found in group 'sdks'. Available generators: ${TS}, ${PY}`
            );
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails for an index past the end of the group", async () => {
            const result = await generate(world, { files: PROJECT, args: { groupNames: ["sdks"], generatorIndex: 2 } });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                "Generator index 2 is out of bounds in group 'sdks' (2 generators available)"
            );
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails, naming the group, when only one of several selected groups has the generator", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: { groupNames: ["sdks", "extra"], generatorName: TS }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain(`Generator '${TS}' not found in group 'extra'`);
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails, pointing to --group, when --target leaves no legacy group to filter", async () => {
            const byName = await generate(world, { files: PROJECT, args: { targetNames: ["go"], generatorName: TS } });

            expect(byName.failed).toBe(true);
            expect(byName.failureMessage).toBe(
                "--generator only filters generators in selected legacy groups. Add --group (and adjust --api if needed), or use --target to select an SDK Config target."
            );
            expect(world.sdkGenApi.builds).toEqual([]);

            const byIndex = await generate(world, { files: PROJECT, args: { targetNames: ["go"], generatorIndex: 0 } });
            expect(byIndex.failed).toBe(true);
            expect(byIndex.failureMessage).toContain("--generator only filters generators in selected legacy groups.");
        });

        it("fails the same way when the project has no API workspace for --generator to filter", async () => {
            const result = await generate(world, {
                files: { "docs.yml": "instances:\n  - url: acme.docs.buildwithfern.com\n" },
                args: { generatorName: TS }
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("--generator only filters generators in selected legacy groups.");
        });

        it("filters the legacy group, and leaves the --target selection alone, when --group and --target are both passed", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: { groupNames: ["sdks"], targetNames: ["go"], generatorName: PY }
            });

            expect(result.failed).toBe(false);
            expect(fiddleGenerators()).toEqual([PY]);
            expect(builtLanguages()).toEqual(["go"]);
        });
    });

    describe("--sdk-config with --generator or --generator-index (the SDK Config form)", () => {
        const args = (directory: string) => ({ sdkConfigPath: path.join(directory, "fern", "sdk-config.yml") });

        it("builds only the target whose generator it names, and no legacy group", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: (directory) => ({ ...args(directory), generatorName: PY })
            });

            expect(result.failed).toBe(false);
            expect(builtLanguages()).toEqual(["python"]);
            expect(world.fiddle.jobs).toEqual([]);
            expect(await result.generated("fern")).toEqual(["generated/python/README.md"]);
        });

        it("builds only the target at the index", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: (directory) => ({ ...args(directory), generatorIndex: 2 })
            });

            expect(result.failed).toBe(false);
            expect(builtLanguages()).toEqual(["go"]);
        });

        it("builds every target when neither is passed", async () => {
            const result = await generate(world, { files: PROJECT, args });

            expect(result.failed).toBe(false);
            expect(builtLanguages()).toEqual(["go", "python", "typescript"]);
            expect(world.fiddle.jobs).toEqual([]);
        });

        it("fails, listing the file's generators, for a generator it has no target for", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: (directory) => ({ ...args(directory), generatorName: JAVA })
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toBe(
                `SDK Config generator '${JAVA}' not found. Available generators: ${TS}, ${PY}, ${GO}`
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails for an index past the last target", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: (directory) => ({ ...args(directory), generatorIndex: 3 })
            });

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain(
                "Generator index 3 is out of range for SDK Config v1 targets (expected 0-2)"
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("refuses --generator together with --target, even with --sdk-config", async () => {
            const result = await generate(world, {
                files: PROJECT,
                args: (directory) => ({ ...args(directory), generatorName: TS, targetNames: ["go"] })
            });

            // --target wins over --generator for the SDK Config selection, so the filter can only reach legacy groups,
            // and with no --group none is selected.
            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("--generator only filters generators in selected legacy groups.");
        });

        // NOTE: --generator is applied to the legacy group and to the SDK Config file alike, so with --group and
        // --sdk-config together the name must exist in both, and when it does the two selections claim one language.
        it("applies the generator name to the legacy group as well, so it must exist in both", async () => {
            const missingInSdkConfig = await generate(world, {
                files: PROJECT,
                args: (directory) => ({ ...args(directory), groupNames: ["extra"], generatorName: JAVA })
            });
            expect(missingInSdkConfig.failed).toBe(true);
            expect(missingInSdkConfig.failureMessage).toContain(`SDK Config generator '${JAVA}' not found`);

            const inBoth = await generate(world, {
                files: PROJECT,
                args: (directory) => ({ ...args(directory), groupNames: ["sdks"], generatorName: PY })
            });
            expect(inBoth.failed).toBe(true);
            expect(inBoth.failureMessage).toContain("selects language 'python' from both legacy group 'sdks'");
            expect(world.fiddle.jobs).toEqual([]);
            expect(world.sdkGenApi.builds).toEqual([]);
        });
    });
});
