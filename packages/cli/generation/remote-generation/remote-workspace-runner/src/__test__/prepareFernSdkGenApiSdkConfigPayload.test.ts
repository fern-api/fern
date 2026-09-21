import type { FernDefinition } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import type { FernConfigMappingDiagnostic } from "@postman/sdk-config/sdk-config/v1";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { describe, expect, it, vi } from "vitest";

import type { FernSdkGenApiSourceArchive } from "../fernSdkGenApiSourceArchive.js";
import {
    formatSdkConfigMappingDiagnostic,
    type MapFernGroupToSdkConfig,
    prepareFernSdkGenApiSdkConfigPayload,
    type SdkConfigMappingResult
} from "../prepareFernSdkGenApiSdkConfigPayload.js";

function definition(): FernDefinition {
    return {
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern/definition"),
        importedDefinitions: {},
        namedDefinitionFiles: {},
        packageMarkers: {},
        rootApiFile: {
            defaultUrl: "https://api.open-meteo.com",
            rawContents: "",
            contents: { name: "weather" }
        },
        specVersion: "2026-09-11"
    };
}

function mcpInvocation(): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-mcp-server",
        version: "0.1.0",
        language: "mcp",
        config: { serverName: "weather" },
        keywords: [],
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        outputMode: FernFiddle.OutputMode.downloadFiles({})
    } as unknown as generatorsYml.GeneratorInvocation;
}

function archive(specIndexes: number[]): FernSdkGenApiSourceArchive {
    return {
        buffer: Buffer.alloc(0),
        specIndexes,
        manifest: {
            specs: [
                { type: "openapi", specPath: "/fern/specs/openapi_0.json", namespace: "weather" },
                { type: "protobuf", specPath: "/fern/specs/proto" }
            ]
        }
    };
}

function mappingCallback() {
    return vi.fn(
        ({ source }: Parameters<MapFernGroupToSdkConfig>[0]): SdkConfigMappingResult => ({
            diagnostics: [],
            sdkConfig: validateSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "weather",
                source,
                targets: [{ language: "mcp", output: { delivery: "files" } }]
            })
        })
    );
}

describe("prepareFernSdkGenApiSdkConfigPayload", () => {
    it("maps a generators.yml invocation to an SDK Config v1 payload with manifest-ordered sources", () => {
        const mapFernGroupToSdkConfig = mappingCallback();
        const payload = prepareFernSdkGenApiSdkConfigPayload({
            workspace: { definition: definition() },
            generatorInvocation: mcpInvocation(),
            audiences: { type: "all" },
            sourceArchive: archive([0]),
            mapFernGroupToSdkConfig
        });

        expect(payload.payloadKind).toBe("sdk-config-v1");
        const sdkConfig = JSON.parse(payload.body.toString("utf8")) as {
            source: { specs: Array<{ type: string; path: string; namespace?: string }> };
            targets: Array<{ language: string }>;
        };
        expect(sdkConfig.source.specs).toEqual([
            { id: "source-0", type: "openapi", path: "fern/specs/openapi_0.json", namespace: "weather" }
        ]);
        expect(sdkConfig.targets.map((target) => target.language)).toEqual(["mcp"]);
        // Root `generation` is required by sdk-config 0.3.0 consumers even when empty.
        expect(payload.body.toString("utf8")).toContain('"generation":');
        expect(mapFernGroupToSdkConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                group: expect.objectContaining({
                    groupName: "sdk-gen-api",
                    generators: [expect.objectContaining({ config: { serverName: "weather" } })]
                }),
                source: {
                    specs: [
                        {
                            id: "source-0",
                            type: "openapi",
                            path: "fern/specs/openapi_0.json",
                            namespace: "weather"
                        }
                    ]
                }
            })
        );
    });

    it("refuses source types SDK Config generation cannot represent", () => {
        const mapFernGroupToSdkConfig = mappingCallback();
        expect(() =>
            prepareFernSdkGenApiSdkConfigPayload({
                workspace: { definition: definition() },
                generatorInvocation: mcpInvocation(),
                audiences: { type: "all" },
                sourceArchive: archive([1]),
                mapFernGroupToSdkConfig
            })
        ).toThrow("does not support Fern source type protobuf");
    });

    it("refuses a selection outside the manifest", () => {
        const mapFernGroupToSdkConfig = mappingCallback();
        expect(() =>
            prepareFernSdkGenApiSdkConfigPayload({
                workspace: { definition: definition() },
                generatorInvocation: mcpInvocation(),
                audiences: { type: "all" },
                sourceArchive: archive([7]),
                mapFernGroupToSdkConfig
            })
        ).toThrow("does not contain selected index 7");
    });
});

function diagnostic(overrides: Partial<FernConfigMappingDiagnostic> = {}): FernConfigMappingDiagnostic {
    return {
        severity: "warning",
        code: "unsupported-field",
        path: ["generators", 0, "config"],
        reason: "This field is not supported.",
        suggestedAction: "Remove the field.",
        ...overrides
    };
}

describe("formatSdkConfigMappingDiagnostic", () => {
    it("formats a diagnostic without an SDK Config path", () => {
        expect(formatSdkConfigMappingDiagnostic(diagnostic())).toBe(
            "[warning] [unsupported-field] generators.0.config: This field is not supported.; Remove the field."
        );
    });

    it("formats a diagnostic with an SDK Config path", () => {
        expect(
            formatSdkConfigMappingDiagnostic(
                diagnostic({ severity: "error", sdkConfigPath: ["targets", 0, "generation"] })
            )
        ).toBe(
            "[error] [unsupported-field] generators.0.config: This field is not supported.; SDK Config: targets.0.generation; Remove the field."
        );
    });
});
