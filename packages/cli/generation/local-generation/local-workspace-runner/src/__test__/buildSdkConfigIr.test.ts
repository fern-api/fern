import type { generatorsYml } from "@fern-api/configuration";

import { sdkConfigIrV1Schema } from "@postman/sdk-config";
import { describe, expect, it } from "vitest";

import { buildSdkConfigIr } from "../postman/buildSdkConfigIr.js";
import type { RawSpecsManifest } from "../rawSpecs.js";

function generatorInvocation(config: unknown, overrides: Partial<generatorsYml.GeneratorInvocation> = {}) {
    return {
        name: "postman/sdk-generator",
        version: "1.0.0",
        config,
        language: undefined,
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

const manifest: RawSpecsManifest = {
    specs: [{ type: "openapi", specPath: "/fern/specs/openapi-0.json" }]
};

function build(config: unknown, overrides: Partial<Parameters<typeof buildSdkConfigIr>[0]> = {}) {
    return buildSdkConfigIr({
        generatorInvocation: generatorInvocation(config),
        organization: "acme",
        workspaceName: "abbey",
        version: "1.2.3",
        outputPath: "/fern/output",
        rawSpecsManifest: manifest,
        ...overrides
    });
}

describe("buildSdkConfigIr", () => {
    it("produces an IR that validates against the published contract", () => {
        const result = build({ language: "typescript" });

        expect(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        const parsed = sdkConfigIrV1Schema.safeParse(result.sdkConfigIr);
        expect(parsed.success).toBe(true);
    });

    it("maps the target from the generator config and the workspace", () => {
        const result = build({ language: "python" });

        expect(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        expect(result.sdkConfigIr.target).toMatchObject({
            language: "python",
            sourceOrigin: "fern",
            sdkName: "abbey",
            sdkVersion: "1.2.3",
            organization: "acme"
        });
        expect(result.sdkConfigIr.output).toEqual({ delivery: "files", path: "/fern/output" });
    });

    it("carries the raw spec through as the IR source", () => {
        const result = build({ language: "typescript" });

        expect(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        expect(result.sdkConfigIr.source.specs).toEqual([
            { specUrl: "/fern/specs/openapi-0.json", specType: "openapi" }
        ]);
    });

    it("prefers explicit config over derived values", () => {
        const result = build({
            language: "go",
            sdkName: "abbey-go",
            sdkVersion: "9.9.9",
            baseUrl: "https://api.abbey.io"
        });

        expect(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        expect(result.sdkConfigIr.target.sdkName).toBe("abbey-go");
        expect(result.sdkConfigIr.target.sdkVersion).toBe("9.9.9");
        expect(result.sdkConfigIr.api?.baseUrl).toBe("https://api.abbey.io");
    });

    it("records untranslated generator config rather than dropping it", () => {
        const result = build({ language: "typescript", customTemplates: "./templates" });

        expect(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        expect(result.sdkConfigIr.compatibility?.unsupportedFields).toEqual([
            expect.objectContaining({
                source: "fern",
                path: ["generation", "language", "customTemplates"],
                severity: "warning"
            })
        ]);
    });

    it("retains the originating invocation for migration debugging", () => {
        const result = build({ language: "typescript" });

        expect(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        expect(result.sdkConfigIr.compatibility?.legacyInput).toMatchObject({
            kind: "fern-generator-invocation"
        });
        expect(result.sdkConfigIr.compatibility?.outputProfile).toBe("fern-legacy");
    });

    it("fails with an actionable message when no language is declared", () => {
        const result = build({});

        expect(result.success).toBe(false);
        if (result.success) {
            return;
        }
        expect(result.message).toContain("config.language");
    });

    it("fails when no specs were mounted", () => {
        const result = build({ language: "typescript" }, { rawSpecsManifest: undefined });

        expect(result.success).toBe(false);
        if (result.success) {
            return;
        }
        expect(result.message).toContain("GENERATORS_WANTING_SPECS");
    });
});
