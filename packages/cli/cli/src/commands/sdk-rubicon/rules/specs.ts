import { join } from "node:path";
import type { ApiImportSettings } from "@postman/sdk-config";

import type { MapperRule, RuleContext } from "../types.js";
import { apiSection, relativeToOutput, resolveFromConfig } from "./output.js";

/**
 * SDK Config import setting to generators.yml `settings` key. `discriminatedUnionV2` and
 * `asyncApiMessageNaming` have no usable key; the treatment table warns about them.
 */
export const SETTINGS_KEYS: Partial<Record<keyof ApiImportSettings, string>> = {
    coerceEnumsToLiterals: "coerce-enums-to-literals",
    coerceOptionalSchemasToNullable: "coerce-optional-schemas-to-nullable",
    defaultIntegerFormat: "default-integer-format",
    disambiguateRequestNames: "disambiguate-request-names",
    groupMultiApiEnvironments: "group-multi-api-environments",
    idiomaticRequestNames: "idiomatic-request-names",
    ignoreTags: "ignore-tags",
    inlineAllOfSchemas: "inline-all-of-schemas",
    objectQueryParameters: "object-query-parameters",
    onlyIncludeReferencedSchemas: "only-include-referenced-schemas",
    pathParameterOrder: "path-parameter-order",
    resolveSchemaCollisions: "resolve-schema-collisions",
    respectNullableSchemas: "respect-nullable-schemas",
    respectReadonlySchemas: "respect-readonly-schemas",
    titleAsSchemaName: "title-as-schema-name",
    typeDatesAsStrings: "type-dates-as-strings",
    undiscriminatedUnionsWithLiterals: "prefer-undiscriminated-unions-with-literals",
    wrapReferencesToNullableInOptional: "wrap-references-to-nullable-in-optional"
};

const OPENAPI_TYPES = new Set(["openapi", "swagger"]);
const SETTING_NAMES = Object.keys(SETTINGS_KEYS);

/** Folder, under the generators.yml folder, for files rubicon writes besides generators.yml. */
export const RUBICON_FILES_DIRECTORY = ".rubicon";

/**
 * `source.specs[]` to `api.specs[]`, in order. Import settings go under each spec and under root
 * `api.settings`: root alone drops OpenAPI-only keys, and `path-parameter-order` works only at root.
 */
export const specsRule: MapperRule = {
    name: "specs",
    paths: [
        "source.specs[].specType",
        "source.specs[].specUrl",
        "source.specs[].namespace",
        "source.specs[].overrides",
        "source.specs[].overlays",
        ...SETTING_NAMES.map((name) => `source.apiImportSettings.${name}`),
        ...SETTING_NAMES.map((name) => `source.specs[].apiImportSettings.${name}`)
    ],
    apply(context) {
        const rootSettings = context.ir.source.apiImportSettings ?? {};
        const specs: Record<string, unknown>[] = [];
        const specSettings: Array<{ index: number; settings: Record<string, unknown> }> = [];
        context.ir.source.specs.forEach((spec, index) => {
            const path = `source.specs[${index}]`;
            if (/^https?:\/\//.test(spec.specUrl)) {
                context.error(
                    `${path}.specUrl`,
                    "RUBICON_URL_SOURCE",
                    "URL sources are not supported by rubicon.",
                    "Download the spec and reference it with `path`."
                );
                return;
            }
            if (!OPENAPI_TYPES.has(spec.specType)) {
                context.error(
                    `${path}.specType`,
                    "RUBICON_SPEC_TYPE",
                    `Spec type '${spec.specType}' is not supported: the Fern CLI generator writes no output without an OpenAPI spec.`,
                    "Use an OpenAPI or Swagger 2.0 spec."
                );
                return;
            }
            const settings = kebabSettings({ ...rootSettings, ...spec.apiImportSettings });
            specSettings.push({ index, settings });
            specs.push({
                openapi: relativeToOutput(context, spec.specUrl),
                ...(spec.namespace != null ? { namespace: spec.namespace } : {}),
                ...overrideEntries(context, spec.overrides ?? [], path),
                ...overlayEntries(context, spec.overlays ?? [], spec.id ?? String(index)),
                ...(Object.keys(settings).length > 0 ? { settings } : {})
            });
        });
        const settings = {
            ...kebabSettings(rootSettings),
            ...commonSettings(specSettings.map((entry) => entry.settings))
        };
        warnRootOnlyConflicts(context, specSettings, settings);
        const api = apiSection(context);
        api.specs = specs;
        if (Object.keys(settings).length > 0) {
            api.settings = settings;
        }
    }
};

