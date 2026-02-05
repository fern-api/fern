import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { describe, expect, it, vi } from "vitest";

import { migration_2_0_0 } from "../migrations/2.0.0.js";
import { migration_3_0_0 } from "../migrations/3.0.0.js";
import migrationModule from "../migrations/index.js";

const mockLogger: Logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
} as unknown as Logger;

const createBaseConfig = (configOverrides?: Record<string, unknown>): generatorsYml.GeneratorInvocationSchema => ({
    name: "fernapi/fern-java-sdk",
    version: "1.9.0",
    config: configOverrides
});

describe("Java SDK Migrations", () => {
    describe("migration_2_0_0", () => {
        it("sets old default for disable-required-property-builder-checks", () => {
            const config = createBaseConfig();

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("preserves explicitly set field to false", () => {
            const config = createBaseConfig({
                "disable-required-property-builder-checks": false
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": false
            });
        });

        it("preserves explicitly set field to true", () => {
            const config = createBaseConfig({
                "disable-required-property-builder-checks": true
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig({
                "client-class-name": "AcmeClient",
                "wrapped-aliases": true
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                "client-class-name": "AcmeClient",
                "wrapped-aliases": true
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig({
                "client-class-name": "AcmeClient"
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

    describe("migration_3_0_0", () => {
        it("sets old default for enable-forward-compatible-enums", () => {
            const config = createBaseConfig();

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "enable-forward-compatible-enums": false
            });
        });

        it("preserves explicitly set field to true", () => {
            const config = createBaseConfig({
                "enable-forward-compatible-enums": true
            });

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "enable-forward-compatible-enums": true
            });
        });

        it("preserves explicitly set field to false", () => {
            const config = createBaseConfig({
                "enable-forward-compatible-enums": false
            });

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "enable-forward-compatible-enums": false
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig({
                "client-class-name": "AcmeClient",
                mode: "server"
            });

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                "client-class-name": "AcmeClient",
                mode: "server"
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig({
                mode: "server"
            });
            const originalConfig = JSON.parse(JSON.stringify(config));

            migration_3_0_0.migrateGeneratorConfig({
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

            const result = migration_3_0_0.migrateGeneratorsYml({
                document,
                context: { logger: mockLogger }
            });

            expect(result).toBe(document);
        });
    });

    describe("sequential migration application", () => {
        it("applies migrations in sequence correctly", () => {
            let config = createBaseConfig();

            // Apply 2.0.0
            config = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Apply 3.0.0
            config = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should have defaults from both migrations
            expect(config.config).toEqual({
                "disable-required-property-builder-checks": true,
                "enable-forward-compatible-enums": false
            });
        });

        it("preserves user config through sequential migrations", () => {
            let config = createBaseConfig({
                "disable-required-property-builder-checks": false,
                "enable-forward-compatible-enums": true,
                "client-class-name": "CustomClient"
            });

            // Apply all migrations
            config = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });
            config = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // User config should be preserved
            expect(config.config).toMatchObject({
                "disable-required-property-builder-checks": false,
                "enable-forward-compatible-enums": true,
                "client-class-name": "CustomClient"
            });
        });
    });

    describe("migration module", () => {
        it("exports all migrations in correct order", () => {
            expect(migrationModule.migrations).toHaveLength(2);
            expect(migrationModule.migrations[0]).toBe(migration_2_0_0);
            expect(migrationModule.migrations[1]).toBe(migration_3_0_0);
        });

        it("all migrations have correct versions", () => {
            expect(migration_2_0_0.version).toBe("2.0.0");
            expect(migration_3_0_0.version).toBe("3.0.0");
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
                name: "fernapi/fern-java-sdk",
                version: "1.9.0",
                config: null
            };

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("handles missing config field", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-java-sdk",
                version: "1.9.0"
            };

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("handles config with boolean fields set to false", () => {
            const config = createBaseConfig({
                "disable-required-property-builder-checks": false,
                "enable-forward-compatible-enums": false
            });

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should preserve explicit false values
            expect(result.config?.["disable-required-property-builder-checks"]).toBe(false);
            expect(result.config?.["enable-forward-compatible-enums"]).toBe(false);
        });

        it("handles nested object config fields", () => {
            const config = createBaseConfig({
                maven: {
                    groupId: "com.acme",
                    artifactId: "acme-sdk"
                }
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                maven: {
                    groupId: "com.acme",
                    artifactId: "acme-sdk"
                }
            });
        });
    });
});
