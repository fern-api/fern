import type { generatorsYml } from "@fern-api/configuration";
import { produce } from "immer";

/**
 * Helper function to safely get config object from generator invocation.
 * Returns an empty object if config is not set or not an object.
 *
 * @param config - The generator invocation schema
 * @returns The config object or an empty object
 *
 * @example
 * ```typescript
 * const configObj = getConfigObject(config);
 * const migratedConfig = {
 *   ...configObj,
 *   newField: "value"
 * };
 * ```
 */
export function getConfigObject(config: generatorsYml.GeneratorInvocationSchema): Record<string, unknown> {
    return config.config && typeof config.config === "object" ? (config.config as Record<string, unknown>) : {};
}

/**
 * Helper function to set a config field only if it's not already defined.
 * This is useful for preserving user's explicit configuration while setting old defaults.
 *
 * @param configObj - The config object to check
 * @param field - The field name to check
 * @param defaultValue - The default value to set if field is undefined
 * @returns An object with the field set, or an empty object if already defined
 *
 * @example
 * ```typescript
 * const migratedConfig = {
 *   ...configObj,
 *   ...setIfUndefined(configObj, "newField", "default-value"),
 *   ...setIfUndefined(configObj, "anotherField", true)
 * };
 * ```
 */
export function setIfUndefined<T>(
    configObj: Record<string, unknown>,
    field: string,
    defaultValue: T
): Record<string, T> | Record<string, never> {
    return configObj[field] === undefined ? { [field]: defaultValue } : {};
}

/**
 * Helper function to create a migrated generator config with updated config object.
 *
 * @param originalConfig - The original generator invocation schema
 * @param migratedConfigObj - The migrated config object
 * @returns A new generator invocation schema with the migrated config
 *
 * @example
 * ```typescript
 * const configObj = getConfigObject(config);
 * const migratedConfigObj = {
 *   ...configObj,
 *   newField: "value"
 * };
 * return createMigratedConfig(config, migratedConfigObj);
 * ```
 */
export function createMigratedConfig(
    originalConfig: generatorsYml.GeneratorInvocationSchema,
    migratedConfigObj: Record<string, unknown>
): generatorsYml.GeneratorInvocationSchema {
    return {
        ...originalConfig,
        config: migratedConfigObj
    };
}

/**
 * Result of applying defaults with tracking information.
 */
export interface ApplyDefaultsResult {
    /**
     * The merged config object with defaults applied.
     */
    config: Record<string, unknown>;

    /**
     * Array of field names that were set (were undefined and got a default value).
     */
    fieldsSet: string[];

    /**
     * Array of field names that were skipped (already had a value).
     */
    fieldsSkipped: string[];
}

/**
 * Helper function to format a log message about fields that were set.
 *
 * @param fieldsSet - Array of field names that were set
 * @param fieldsSkipped - Array of field names that were skipped
 * @returns A formatted log message, or undefined if no fields were set
 *
 * @example
 * ```typescript
 * const result = applyDefaultsWithTracking(configObj, defaults);
 * const logMessage = formatFieldChanges(result.fieldsSet, result.fieldsSkipped);
 * if (logMessage) {
 *   context?.log?.(logMessage);
 * }
 * ```
 */
export function formatFieldChanges(fieldsSet: string[], fieldsSkipped: string[]): string | undefined {
    if (fieldsSet.length === 0) {
        return undefined;
    }

    const parts: string[] = [];
    parts.push(`Set ${fieldsSet.length} field(s): ${fieldsSet.join(", ")}`);

    if (fieldsSkipped.length > 0) {
        parts.push(`(skipped ${fieldsSkipped.length}: ${fieldsSkipped.join(", ")})`);
    }

    return parts.join(" ");
}

/**
 * Helper function to apply multiple field defaults in a single call.
 * Each field is only set if it's currently undefined.
 *
 * @param configObj - The config object to update
 * @param defaults - Object mapping field names to their default values
 * @returns A merged config object with defaults applied
 *
 * @example
 * ```typescript
 * const configObj = getConfigObject(config);
 * const migratedConfig = applyDefaults(configObj, {
 *   field1: "default1",
 *   field2: true,
 *   field3: 42
 * });
 * return createMigratedConfig(config, migratedConfig);
 * ```
 */
export function applyDefaults(
    configObj: Record<string, unknown>,
    defaults: Record<string, unknown>
): Record<string, unknown> {
    const result = { ...configObj };

    for (const [field, defaultValue] of Object.entries(defaults)) {
        if (result[field] === undefined) {
            result[field] = defaultValue;
        }
    }

    return result;
}

/**
 * Migrate a generator config using Immer's produce for immutable updates.
 * This is the recommended way to write migrations as it handles nested updates elegantly.
 *
 * @param config - The original generator config
 * @param updater - Function that mutates the config draft (uses Immer)
 * @returns A new generator config with updates applied
 *
 * @example
 * ```typescript
 * // Simple field updates
 * return migrateConfig(config, (draft) => {
 *   draft.oldField = false;  // Set old default
 *   draft.newField = true;   // Set new default
 * });
 *
 * // Conditional updates (only if undefined)
 * return migrateConfig(config, (draft) => {
 *   draft.field1 ??= false;  // Only set if undefined
 *   draft.field2 ??= true;
 * });
 *
 * // Nested updates
 * return migrateConfig(config, (draft) => {
 *   draft.nested ??= {};
 *   draft.nested.field = "value";
 * });
 *
 * // Removing fields
 * return migrateConfig(config, (draft) => {
 *   delete draft.deprecated;
 * });
 *
 * // Renaming fields
 * return migrateConfig(config, (draft) => {
 *   draft.newName = draft.oldName;
 *   delete draft.oldName;
 * });
 * ```
 */
export function migrateConfig(
    config: generatorsYml.GeneratorInvocationSchema,
    updater: (draft: Record<string, unknown>) => void
): generatorsYml.GeneratorInvocationSchema {
    const configObj = getConfigObject(config);

    const migratedConfigObj = produce(configObj, updater);

    return {
        ...config,
        config: migratedConfigObj
    };
}

/**
 * Helper function to apply multiple field defaults and track which fields were changed.
 * Each field is only set if it's currently undefined.
 *
 * @param configObj - The config object to update
 * @param defaults - Object mapping field names to their default values
 * @returns Result with config, fieldsSet, and fieldsSkipped
 *
 * @example
 * ```typescript
 * const configObj = getConfigObject(config);
 * const result = applyDefaultsWithTracking(configObj, {
 *   field1: "default1",
 *   field2: true,
 *   field3: 42
 * });
 * console.log(`Set: ${result.fieldsSet.join(", ")}`);
 * console.log(`Skipped: ${result.fieldsSkipped.join(", ")}`);
 * return createMigratedConfig(config, result.config);
 * ```
 */
export function applyDefaultsWithTracking(
    configObj: Record<string, unknown>,
    defaults: Record<string, unknown>
): ApplyDefaultsResult {
    const result = { ...configObj };
    const fieldsSet: string[] = [];
    const fieldsSkipped: string[] = [];

    for (const [field, defaultValue] of Object.entries(defaults)) {
        if (result[field] === undefined) {
            result[field] = defaultValue;
            fieldsSet.push(field);
        } else {
            fieldsSkipped.push(field);
        }
    }

    return {
        config: result,
        fieldsSet,
        fieldsSkipped
    };
}
