import { isDeepStrictEqual } from "node:util";
import type { generatorsYml } from "@fern-api/configuration-loader";
import {
    type FernConfigMappingDiagnostic,
    type SdkConfigV1Document,
    type SdkConfigV1PackageConfig,
    sdkConfigV1PackageConfigSchema
} from "@postman/sdk-config/sdk-config/v1";

type Path = Array<string | number>;
type PackageConfig = SdkConfigV1PackageConfig;
type Author = NonNullable<PackageConfig["authors"]>[number];
type License = NonNullable<PackageConfig["license"]>;
type DependencyTable = "extraDependencies" | "extraDevDependencies";

const CARGO_LANGUAGES = new Set(["cli", "rust"]);
const DEPENDENCY_TABLES: DependencyTable[] = ["extraDependencies", "extraDevDependencies"];
// SDK Config license types follow the hosted generator's license table (`MIT`, `APACHE`, `GPL3`,
// `UNLICENSED`), the same normalization the SDK Config mapper applies to GitHub licenses.
const CANONICAL_LICENSE_TYPES: Record<string, string> = {
    mit: "MIT",
    "apache-2.0": "APACHE",
    "gpl-3.0": "GPL3",
    "gpl-3.0-only": "GPL3",
    unlicensed: "UNLICENSED"
};

interface TargetPatch {
    package: PackageConfig;
    consumed: Path[];
    diagnostics: FernConfigMappingDiagnostic[];
}

/**
 * Fills package metadata that the SDK Config mapper does not read from legacy generator settings,
 * and removes the mapper's "unsupported field" diagnostics for every value it preserves. A value is
 * only written when the target does not already carry a different one, so mapper output wins.
 */
export function preserveLegacyPackageMetadata({
    generators,
    sdkConfig,
    diagnostics
}: {
    generators: readonly generatorsYml.GeneratorInvocation[];
    sdkConfig: SdkConfigV1Document;
    diagnostics: readonly FernConfigMappingDiagnostic[];
}): { sdkConfig: SdkConfigV1Document; diagnostics: FernConfigMappingDiagnostic[] } {
    const consumed: Path[] = [];
    const added: FernConfigMappingDiagnostic[] = [];
    const targets = sdkConfig.targets.map((target, index) => {
        const generator = generators[index];
        if (generator == null) {
            return target;
        }
        const patch = patchTargetPackage(generator, target, index);
        consumed.push(...patch.consumed);
        added.push(...patch.diagnostics);
        return Object.keys(patch.package).length === 0 ? target : { ...target, package: patch.package };
    });
    return {
        sdkConfig: { ...sdkConfig, targets },
        diagnostics: [
            ...diagnostics.filter((diagnostic) => !consumed.some((path) => startsWith(diagnostic.path, path))),
            ...added
        ]
    };
}

function patchTargetPackage(
    generator: generatorsYml.GeneratorInvocation,
    target: SdkConfigV1Document["targets"][number],
    index: number
): TargetPatch {
    const patch: TargetPatch = { package: structuredClone(target.package ?? {}), consumed: [], diagnostics: [] };
    const config = isRecord(generator.config) ? generator.config : {};
    const configPath: Path = ["group", "generators", index, "config"];
    if (target.language === "cli") {
        preserveCliPackageIdentity(config, configPath, patch);
    }
    if (target.language === "rust") {
        const license = nonEmptyString(config.packageLicense);
        if (license != null) {
            assign(patch, "license", toLicense(license), [...configPath, "packageLicense"]);
        }
    }
    if (CARGO_LANGUAGES.has(target.language)) {
        for (const table of DEPENDENCY_TABLES) {
            preserveCargoDependencySources(config[table], table, [...configPath, table], patch);
        }
    }
    if (target.output?.delivery !== "github") {
        preserveMetadataLicense(generator.raw, index, patch);
    }
    return patch;
}

function preserveCliPackageIdentity(config: Record<string, unknown>, configPath: Path, patch: TargetPatch): void {
    const identity = config.packageIdentity;
    if (!isRecord(identity)) {
        return;
    }
    const identityPath = [...configPath, "packageIdentity"];
    const homepage = nonEmptyString(identity.homepage);
    if (homepage != null) {
        assign(patch, "homepage", homepage, [...identityPath, "homepage"]);
    }
    const keywords = nonEmptyStrings(identity.keywords);
    if (keywords != null) {
        assign(patch, "keywords", keywords, [...identityPath, "keywords"]);
    }
    const authors = parseCargoAuthors(identity.authors);
    if (authors != null) {
        assign(patch, "authors", authors, [...identityPath, "authors"]);
    }
    const license = nonEmptyString(identity.license);
    if (license != null) {
        assign(patch, "license", toLicense(license), [...identityPath, "license"]);
    }
}

