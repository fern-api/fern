import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { NOOP_LOGGER } from "@fern-api/logger";
import type { Migration, MigrationContext } from "@fern-api/migrations-base";

/**
 * Test utilities for Fern generator migrations.
 * Provides helpers to make migration testing easier and more consistent.
 */

/**
 * Options for testing a migration.
 */
export interface TestMigrationOptions {
    /**
     * The migration to test.
     */
    migration: Migration;

    /**
     * The input generator configuration.
     */
    input: generatorsYml.GeneratorInvocationSchema;

    /**
     * The expected output configuration.
     */
    expected: generatorsYml.GeneratorInvocationSchema;

    /**
     * Optional logger for the migration context.
     * Defaults to NOOP logger if not provided.
     */
    logger?: Logger;
}

/**
 * Result of a migration test.
 */
export interface TestMigrationResult {
    /**
     * The actual output from the migration.
     */
    actual: generatorsYml.GeneratorInvocationSchema;

    /**
     * Whether the actual output matches the expected output.
     */
    matches: boolean;

    /**
     * Differences between actual and expected (if any).
     */
    differences?: string[];
}

/**
 * Tests a migration against input and expected output.
 * Returns the actual output and whether it matches expectations.
 *
 * @param options - Test options
 * @returns Test result with actual output and match status
 *
 * @example
 * ```typescript
 * const result = testMigration({
 *   migration: migration_2_0_0,
 *   input: { name: "typescript-sdk", version: "1.0.0", config: {} },
 *   expected: { name: "typescript-sdk", version: "1.0.0", config: { newField: "default" } }
 * });
 *
 * expect(result.matches).toBe(true);
 * ```
 */
export function testMigration(options: TestMigrationOptions): TestMigrationResult {
    const { migration, input, expected, logger = NOOP_LOGGER } = options;

    const context: MigrationContext = { logger };
    const actual = migration.migrateGeneratorConfig({ config: input, context });

    const matches = JSON.stringify(actual) === JSON.stringify(expected);

    if (!matches) {
        const differences = findDifferences(actual, expected);
        return { actual, matches: false, differences };
    }

    return { actual, matches: true };
}

/**
 * Tests multiple migrations applied sequentially.
 *
 * @param options - Test options with multiple migrations
 * @returns Test result with actual output after all migrations
 *
 * @example
 * ```typescript
 * const result = testMigrationChain({
 *   migrations: [migration_1_0_0, migration_2_0_0, migration_3_0_0],
 *   input: { name: "typescript-sdk", version: "0.9.0", config: {} },
 *   expected: { name: "typescript-sdk", version: "0.9.0", config: { field1: true, field2: "value" } }
 * });
 *
 * expect(result.matches).toBe(true);
 * ```
 */
export function testMigrationChain(options: {
    migrations: Migration[];
    input: generatorsYml.GeneratorInvocationSchema;
    expected: generatorsYml.GeneratorInvocationSchema;
    logger?: Logger;
}): TestMigrationResult {
    const { migrations, input, expected, logger = NOOP_LOGGER } = options;

    const context: MigrationContext = { logger };
    let current = input;

    for (const migration of migrations) {
        current = migration.migrateGeneratorConfig({ config: current, context });
    }

    const matches = JSON.stringify(current) === JSON.stringify(expected);

    if (!matches) {
        const differences = findDifferences(current, expected);
        return { actual: current, matches: false, differences };
    }

    return { actual: current, matches: true };
}

/**
 * Tests that a migration is idempotent (can be run multiple times safely).
 *
 * @param options - Test options
 * @returns Whether the migration is idempotent
 *
 * @example
 * ```typescript
 * const isIdempotent = testMigrationIdempotence({
 *   migration: migration_2_0_0,
 *   input: { name: "typescript-sdk", version: "1.0.0", config: {} }
 * });
 *
 * expect(isIdempotent).toBe(true);
 * ```
 */
export function testMigrationIdempotence(options: {
    migration: Migration;
    input: generatorsYml.GeneratorInvocationSchema;
    logger?: Logger;
}): boolean {
    const { migration, input, logger = NOOP_LOGGER } = options;

    const context: MigrationContext = { logger };

    // Run migration once
    const firstRun = migration.migrateGeneratorConfig({ config: input, context });

    // Run migration again on the result
    const secondRun = migration.migrateGeneratorConfig({ config: firstRun, context });

    // Results should be identical
    return JSON.stringify(firstRun) === JSON.stringify(secondRun);
}

/**
 * Tests that a migration preserves unknown fields.
 *
 * @param options - Test options
 * @returns Whether unknown fields were preserved
 *
 * @example
 * ```typescript
 * const preserves = testMigrationPreservesUnknownFields({
 *   migration: migration_2_0_0,
 *   input: {
 *     name: "typescript-sdk",
 *     version: "1.0.0",
 *     config: { unknownField: "should-be-preserved" }
 *   }
 * });
 *
 * expect(preserves).toBe(true);
 * ```
 */
export function testMigrationPreservesUnknownFields(options: {
    migration: Migration;
    input: generatorsYml.GeneratorInvocationSchema;
    logger?: Logger;
}): boolean {
    const { migration, input, logger = NOOP_LOGGER } = options;

    const context: MigrationContext = { logger };
    const output = migration.migrateGeneratorConfig({ config: input, context });

    // Check that all fields from input config are present in output config
    if (typeof input.config !== "object" || input.config == null) {
        return true; // No config to preserve
    }

    if (typeof output.config !== "object" || output.config == null) {
        return false; // Config was removed
    }

    const inputConfig = input.config as Record<string, unknown>;
    const outputConfig = output.config as Record<string, unknown>;

    for (const key of Object.keys(inputConfig)) {
        if (!(key in outputConfig)) {
            return false; // Field was removed
        }
    }

    return true;
}

/**
 * Mock logger that captures log messages for testing.
 */
export interface MockLogger {
    debugs: string[];
    infos: string[];
    warnings: string[];
    errors: string[];
    logger: Logger;
}

/**
 * Creates a mock logger that captures log messages for testing.
 *
 * @returns Mock logger with captured messages
 *
 * @example
 * ```typescript
 * const mockLogger = createMockLogger();
 * testMigration({ migration, input, expected, logger: mockLogger.logger });
 *
 * expect(mockLogger.warnings).toContain("Some warning");
 * ```
 */
export function createMockLogger(): MockLogger {
    const debugs: string[] = [];
    const infos: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    const logger: Logger = {
        ...NOOP_LOGGER,
        debug: (message: string) => {
            debugs.push(message);
        },
        info: (message: string) => {
            infos.push(message);
        },
        warn: (message: string) => {
            warnings.push(message);
        },
        error: (message: string) => {
            errors.push(message);
        }
    };

    return {
        debugs,
        infos,
        warnings,
        errors,
        logger
    };
}

/**
 * Helper to find differences between two objects.
 */
function findDifferences(
    actual: generatorsYml.GeneratorInvocationSchema,
    expected: generatorsYml.GeneratorInvocationSchema
): string[] {
    const differences: string[] = [];

    // Compare top-level fields
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    const allKeys = Array.from(new Set([...actualKeys, ...expectedKeys]));

    for (const key of allKeys) {
        const actualValue = (actual as unknown as Record<string, unknown>)[key];
        const expectedValue = (expected as unknown as Record<string, unknown>)[key];

        if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
            differences.push(
                `Field '${key}': expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`
            );
        }
    }

    return differences;
}
