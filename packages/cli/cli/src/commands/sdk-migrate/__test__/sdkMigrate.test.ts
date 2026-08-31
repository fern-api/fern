import type { FernDefinition } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { FernConfigMappingError } from "@postman/sdk-config/sdk-config/v1";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { mapFernDefinitionToSdkConfigApi, mapFernGroupToSdkConfig } from "../mapFernGroupToSdkConfig.js";
import { writeOutputFile } from "../writeOutputFile.js";

describe("SDK Config migration", () => {
    let temporaryDirectory: string;

    beforeEach(async () => {
        temporaryDirectory = await mkdtemp(join(tmpdir(), "fern-sdk-migrate-"));
    });

    afterEach(async () => {
        await rm(temporaryDirectory, { force: true, recursive: true });
    });

    it("maps a resolved generator group without reparsing Fern configuration", () => {
        const result = mapFernGroupToSdkConfig({
            fernWorkspace: { definition: createDefinition() },
            group: createGroup([createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3")])
        });

        expect(result.sdkConfig).toMatchObject({
            schemaVersion: "sdk-config/v1",
            apiVersion: "2026-08-31",
            api: {
                audiences: [],
                baseUrl: "https://api.example.com",
                defaultEnvironment: "Production",
                environments: [
                    {
                        name: "Production",
                        urls: [{ name: "default", url: "https://api.example.com" }]
                    }
                ],
                headers: [{ name: "apiVersion", environmentVariable: "API_VERSION" }]
            },
            targets: [
                {
                    generatorVersion: "3.63.3",
                    language: "typescript",
                    output: { delivery: "zip" }
                }
            ]
        });
    });

    it("reports API authentication for manual review", () => {
        const definition = createDefinition();
        definition.rootApiFile.contents.auth = "bearer";

        const result = mapFernDefinitionToSdkConfigApi(definition);

        expect(result.diagnostics).toEqual([
            expect.objectContaining({ code: "FERN_API_AUTH_REQUIRES_REVIEW", path: ["api", "auth"] })
        ]);
    });

    it("rejects duplicate target languages", () => {
        const group = createGroup([
            createGenerator("fernapi/fern-typescript-sdk", "typescript", "3.63.3"),
            createGenerator("fernapi/fern-typescript-node-sdk", "typescript", "2.8.0")
        ]);

        expect(() => mapFernGroupToSdkConfig({ fernWorkspace: { definition: createDefinition() }, group })).toThrow(
            FernConfigMappingError
        );
    });

    it("creates parent directories and protects existing output unless forced", async () => {
        const output = AbsoluteFilePath.of(join(temporaryDirectory, "nested", "sdk-config.json"));
        await writeOutputFile(output, "first\n", false);
        expect(await readFile(output, "utf-8")).toBe("first\n");

        await expect(writeOutputFile(output, "second\n", false)).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message.includes("already exists")
        );
        expect(await readFile(output, "utf-8")).toBe("first\n");

        await writeOutputFile(output, "second\n", true);
        expect(await readFile(output, "utf-8")).toBe("second\n");
    });

    it("does not replace an existing file when creating a new output fails", async () => {
        const output = AbsoluteFilePath.of(join(temporaryDirectory, "sdk-config.json"));
        await writeFile(output, "existing\n");

        await expect(writeOutputFile(output, "replacement\n", false)).rejects.toBeInstanceOf(CliError);
        expect(await readFile(output, "utf-8")).toBe("existing\n");
    });
});

function createDefinition(): FernDefinition {
    return {
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern/definition"),
        importedDefinitions: {},
        namedDefinitionFiles: {},
        packageMarkers: {},
        rootApiFile: {
            defaultUrl: "https://api.example.com",
            rawContents: "",
            contents: {
                name: "migration-api",
                "default-environment": "Production",
                environments: { Production: "https://api.example.com" },
                headers: {
                    "X-API-Version": {
                        name: "apiVersion",
                        type: "optional<string>",
                        env: "API_VERSION"
                    }
                }
            }
        },
        specVersion: "2026-08-31"
    };
}

function createGroup(generators: generatorsYml.GeneratorInvocation[]): generatorsYml.GeneratorGroup {
    return {
        audiences: { type: "select", audiences: [] },
        generators,
        groupName: "production",
        reviewers: undefined
    };
}

function createGenerator(
    name: string,
    language: generatorsYml.GenerationLanguage,
    version: string
): generatorsYml.GeneratorInvocation {
    return {
        absolutePathToLocalOutput: undefined,
        absolutePathToLocalSnippets: undefined,
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        config: {},
        containerImage: undefined,
        disableExamples: false,
        idempotencyKeyGenerationConfig: undefined,
        irVersionOverride: undefined,
        keywords: undefined,
        language,
        name,
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined,
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        version
    };
}