/** Cargo `authors` entries are `"Name <email>"` or a bare name. */
function parseCargoAuthors(value: unknown): Author[] | undefined {
    const entries = nonEmptyStrings(value);
    if (entries == null) {
        return undefined;
    }
    const authors = entries.map((entry): Author => {
        const match = /^(.*?)\s*<([^<>]*)>$/.exec(entry.trim());
        if (match == null) {
            return { name: entry.trim() };
        }
        return { name: match[1] ?? "", email: match[2] ?? "" };
    });
    return sdkConfigV1PackageConfigSchema.safeParse({ authors }).success ? authors : undefined;
}

/**
 * The SDK Config mapper reads `version`, `path`, and `git` but not Cargo's `rev` or `registry`;
 * attach them to the dependency the mapper already produced.
 */
function preserveCargoDependencySources(
    value: unknown,
    table: DependencyTable,
    tablePath: Path,
    patch: TargetPatch
): void {
    if (!isRecord(value)) {
        return;
    }
    const dependencies = patch.package[table];
    for (const [name, spec] of Object.entries(value)) {
        const dependency = dependencies?.find((entry) => entry.name === name);
        if (!isRecord(spec) || dependency == null) {
            continue;
        }
        const rev = nonEmptyString(spec.rev);
        if (rev != null && dependency.source?.type === "git" && dependency.source.ref == null) {
            dependency.source = { ...dependency.source, ref: rev };
            patch.consumed.push([...tablePath, name, "rev"]);
        }
        const registry = nonEmptyString(spec.registry);
        if (registry != null && dependency.source == null) {
            dependency.source = { type: "registry", registry };
            patch.consumed.push([...tablePath, name, "registry"]);
        }
    }
}

/**
 * Fern hands `metadata.license` to every generator, but the SDK Config mapper only reads the
 * license of GitHub outputs. Custom license files stay manual: their path is relative to
 * generators.yml, not to the SDK Config file.
 */
function preserveMetadataLicense(raw: unknown, index: number, patch: TargetPatch): void {
    const metadata = isRecord(raw) ? raw.metadata : undefined;
    const value = isRecord(metadata) ? metadata.license : undefined;
    if (value == null) {
        return;
    }
    const path: Path = ["group", "generators", index, "metadata", "license"];
    const license = nonEmptyString(value);
    if (license == null) {
        patch.diagnostics.push(
            licenseDiagnostic(path, index, "A custom license file cannot be migrated automatically.")
        );
        return;
    }
    const migrated = toLicense(license);
    if (patch.package.license == null) {
        patch.package.license = migrated;
    } else if (!isDeepStrictEqual(patch.package.license, migrated)) {
        patch.diagnostics.push(
            licenseDiagnostic(
                path,
                index,
                `metadata.license ${license} conflicts with the license ${patch.package.license.type} already migrated for this target.`
            )
        );
    }
}

function licenseDiagnostic(path: Path, index: number, reason: string): FernConfigMappingDiagnostic {
    return {
        code: "FERN_CONFIG_FIELD_UNSUPPORTED",
        severity: "warning",
        path,
        reason,
        sdkConfigPath: ["targets", index, "package", "license"],
        suggestedAction: `Set targets.${index}.package.license manually.`
    };
}

function toLicense(value: string): License {
    return { type: CANONICAL_LICENSE_TYPES[value.toLowerCase()] ?? value };
}

/** Writes a value the target does not have yet; an equal value is also consumed, a different one is left for review. */
function assign<Field extends keyof PackageConfig>(
    patch: TargetPatch,
    field: Field,
    value: NonNullable<PackageConfig[Field]>,
    sourcePath: Path
): void {
    const existing = patch.package[field];
    if (existing == null) {
        patch.package[field] = value;
    } else if (!isDeepStrictEqual(existing, value)) {
        return;
    }
    patch.consumed.push(sourcePath);
}

function startsWith(path: readonly (string | number)[], prefix: Path): boolean {
    return prefix.length <= path.length && prefix.every((segment, index) => path[index] === segment);
}

function nonEmptyString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function nonEmptyStrings(value: unknown): string[] | undefined {
    if (!Array.isArray(value) || value.length === 0) {
        return undefined;
    }
    const strings = value.map(nonEmptyString);
    return strings.every((entry): entry is string => entry != null) ? strings : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
