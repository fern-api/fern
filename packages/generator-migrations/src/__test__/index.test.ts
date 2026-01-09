import { describe, expect, it } from "vitest";

import { migrations } from "../index.js";

describe("@fern-api/generator-migrations", () => {
    describe("migrations export", () => {
        it("exports migrations object", () => {
            expect(migrations).toBeDefined();
            expect(typeof migrations).toBe("object");
        });

        it("includes TypeScript SDK migration entries", () => {
            const typescriptGenerators = [
                "fernapi/fern-typescript",
                "fernapi/fern-typescript-sdk",
                "fernapi/fern-typescript-node-sdk",
                "fernapi/fern-typescript-browser-sdk"
            ];

            for (const generatorName of typescriptGenerators) {
                expect(migrations[generatorName]).toBeDefined();
                expect(migrations[generatorName]?.migrations).toBeDefined();
                expect(Array.isArray(migrations[generatorName]?.migrations)).toBe(true);
            }
        });

        it("all TypeScript variants share the same migration module", () => {
            const typescriptModule1 = migrations["fernapi/fern-typescript"];
            const typescriptModule2 = migrations["fernapi/fern-typescript-sdk"];
            const typescriptModule3 = migrations["fernapi/fern-typescript-node-sdk"];
            const typescriptModule4 = migrations["fernapi/fern-typescript-browser-sdk"];

            expect(typescriptModule1).toBe(typescriptModule2);
            expect(typescriptModule2).toBe(typescriptModule3);
            expect(typescriptModule3).toBe(typescriptModule4);
        });

        it("TypeScript migrations have correct structure", () => {
            const module = migrations["fernapi/fern-typescript-sdk"];

            expect(module).toBeDefined();
            expect(module?.migrations).toBeDefined();
            expect(module?.migrations.length).toBeGreaterThan(0);

            // Check each migration has required properties
            for (const migration of module?.migrations ?? []) {
                expect(migration).toHaveProperty("version");
                expect(migration).toHaveProperty("migrateGeneratorConfig");
                expect(migration).toHaveProperty("migrateGeneratorsYml");
                expect(typeof migration.version).toBe("string");
                expect(typeof migration.migrateGeneratorConfig).toBe("function");
                expect(typeof migration.migrateGeneratorsYml).toBe("function");
            }
        });

        it("TypeScript migrations are in semver order", () => {
            const module = migrations["fernapi/fern-typescript-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["1.0.0", "2.0.0", "3.0.0"]);
        });
    });

    describe("generator name lookup", () => {
        it("returns undefined for generators without migrations", () => {
            expect(migrations["fernapi/fern-python-sdk"]).toBeUndefined();
            expect(migrations["fernapi/fern-java-sdk"]).toBeUndefined();
            expect(migrations["fernapi/fern-go-sdk"]).toBeUndefined();
        });

        it("requires full generator name with fernapi prefix", () => {
            // Shorthand names should not work
            expect(migrations["fern-typescript-sdk"]).toBeUndefined();
            expect(migrations["typescript-sdk"]).toBeUndefined();

            // Full names should work
            expect(migrations["fernapi/fern-typescript-sdk"]).toBeDefined();
        });

        it("is case-sensitive", () => {
            expect(migrations["fernapi/fern-typescript-sdk"]).toBeDefined();
            expect(migrations["FERNAPI/FERN-TYPESCRIPT-SDK"]).toBeUndefined();
            expect(migrations["fernapi/fern-TypeScript-sdk"]).toBeUndefined();
        });
    });

    describe("package structure", () => {
        it("only exports migrations object", async () => {
            const exportedKeys = Object.keys(await import("../index.js"));
            expect(exportedKeys).toEqual(["migrations"]);
        });
    });
});
