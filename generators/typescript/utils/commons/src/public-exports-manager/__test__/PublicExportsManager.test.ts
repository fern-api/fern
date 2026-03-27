import { Volume } from "memfs/lib/volume";
import { beforeEach, describe, expect, it } from "vitest";
import { PublicExportsManager } from "../PublicExportsManager.js";

describe("generatePublicExportsToVolume", () => {
    let volume: InstanceType<typeof Volume>;
    let manager: PublicExportsManager;

    beforeEach(() => {
        volume = new Volume();
        manager = new PublicExportsManager();
    });

    it("does nothing when core/ directory does not exist", () => {
        volume.mkdirSync("/src", { recursive: true });
        volume.writeFileSync("/src/index.ts", 'export * from "./api";\n');

        manager.generatePublicExportsToVolume(volume, "src");

        // No new files should be created
        const files = volume.readdirSync("/src");
        expect(files).toEqual(["index.ts"]);
    });

    it("generates parent exports.ts for a single core subdirectory with exports.ts", () => {
        volume.mkdirSync("/src/core/logging", { recursive: true });
        volume.writeFileSync("/src/core/logging/exports.ts", 'export { Logger } from "./Logger";\n');
        volume.writeFileSync("/src/index.ts", 'export * from "./api";\n');

        manager.generatePublicExportsToVolume(volume, "src");

        // Should create src/core/exports.ts re-exporting logging/exports
        const coreExports = volume.readFileSync("/src/core/exports.ts", "utf-8").toString();
        expect(coreExports).toContain('export * from "./logging/exports";');

        // Should create src/exports.ts re-exporting core/exports
        const srcExports = volume.readFileSync("/src/exports.ts", "utf-8").toString();
        expect(srcExports).toContain('export * from "./core/exports";');

        // Should add re-export to src/index.ts
        const indexContent = volume.readFileSync("/src/index.ts", "utf-8").toString();
        expect(indexContent).toContain('export * from "./exports"');
    });

    it("generates parent exports.ts for multiple core subdirectories", () => {
        volume.mkdirSync("/src/core/logging", { recursive: true });
        volume.mkdirSync("/src/core/pagination", { recursive: true });
        volume.mkdirSync("/src/core/file", { recursive: true });
        volume.writeFileSync("/src/core/logging/exports.ts", 'export { Logger } from "./Logger";\n');
        volume.writeFileSync("/src/core/pagination/exports.ts", 'export { Page } from "./Page";\n');
        volume.writeFileSync("/src/core/file/exports.ts", 'export { FileUtils } from "./FileUtils";\n');
        volume.writeFileSync("/src/index.ts", "export {};\n");

        manager.generatePublicExportsToVolume(volume, "src");

        // Should create src/core/exports.ts re-exporting all three (alphabetically sorted)
        const coreExports = volume.readFileSync("/src/core/exports.ts", "utf-8").toString();
        expect(coreExports).toContain('export * from "./file/exports";');
        expect(coreExports).toContain('export * from "./logging/exports";');
        expect(coreExports).toContain('export * from "./pagination/exports";');

        // Verify alphabetical order: file < logging < pagination
        const fileIdx = coreExports.indexOf("./file/exports");
        const loggingIdx = coreExports.indexOf("./logging/exports");
        const paginationIdx = coreExports.indexOf("./pagination/exports");
        expect(fileIdx).toBeLessThan(loggingIdx);
        expect(loggingIdx).toBeLessThan(paginationIdx);
    });

    it("does not overwrite existing exports.ts files", () => {
        volume.mkdirSync("/src/core/logging", { recursive: true });
        volume.writeFileSync("/src/core/logging/exports.ts", 'export { Logger } from "./Logger";\n');
        // Pre-existing core/exports.ts
        volume.writeFileSync("/src/core/exports.ts", "// custom exports\nexport {};\n");
        volume.writeFileSync("/src/index.ts", "export {};\n");

        manager.generatePublicExportsToVolume(volume, "src");

        // Should NOT overwrite the existing core/exports.ts
        const coreExports = volume.readFileSync("/src/core/exports.ts", "utf-8").toString();
        expect(coreExports).toBe("// custom exports\nexport {};\n");
    });

    it("does not duplicate re-export in index.ts if already present", () => {
        volume.mkdirSync("/src/core/logging", { recursive: true });
        volume.writeFileSync("/src/core/logging/exports.ts", 'export { Logger } from "./Logger";\n');
        volume.writeFileSync("/src/index.ts", 'export * from "./api";\nexport * from "./exports";\n');

        manager.generatePublicExportsToVolume(volume, "src");

        // Should NOT add duplicate re-export
        const indexContent = volume.readFileSync("/src/index.ts", "utf-8").toString();
        const matches = indexContent.match(/export \* from "\.\/exports"/g);
        expect(matches).toHaveLength(1);
    });

    it("does not modify index.ts if it does not exist", () => {
        volume.mkdirSync("/src/core/logging", { recursive: true });
        volume.writeFileSync("/src/core/logging/exports.ts", 'export { Logger } from "./Logger";\n');
        // No index.ts

        manager.generatePublicExportsToVolume(volume, "src");

        // src/exports.ts should be created (parent of core/exports.ts)
        expect(volume.existsSync("/src/exports.ts")).toBe(true);
        // But index.ts should NOT be created
        expect(volume.existsSync("/src/index.ts")).toBe(false);
    });

    it("works with custom package path", () => {
        volume.mkdirSync("/src/test-packagePath/core/logging", { recursive: true });
        volume.writeFileSync("/src/test-packagePath/core/logging/exports.ts", 'export { Logger } from "./Logger";\n');
        volume.writeFileSync("/src/test-packagePath/index.ts", "export {};\n");

        manager.generatePublicExportsToVolume(volume, "src/test-packagePath");

        const coreExports = volume.readFileSync("/src/test-packagePath/core/exports.ts", "utf-8").toString();
        expect(coreExports).toContain('export * from "./logging/exports";');

        const indexContent = volume.readFileSync("/src/test-packagePath/index.ts", "utf-8").toString();
        expect(indexContent).toContain('export * from "./exports"');
    });

    it("generates empty export when directory has no child exports", () => {
        // Create a deeply nested structure where an intermediate directory
        // needs a parent exports.ts but has no direct child exports
        volume.mkdirSync("/src/core/nested/deep", { recursive: true });
        volume.writeFileSync("/src/core/nested/deep/exports.ts", "export {};\n");
        volume.writeFileSync("/src/index.ts", "export {};\n");

        manager.generatePublicExportsToVolume(volume, "src");

        // core/nested/exports.ts should re-export deep/exports
        const nestedExports = volume.readFileSync("/src/core/nested/exports.ts", "utf-8").toString();
        expect(nestedExports).toContain('export * from "./deep/exports";');

        // core/exports.ts should re-export nested/exports
        const coreExports = volume.readFileSync("/src/core/exports.ts", "utf-8").toString();
        expect(coreExports).toContain('export * from "./nested/exports";');
    });
});
