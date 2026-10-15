import { assertNever } from "@fern-api/core-utils";
import type { Dependency, SdkConfigIrV1 } from "@postman/sdk-config";

import type { MapperRule, RuleContext } from "../types.js";
import { CLI_GENERATION_PATHS, cliGenerationConfig, DISTRIBUTION_PATHS, distributionConfig } from "./cliConfig.js";
import { relativeToOutput } from "./output.js";

export const GENERATOR_NAME = "fernapi/fern-cli-generator";
export const GROUP_NAME = "cli";
const DEFAULT_OUTPUT_PATH = "generated/cli";
const DEFAULT_NPM_TOKEN_VARIABLE = "NPM_TOKEN";
/** fern-cli-generator's crate-name check, plus crates.io's 64-character limit. */
const CRATE_NAME = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;

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
    "APACHE-2.0": "Apache-2.0",
    GPL3: "GPL-3.0-only",
    "GPL-3.0-ONLY": "GPL-3.0-only",
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
        "output.publish.registry",
        "output.publish.trustedPublishing",
        "output.publish.tokenEnvironmentVariable",
        "output.publish.url",
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
    const identity = packageIdentity(context, ir);
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

function packageIdentity(context: RuleContext, ir: SdkConfigIrV1): Record<string, unknown> {
    const pkg = ir.package;
    const npmName = npmPublish(ir.output) != null && pkg.packageName != null && !CRATE_NAME.test(pkg.packageName);
    const crate = npmName && pkg.packageName != null ? crateNameForNpmPackage(context, pkg.packageName) : undefined;
    if (npmName) {
        context.output.hints.push(
            crate != null
                ? `package.packageName "${pkg.packageName}" is the npm package name and not a valid crate name, so the crate is named "${crate.name}" from ${crate.source}.`
                : `package.packageName "${pkg.packageName}" is the npm package name and no valid crate name derives from it, so the generator names the crate.`
        );
    }
    const identity: Record<string, unknown> = {};
    for (const [field, key] of IDENTITY_FIELDS) {
        const value = npmName && field === "packageName" ? crate?.name : pkg[field];
        if (value != null) {
            identity[key] = value;
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

/**
 * The crate name when package.packageName is an npm name such as `@acme/cli`: the binary name, as fern-cli-generator
 * derives it (its `deriveBinaryName`), when that is computable here; otherwise the kebab-cased npm name.
 */
function crateNameForNpmPackage(
    context: RuleContext,
    packageName: string
): { name: string; source: string } | undefined {
    const { ir, input } = context;
    const binaryName = ir.generation.language?.cli?.binaryName;
    const title = ir.source.specs.length === 1 ? input.specFacts[0]?.title : undefined;
    const candidates: Array<[string | undefined, string]> = [
        binaryName != null && binaryName.trim() !== ""
            ? [binaryName, "generation.language.cli.binaryName"]
            : [title, "the spec's info.title, which also names the binary"],
        [packageName, "the npm package name"]
    ];
    for (const [raw, source] of candidates) {
        const name = raw != null ? toKebabCase(raw) : undefined;
        if (name != null && CRATE_NAME.test(name)) {
            return { name, source };
        }
    }
    return undefined;
}

/** fern-cli-generator's `toKebabCase`, which it applies to the binary name. */
function toKebabCase(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
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
            rejectPublishWithoutGithub(context, output);
            return {
                output: {
                    location: "local-file-system",
                    path: relativeToOutput(context, output.path ?? DEFAULT_OUTPUT_PATH)
                }
            };
        case "zip":
            rejectPublishWithoutGithub(context, output);
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
                ...npmOutputBlock(context),
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

type NpmPublish = Extract<NonNullable<SdkConfigIrV1["output"]["publish"]>, { registry: "npm" }>;

function npmPublish(output: SdkConfigIrV1["output"]): NpmPublish | undefined {
    return output.delivery === "github" && output.publish?.registry === "npm" ? output.publish : undefined;
}

/** The generator-level npm output that, next to `github`, becomes the github output mode's npm `publishInfo`. */
function npmOutputBlock(context: RuleContext): Record<string, unknown> {
    const { output, package: pkg } = context.ir;
    if (output.publish == null) {
        return {};
    }
    const publish = npmPublish(output);
    if (publish == null) {
        context.error(
            "output.publish.registry",
            "CLI_TARGET_NPM_PUBLISH",
            `The cli target publishes to npm only, not ${output.publish.registry}.`,
            "Set output.publish.registry to npm, or remove output.publish."
        );
        return {};
    }
    if (pkg.packageName == null) {
        context.error(
            "package.packageName",
            "CLI_TARGET_NPM_PUBLISH",
            "npm publication needs the npm package name.",
            "Set package.packageName."
        );
        return {};
    }
    return {
        output: {
            location: "npm",
            "package-name": pkg.packageName,
            ...(publish.url != null ? { url: publish.url } : {}),
            token:
                publish.trustedPublishing === true
                    ? "OIDC"
                    : `\${${publish.tokenEnvironmentVariable ?? DEFAULT_NPM_TOKEN_VARIABLE}}`
        }
    };
}

function rejectPublishWithoutGithub(context: RuleContext, output: SdkConfigIrV1["output"]): void {
    if (output.publish != null) {
        context.error(
            "output.publish",
            "CLI_TARGET_NPM_PUBLISH",
            "npm publication for the cli target needs GitHub delivery: the generated workflow publishes.",
            'Set output.delivery to "github", or remove output.publish.'
        );
    }
}

function removeUndefined(value: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}
