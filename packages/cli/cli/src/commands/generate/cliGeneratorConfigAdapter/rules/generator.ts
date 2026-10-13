import { assertNever } from "@fern-api/core-utils";
import type { Dependency, SdkConfigIrV1 } from "@postman/sdk-config";

import type { MapperRule, RuleContext } from "../types.js";
import { CLI_GENERATION_PATHS, cliGenerationConfig, DISTRIBUTION_PATHS, distributionConfig } from "./cliConfig.js";
import { relativeToOutput } from "./output.js";

export const GENERATOR_NAME = "fernapi/fern-cli-generator";
export const GROUP_NAME = "cli";
const DEFAULT_OUTPUT_PATH = "generated/cli";

const IDENTITY_FIELDS = [
    ["packageName", "name"],
    ["description", "description"],
    ["repository", "repository"],
    ["homepage", "homepage"],
    ["keywords", "keywords"]
] as const;
const DEPENDENCY_TABLES = ["extraDependencies", "extraDevDependencies"] as const;
const DEPENDENCY_FIELDS = ["name", "version", "features", "optional", "defaultFeatures", "packageName"];
const SOURCE_FIELDS = ["type", "path", "url", "ref", "registry"];
/** SDK Config's canonical license types, as `fern sdk migrate` writes them, back to SPDX identifiers. */
const SPDX_LICENSES: Record<string, string> = {
    MIT: "MIT",
    APACHE: "Apache-2.0",
    GPL3: "GPL-3.0-only",
    UNLICENSED: "UNLICENSED"
};
/** `metadata.license` in generators.yml takes only these identifiers, or a custom file. */
const METADATA_LICENSES = new Set(["MIT", "Apache-2.0"]);

/**
 * The `cli` group: one fern-cli-generator invocation with its version, output, license metadata and
 * `config` (package identity, Cargo dependencies, wire tests, CLI generation settings, distribution).
 * `ir-version` is left out; the Fern CLI resolves it for the generator version.
 */
export const generatorRule: MapperRule = {
    name: "generator",
    paths: [
        "schemaVersion",
        "target.language",
        "target.generatorVersion",
        "target.organizationName",
        ...IDENTITY_FIELDS.map(([field]) => `package.${field}`),
        "package.authors[].name",
        "package.authors[].email",
        "package.license.type",
        "package.license.name",
        "package.license.path",
        ...DEPENDENCY_TABLES.flatMap((table) => [
            ...DEPENDENCY_FIELDS.filter((field) => table === "extraDependencies" || field !== "optional").map(
                (field) => `package.${table}[].${field}`
            ),
            ...SOURCE_FIELDS.map((field) => `package.${table}[].source.${field}`)
        ]),
        "generation.wireTests.enabled",
        ...CLI_GENERATION_PATHS,
        ...DISTRIBUTION_PATHS,
        "output.delivery",
        "output.path",
        "output.github.repository",
        "output.github.mode",
        "output.github.branch",
        "api.audiences"
    ],
    apply(context) {
        const { ir } = context;
        const config = generatorConfig(context, ir);
        const metadata = licenseMetadata(context, ir.package.license);
        const generator = {
            name: GENERATOR_NAME,
            version: context.input.generatorVersion,
            ...deliveryBlock(context, ir.output),
            ...(metadata != null ? { metadata } : {}),
            ...(Object.keys(config).length > 0 ? { config } : {})
        };
        context.output.generatorsYml.groups = {
            [GROUP_NAME]: {
                generators: [generator],
                ...(ir.api.audiences != null && ir.api.audiences.length > 0 ? { audiences: ir.api.audiences } : {})
            }
        };
    }
};

