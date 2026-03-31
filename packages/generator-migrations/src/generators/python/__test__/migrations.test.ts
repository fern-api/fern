import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { describe, expect, it, vi } from "vitest";

import { migration_4_0_0 } from "../migrations/4.0.0.js";
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
    version: "3.9.0",
    config: configOverrides
});

describe("Python SDK Migrations", () => {
    describe("migration_4_0_0", () => {
        it("sets old default for use_pydantic_field_aliases in nested config", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk");

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("preserves explicitly set field to false", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                pydantic_config: {
                    use_pydantic_field_aliases: false
                }
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: false
                }
            });
        });

        it("preserves explicitly set field to true", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("creates pydantic_config object if it does not exist", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                client_class_name: "AcmeClient"
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                client_class_name: "AcmeClient",
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("preserves other pydantic_config fields", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                pydantic_config: {
                    version: "v2",
                    frozen: true
                }
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    version: "v2",
                    frozen: true,
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("preserves other top-level config fields", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                client_class_name: "AcmeClient",
                timeout_in_seconds: 60
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                client_class_name: "AcmeClient",
                timeout_in_seconds: 60
            });
        });

        it("does not mutate original config", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                client_class_name: "AcmeClient"
            });
            const originalConfig = JSON.parse(JSON.stringify(config));

            migration_4_0_0.migrateGeneratorConfig({
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

            const result = migration_4_0_0.migrateGeneratorsYml({
                document,
                context: { logger: mockLogger }
            });

            expect(result).toBe(document);
        });

        it("works with fastapi-server generator", () => {
            const config = createBaseConfig("fernapi/fern-fastapi-server");

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("works with pydantic-model generator", () => {
            const config = createBaseConfig("fernapi/fern-pydantic-model");

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });
    });

    describe("migration module", () => {
        it("exports all migrations in correct order", () => {
            expect(migrationModule.migrations).toHaveLength(1);
            expect(migrationModule.migrations[0]).toBe(migration_4_0_0);
        });

        it("all migrations have correct versions", () => {
            expect(migration_4_0_0.version).toBe("4.0.0");
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
                name: "fernapi/fern-python-sdk",
                version: "3.9.0",
                config: null
            };

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("handles missing config field", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-python-sdk",
                version: "3.9.0"
            };

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("handles pydantic_config with explicit undefined", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                pydantic_config: {
                    use_pydantic_field_aliases: undefined
                }
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config?.pydantic_config).toMatchObject({
                use_pydantic_field_aliases: true
            });
        });

        it("handles null pydantic_config", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                pydantic_config: null
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should still create the pydantic_config object
            expect(result.config).toEqual({
                pydantic_config: {
                    use_pydantic_field_aliases: true
                }
            });
        });

        it("handles string pydantic_config (invalid type)", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                pydantic_config: "invalid-string" as unknown as Record<string, unknown>
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            // Should skip migration for invalid types
            expect(result.config?.pydantic_config).toBe("invalid-string");
        });

        it("preserves top-level config properties", () => {
            const config: generatorsYml.GeneratorInvocationSchema = {
                name: "fernapi/fern-python-sdk",
                version: "3.9.0",
                output: { location: "pypi", package_name: "acme-sdk" },
                github: { repository: "acme/sdk" },
                config: {}
            };

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.output).toEqual({ location: "pypi", package_name: "acme-sdk" });
            expect(result.github).toEqual({ repository: "acme/sdk" });
            expect(result.name).toBe("fernapi/fern-python-sdk");
            expect(result.version).toBe("3.9.0");
        });

        it("handles nested objects in config", () => {
            const config = createBaseConfig("fernapi/fern-python-sdk", {
                extras: {
                    dev: ["pytest", "mypy"],
                    docs: ["sphinx"]
                }
            });

            const result = migration_4_0_0.migrateGeneratorConfig({
                config,
                context: { logger: mockLogger }
            });

            expect(result.config).toMatchObject({
                extras: {
                    dev: ["pytest", "mypy"],
                    docs: ["sphinx"]
                }
            });
        });
    });
});
