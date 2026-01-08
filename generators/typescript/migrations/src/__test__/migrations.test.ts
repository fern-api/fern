import { NOOP_LOGGER } from "@fern-api/logger";
import { describe, expect, it } from "vitest";

import migrationModule from "../index";

const migrations = migrationModule.migrations;

describe("TypeScript SDK Migrations", () => {
    const mockContext = { logger: NOOP_LOGGER };

    describe("migration_1_0_0", () => {
        const migration = migrations.find((m) => m.version === "1.0.0");

        it("should exist", () => {
            expect(migration).toBeDefined();
        });

        it("should set old defaults for all changed options", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0",
                config: {}
            };

            const result = migration?.migrateGeneratorConfig({ config, context: mockContext });

            expect(result?.config).toEqual({
                inlineFileProperties: false,
                inlinePathParameters: false,
                enableInlineTypes: false,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true
            });
        });

        it("should preserve explicitly set values", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0",
                config: {
                    inlineFileProperties: true,
                    customField: "preserved"
                }
            };

            const result = migration?.migrateGeneratorConfig({ config, context: mockContext });

            expect(result?.config).toEqual({
                inlineFileProperties: true, // Kept user's explicit value
                inlinePathParameters: false,
                enableInlineTypes: false,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true,
                customField: "preserved"
            });
        });

        it("should handle config being undefined", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0"
            };

            const result = migration?.migrateGeneratorConfig({ config, context: mockContext });

            expect(result?.config).toEqual({
                inlineFileProperties: false,
                inlinePathParameters: false,
                enableInlineTypes: false,
                noSerdeLayer: false,
                omitUndefined: false,
                skipResponseValidation: false,
                useLegacyExports: true
            });
        });
    });

    describe("migration_2_0_0", () => {
        const migration = migrations.find((m) => m.version === "2.0.0");

        it("should exist", () => {
            expect(migration).toBeDefined();
        });

        it("should set old defaults for all changed options", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "1.5.0",
                config: {}
            };

            const result = migration?.migrateGeneratorConfig({ config, context: mockContext });

            expect(result?.config).toEqual({
                streamType: "wrapper",
                fileResponseType: "stream",
                formDataSupport: "Node16",
                fetchSupport: "node-fetch"
            });
        });

        it("should preserve explicitly set values", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "1.5.0",
                config: {
                    streamType: "web", // User already opted into new default
                    existingField: "value"
                }
            };

            const result = migration?.migrateGeneratorConfig({ config, context: mockContext });

            expect(result?.config).toEqual({
                streamType: "web", // Kept user's explicit value
                fileResponseType: "stream",
                formDataSupport: "Node16",
                fetchSupport: "node-fetch",
                existingField: "value"
            });
        });
    });

    describe("migration_3_0_0", () => {
        const migration = migrations.find((m) => m.version === "3.0.0");

        it("should exist", () => {
            expect(migration).toBeDefined();
        });

        it("should set old defaults for all changed options", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "2.5.0",
                config: {}
            };

            const result = migration?.migrateGeneratorConfig({ config, context: mockContext });

            expect(result?.config).toEqual({
                packageManager: "yarn",
                testFramework: "jest"
            });
        });

        it("should preserve explicitly set values", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "2.5.0",
                config: {
                    packageManager: "pnpm", // User already using new default
                    otherConfig: "preserved"
                }
            };

            const result = migration?.migrateGeneratorConfig({ config, context: mockContext });

            expect(result?.config).toEqual({
                packageManager: "pnpm", // Kept user's explicit value
                testFramework: "jest",
                otherConfig: "preserved"
            });
        });
    });

    describe("sequential migrations", () => {
        it("should apply all three migrations in sequence for 0.x to 3.0 upgrade", () => {
            // Simulate upgrading from 0.9.0 to 3.0.0
            const initialConfig = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0",
                config: {
                    myCustomField: "should-be-preserved"
                }
            };

            // Apply 1.0.0 migration
            const after1 = migrations[0]?.migrateGeneratorConfig({ config: initialConfig, context: mockContext });

            // Apply 2.0.0 migration
            const after2 = migrations[1]?.migrateGeneratorConfig({ config: after1!, context: mockContext });

            // Apply 3.0.0 migration
            const finalConfig = migrations[2]?.migrateGeneratorConfig({ config: after2!, context: mockContext });

            // Should have all old defaults set
            expect(finalConfig?.config).toEqual({
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
                testFramework: "jest",
                // User's custom field
                myCustomField: "should-be-preserved"
            });
        });

        it("should only apply 2.0.0 and 3.0.0 migrations for 1.x to 3.0 upgrade", () => {
            // User already on 1.x with explicit config
            const initialConfig = {
                name: "fernapi/fern-typescript-sdk",
                version: "1.8.0",
                config: {
                    inlineFileProperties: true, // User explicitly set this
                    enableInlineTypes: true // User explicitly set this
                }
            };

            // Migration 1.0.0 would not be applied (CLI filters by version)
            // but let's verify it doesn't break if it is applied

            // Apply 2.0.0 migration
            const after2 = migrations[1]?.migrateGeneratorConfig({ config: initialConfig, context: mockContext });

            // Apply 3.0.0 migration
            const finalConfig = migrations[2]?.migrateGeneratorConfig({ config: after2!, context: mockContext });

            expect(finalConfig?.config).toEqual({
                // User's explicit values preserved
                inlineFileProperties: true,
                enableInlineTypes: true,
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
    });

    describe("idempotence", () => {
        it("should be safe to run migrations multiple times", () => {
            const config = {
                name: "fernapi/fern-typescript-sdk",
                version: "0.9.0",
                config: {}
            };

            // Apply migration twice
            const firstRun = migrations[0]?.migrateGeneratorConfig({ config, context: mockContext });
            const secondRun = migrations[0]?.migrateGeneratorConfig({
                config: firstRun ?? config,
                context: mockContext
            });

            // Should produce the same result
            expect(firstRun).toEqual(secondRun);
        });
    });
});
