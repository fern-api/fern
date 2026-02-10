import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { describe, expect, it, vi } from "vitest";

import { migration_1_0_0 } from "../migrations/1.0.0.js";
import { migration_2_0_0 } from "../migrations/2.0.0.js";
import migrationModule from "../migrations/index.js";

const mockLogger: Logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
} as unknown as Logger;

const createBaseConfig = (configOverrides?: Record<string, unknown>): generatorsYml.GeneratorInvocationSchema => ({
    name: "fernapi/fern-csharp-sdk",
    version: "0.9.0",
    config: configOverrides
});

describe("C# SDK Migrations", () => {
    describe("migration_1_0_0", () => {
        it("sets all old defaults for undefined fields", () => {
            const config = createBaseConfig();

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "root-namespace-for-core-classes": false,
                "pascal-case-environments": false,
                "simplify-object-dictionaries": false
            });
        });

        it("preserves explicitly set fields", () => {
            const config = createBaseConfig({
                "root-namespace-for-core-classes": true,
                "pascal-case-environments": true
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "root-namespace-for-core-classes": true,
                "pascal-case-environments": true,
                "simplify-object-dictionaries": false
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig({
                namespace: "Acme.Sdk",
                "client-class-name": "AcmeClient"
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                namespace: "Acme.Sdk",
                "client-class-name": "AcmeClient"
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig({
                namespace: "Acme.Sdk"
            });
            const originalConfig = JSON.parse(JSON.stringify(config));

            migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(config).toEqual(originalConfig);
        });

        it("returns unmodified document for migrateGeneratorsYml", () => {
            const document = {
                configuration: {
                    groups: {}
                }
            };

            const result = migration_1_0_0.migrateGeneratorsYml({
                document,
                context: { logger: mockLogger }
            });

            expect(result).toBe(document);
        });
    });

    describe("migration_2_0_0", () => {
        it("sets all old defaults for undefined fields", () => {
            const config = createBaseConfig();

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "additional-properties": false,
                "enable-forward-compatible-enums": false,
                "generate-mock-server-tests": false,
                "inline-path-parameters": false,
                "simplify-object-dictionaries": true,
                "use-discriminated-unions": false
            });
        });

        it("migrates experimental field names to stable names", () => {
            const config = createBaseConfig({
                "experimental-additional-properties": true,
                "experimental-enable-forward-compatible-enums": true
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "additional-properties": true,
                "enable-forward-compatible-enums": true,
                "generate-mock-server-tests": false,
                "inline-path-parameters": false,
                "simplify-object-dictionaries": true,
                "use-discriminated-unions": false
            });

            // Old names should be removed
            expect(result.config).not.toHaveProperty("experimental-additional-properties");
            expect(result.config).not.toHaveProperty("experimental-enable-forward-compatible-enums");
        });

        it("migrates experimental field even when stable field exists", () => {
            const config = createBaseConfig({
                "experimental-additional-properties": false,
                "additional-properties": true
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Experimental field is migrated first, then overwritten by ??=, so stable field wins
            // The migration first moves experimental to stable (false), then ??= doesn't change it
            // since it's already defined
            expect(result.config?.["additional-properties"]).toBe(false);
            expect(result.config).not.toHaveProperty("experimental-additional-properties");
        });

        it("preserves explicitly set fields", () => {
            const config = createBaseConfig({
                "additional-properties": true,
                "enable-forward-compatible-enums": true,
                "generate-mock-server-tests": true
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "additional-properties": true,
                "enable-forward-compatible-enums": true,
                "generate-mock-server-tests": true,
                "inline-path-parameters": false,
                "simplify-object-dictionaries": true,
                "use-discriminated-unions": false
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig({
                namespace: "Acme.Sdk",
                "target-framework": "net6.0"
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                namespace: "Acme.Sdk",
                "target-framework": "net6.0"
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig({
                "experimental-additional-properties": true
            });
            const originalConfig = JSON.parse(JSON.stringify(config));

            migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(config).toEqual(originalConfig);
        });

        it("returns unmodified document for migrateGeneratorsYml", () => {
            const document = {
                configuration: {
                    groups: {}
                }
            };

            const result = migration_2_0_0.migrateGeneratorsYml({
                document,
                context: { logger: mockLogger }
            });

            expect(result).toBe(document);
        });
    });

    describe("sequential migration application", () => {
        it("applies migrations in sequence correctly", () => {
            let config = createBaseConfig();

            // Apply 1.0.0
            config = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Apply 2.0.0
            config = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should have defaults from both migrations
            expect(config.config).toEqual({
                // From 1.0.0
                "root-namespace-for-core-classes": false,
                "pascal-case-environments": false,
                // simplify-object-dictionaries is set by both:
                // - 1.0.0 sets it to false
                // - 2.0.0 tries to set it to true, but ??= preserves the false from 1.0.0
                "simplify-object-dictionaries": false,
                "additional-properties": false,
                "enable-forward-compatible-enums": false,
                "generate-mock-server-tests": false,
                "inline-path-parameters": false,
                "use-discriminated-unions": false
            });
        });

        it("preserves user config through sequential migrations", () => {
            let config = createBaseConfig({
                "root-namespace-for-core-classes": true,
                "additional-properties": true,
                namespace: "Custom.Namespace"
            });

            // Apply all migrations
            config = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });
            config = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // User config should be preserved
            expect(config.config).toMatchObject({
                "root-namespace-for-core-classes": true,
                "additional-properties": true,
                namespace: "Custom.Namespace"
            });
        });
    });

    describe("migration module", () => {
        it("exports all migrations in correct order", () => {
            expect(migrationModule.migrations).toHaveLength(2);
            expect(migrationModule.migrations[0]).toBe(migration_1_0_0);
            expect(migrationModule.migrations[1]).toBe(migration_2_0_0);
        });

        it("all migrations have correct versions", () => {
            expect(migration_1_0_0.version).toBe("1.0.0");
            expect(migration_2_0_0.version).toBe("2.0.0");
        });

        it("all migrations are properly structured", () => {
            for (const migration of migrationModule.migrations) {
                expect(migration).toHaveProperty("version");
                expect(migration).toHaveProperty("migrateGeneratorConfig");
                expect(migration).toHaveProperty("migrateGeneratorsYml");
                expect(typeof migration.version).toBe("string");
                expect(typeof migration.migrateGeneratorConfig).toBe("function");
                expect(typeof migration.migrateGeneratorsYml).toBe("function");
            }
        });
    });

    describe("edge cases", () => {
        it("handles null config field", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-csharp-sdk",
                version: "0.9.0",
                config: null
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "root-namespace-for-core-classes": false,
                "pascal-case-environments": false,
                "simplify-object-dictionaries": false
            });
        });

        it("handles missing config field", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-csharp-sdk",
                version: "0.9.0"
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "root-namespace-for-core-classes": false,
                "pascal-case-environments": false,
                "simplify-object-dictionaries": false
            });
        });

        it("handles config with boolean fields set to false", () => {
            const config = createBaseConfig({
                "root-namespace-for-core-classes": false,
                "pascal-case-environments": false
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should preserve explicit false values
            expect(result.config?.["root-namespace-for-core-classes"]).toBe(false);
            expect(result.config?.["pascal-case-environments"]).toBe(false);
        });
    });
});
