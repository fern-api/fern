import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { bundleRemoteOpenAPI } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { parseSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSdkConfigWorkspace } from "../createSdkConfigWorkspace.js";

vi.mock("@fern-api/configuration-loader", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/configuration-loader")>()),
    getLatestGeneratorVersion: vi.fn()
}));

vi.mock("@fern-api/lazy-fern-workspace", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/lazy-fern-workspace")>()),
    bundleRemoteOpenAPI: vi.fn()
}));

describe("createSdkConfigWorkspace", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.resetAllMocks();
        vi.unstubAllGlobals();
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    it("constructs sources and resolves an omitted generator version without generators.yml", async () => {
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("4.1.0");
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        await mkdir(path.join(directory, "specs"));
        await writeFile(
            path.join(directory, "specs", "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                sdkVersion: "1.0.0",
                source: {
                    specs: [
                        {
                            id: "payments",
                            type: "openapi",
                            path: "./specs/openapi.yml",
                            namespace: "payments"
                        }
                    ]
                },
                api: { audiences: [] },
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [
                    {
                        language: "typescript",
                        output: { delivery: "files", path: "./generated/typescript" }
                    }
                ]
            }),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        expect(workspace.allSpecs).toMatchObject([
            {
                type: "openapi",
                absoluteFilepath: path.join(directory, "specs", "openapi.yml"),
                namespace: "payments"
            }
        ]);
        expect(workspace.generatorsConfiguration?.groups).toMatchObject([
            {
                groupName: "sdk-config",
                generators: [
                    {
                        name: "fernapi/fern-typescript-sdk",
                        version: "4.1.0",
                        language: "typescript",
                        absolutePathToLocalOutput: path.join(directory, "generated", "typescript")
                    }
                ]
            }
        ]);
        expect(workspace.generatorsConfiguration?.absolutePathToConfiguration).toBe(
            path.join(directory, "sdk-config.yml")
        );
        expect(getLatestGeneratorVersion).toHaveBeenCalledWith(
            expect.objectContaining({
                generatorName: "fernapi/fern-typescript-sdk",
                cliVersion: "0.0.0"
            })
        );
        await cleanup();
    });

    it("preserves an explicitly pinned generator version without resolving latest", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        await writeFile(
            path.join(directory, "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: {
                    specs: [{ id: "payments", type: "openapi", path: "./openapi.yml" }]
                },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [
                    {
                        language: "typescript",
                        generatorVersion: "4.0.0",
                        output: { delivery: "zip" }
                    }
                ]
            }),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        expect(workspace.generatorsConfiguration?.groups[0]?.generators[0]).toMatchObject({
            name: "fernapi/fern-typescript-sdk",
            version: "4.0.0"
        });
        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
        await cleanup();
    });

    it("materializes a bundled OpenAPI URL source and cleans it up", async () => {
        vi.mocked(bundleRemoteOpenAPI).mockResolvedValue({
            openapi: "3.0.0",
            info: { title: "Payments", version: "1.0.0" },
            paths: {}
        });
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);

        const created = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: {
                    specs: [
                        {
                            id: "payments",
                            type: "openapi",
                            url: "https://example.com/openapi.yaml"
                        }
                    ]
                },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [{ language: "typescript", generatorVersion: "4.0.0", output: { delivery: "zip" } }]
            }),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        const materialized = created.workspace.allSpecs[0];
        if (materialized?.type !== "openapi") {
            throw new Error("Expected an OpenAPI specification");
        }
        expect(bundleRemoteOpenAPI).toHaveBeenCalledWith("https://example.com/openapi.yaml");
        expect(JSON.parse(await readFile(materialized.absoluteFilepath, "utf-8"))).toMatchObject({
            info: { title: "Payments" }
        });

        await created.cleanup();
        await expect(access(materialized.absoluteFilepath)).rejects.toThrow();
    });

    it.each(["asyncapi", "graphql"] as const)("rejects unsupported %s URL sources", async (type) => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);

        await expect(
            createSdkConfigWorkspace({
                sdkConfig: parseSdkConfigV1({
                    schemaVersion: "sdk-config/v1",
                    sdkName: "payments",
                    source: {
                        specs: [{ id: "payments", type, url: `https://example.com/${type}.yaml` }]
                    },
                    api: {},
                    client: {},
                    package: {},
                    docs: {},
                    generation: {},
                    targets: [{ language: "typescript", generatorVersion: "4.0.0", output: { delivery: "zip" } }]
                }),
                absolutePathToConfig: path.join(directory, "sdk-config.yml"),
                cliVersion: "0.0.0",
                context: {
                    failAndThrow: (message: string) => {
                        throw new Error(message);
                    }
                } as never
            })
        ).rejects.toThrow(`SDK Config ${type} URL source 'payments' is not supported`);
    });
});
