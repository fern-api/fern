import { TaskContext } from "@fern-api/task-context";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

/**
 * Migrates deprecated generator-level API settings keys to their new V2 equivalents.
 * This migration runs before schema validation to prevent "Unexpected key" errors.
 *
 * Deprecated keys and their mappings:
 * - `use-title` -> `title-as-schema-name`
 * - `unions: 'v1'` -> `prefer-undiscriminated-unions-with-literals: true`
 *
 * @param raw - The raw parsed YAML configuration
 * @param context - Task context for logging warnings
 * @returns The migrated configuration
 */
export function migrateDeprecatedGeneratorApiSettings(raw: unknown, context: TaskContext): unknown {
    if (!isObject(raw)) {
        return raw;
    }

    const groups = raw.groups;
    if (!isObject(groups)) {
        return raw;
    }

    let sawDeprecatedUseTitle = false;
    let sawDeprecatedUnions = false;

    for (const group of Object.values(groups)) {
        if (!isObject(group)) {
            continue;
        }
        const generators = group.generators;
        if (!Array.isArray(generators)) {
            continue;
        }

        for (const gen of generators) {
            if (!isObject(gen)) {
                continue;
            }
            const api = gen.api;
            if (!isObject(api)) {
                continue;
            }
            const settings = api.settings;
            if (!isObject(settings)) {
                continue;
            }

            // use-title -> title-as-schema-name (do not override new key if already present)
            if ("use-title" in settings) {
                if (!("title-as-schema-name" in settings)) {
                    (settings as JsonObject)["title-as-schema-name"] = settings["use-title"];
                }
                delete (settings as JsonObject)["use-title"];
                sawDeprecatedUseTitle = true;
            }

            // unions -> prefer-undiscriminated-unions-with-literals
            if ("unions" in settings) {
                const unionsValue = settings["unions"];
                if (!("prefer-undiscriminated-unions-with-literals" in settings) && unionsValue === "v1") {
                    (settings as JsonObject)["prefer-undiscriminated-unions-with-literals"] = true;
                }
                // Always drop the deprecated key so schema validation doesn't fail
                delete (settings as JsonObject)["unions"];
                sawDeprecatedUnions = true;
            }
        }
    }

    if (sawDeprecatedUseTitle || sawDeprecatedUnions) {
        const warnings: string[] = [];
        if (sawDeprecatedUseTitle) {
            warnings.push(
                '"use-title" in "groups.*.generators[].api.settings" is deprecated. ' +
                    'Please use "title-as-schema-name" instead.'
            );
        }
        if (sawDeprecatedUnions) {
            warnings.push(
                '"unions" in "groups.*.generators[].api.settings" is deprecated. ' +
                    'Please use "prefer-undiscriminated-unions-with-literals" instead.'
            );
        }
        context.logger.warn("Warnings for generators.yml:");
        context.logger.warn("\t" + warnings.join("\n\t"));
    }

    return raw;
}
