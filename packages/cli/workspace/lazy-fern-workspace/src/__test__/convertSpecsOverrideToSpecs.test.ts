import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join } from "path";

import { OSSWorkspace } from "../OSSWorkspace.js";

function createMinimalOSSWorkspace(absoluteFilePath: string): OSSWorkspace {
    return new OSSWorkspace({
        absoluteFilePath: AbsoluteFilePath.of(absoluteFilePath),
        allSpecs: [],
        specs: [],
        generatorsConfiguration: undefined,
        workspaceName: "test",
        cliVersion: "0.0.0"
    });
}

function callConvertSpecsOverrideToSpecs(workspace: OSSWorkspace, specsOverride: unknown): Promise<unknown[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (workspace as any)["convertSpecsOverrideToSpecs"](specsOverride);
}

describe("convertSpecsOverrideToSpecs", () => {
    const baseDir = "/tmp/test-workspace";
    let workspace: OSSWorkspace;

    beforeEach(() => {
        workspace = createMinimalOSSWorkspace(baseDir);
    });

    it("resolves a single string override to an AbsoluteFilePath", async () => {
        const specs = await callConvertSpecsOverrideToSpecs(workspace, [{ openapi: "api.yml", overrides: "o.yml" }]);

        expect(specs).toHaveLength(1);
        const spec = specs[0] as { absoluteFilepathToOverrides: unknown };
        expect(spec.absoluteFilepathToOverrides).toBe(join(baseDir, "o.yml"));
    });

    it("resolves an array of overrides to an AbsoluteFilePath[]", async () => {
        const specs = await callConvertSpecsOverrideToSpecs(workspace, [
            { openapi: "api.yml", overrides: ["o1.yml", "o2.yml"] }
        ]);

        expect(specs).toHaveLength(1);
        const spec = specs[0] as { absoluteFilepathToOverrides: unknown };
        const overrides = spec.absoluteFilepathToOverrides as string[];
        expect(Array.isArray(overrides)).toBe(true);
        expect(overrides).toHaveLength(2);
        expect(overrides[0]).toBe(join(baseDir, "o1.yml"));
        expect(overrides[1]).toBe(join(baseDir, "o2.yml"));
    });

    it("collapses a single-element array override to a single AbsoluteFilePath", async () => {
        const specs = await callConvertSpecsOverrideToSpecs(workspace, [{ openapi: "api.yml", overrides: ["o.yml"] }]);

        expect(specs).toHaveLength(1);
        const spec = specs[0] as { absoluteFilepathToOverrides: unknown };
        // Single-element array should collapse to a single path, not an array
        expect(Array.isArray(spec.absoluteFilepathToOverrides)).toBe(false);
        expect(spec.absoluteFilepathToOverrides).toBe(join(baseDir, "o.yml"));
    });

    it("sets absoluteFilepathToOverrides to undefined when no overrides provided", async () => {
        const specs = await callConvertSpecsOverrideToSpecs(workspace, [{ openapi: "api.yml" }]);

        expect(specs).toHaveLength(1);
        const spec = specs[0] as { absoluteFilepathToOverrides: unknown };
        expect(spec.absoluteFilepathToOverrides).toBeUndefined();
    });

    it("throws for conjure (non-array) input", async () => {
        await expect(callConvertSpecsOverrideToSpecs(workspace, { conjure: "some-conjure-spec" })).rejects.toThrow(
            "Conjure specs override is not yet supported"
        );
    });

    it("throws for non-OpenAPI spec types", async () => {
        await expect(callConvertSpecsOverrideToSpecs(workspace, [{ asyncapi: "api.yml" }])).rejects.toThrow(
            "Spec type override not yet supported"
        );
    });

    it("passes through overlays", async () => {
        const specs = await callConvertSpecsOverrideToSpecs(workspace, [
            { openapi: "api.yml", overlays: "overlay.yml" }
        ]);

        expect(specs).toHaveLength(1);
        const spec = specs[0] as { absoluteFilepathToOverlays: unknown };
        expect(spec.absoluteFilepathToOverlays).toBe(join(baseDir, "overlay.yml"));
    });

    it("passes through namespace", async () => {
        const specs = await callConvertSpecsOverrideToSpecs(workspace, [{ openapi: "api.yml", namespace: "v2" }]);

        expect(specs).toHaveLength(1);
        const spec = specs[0] as { namespace: unknown };
        expect(spec.namespace).toBe("v2");
    });

    it("handles multiple specs with mixed overrides", async () => {
        const specs = await callConvertSpecsOverrideToSpecs(workspace, [
            { openapi: "a.yml" },
            { openapi: "b.yml", overrides: "o.yml" }
        ]);

        expect(specs).toHaveLength(2);

        const specA = specs[0] as { absoluteFilepath: unknown; absoluteFilepathToOverrides: unknown };
        expect(specA.absoluteFilepath).toBe(join(baseDir, "a.yml"));
        expect(specA.absoluteFilepathToOverrides).toBeUndefined();

        const specB = specs[1] as { absoluteFilepath: unknown; absoluteFilepathToOverrides: unknown };
        expect(specB.absoluteFilepath).toBe(join(baseDir, "b.yml"));
        expect(specB.absoluteFilepathToOverrides).toBe(join(baseDir, "o.yml"));
    });
});
