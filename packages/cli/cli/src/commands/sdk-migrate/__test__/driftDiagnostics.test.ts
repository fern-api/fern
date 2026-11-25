import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AbstractAPIWorkspace, FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { mapFernDefinitionToSdkConfigApi } from "../mapFernGroupToSdkConfig.js";
import {
    type ResolvedMigrationFileSpec,
    resolveMigrationSourceSpecs,
    unmigratedApiImportSettingDiagnostics
} from "../projectMigrationSource.js";
import { scanSourceSpecExtensions } from "../scanSourceSpecExtensions.js";

describe("SDK Config migration drift diagnostics", () => {
    it("warns when a header or bearer auth option name would be renamed", () => {
        const definition = createDefinition({
            auth: { "endpoint-security": {} },
            "auth-schemes": {
                ApiKeyScheme: { header: "X-API-Key", name: "driftKey" },
                BearerScheme: { scheme: "bearer", token: { name: "accessToken", env: "ACCESS_TOKEN" } }
            }
        });

        const { diagnostics } = mapFernDefinitionToSdkConfigApi(definition);

        expect(diagnostics.map((diagnostic) => diagnostic.path)).toEqual([
            ["auth-schemes", "ApiKeyScheme", "name"],
            ["auth-schemes", "BearerScheme", "token", "name"]
        ]);
        expect(diagnostics[0]?.reason).toContain("x-fern-header: { name: driftKey }");
        expect(diagnostics[1]?.reason).toContain("x-fern-bearer: { name: accessToken }");
    });

    it("does not warn when the auth option name matches the SDK Config default", () => {
        const definition = createDefinition({
            auth: { "endpoint-security": {} },
            "auth-schemes": {
                ApiKeyScheme: { header: "X-API-Key", name: "apiKey" },
                BearerScheme: { scheme: "bearer", token: { name: "token" } }
            }
        });

        expect(mapFernDefinitionToSdkConfigApi(definition).diagnostics).toEqual([]);
    });

    it("warns about API settings SDK Config v1 cannot carry", () => {
        const generator = createGenerator();
        generator.apiOverride = {
            specs: [
                {
                    openapi: "./openapi.yml",
                    settings: {
                        filter: { endpoints: ["GET /items"] },
                        "resolve-aliases": true,
                        "remove-discriminants-from-schemas": "always",
                        "only-include-referenced-schemas": true
                    }
                }
            ]
        } as generatorsYml.GeneratorInvocation["apiOverride"];
        const specs = resolveMigrationSourceSpecs({
            workspace: { absoluteFilePath: AbsoluteFilePath.of("/tmp/fern") } as AbstractAPIWorkspace<unknown>,
            fernWorkspace: {} as FernWorkspace,
            generator
        });

        const diagnostics = unmigratedApiImportSettingDiagnostics(specs);

        expect(diagnostics.map((diagnostic) => [diagnostic.code, diagnostic.path])).toEqual([
            ["FERN_API_IMPORT_SETTING_UNSUPPORTED", ["api", "specs", "openapi.yml", "settings", "filter"]],
            ["FERN_API_IMPORT_SETTING_UNSUPPORTED", ["api", "specs", "openapi.yml", "settings", "resolve-aliases"]]
        ]);
    });

    it("finds Fern extensions in specs and overlays that SDK Config generators ignore", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "sdk-migrate-drift-"));
        const specPath = path.join(directory, "openapi.yml");
        const overlayPath = path.join(directory, "overlay.yml");
        await writeFile(
            specPath,
            [
                "openapi: 3.0.3",
                "x-fern-base-path: /v2",
                "paths:",
                "  /items:",
                "    get:",
                "      x-fern-pagination:",
                "        offset: $request.offset",
                "        results: $response.data",
                "  /pages:",
                "    get:",
                "      x-fern-pagination:",
                "        offset: $request.offset",
                "        step: $request.limit",
                "        results: $response.data"
            ].join("\n")
        );
        await writeFile(
            overlayPath,
            [
                "overlay: 1.0.0",
                "actions:",
                "  - target: $",
                "    update:",
                "      x-fern-sdk-variables:",
                "        tenantId:",
                "          type: string"
            ].join("\n")
        );
        const spec: ResolvedMigrationFileSpec = {
            absolutePath: specPath,
            absoluteOverlayPaths: [overlayPath],
            absoluteOverridePaths: [],
            type: "openapi"
        };

        const diagnostics = await scanSourceSpecExtensions([spec]);

        expect(diagnostics.map((diagnostic) => diagnostic.path)).toEqual([
            ["openapi.yml", "x-fern-base-path"],
            ["openapi.yml", "x-fern-pagination", "step"],
            ["overlay.yml", "x-fern-sdk-variables"]
        ]);
        expect(diagnostics[1]?.reason).toMatch(/^1 offset x-fern-pagination/);
    });
});

function createDefinition(contents: Record<string, unknown>): FernDefinition {
    return {
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern/definition"),
        importedDefinitions: {},
        namedDefinitionFiles: {},
        packageMarkers: {},
        rootApiFile: {
            defaultUrl: "https://api.example.com",
            rawContents: "",
            contents: { name: "drift", ...contents }
        }
    } as unknown as FernDefinition;
}

function createGenerator(): generatorsYml.GeneratorInvocation {
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
        language: "python",
        name: "fernapi/fern-python-sdk",
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined,
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        version: "4.64.1"
    };
}
