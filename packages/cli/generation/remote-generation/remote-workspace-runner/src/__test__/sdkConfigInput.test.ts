import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prepareFernSdkGenApiRoutes, resolveSdkConfigForGeneration } from "../runRemoteGenerationForAPIWorkspace.js";
import { assertSdkConfigRemoteGeneration, getSdkConfigPackage, loadSdkConfigInput } from "../sdkConfigInput.js";

describe("SDK Config input", () => {
    let temporaryDirectory: AbsoluteFilePath;
    let invocationCwd: AbsoluteFilePath;
    let projectRoot: AbsoluteFilePath;

    beforeEach(async () => {
        temporaryDirectory = AbsoluteFilePath.of(
            await mkdtemp(join(AbsoluteFilePath.of(tmpdir()), RelativeFilePath.of("fern-sdk-config-")))
        );
        invocationCwd = join(temporaryDirectory, RelativeFilePath.of("invocation"));
        projectRoot = join(temporaryDirectory, RelativeFilePath.of("project"));
        await mkdir(invocationCwd, { recursive: true });
        await mkdir(projectRoot, { recursive: true });
    });

    afterEach(async () => {
        await rm(temporaryDirectory, { recursive: true, force: true });
    });

    it("prefers an explicit path resolved from the invocation directory", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), validConfig("python"));
        await writeFile(join(invocationCwd, RelativeFilePath.of("chosen.yml")), validConfig("typescript"));

        const loaded = await loadSdkConfigInput({
            explicitPath: "chosen.yml",
            invocationCwd,
            projectRoot
        });

        expect(loaded?.absolutePath).toBe(join(invocationCwd, RelativeFilePath.of("chosen.yml")));
        expect(loaded?.config.targets.map((target) => target.language)).toEqual(["typescript"]);
    });

    it("does not fall back to auto-discovery when an explicit path is missing", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), validConfig("typescript"));

        await expect(loadSdkConfigInput({ explicitPath: "missing.yml", invocationCwd, projectRoot })).rejects.toThrow(
            `SDK Config file not found at ${join(invocationCwd, RelativeFilePath.of("missing.yml"))}`
        );
    });

    it("returns undefined when the auto-discovered file is absent", async () => {
        await expect(loadSdkConfigInput({ invocationCwd, projectRoot })).resolves.toBeUndefined();
    });

    it.each([
        ["malformed YAML", "targets: ["],
        ["invalid schema", "schemaVersion: sdk-config/v1\n"]
    ])("reports %s as an actionable configuration error", async (_name, contents) => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), contents);

        await expect(loadSdkConfigInput({ invocationCwd, projectRoot })).rejects.toThrow(
            "Fix the file or regenerate it with `fern sdk migrate --output <path>`"
        );
    });

    it("serializes the validated sparse document without parsed defaults", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), validConfig("typescript"));

        const loaded = await loadSdkConfigInput({ invocationCwd, projectRoot });

        expect(loaded).toBeDefined();
        expect(JSON.parse(loaded?.body.toString("utf8") ?? "null")).toEqual({
            schemaVersion: "sdk-config/v1",
            sdkName: "Acme SDK",
            source: { specs: [{ id: "api", type: "openapi", path: "./openapi.yml" }] },
            output: { delivery: "zip" },
            targets: [{ language: "typescript" }]
        });
        expect(loaded?.config.sdkVersion).toBe("1.0.0");
    });

    it("uses parsed root and target package metadata without changing payload bytes", async () => {
        await writeFile(
            join(projectRoot, RelativeFilePath.of("sdk-config.yml")),
            `schemaVersion: sdk-config/v1
sdkName: Acme SDK
source:
  specs:
    - id: api
      type: openapi
      path: ./openapi.yml
package:
  moduleName: Acme
  namespace: Root
output:
  delivery: zip
targets:
  - language: typescript
    package:
      namespace: Target
`
        );
        const loaded = await loadSdkConfigInput({ invocationCwd, projectRoot });

        expect(loaded == null ? undefined : getSdkConfigPackage(loaded, "typescript")).toEqual({
            moduleName: "Acme",
            namespace: "Target"
        });
    });

    it("rejects explicit SDK Config for local generation", () => {
        expect(() => assertSdkConfigRemoteGeneration("sdk-config.yml", true)).toThrow(
            "only supported for remote generation"
        );
        expect(() => assertSdkConfigRemoteGeneration(undefined, true)).not.toThrow();
        expect(() => assertSdkConfigRemoteGeneration("sdk-config.yml", false)).not.toThrow();
    });

    it("does not auto-load a discovered file for below-cutover targets", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), "targets: [");

        await expect(
            resolveSdkConfigForGeneration({
                generators: [generator("3.999.999")],
                enabled: true,
                sdkConfigInput: { invocationCwd, projectRoot },
                requireEnvVars: true,
                isPreview: false
            })
        ).resolves.toBeUndefined();
    });

    it("auto-loads a discovered file for a cutover target, including an environment-resolved version", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), validConfig("typescript"));
        process.env.FERN_TEST_SDK_CONFIG_VERSION = "4.0.0";

        try {
            const loaded = await resolveSdkConfigForGeneration({
                generators: [generator("${FERN_TEST_SDK_CONFIG_VERSION}")],
                enabled: true,
                sdkConfigInput: { invocationCwd, projectRoot },
                requireEnvVars: true,
                isPreview: false
            });

            expect(loaded?.absolutePath).toBe(join(projectRoot, RelativeFilePath.of("sdk-config.yml")));
        } finally {
            delete process.env.FERN_TEST_SDK_CONFIG_VERSION;
        }
    });

    it("does not auto-load SDK Config when SDK Gen API routing is disabled", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), "targets: [");

        await expect(
            resolveSdkConfigForGeneration({
                generators: [generator("4.0.0")],
                enabled: false,
                sdkConfigInput: { invocationCwd, projectRoot },
                requireEnvVars: true,
                isPreview: false
            })
        ).resolves.toBeUndefined();
    });

    it("routes mixed groups without changing below-cutover payloads", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), validConfig("typescript"));
        const loaded = await loadSdkConfigInput({ invocationCwd, projectRoot });
        const results = prepareFernSdkGenApiRoutes({
            generators: [generator("3.999.999"), generator("4.0.0")],
            enabled: true,
            sdkConfig: loaded,
            requireEnvVars: true,
            isPreview: false
        });

        expect(results.map((result) => result.route?.payloadKind)).toEqual(["fern-runtime-bundle", "sdk-config-v1"]);
        expect(results.map((result) => result.error)).toEqual([undefined, undefined]);
    });

    it("retains downgrade-or-migrate guidance when no SDK Config is available", () => {
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [generator("4.0.0")],
            enabled: true,
            requireEnvVars: true,
            isPreview: false
        });

        expect(result?.error).toHaveProperty("message", expect.stringContaining("exact generator version below 4.0.0"));
        expect(result?.error).toHaveProperty("message", expect.stringContaining("fern sdk migrate --output <path>"));
        expect(result?.error).toHaveProperty("message", expect.stringContaining("--sdk-config <path>"));
    });

    it("requires a matching language target for every cutover generator", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), validConfig("python"));
        const loaded = await loadSdkConfigInput({ invocationCwd, projectRoot });
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [generator("4.0.0")],
            enabled: true,
            sdkConfig: loaded,
            requireEnvVars: true,
            isPreview: false
        });

        expect(result?.route).toBeUndefined();
        expect(result?.error).toHaveProperty("message", expect.stringContaining("has no target for typescript"));
    });

    it("uses a typed configuration error for unsupported cutover options", async () => {
        await writeFile(join(projectRoot, RelativeFilePath.of("sdk-config.yml")), validConfig("typescript"));
        const loaded = await loadSdkConfigInput({ invocationCwd, projectRoot });
        const [result] = prepareFernSdkGenApiRoutes({
            generators: [generator("4.0.0")],
            enabled: true,
            sdkConfig: loaded,
            requireEnvVars: true,
            isPreview: false,
            verify: true
        });

        expect(result?.route).toBeUndefined();
        expect(result?.error).toMatchObject({
            code: "CONFIG_ERROR",
            message: expect.stringContaining("verify=true is not implemented by sdk-gen-api")
        });
    });
});

function validConfig(language: "typescript" | "python"): string {
    return `schemaVersion: sdk-config/v1
sdkName: Acme SDK
source:
  specs:
    - id: api
      type: openapi
      path: ./openapi.yml
output:
  delivery: zip
targets:
  - language: ${language}
`;
}

function generator(version: string): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-typescript-sdk",
        version,
        config: {},
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        automation: { generate: false, upgrade: false, preview: false, verify: false },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/test-output"),
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        language: "typescript",
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    };
}
