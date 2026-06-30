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
                "fernenterprise/fern-typescript",
                "fernenterprise/fern-typescript-sdk",
                "fernenterprise/fern-typescript-node-sdk",
                "fernenterprise/fern-typescript-browser-sdk"
            ];

            for (const generatorName of typescriptGenerators) {
                expect(migrations[generatorName]).toBeDefined();
                expect(migrations[generatorName]?.migrations).toBeDefined();
                expect(Array.isArray(migrations[generatorName]?.migrations)).toBe(true);
            }
        });

        it("all TypeScript variants share the same migration module", () => {
            const typescriptModule1 = migrations["fernenterprise/fern-typescript"];
            const typescriptModule2 = migrations["fernenterprise/fern-typescript-sdk"];
            const typescriptModule3 = migrations["fernenterprise/fern-typescript-node-sdk"];
            const typescriptModule4 = migrations["fernenterprise/fern-typescript-browser-sdk"];

            expect(typescriptModule1).toBe(typescriptModule2);
            expect(typescriptModule2).toBe(typescriptModule3);
            expect(typescriptModule3).toBe(typescriptModule4);
        });

        it("TypeScript migrations have correct structure", () => {
            const module = migrations["fernenterprise/fern-typescript-sdk"];

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
            const module = migrations["fernenterprise/fern-typescript-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["1.0.0", "2.0.0", "3.0.0", "4.0.0"]);
        });
    });

    describe("C# SDK migrations", () => {
        it("includes C# SDK migration entries", () => {
            expect(migrations["fernenterprise/fern-csharp-sdk"]).toBeDefined();
            expect(migrations["fernenterprise/fern-csharp-sdk"]?.migrations).toBeDefined();
            expect(Array.isArray(migrations["fernenterprise/fern-csharp-sdk"]?.migrations)).toBe(true);
        });

        it("C# migrations have correct structure", () => {
            const module = migrations["fernenterprise/fern-csharp-sdk"];

            expect(module).toBeDefined();
            expect(module?.migrations.length).toBeGreaterThan(0);

            for (const migration of module?.migrations ?? []) {
                expect(migration).toHaveProperty("version");
                expect(migration).toHaveProperty("migrateGeneratorConfig");
                expect(migration).toHaveProperty("migrateGeneratorsYml");
            }
        });

        it("C# migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-csharp-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["1.0.0", "2.0.0", "3.0.0"]);
        });
    });

    describe("Go SDK migrations", () => {
        it("includes Go SDK migration entries", () => {
            expect(migrations["fernenterprise/fern-go-sdk"]).toBeDefined();
            expect(migrations["fernenterprise/fern-go-sdk"]?.migrations).toBeDefined();
            expect(Array.isArray(migrations["fernenterprise/fern-go-sdk"]?.migrations)).toBe(true);
        });

        it("Go SDK migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-go-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["1.0.0"]);
        });
    });

    describe("Java SDK migrations", () => {
        it("includes Java SDK migration entries", () => {
            expect(migrations["fernenterprise/fern-java-sdk"]).toBeDefined();
            expect(migrations["fernenterprise/fern-java-sdk"]?.migrations).toBeDefined();
            expect(Array.isArray(migrations["fernenterprise/fern-java-sdk"]?.migrations)).toBe(true);
        });

        it("Java SDK migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-java-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["2.0.0", "3.0.0", "4.0.0"]);
        });
    });

    describe("Java Model migrations", () => {
        it("includes Java Model migration entries", () => {
            const javaModelGenerators = ["fernenterprise/fern-java-model", "fernenterprise/fern-java-spring"];

            for (const generatorName of javaModelGenerators) {
                expect(migrations[generatorName]).toBeDefined();
                expect(migrations[generatorName]?.migrations).toBeDefined();
                expect(Array.isArray(migrations[generatorName]?.migrations)).toBe(true);
            }
        });

        it("Java Model and Spring share the same migration module", () => {
            const javaModelModule = migrations["fernenterprise/fern-java-model"];
            const javaSpringModule = migrations["fernenterprise/fern-java-spring"];

            expect(javaModelModule).toBe(javaSpringModule);
        });

        it("Java Model migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-java-model"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["1.0.0"]);
        });
    });

    describe("Python SDK migrations", () => {
        it("includes Python SDK migration entries", () => {
            const pythonGenerators = [
                "fernenterprise/fern-python-sdk",
                "fernenterprise/fern-fastapi-server",
                "fernenterprise/fern-pydantic-model"
            ];

            for (const generatorName of pythonGenerators) {
                expect(migrations[generatorName]).toBeDefined();
                expect(migrations[generatorName]?.migrations).toBeDefined();
                expect(Array.isArray(migrations[generatorName]?.migrations)).toBe(true);
            }
        });

        it("all Python variants share the same migration module", () => {
            const pythonSdkModule = migrations["fernenterprise/fern-python-sdk"];
            const fastapiModule = migrations["fernenterprise/fern-fastapi-server"];
            const pydanticModule = migrations["fernenterprise/fern-pydantic-model"];

            expect(pythonSdkModule).toBe(fastapiModule);
            expect(fastapiModule).toBe(pydanticModule);
        });

        it("Python migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-python-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["4.0.0", "4.54.4", "6.0.0"]);
        });
    });

    describe("PHP SDK migrations", () => {
        it("includes PHP SDK migration entries", () => {
            expect(migrations["fernenterprise/fern-php-sdk"]).toBeDefined();
            expect(migrations["fernenterprise/fern-php-sdk"]?.migrations).toBeDefined();
            expect(Array.isArray(migrations["fernenterprise/fern-php-sdk"]?.migrations)).toBe(true);
        });

        it("PHP SDK migrations have correct structure", () => {
            const module = migrations["fernenterprise/fern-php-sdk"];

            expect(module).toBeDefined();
            expect(module?.migrations.length).toBeGreaterThan(0);

            for (const migration of module?.migrations ?? []) {
                expect(migration).toHaveProperty("version");
                expect(migration).toHaveProperty("migrateGeneratorConfig");
                expect(migration).toHaveProperty("migrateGeneratorsYml");
            }
        });

        it("PHP SDK migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-php-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["3.0.0"]);
        });
    });

    describe("Ruby SDK migrations", () => {
        it("includes Ruby SDK migration entries", () => {
            expect(migrations["fernenterprise/fern-ruby-sdk"]).toBeDefined();
            expect(migrations["fernenterprise/fern-ruby-sdk"]?.migrations).toBeDefined();
            expect(Array.isArray(migrations["fernenterprise/fern-ruby-sdk"]?.migrations)).toBe(true);
        });

        it("Ruby SDK migrations have correct structure", () => {
            const module = migrations["fernenterprise/fern-ruby-sdk"];

            expect(module).toBeDefined();
            expect(module?.migrations.length).toBeGreaterThan(0);

            for (const migration of module?.migrations ?? []) {
                expect(migration).toHaveProperty("version");
                expect(migration).toHaveProperty("migrateGeneratorConfig");
                expect(migration).toHaveProperty("migrateGeneratorsYml");
            }
        });

        it("Ruby SDK migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-ruby-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["2.0.0"]);
        });
    });

    describe("Rust SDK migrations", () => {
        it("includes Rust SDK migration entries", () => {
            expect(migrations["fernenterprise/fern-rust-sdk"]).toBeDefined();
            expect(migrations["fernenterprise/fern-rust-sdk"]?.migrations).toBeDefined();
            expect(Array.isArray(migrations["fernenterprise/fern-rust-sdk"]?.migrations)).toBe(true);
        });

        it("Rust SDK migrations have correct structure", () => {
            const module = migrations["fernenterprise/fern-rust-sdk"];

            expect(module).toBeDefined();
            expect(module?.migrations.length).toBeGreaterThan(0);

            for (const migration of module?.migrations ?? []) {
                expect(migration).toHaveProperty("version");
                expect(migration).toHaveProperty("migrateGeneratorConfig");
                expect(migration).toHaveProperty("migrateGeneratorsYml");
            }
        });

        it("Rust SDK migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-rust-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["1.0.0"]);
        });
    });

    describe("Swift SDK migrations", () => {
        it("includes Swift SDK migration entries", () => {
            expect(migrations["fernenterprise/fern-swift-sdk"]).toBeDefined();
            expect(migrations["fernenterprise/fern-swift-sdk"]?.migrations).toBeDefined();
            expect(Array.isArray(migrations["fernenterprise/fern-swift-sdk"]?.migrations)).toBe(true);
        });

        it("Swift SDK migrations have correct structure", () => {
            const module = migrations["fernenterprise/fern-swift-sdk"];

            expect(module).toBeDefined();
            expect(module?.migrations.length).toBeGreaterThan(0);

            for (const migration of module?.migrations ?? []) {
                expect(migration).toHaveProperty("version");
                expect(migration).toHaveProperty("migrateGeneratorConfig");
                expect(migration).toHaveProperty("migrateGeneratorsYml");
            }
        });

        it("Swift SDK migrations are in semver order", () => {
            const module = migrations["fernenterprise/fern-swift-sdk"];
            const versions = module?.migrations.map((m) => m.version) ?? [];

            expect(versions).toEqual(["1.0.0"]);
        });
    });

    describe("generator name lookup", () => {
        it("returns undefined for generators without migrations", () => {
            expect(migrations["fernenterprise/fern-openapi"]).toBeUndefined();
        });

        it("requires full generator name with fernapi prefix", () => {
            // Shorthand names should not work
            expect(migrations["fern-typescript-sdk"]).toBeUndefined();
            expect(migrations["typescript-sdk"]).toBeUndefined();

            // Full names should work
            expect(migrations["fernenterprise/fern-typescript-sdk"]).toBeDefined();
        });

        it("is case-sensitive", () => {
            expect(migrations["fernenterprise/fern-typescript-sdk"]).toBeDefined();
            expect(migrations["FERNAPI/FERN-TYPESCRIPT-SDK"]).toBeUndefined();
            expect(migrations["fernenterprise/fern-TypeScript-sdk"]).toBeUndefined();
        });
    });

    describe("package structure", () => {
        it("only exports migrations object", async () => {
            const exportedKeys = Object.keys(await import("../index.js"));
            expect(exportedKeys).toEqual(["migrations"]);
        });
    });
});
