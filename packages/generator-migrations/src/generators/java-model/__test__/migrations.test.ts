import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { describe, expect, it, vi } from "vitest";

import { migration_1_0_0 } from "../migrations/1.0.0.js";
import migrationModule from "../migrations/index.js";

const mockLogger: Logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
} as unknown as Logger;

const createBaseConfig = (
    generatorName: string,
    configOverrides?: Record<string, unknown>
): generatorsYml.GeneratorInvocationSchema => ({
    name: generatorName,
    version: "0.9.0",
    config: configOverrides
});

describe("Java Model Migrations", () => {
    describe("migration_1_0_0", () => {
        it("sets old default for disable-required-property-builder-checks", () => {
            const config = createBaseConfig("fernapi/fern-java-model");

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("preserves explicitly set field to false", () => {
            const config = createBaseConfig("fernapi/fern-java-model", {
                "disable-required-property-builder-checks": false
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": false
            });
        });

        it("preserves explicitly set field to true", () => {
            const config = createBaseConfig("fernapi/fern-java-model", {
                "disable-required-property-builder-checks": true
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig("fernapi/fern-java-model", {
                "wrapped-aliases": true,
                enablePublicConstructors: false
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                "wrapped-aliases": true,
                enablePublicConstructors: false
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig("fernapi/fern-java-model", {
                enablePublicConstructors: false
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

        it("works with java-spring generator", () => {
            const config = createBaseConfig("fernapi/fern-java-spring");

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });
    });

    describe("migration module", () => {
        it("exports all migrations in correct order", () => {
            expect(migrationModule.migrations).toHaveLength(1);
            expect(migrationModule.migrations[0]).toBe(migration_1_0_0);
        });

        it("all migrations have correct versions", () => {
            expect(migration_1_0_0.version).toBe("1.0.0");
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
                name: "fernapi/fern-java-model",
                version: "0.9.0",
                config: null
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("handles missing config field", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-java-model",
                version: "0.9.0"
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                "disable-required-property-builder-checks": true
            });
        });

        it("handles config with boolean field set to false", () => {
            const config = createBaseConfig("fernapi/fern-java-model", {
                "disable-required-property-builder-checks": false
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should preserve explicit false value
            expect(result.config?.["disable-required-property-builder-checks"]).toBe(false);
        });

        it("handles nested object config fields", () => {
            const config = createBaseConfig("fernapi/fern-java-model", {
                maven: {
                    groupId: "com.acme",
                    artifactId: "acme-models"
                }
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                maven: {
                    groupId: "com.acme",
                    artifactId: "acme-models"
                }
            });
        });

        it("preserves top-level config properties", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-java-model",
                version: "0.9.0",
                output: { location: "local-file-system", path: "./generated" },
                config: {}
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.output).toEqual({ location: "local-file-system", path: "./generated" });
            expect(result.name).toBe("fernapi/fern-java-model");
            expect(result.version).toBe("0.9.0");
        });
    });
});
