import { NOOP_LOGGER } from "@fern-api/logger";
import { describe, expect, it } from "vitest";

import { runMigrations } from "../loader";
import { Migration } from "../types";

describe("runMigrations", () => {
    it("should apply migrations sequentially", () => {
        const migration1: Migration = {
            version: "2.0.0",
            migrateGeneratorConfig: ({ config }) => ({
                ...config,
                config: {
                    ...(typeof config.config === "object" ? config.config : {}),
                    field1: "added-by-migration-1"
                }
            }),
            migrateGeneratorsYml: ({ document }) => document
        };

        const migration2: Migration = {
            version: "2.1.0",
            migrateGeneratorConfig: ({ config }) => ({
                ...config,
                config: {
                    ...(typeof config.config === "object" ? config.config : {}),
                    field2: "added-by-migration-2"
                }
            }),
            migrateGeneratorsYml: ({ document }) => document
        };

        const inputConfig = {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0"
        };

        const result = runMigrations({
            migrations: [migration1, migration2],
            config: inputConfig,
            logger: NOOP_LOGGER
        });

        expect(result.migrationsApplied).toBe(2);
        expect(result.appliedVersions).toEqual(["2.0.0", "2.1.0"]);
        expect(result.config).toEqual({
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                field1: "added-by-migration-1",
                field2: "added-by-migration-2"
            }
        });
    });

    it("should handle empty migrations array", () => {
        const inputConfig = {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0"
        };

        const result = runMigrations({ migrations: [], config: inputConfig, logger: NOOP_LOGGER });

        expect(result.migrationsApplied).toBe(0);
        expect(result.appliedVersions).toEqual([]);
        expect(result.config).toEqual(inputConfig);
    });

    it("should pipe output from one migration to the next", () => {
        const migration1: Migration = {
            version: "2.0.0",
            migrateGeneratorConfig: ({ config }) => ({
                ...config,
                config: {
                    value: 10
                }
            }),
            migrateGeneratorsYml: ({ document }) => document
        };

        const migration2: Migration = {
            version: "2.1.0",
            migrateGeneratorConfig: ({ config }) => {
                const value =
                    typeof config.config === "object" && config.config && "value" in config.config
                        ? (config.config.value as number)
                        : 0;
                return {
                    ...config,
                    config: {
                        value: value * 2 // Double the value from migration1
                    }
                };
            },
            migrateGeneratorsYml: ({ document }) => document
        };

        const inputConfig = {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0"
        };

        const result = runMigrations({
            migrations: [migration1, migration2],
            config: inputConfig,
            logger: NOOP_LOGGER
        });

        expect(result.config).toEqual({
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                value: 20 // 10 * 2
            }
        });
    });

    it("should preserve existing config fields", () => {
        const migration: Migration = {
            version: "2.0.0",
            migrateGeneratorConfig: ({ config }) => ({
                ...config,
                config: {
                    ...(typeof config.config === "object" ? config.config : {}),
                    newField: "added"
                }
            }),
            migrateGeneratorsYml: ({ document }) => document
        };

        const inputConfig = {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                existingField: "should-be-preserved"
            }
        };

        const result = runMigrations({ migrations: [migration], config: inputConfig, logger: NOOP_LOGGER });

        expect(result.config).toEqual({
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                existingField: "should-be-preserved",
                newField: "added"
            }
        });
    });

    it("should handle renaming fields", () => {
        const migration: Migration = {
            version: "2.0.0",
            migrateGeneratorConfig: ({ config }) => {
                const cfg =
                    typeof config.config === "object" && config.config
                        ? (config.config as Record<string, unknown>)
                        : {};
                if ("oldName" in cfg) {
                    const { oldName, ...rest } = cfg;
                    return {
                        ...config,
                        config: {
                            ...rest,
                            newName: oldName
                        }
                    };
                }
                return config;
            },
            migrateGeneratorsYml: ({ document }) => document
        };

        const inputConfig = {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                oldName: "value",
                otherField: "preserved"
            }
        };

        const result = runMigrations({ migrations: [migration], config: inputConfig, logger: NOOP_LOGGER });

        expect(result.config).toEqual({
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                newName: "value",
                otherField: "preserved"
            }
        });
    });

    it("should handle removing fields", () => {
        const migration: Migration = {
            version: "2.0.0",
            migrateGeneratorConfig: ({ config }) => {
                const cfg =
                    typeof config.config === "object" && config.config
                        ? (config.config as Record<string, unknown>)
                        : {};
                if ("deprecated" in cfg) {
                    const { deprecated, ...rest } = cfg;
                    return {
                        ...config,
                        config: rest
                    };
                }
                return config;
            },
            migrateGeneratorsYml: ({ document }) => document
        };

        const inputConfig = {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                deprecated: "should-be-removed",
                kept: "should-remain"
            }
        };

        const result = runMigrations({ migrations: [migration], config: inputConfig, logger: NOOP_LOGGER });

        expect(result.config).toEqual({
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0",
            config: {
                kept: "should-remain"
            }
        });
    });
});
