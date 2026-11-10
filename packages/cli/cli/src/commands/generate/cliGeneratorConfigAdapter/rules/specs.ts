import { join } from "node:path";
import type { ApiImportSettings } from "@postman/sdk-config";

import type { MapperRule, RuleContext } from "../types.js";
import { apiSection, relativeSourceToOutput, resolveFromSource } from "./output.js";

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
    inferDiscriminatedUnionBaseProperties: "infer-discriminated-union-base-properties",
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
    wrapReferencesToNullableInOptional: "wrap-references-to-nullable-in-optional",
    additionalPropertiesDefaultsTo: "additional-properties-defaults-to",
    optionalAdditionalProperties: "optional-additional-properties",
    anyOfSiblingPropertiesAsObject: "any-of-sibling-properties-as-object",
    preserveSingleSchemaOneOf: "preserve-single-schema-oneof",
    preserveOneOfInAllOf: "preserve-one-of-in-all-of",
    removeDiscriminantsFromSchemas: "remove-discriminants-from-schemas",
    coerceConstsTo: "coerce-consts-to",
    resolveAliases: "resolve-aliases",
    respectForwardCompatibleEnums: "respect-forward-compatible-enums",
    inferForwardCompatible: "infer-forward-compatible",
    respectOperationIdWordBoundaries: "respect-operation-id-word-boundaries",
    namespacedErrors: "namespaced-errors",
    defaultFormParameterEncoding: "default-form-parameter-encoding",
    respectParameterContent: "respect-parameter-content",
    useBytesForBinaryResponse: "use-bytes-for-binary-response",
    useReadVariantForResponses: "use-read-variant-for-responses",
    groupEnvironmentsByHost: "group-environments-by-host",
    multiServerStrategy: "multi-server-strategy",
    inferDefaultEnvironment: "infer-default-environment",
    respectPerSpecBasePath: "respect-per-spec-base-path",
    exampleGeneration: "example-generation",
    filter: "filter",
    errorResponses: "error-responses"
};

/**
 * Settings that are objects in both SDK Config and generators.yml. The values are the same apart from camelCase
 * names, so their leaves are listed (a container is not a leaf path) and `settingValue` renames the keys.
 */
const OBJECT_SETTING_LEAVES: Partial<Record<keyof ApiImportSettings, string[]>> = {
    resolveAliases: ["except"],
    exampleGeneration: ["request.maxDepth", "response.maxDepth"],
    filter: ["endpoints"],
    errorResponses: ["schema.*", "name", "applyTo", "ensure[].statusCode", "ensure[].methods"]
};

/** Every import setting path (under `source.apiImportSettings` and `source.specs[].apiImportSettings`) written. */
export const SETTING_PATHS: string[] = Object.keys(SETTINGS_KEYS).flatMap((name) => {
    const leaves = OBJECT_SETTING_LEAVES[name as keyof ApiImportSettings];
    const isContainerOnly = ["exampleGeneration", "filter", "errorResponses"].includes(name);
    return [...(isContainerOnly ? [] : [name]), ...(leaves ?? []).map((leaf) => `${name}.${leaf}`)];
});

const OPENAPI_TYPES = new Set(["openapi", "swagger"]);

/** Folder, under the generators.yml folder, for files the translation writes besides generators.yml. */
export const TRANSLATION_FILES_DIRECTORY = ".cli-target";

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
        ...SETTING_PATHS.map((path) => `source.apiImportSettings.${path}`),
        ...SETTING_PATHS.map((path) => `source.specs[].apiImportSettings.${path}`)
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
                    "CLI_TARGET_URL_SOURCE",
                    "URL sources are not supported for the cli target.",
                    "Download the spec and reference it with `path`."
                );
                return;
            }
            if (!OPENAPI_TYPES.has(spec.specType)) {
                context.error(
                    `${path}.specType`,
                    "CLI_TARGET_SPEC_TYPE",
                    `Spec type '${spec.specType}' is not supported: the Fern CLI generator writes no output without an OpenAPI spec.`,
                    "Use an OpenAPI or Swagger 2.0 spec."
                );
                return;
            }
            const settings = kebabSettings({ ...rootSettings, ...spec.apiImportSettings });
            specSettings.push({ index, settings });
            specs.push({
                openapi: relativeSourceToOutput(context, spec.specUrl),
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
            "CLI_TARGET_UNTESTED",
            "Several overrides files are written as a list; only one was tested end to end.",
            "Check the generated CLI."
        );
    }
    const paths = overrides.map((override) => relativeSourceToOutput(context, override));
    return { overrides: paths.length === 1 ? paths[0] : paths };
}

function overlayEntries(context: RuleContext, overlays: string[], specId: string): Record<string, unknown> {
    const [first, ...rest] = overlays;
    if (first == null) {
        return {};
    }
    if (rest.length === 0) {
        return { overlays: relativeSourceToOutput(context, first) };
    }
    // Fern takes one overlay file; the writer concatenates the actions of every overlay into it.
    const mergedPath = join(context.input.outDir, TRANSLATION_FILES_DIRECTORY, `overlay-${specId}.yml`);
    context.output.overlayMerges.push({
        path: mergedPath,
        overlayPaths: overlays.map((overlay) => resolveFromSource(context, overlay))
    });
    return { overlays: `./${TRANSLATION_FILES_DIRECTORY}/overlay-${specId}.yml` };
}

function kebabSettings(settings: ApiImportSettings): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(settings)) {
        const key = settingKey(name);
        if (key != null && value !== undefined) {
            mapped[key] = settingValue(name, value);
        }
    }
    return mapped;
}

/** The value in generators.yml: object settings use kebab-case keys where SDK Config uses camelCase. */
function settingValue(name: string, value: unknown): unknown {
    const object = value as Record<string, unknown>;
    switch (name) {
        case "exampleGeneration":
            return Object.fromEntries(
                Object.entries(object).map(([side, depth]) => [
                    side,
                    Object.fromEntries(
                        Object.entries(depth as Record<string, unknown>).map(([key, entry]) => [
                            key === "maxDepth" ? "max-depth" : key,
                            entry
                        ])
                    )
                ])
            );
        case "errorResponses": {
            const { applyTo, ensure, ...rest } = object as {
                applyTo?: unknown;
                ensure?: Array<{ statusCode: number; methods?: unknown }>;
            } & Record<string, unknown>;
            return {
                ...rest,
                ...(applyTo !== undefined ? { "apply-to": applyTo } : {}),
                ...(ensure !== undefined
                    ? {
                          ensure: ensure.map(({ statusCode, methods }) => ({
                              "status-code": statusCode,
                              ...(methods !== undefined ? { methods } : {})
                          }))
                      }
                    : {})
            };
        }
        default:
            return value;
    }
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
                    "CLI_TARGET_ROOT_SETTING_CONFLICT",
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
