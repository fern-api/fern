import { Spec } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join } from "path";

import { OSSWorkspace } from "../OSSWorkspace.js";

class TestableOSSWorkspace extends OSSWorkspace {
    public callConvertSpecsOverrideToSpecs(
        specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema
    ): Promise<Spec[]> {
        return this.convertSpecsOverrideToSpecs(specsOverride);
    }
}

function createTestWorkspace(absoluteFilePath: string): TestableOSSWorkspace {
    return new TestableOSSWorkspace({
        absoluteFilePath: AbsoluteFilePath.of(absoluteFilePath),
        allSpecs: [],
        specs: [],
        generatorsConfiguration: undefined,
        workspaceName: "test",
        cliVersion: "0.0.0"
    });
}

describe("convertSpecsOverrideToSpecs", () => {
    const baseDir = "/tmp/test-workspace";
    let workspace: TestableOSSWorkspace;

    beforeEach(() => {
        workspace = createTestWorkspace(baseDir);
    });

    it("resolves a single string override to an AbsoluteFilePath", async () => {
        const specs = await workspace.callConvertSpecsOverrideToSpecs([{ openapi: "api.yml", overrides: "o.yml" }]);

        expect(specs).toHaveLength(1);
        expect(specs[0]?.absoluteFilepathToOverrides).toBe(join(baseDir, "o.yml"));
    });

    it("resolves an array of overrides to an AbsoluteFilePath[]", async () => {
        const specs = await workspace.callConvertSpecsOverrideToSpecs([
            { openapi: "api.yml", overrides: ["o1.yml", "o2.yml"] }
        ]);

        expect(specs).toHaveLength(1);
        const overrides = specs[0]?.absoluteFilepathToOverrides;
        expect(Array.isArray(overrides)).toBe(true);
        expect(overrides).toHaveLength(2);
        expect((overrides as string[])[0]).toBe(join(baseDir, "o1.yml"));
        expect((overrides as string[])[1]).toBe(join(baseDir, "o2.yml"));
    });

    it("collapses a single-element array override to a single AbsoluteFilePath", async () => {
        const specs = await workspace.callConvertSpecsOverrideToSpecs([{ openapi: "api.yml", overrides: ["o.yml"] }]);

        expect(specs).toHaveLength(1);
        // Single-element array should collapse to a single path, not an array
        expect(Array.isArray(specs[0]?.absoluteFilepathToOverrides)).toBe(false);
        expect(specs[0]?.absoluteFilepathToOverrides).toBe(join(baseDir, "o.yml"));
    });

    it("sets absoluteFilepathToOverrides to undefined when no overrides provided", async () => {
        const specs = await workspace.callConvertSpecsOverrideToSpecs([{ openapi: "api.yml" }]);

        expect(specs).toHaveLength(1);
        expect(specs[0]?.absoluteFilepathToOverrides).toBeUndefined();
    });

    it("throws for conjure (non-array) input", async () => {
        const conjureInput: generatorsYml.ConjureSchema = { conjure: "some-conjure-spec" };
        await expect(workspace.callConvertSpecsOverrideToSpecs(conjureInput)).rejects.toThrow(
            "Conjure specs override is not yet supported"
        );
    });

    it("throws for non-OpenAPI spec types", async () => {
        await expect(
            workspace.callConvertSpecsOverrideToSpecs([{ asyncapi: "api.yml" } as generatorsYml.SpecSchema])
        ).rejects.toThrow("Spec type override not yet supported");
    });

    it("passes through overlays", async () => {
        const specs = await workspace.callConvertSpecsOverrideToSpecs([
            { openapi: "api.yml", overlays: "overlay.yml" }
        ]);

        expect(specs).toHaveLength(1);
        if (specs[0]?.type === "openapi") {
            expect(specs[0].absoluteFilepathToOverlays).toBe(join(baseDir, "overlay.yml"));
        } else {
            throw new Error("Expected openapi spec type");
        }
    });

    it("passes through namespace", async () => {
        const specs = await workspace.callConvertSpecsOverrideToSpecs([{ openapi: "api.yml", namespace: "v2" }]);

        expect(specs).toHaveLength(1);
        if (specs[0]?.type === "openapi") {
            expect(specs[0].namespace).toBe("v2");
        } else {
            throw new Error("Expected openapi spec type");
        }
    });

    it("handles multiple specs with mixed overrides", async () => {
        const specs = await workspace.callConvertSpecsOverrideToSpecs([
            { openapi: "a.yml" },
            { openapi: "b.yml", overrides: "o.yml" }
        ]);

        expect(specs).toHaveLength(2);

        expect(specs[0]?.absoluteFilepathToOverrides).toBeUndefined();
        expect(specs[1]?.absoluteFilepathToOverrides).toBe(join(baseDir, "o.yml"));
    });
});
