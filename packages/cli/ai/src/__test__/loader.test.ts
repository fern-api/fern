import { describe, expect, it, vi } from "vitest";

describe("loadBamlDependencies", () => {
    it("throws with install instructions when @boundaryml/baml is not available", async () => {
        vi.doMock("@boundaryml/baml", () => {
            throw new Error("Cannot find module '@boundaryml/baml'");
        });

        const { loadBamlDependencies } = await import("../loader.js");

        await expect(loadBamlDependencies()).rejects.toThrow(
            "@boundaryml/baml is required for AI features (auto-versioning, sdk-diff)."
        );
        await expect(loadBamlDependencies()).rejects.toThrow("pnpm add @boundaryml/baml");
        await expect(loadBamlDependencies()).rejects.toThrow("Original error:");

        vi.doUnmock("@boundaryml/baml");
    });

    it("resolves successfully when @boundaryml/baml is installed", async () => {
        const { loadBamlDependencies } = await import("../loader.js");

        const deps = await loadBamlDependencies();
        expect(deps).toBeDefined();
        expect(deps.ClientRegistry).toBeDefined();
        expect(deps.BamlClient).toBeDefined();
        expect(deps.configureBamlClient).toBeDefined();
        expect(typeof deps.configureBamlClient).toBe("function");
    });
});
