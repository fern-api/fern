import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import yaml from "js-yaml";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDefaultOpenAPIWorkspace, createOpenAPIWorkspace } from "../createWorkspace.js";

vi.mock("@fern-api/configuration-loader", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/configuration-loader")>()),
    getLatestGeneratorVersion: vi.fn()
}));

describe("createWorkspace", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.resetAllMocks();
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    it("creates a valid SDK Config without pinning the generator version", async () => {
        const directory = await temporaryDirectory();

        await createDefaultOpenAPIWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(directory),
            cliVersion: "0.0.0",
            context: createMockTaskContext(),
            useSdkConfig: true
        });

        const sdkConfigPath = path.join(directory, "sdk-config.yml");
        const sdkConfig = validateSdkConfigV1(yaml.load(await readFile(sdkConfigPath, "utf8")));
        expect(sdkConfig).toEqual({
            schemaVersion: "sdk-config/v1",
            sdkName: "api",
            source: { specs: [{ id: "api", type: "openapi", path: "./openapi.yml" }] },
            targets: [
                {
                    language: "typescript",
                    output: { delivery: "files", path: "../sdks/typescript" }
                }
            ]
        });
        expect(sdkConfig.targets[0]?.generatorVersion).toBeUndefined();
        expect(await doesPathExist(AbsoluteFilePath.of(path.join(directory, "openapi.yml")))).toBe(true);
        expect(await doesPathExist(AbsoluteFilePath.of(path.join(directory, "generators.yml")))).toBe(false);
        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
    });

    it("bundles a supplied OpenAPI document into the SDK Config workspace", async () => {
        const directory = await temporaryDirectory();
        const sourceDirectory = await temporaryDirectory();
        const sourcePath = path.join(sourceDirectory, "payments.yml");
        await writeFile(
            sourcePath,
            [
                "openapi: 3.0.0",
                "info:",
                "  title: Payments",
                "  version: 1.0.0",
                "paths: {}",
                "components:",
                "  schemas:",
                "    Payment:",
                "      $ref: ./components.yml#/Payment",
                ""
            ].join("\n")
        );
        await writeFile(
            path.join(sourceDirectory, "components.yml"),
            ["Payment:", "  type: object", "  properties:", "    amount:", "      type: number", ""].join("\n")
        );

        await createOpenAPIWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(directory),
            openAPIFilePath: AbsoluteFilePath.of(sourcePath),
            cliVersion: "0.0.0",
            context: createMockTaskContext(),
            useSdkConfig: true,
            sdkName: "payments"
        });

        const sdkConfig = validateSdkConfigV1(
            yaml.load(await readFile(path.join(directory, "sdk-config.yml"), "utf8"))
        );
        expect(sdkConfig.sdkName).toBe("payments");
        const source = sdkConfig.source.specs[0];
        expect(source != null && "path" in source ? source.path : undefined).toBe("./openapi.yml");
        const bundledOpenAPI = await readFile(path.join(directory, "openapi.yml"), "utf8");
        expect(bundledOpenAPI).toContain("amount:");
        expect(bundledOpenAPI).not.toContain("./components.yml");
    });

    it("preserves an OpenAPI URL in SDK Config", async () => {
        const directory = await temporaryDirectory();
        const sourceDirectory = await temporaryDirectory();
        const sourcePath = path.join(sourceDirectory, "downloaded-openapi.yml");
        await writeFile(sourcePath, "openapi: 3.0.0\n");

        await createOpenAPIWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(directory),
            openAPIFilePath: AbsoluteFilePath.of(sourcePath),
            openAPIUrl: "https://example.com/openapi.yml",
            cliVersion: "0.0.0",
            context: createMockTaskContext(),
            useSdkConfig: true
        });

        const sdkConfig = validateSdkConfigV1(
            yaml.load(await readFile(path.join(directory, "sdk-config.yml"), "utf8"))
        );
        expect(sdkConfig.source.specs[0]).toMatchObject({
            id: "api",
            type: "openapi",
            url: "https://example.com/openapi.yml"
        });
    });

    it("preserves the legacy generators.yml initialization path", async () => {
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("9.9.9");
        const directory = await temporaryDirectory();

        await createDefaultOpenAPIWorkspace({
            directoryOfWorkspace: AbsoluteFilePath.of(directory),
            cliVersion: "0.0.0",
            context: createMockTaskContext(),
            useSdkConfig: false
        });

        const generatorsContents = await readFile(path.join(directory, "generators.yml"), "utf8");
        expect(generatorsContents).toContain("version: 9.9.9");
        expect(await doesPathExist(AbsoluteFilePath.of(path.join(directory, "sdk-config.yml")))).toBe(false);
    });

    async function temporaryDirectory(): Promise<string> {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-init-workspace-"));
        temporaryDirectories.push(directory);
        return directory;
    }
});