function overrideEntries(context: RuleContext, overrides: string[], path: string): Record<string, unknown> {
    if (overrides.length === 0) {
        return {};
    }
    if (overrides.length > 1) {
        context.warn(
            `${path}.overrides`,
            "RUBICON_UNTESTED",
            "Several overrides files are written as a list; only one was tested end to end.",
            "Check the generated CLI."
        );
    }
    const paths = overrides.map((override) => relativeToOutput(context, override));
    return { overrides: paths.length === 1 ? paths[0] : paths };
}

function overlayEntries(context: RuleContext, overlays: string[], specId: string): Record<string, unknown> {
    const [first, ...rest] = overlays;
    if (first == null) {
        return {};
    }
    if (rest.length === 0) {
        return { overlays: relativeToOutput(context, first) };
    }
    // Fern takes one overlay file; the writer concatenates the actions of every overlay into it.
    const mergedPath = join(context.input.outDir, RUBICON_FILES_DIRECTORY, `overlay-${specId}.yml`);
    context.output.overlayMerges.push({
        path: mergedPath,
        overlayPaths: overlays.map((overlay) => resolveFromConfig(context, overlay))
    });
    return { overlays: `./${RUBICON_FILES_DIRECTORY}/overlay-${specId}.yml` };
}

function kebabSettings(settings: ApiImportSettings): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(settings)) {
        const key = settingKey(name);
        if (key != null && value !== undefined) {
            mapped[key] = value;
        }
    }
    return mapped;
}

function settingKey(name: string): string | undefined {
    return Object.entries(SETTINGS_KEYS).find(([setting]) => setting === name)?.[1];
}

/** Settings Fern reads only from root `api.settings`; a different value on a spec has no effect. */
const ROOT_ONLY_SETTINGS: Array<keyof ApiImportSettings> = ["pathParameterOrder"];

/** Warns for each spec whose value of a root-only setting differs from what root gets. */
function warnRootOnlyConflicts(
    context: RuleContext,
    specSettings: Array<{ index: number; settings: Record<string, unknown> }>,
    rootSettings: Record<string, unknown>
): void {
    for (const name of ROOT_ONLY_SETTINGS) {
        const key = SETTINGS_KEYS[name];
        if (key == null) {
            continue;
        }
        for (const { index, settings } of specSettings) {
            if (settings[key] !== undefined && settings[key] !== rootSettings[key]) {
                context.warn(
                    `source.specs[${index}].apiImportSettings.${name}`,
                    "RUBICON_ROOT_SETTING_CONFLICT",
                    `Fern reads ${key} only from root api.settings, so this spec's value has no effect (root ${
                        rootSettings[key] === undefined ? "leaves it unset" : `uses ${String(rootSettings[key])}`
                    }).`,
                    `Set ${name} once, in source.apiImportSettings, or give every spec the same value.`
                );
            }
        }
    }
}

/**
 * Settings every spec agrees on. Root also keeps the root import settings, so a spec override of a
 * setting the specs disagree on stays per spec (warned for root-only settings above).
 */
function commonSettings(perSpec: Record<string, unknown>[]): Record<string, unknown> {
    const [first, ...rest] = perSpec;
    if (first == null) {
        return {};
    }
    return Object.fromEntries(
        Object.entries(first).filter(([key, value]) => rest.every((settings) => settings[key] === value))
    );
}
