import type { Migration } from "@fern-api/migrations-base";
import { describe, expect, it } from "vitest";

import {
    createMockLogger,
    testMigration,
    testMigrationChain,
    testMigrationIdempotence,
    testMigrationPreservesUnknownFields
} from "../index";

describe("migration-test-utils", () => {
    describe("testMigration", () => {
        it("should return matches: true when config matches expected", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { field: "value" }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0", config: { field: "value" } }
            });

            expect(result.matches).toBe(true);
            expect(result.actual).toEqual({ name: "test-generator", version: "1.0.0", config: { field: "value" } });
        });

        it("should return matches: false when config does not match expected", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { field: "actual-value" }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0", config: { field: "expected-value" } }
            });

            expect(result.matches).toBe(false);
            expect(result.differences).toBeDefined();
            expect(result.differences?.length).toBeGreaterThan(0);
        });

        it("should capture log messages when using mock logger", () => {
            const mockLogger = createMockLogger();
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config, context }) => {
                    context.logger.debug("Debug message");
                    context.logger.info("Info message");
                    context.logger.warn("Warning message");
                    return config;
                },
                migrateGeneratorsYml: ({ document }) => document
            };

            testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0" },
                logger: mockLogger.logger
            });

            expect(mockLogger.debugs).toContain("Debug message");
            expect(mockLogger.infos).toContain("Info message");
            expect(mockLogger.warnings).toContain("Warning message");
        });
    });

    describe("testMigrationChain", () => {
        it("should apply migrations sequentially", () => {
            const migration1: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { field1: "value1" }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const migration2: Migration = {
                version: "3.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: {
                        ...(typeof config.config === "object" ? config.config : {}),
                        field2: "value2"
                    }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigrationChain({
                migrations: [migration1, migration2],
                input: { name: "test-generator", version: "1.0.0" },
                expected: {
                    name: "test-generator",
                    version: "1.0.0",
                    config: { field1: "value1", field2: "value2" }
                }
            });

            expect(result.matches).toBe(true);
        });

        it("should work with empty migrations array", () => {
            const result = testMigrationChain({
                migrations: [],
                input: { name: "test-generator", version: "1.0.0", config: { existing: "value" } },
                expected: { name: "test-generator", version: "1.0.0", config: { existing: "value" } }
            });

            expect(result.matches).toBe(true);
        });
    });

    describe("testMigrationIdempotence", () => {
        it("should return true for idempotent migrations", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => {
                    const cfg = typeof config.config === "object" ? config.config : {};
                    return {
                        ...config,
                        config: {
                            ...cfg,
                            field: (cfg as Record<string, unknown>).field ?? "default"
                        }
                    };
                },
                migrateGeneratorsYml: ({ document }) => document
            };

            const isIdempotent = testMigrationIdempotence({
                migration,
                input: { name: "test-generator", version: "1.0.0" }
            });

            expect(isIdempotent).toBe(true);
        });

        it("should return false for non-idempotent migrations", () => {
            let counter = 0;
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { counter: ++counter } // Non-idempotent!
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const isIdempotent = testMigrationIdempotence({
                migration,
                input: { name: "test-generator", version: "1.0.0" }
            });

            expect(isIdempotent).toBe(false);
        });
    });

    describe("testMigrationPreservesUnknownFields", () => {
        it("should return true when unknown fields are preserved", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: {
                        ...(typeof config.config === "object" ? config.config : {}),
                        newField: "new-value"
                    }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const preserves = testMigrationPreservesUnknownFields({
                migration,
                input: {
                    name: "test-generator",
                    version: "1.0.0",
                    config: { unknownField: "should-be-kept", anotherUnknown: 42 }
                }
            });

            expect(preserves).toBe(true);
        });

        it("should return false when unknown fields are removed", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { onlyThis: "field" } // Removed all unknown fields!
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const preserves = testMigrationPreservesUnknownFields({
                migration,
                input: {
                    name: "test-generator",
                    version: "1.0.0",
                    config: { unknownField: "was-removed" }
                }
            });

            expect(preserves).toBe(false);
        });

        it("should return true when input has no config", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { newField: "value" }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const preserves = testMigrationPreservesUnknownFields({
                migration,
                input: { name: "test-generator", version: "1.0.0" }
            });

            expect(preserves).toBe(true);
        });
    });

    describe("createMockLogger", () => {
        it("should capture all log levels", () => {
            const mockLogger = createMockLogger();

            mockLogger.logger.debug("debug1");
            mockLogger.logger.debug("debug2");
            mockLogger.logger.info("info1");
            mockLogger.logger.warn("warn1");
            mockLogger.logger.error("error1");

            expect(mockLogger.debugs).toEqual(["debug1", "debug2"]);
            expect(mockLogger.infos).toEqual(["info1"]);
            expect(mockLogger.warnings).toEqual(["warn1"]);
            expect(mockLogger.errors).toEqual(["error1"]);
        });

        it("should start with empty arrays", () => {
            const mockLogger = createMockLogger();

            expect(mockLogger.debugs).toEqual([]);
            expect(mockLogger.infos).toEqual([]);
            expect(mockLogger.warnings).toEqual([]);
            expect(mockLogger.errors).toEqual([]);
        });
    });

    describe("error recovery", () => {
        it("should handle migrations that throw errors", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: () => {
                    throw new Error("Migration failed!");
                },
                migrateGeneratorsYml: ({ document }) => document
            };

            expect(() => {
                testMigration({
                    migration,
                    input: { name: "test-generator", version: "1.0.0" },
                    expected: { name: "test-generator", version: "1.0.0" }
                });
            }).toThrow("Migration failed!");
        });

        it("should handle migrations that return invalid config shape", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: () => {
                    // Return invalid shape (missing required fields)
                    return { invalid: "shape" } as never;
                },
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0" }
            });

            expect(result.matches).toBe(false);
            expect(result.differences).toBeDefined();
        });

        it("should handle migration chain that fails mid-stream", () => {
            const migration1: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { field1: "value1" }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const migration2: Migration = {
                version: "3.0.0",
                migrateGeneratorConfig: () => {
                    throw new Error("Second migration failed!");
                },
                migrateGeneratorsYml: ({ document }) => document
            };

            const migration3: Migration = {
                version: "4.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: {
                        ...(typeof config.config === "object" ? config.config : {}),
                        field3: "value3"
                    }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            expect(() => {
                testMigrationChain({
                    migrations: [migration1, migration2, migration3],
                    input: { name: "test-generator", version: "1.0.0" },
                    expected: { name: "test-generator", version: "1.0.0", config: { field1: "value1" } }
                });
            }).toThrow("Second migration failed!");
        });

        it("should handle migrations that mutate input (bad practice)", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => {
                    // BAD: Mutating input config
                    if (typeof config.config === "object" && config.config != null) {
                        (config.config as Record<string, unknown>).mutated = "bad";
                    }
                    return config;
                },
                migrateGeneratorsYml: ({ document }) => document
            };

            const input = { name: "test-generator", version: "1.0.0", config: { original: "value" } };
            const result = testMigration({
                migration,
                input,
                expected: { name: "test-generator", version: "1.0.0", config: { original: "value", mutated: "bad" } }
            });

            // Migration worked but mutated the input (which we can detect)
            expect(result.matches).toBe(true);
            expect((input.config as Record<string, unknown>).mutated).toBe("bad"); // Input was mutated!
        });
    });

    describe("version edge cases", () => {
        it("should handle pre-release versions", () => {
            const migration: Migration = {
                version: "2.0.0-beta.1",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { prerelease: true }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0", config: { prerelease: true } }
            });

            expect(result.matches).toBe(true);
        });

        it("should handle build metadata in versions", () => {
            const migration: Migration = {
                version: "2.0.0+build.123",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { buildMetadata: true }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0", config: { buildMetadata: true } }
            });

            expect(result.matches).toBe(true);
        });

        it("should handle version with both pre-release and build metadata", () => {
            const migration: Migration = {
                version: "2.0.0-rc.1+build.456",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { complex: "version" }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0", config: { complex: "version" } }
            });

            expect(result.matches).toBe(true);
        });

        it("should work with migrations in pre-release order", () => {
            const migrations: Migration[] = [
                {
                    version: "2.0.0-alpha.1",
                    migrateGeneratorConfig: ({ config }) => ({
                        ...config,
                        config: { alpha: true }
                    }),
                    migrateGeneratorsYml: ({ document }) => document
                },
                {
                    version: "2.0.0-beta.1",
                    migrateGeneratorConfig: ({ config }) => ({
                        ...config,
                        config: {
                            ...(typeof config.config === "object" ? config.config : {}),
                            beta: true
                        }
                    }),
                    migrateGeneratorsYml: ({ document }) => document
                },
                {
                    version: "2.0.0",
                    migrateGeneratorConfig: ({ config }) => ({
                        ...config,
                        config: {
                            ...(typeof config.config === "object" ? config.config : {}),
                            stable: true
                        }
                    }),
                    migrateGeneratorsYml: ({ document }) => document
                }
            ];

            const result = testMigrationChain({
                migrations,
                input: { name: "test-generator", version: "1.0.0" },
                expected: {
                    name: "test-generator",
                    version: "1.0.0",
                    config: { alpha: true, beta: true, stable: true }
                }
            });

            expect(result.matches).toBe(true);
        });
    });

    describe("edge cases", () => {
        it("should handle config with deeply nested objects", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: {
                        nested: {
                            deep: {
                                value: "preserved"
                            }
                        }
                    }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: {
                    name: "test-generator",
                    version: "1.0.0",
                    config: { nested: { deep: { value: "preserved" } } }
                }
            });

            expect(result.matches).toBe(true);
        });

        it("should handle config with arrays", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: {
                        items: ["item1", "item2", "item3"]
                    }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: {
                    name: "test-generator",
                    version: "1.0.0",
                    config: { items: ["item1", "item2", "item3"] }
                }
            });

            expect(result.matches).toBe(true);
        });

        it("should handle config with null values", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { nullField: null }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0", config: { nullField: null } }
            });

            expect(result.matches).toBe(true);
        });

        it("should handle config with boolean values", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { enabled: true, disabled: false }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: { name: "test-generator", version: "1.0.0", config: { enabled: true, disabled: false } }
            });

            expect(result.matches).toBe(true);
        });

        it("should handle config with number values", () => {
            const migration: Migration = {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }) => ({
                    ...config,
                    config: { count: 42, percentage: 0.75, negative: -10 }
                }),
                migrateGeneratorsYml: ({ document }) => document
            };

            const result = testMigration({
                migration,
                input: { name: "test-generator", version: "1.0.0" },
                expected: {
                    name: "test-generator",
                    version: "1.0.0",
                    config: { count: 42, percentage: 0.75, negative: -10 }
                }
            });

            expect(result.matches).toBe(true);
        });
    });
});
