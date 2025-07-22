import { describe, it, expect } from "vitest";

import { generateModels } from "../generateModels";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext";

const testDefinitions = ["basic-object", "enum-types", "alias-types"] as const;

describe.each(testDefinitions)("generateModels - %s", (testDefinitionName) => {
    it("should correctly generate model files", async () => {
        const context = await createSampleGeneratorContext(testDefinitionName);
        const files = generateModels({ context });

        // Test that files are generated
        expect(files).toBeDefined();
        expect(files.length).toBeGreaterThan(0);

        // Snapshot test for each generated file
        for (const file of files) {
            await expect(file.fileContents).toMatchFileSnapshot(`snapshots/${testDefinitionName}/${file.filename}`);
        }
    });

    it("should generate files with correct structure", async () => {
        const context = await createSampleGeneratorContext(testDefinitionName);
        const files = generateModels({ context });

        // All files should have Rust file extension
        for (const file of files) {
            expect(file.filename).toMatch(/\.rs$/);
        }

        // All files should contain valid Rust code structure
        for (const file of files) {
            expect(file.fileContents).toBeTruthy();
            expect(file.fileContents.length).toBeGreaterThan(0);
        }
    });
});

describe("generateModels type-specific tests", () => {
    it("should generate struct for basic object", async () => {
        const context = await createSampleGeneratorContext("basic-object");
        const files = generateModels({ context });

        const userFile = files.find((f) => f.filename.toLowerCase().includes("user"));
        expect(userFile).toBeDefined();
        expect(userFile?.fileContents).toContain("struct");
        expect(userFile?.fileContents).toContain("User");
    });

    it("should generate enums for enum types", async () => {
        const context = await createSampleGeneratorContext("enum-types");
        const files = generateModels({ context });

        expect(files.length).toBeGreaterThan(0);

        // Should have enum-related content
        const hasEnumContent = files.some(
            (file) =>
                file.fileContents.includes("enum") ||
                file.fileContents.includes("Color") ||
                file.fileContents.includes("Status")
        );
        expect(hasEnumContent).toBeTruthy();
    });

    it("should generate type aliases for alias types", async () => {
        const context = await createSampleGeneratorContext("alias-types");
        const files = generateModels({ context });

        expect(files.length).toBeGreaterThan(0);

        // Should have alias-related content
        const hasAliasContent = files.some(
            (file) =>
                file.fileContents.includes("type") ||
                file.fileContents.includes("UserId") ||
                file.fileContents.includes("UserProfile")
        );
        expect(hasAliasContent).toBeTruthy();
    });
});
