import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { describe, expect, it, vi } from "vitest";

import { migration_1_0_0 } from "../migrations/1.0.0.js";
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
    name: "fernapi/fern-typescript-sdk",
    version: "0.9.0",
    config: configOverrides
});

describe("TypeScript SDK Migrations", () => {
    describe("migration_1_0_0", () => {
        it("sets all old defaults for undefined fields", () => {
            const config = createBaseConfig();

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                inlineFileProperties: false,
                inlinePathParameters: false,
                enableInlineTypes: false,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true
            });
        });

        it("preserves explicitly set fields", () => {
            const config = createBaseConfig({
                inlineFileProperties: true,
                inlinePathParameters: true,
                enableInlineTypes: true
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                inlineFileProperties: true,
                inlinePathParameters: true,
                enableInlineTypes: true,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig({
                outputDir: "./custom-output",
                customField: "custom-value"
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                outputDir: "./custom-output",
                customField: "custom-value"
            });
        });

        it("sets old defaults when fields are explicitly undefined", () => {
            const config = createBaseConfig({
                inlineFileProperties: undefined,
                inlinePathParameters: undefined
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                inlineFileProperties: false,
                inlinePathParameters: false
            });
        });

        it("handles null config field", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0",
                config: null
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                inlineFileProperties: false,
                inlinePathParameters: false,
                enableInlineTypes: false,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true
            });
        });

        it("handles missing config field", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0"
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                inlineFileProperties: false,
                inlinePathParameters: false,
                enableInlineTypes: false,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig({
                customField: "value"
            });
            const originalConfig = JSON.parse(JSON.stringify(config));

            migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(config).toEqual(originalConfig);
        });

        it("preserves top-level config properties", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0",
                output: { location: "npm" },
                github: { repository: "owner/repo" },
                config: {}
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.output).toEqual({ location: "npm" });
            expect(result.github).toEqual({ repository: "owner/repo" });
            expect(result.name).toBe("fernapi/fern-typescript-sdk");
            expect(result.version).toBe("0.9.0");
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
                streamType: "wrapper",
                fileResponseType: "stream",
                formDataSupport: "Node16",
                fetchSupport: "node-fetch"
            });
        });

        it("preserves explicitly set fields", () => {
            const config = createBaseConfig({
                streamType: "web",
                fileResponseType: "binary-response"
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                streamType: "web",
                fileResponseType: "binary-response",
                formDataSupport: "Node16",
                fetchSupport: "node-fetch"
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig({
                packageName: "@acme/sdk",
                version: "1.0.0"
            });

            const result = migration_2_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                packageName: "@acme/sdk",
                version: "1.0.0"
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig({
                streamType: "web"
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
        it("sets all old defaults for undefined fields", () => {
            const config = createBaseConfig();

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                packageManager: "yarn",
                testFramework: "jest"
            });
        });

        it("preserves explicitly set fields", () => {
            const config = createBaseConfig({
                packageManager: "pnpm",
                testFramework: "vitest"
            });

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                packageManager: "pnpm",
                testFramework: "vitest"
            });
        });

        it("preserves other config fields", () => {
            const config = createBaseConfig({
                packageName: "@acme/sdk",
                outputDir: "./dist"
            });

            const result = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                packageName: "@acme/sdk",
                outputDir: "./dist"
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig({
                packageManager: "pnpm"
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

            // Apply 3.0.0
            config = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should have all defaults from all migrations
            expect(config.config).toEqual({
                // From 1.0.0
                inlineFileProperties: false,
                inlinePathParameters: false,
                enableInlineTypes: false,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true,
                // From 2.0.0
                streamType: "wrapper",
                fileResponseType: "stream",
                formDataSupport: "Node16",
                fetchSupport: "node-fetch",
                // From 3.0.0
                packageManager: "yarn",
                testFramework: "jest"
            });
        });

        it("preserves user config through sequential migrations", () => {
            let config = createBaseConfig({
                inlineFileProperties: true,
                streamType: "web",
                packageManager: "pnpm",
                customField: "preserved"
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
            config = migration_3_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // User config should be preserved
            expect(config.config).toMatchObject({
                inlineFileProperties: true,
                streamType: "web",
                packageManager: "pnpm",
                customField: "preserved"
            });
        });
    });

    describe("migration module", () => {
        it("exports all migrations in correct order", () => {
            expect(migrationModule.migrations).toHaveLength(3);
            expect(migrationModule.migrations[0]).toBe(migration_1_0_0);
            expect(migrationModule.migrations[1]).toBe(migration_2_0_0);
            expect(migrationModule.migrations[2]).toBe(migration_3_0_0);
        });

        it("all migrations have correct versions", () => {
            expect(migration_1_0_0.version).toBe("1.0.0");
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
        it("handles config with string value instead of object", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0",
                config: "invalid-string-config" as unknown as Record<string, unknown>
            };

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should treat invalid config as empty and add defaults
            expect(result.config).toMatchObject({
                inlineFileProperties: false,
                useLegacyExports: true
            });
        });

        it("handles config with boolean fields set to false", () => {
            const config = createBaseConfig({
                inlineFileProperties: false,
                noSerdeLayer: false
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should preserve explicit false values
            expect(result.config?.inlineFileProperties).toBe(false);
            expect(result.config?.noSerdeLayer).toBe(false);
        });

        it("handles nested object config fields", () => {
            const config = createBaseConfig({
                nested: {
                    field1: "value1",
                    field2: "value2"
                }
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                nested: {
                    field1: "value1",
                    field2: "value2"
                }
            });
        });

        it("handles array config fields", () => {
            const config = createBaseConfig({
                excludedFiles: ["*.test.ts", "*.spec.ts"]
            });

            const result = migration_1_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config?.excludedFiles).toEqual(["*.test.ts", "*.spec.ts"]);
        });
    });
});