function generatorConfig(context: RuleContext, ir: SdkConfigIrV1): Record<string, unknown> {
    const config: Record<string, unknown> = {};
    if (ir.generation.wireTests?.enabled === true) {
        config.generateWireTests = true;
    }
    Object.assign(config, cliGenerationConfig(ir));
    const distribution = distributionConfig(ir.output);
    if (distribution != null) {
        config.distribution = distribution;
    }
    const identity = packageIdentity(ir.package);
    if (Object.keys(identity).length > 0) {
        config.packageIdentity = identity;
    }
    for (const table of DEPENDENCY_TABLES) {
        const dependencies = ir.package[table];
        if (dependencies == null || dependencies.length === 0) {
            continue;
        }
        config[table] = Object.fromEntries(
            dependencies.map((dependency) => [dependency.name, cargoDependency(dependency)])
        );
        context.output.hints.push(
            `package.${table}: the generated Cargo.lock does not include the added dependencies; build without --locked.`
        );
    }
    return config;
}

function packageIdentity(pkg: SdkConfigIrV1["package"]): Record<string, unknown> {
    const identity: Record<string, unknown> = {};
    for (const [field, key] of IDENTITY_FIELDS) {
        if (pkg[field] != null) {
            identity[key] = pkg[field];
        }
    }
    if (pkg.authors != null && pkg.authors.length > 0) {
        identity.authors = pkg.authors.map((author) =>
            author.email != null ? `${author.name} <${author.email}>` : author.name
        );
    }
    if (pkg.license != null && pkg.license.type !== "custom") {
        identity.license = spdxLicense(pkg.license.type);
    }
    return identity;
}

function licenseMetadata(
    context: RuleContext,
    license: SdkConfigIrV1["package"]["license"]
): Record<string, unknown> | undefined {
    if (license == null) {
        return undefined;
    }
    if (license.type !== "custom") {
        const spdx = spdxLicense(license.type);
        return METADATA_LICENSES.has(spdx) ? { license: spdx } : undefined;
    }
    if (license.path == null) {
        context.error(
            "package.license",
            "CLI_TARGET_LICENSE",
            "A custom license needs a file path.",
            "Set package.license.path."
        );
        return undefined;
    }
    return { license: { custom: relativeToOutput(context, license.path) } };
}

function spdxLicense(type: string): string {
    return SPDX_LICENSES[type.toUpperCase()] ?? type;
}

function cargoDependency(dependency: Dependency): unknown {
    const { source } = dependency;
    const table = removeUndefined({
        version: dependency.version,
        features: dependency.features,
        optional: dependency.optional,
        defaultFeatures: dependency.defaultFeatures,
        package: dependency.packageName,
        path: source?.type === "path" ? source.path : undefined,
        git: source?.type === "git" ? source.url : undefined,
        rev: source?.type === "git" ? source.ref : undefined,
        registry: source?.type === "registry" ? source.registry : undefined
    });
    const keys = Object.keys(table);
    return keys.length === 1 && keys[0] === "version" ? table.version : table;
}

function deliveryBlock(context: RuleContext, output: SdkConfigIrV1["output"]): Record<string, unknown> {
    switch (output.delivery) {
        case "files":
            return {
                output: {
                    location: "local-file-system",
                    path: relativeToOutput(context, output.path ?? DEFAULT_OUTPUT_PATH)
                }
            };
        case "zip":
            context.warn(
                "output.delivery",
                "CLI_TARGET_ZIP_AS_FILES",
                "Zip delivery is a hosted concept; generators.yml writes files instead.",
                "None needed."
            );
            return {
                output: { location: "local-file-system", path: relativeToOutput(context, DEFAULT_OUTPUT_PATH) }
            };
        case "github":
            context.warn(
                "output.github",
                "CLI_TARGET_UNTESTED",
                "GitHub output is written as a generators.yml github block; it is untested, and `fern generate` will push to the repository.",
                "Review the output block before generating."
            );
            return {
                github: {
                    repository: output.github.repository,
                    ...(output.github.mode != null ? { mode: output.github.mode } : {}),
                    ...(output.github.branch != null ? { branch: output.github.branch } : {})
                }
            };
        default:
            assertNever(output);
    }
}

function removeUndefined(value: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}
