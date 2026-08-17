import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import path from "path";
import { BaseGoCustomConfigSchema } from "../custom-config/BaseGoCustomConfigSchema.js";

const DEFAULT_MODULE_PATH = "sdk";

// Matches the ".vN" suffix every gopkg.in path must carry, optionally followed by
// "-unstable". Unlike a module path suffix, ".v0" and ".v1" are both legal.
const GOPKG_IN_MAJOR_VERSION_SUFFIX_PATTERN = /\.v(\d+)(?:-unstable)?$/;

// Matches a path element that looks like a major version, e.g. "v2", "v0", "v1.2".
const MAJOR_VERSION_LIKE_SUFFIX_PATTERN = /\/v([0-9.]+)$/;

export function resolveRootImportPath({
    config,
    customConfig
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
}): string {
    const suffix = getMajorVersionSuffix({ config });
    const modulePath = getImportPath({ config, customConfig, isModulePath: true });
    const modulePathWithSuffix =
        suffix != null ? maybeAppendMajorVersionSuffix({ importPath: modulePath, majorVersion: suffix }) : modulePath;
    const packagePath = customConfig?.packagePath ?? "";
    return packagePath ? path.join(modulePathWithSuffix, packagePath) : modulePathWithSuffix;
}

export function resolveRootModulePath({
    config,
    customConfig
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
}): string {
    const suffix = getMajorVersionSuffix({ config });
    const importPath = getImportPath({ config, customConfig, isModulePath: true });
    return suffix != null ? maybeAppendMajorVersionSuffix({ importPath, majorVersion: suffix }) : importPath;
}

function getImportPath({
    config,
    customConfig,
    isModulePath = false
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
    isModulePath?: boolean;
}): string {
    const importPath =
        customConfig?.importPath ??
        customConfig?.module?.path ??
        (config.output.mode.type === "github"
            ? trimPrefix(config.output.mode.repoUrl, "https://")
            : DEFAULT_MODULE_PATH);
    return isModulePath ? importPath : path.join(importPath, customConfig?.packagePath ?? "");
}

function getMajorVersionSuffix({ config }: { config: FernGeneratorExec.config.GeneratorConfig }): string | undefined {
    const majorVersion = parseMajorVersion({ config });
    if (majorVersion == null || majorVersion === "v0" || majorVersion === "v1") {
        return undefined;
    }
    return `${majorVersion}`;
}

// parseMajorVersion returns the major version of the SDK, including Go's expected "v"
// prefix, e.g. "v0", "v1", "v2", etc.
function parseMajorVersion({ config }: { config: FernGeneratorExec.config.GeneratorConfig }): string | undefined {
    const version = getVersion(config);
    if (version == null || version === "") {
        return undefined;
    }
    const split = version.split(".");
    if (split[0] == null || split[0] === "" || split[0] === "v") {
        return undefined;
    }
    const majorVersion = split[0];
    if (majorVersion.startsWith("v")) {
        return majorVersion;
    }
    return `v${majorVersion}`;
}

// Appends the major version suffix to the importPath, unless the importPath already ends
// in a major version suffix. The configured suffix wins, even if it doesn't match the
// version being released.
//
// Throws when the importPath ends in something that looks like a major version but isn't a
// legal one, since appending would silently produce an unbuildable path like ".../v0/v2".
function maybeAppendMajorVersionSuffix({
    importPath,
    majorVersion
}: {
    importPath: string;
    majorVersion: string;
}): string {
    const suffix = splitMajorVersionSuffix(importPath);
    if (suffix.type === "invalid") {
        throw new Error(
            `The configured import path "${importPath}" isn't a valid Go module path: ${suffix.reason}. ` +
                'Remove the suffix and let Fern append the version being released, or replace it with a valid suffix (e.g. "/v2").'
        );
    }
    if (suffix.type === "present") {
        return importPath;
    }
    return `${importPath}/${majorVersion}`;
}

type MajorVersionSuffix = { type: "present" } | { type: "absent" } | { type: "invalid"; reason: string };

// Classifies the major version suffix an import path carries, mirroring the behavior of
// golang.org/x/mod's module.SplitPathVersion (which the Go generator itself calls, and
// which this TypeScript implementation cannot):
//
//   github.com/acme/acme-go            -> absent
//   github.com/acme/acme-go/v2         -> present
//   github.com/acme/acme-go/v0         -> invalid (only v2 and above may carry a suffix)
//   github.com/acme/acme-go/v01        -> invalid (zero-padded)
//   github.com/acme/acme-go/v1         -> invalid (v1 modules carry no suffix)
//   github.com/acme/acme-go/v1.2       -> invalid (not a major version)
//   gopkg.in/acme/acme-go.v0           -> present (gopkg.in carries the major for every N)
//   gopkg.in/acme/acme-go.v2-unstable  -> present
//   gopkg.in/acme/acme-go              -> invalid (every gopkg.in path must end in ".vN")
//   gopkg.in/acme/acme-go.v01          -> invalid (zero-padded)
function splitMajorVersionSuffix(importPath: string): MajorVersionSuffix {
    if (importPath.startsWith("gopkg.in/")) {
        const version = GOPKG_IN_MAJOR_VERSION_SUFFIX_PATTERN.exec(importPath)?.[1];
        if (version == null) {
            return { type: "invalid", reason: 'every gopkg.in path must end in a major version, e.g. ".v2"' };
        }
        if (isZeroPadded(version)) {
            return { type: "invalid", reason: `".v${version}" is zero-padded` };
        }
        return { type: "present" };
    }
    const version = MAJOR_VERSION_LIKE_SUFFIX_PATTERN.exec(importPath)?.[1];
    if (version == null) {
        return { type: "absent" };
    }
    if (version.includes(".")) {
        return { type: "invalid", reason: `"v${version}" isn't a major version` };
    }
    if (isZeroPadded(version)) {
        return { type: "invalid", reason: `"v${version}" is zero-padded` };
    }
    if (version === "0" || version === "1") {
        return { type: "invalid", reason: `only v2 and above may carry a version suffix, not "v${version}"` };
    }
    return { type: "present" };
}

function isZeroPadded(version: string): boolean {
    return version.length > 1 && version.startsWith("0");
}

function trimPrefix(str: string, prefix: string): string {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length);
    }
    return str;
}

function getVersion(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    const mode = config?.output?.mode;
    if (mode == null) {
        return undefined;
    }
    return mode.type === "github" || mode.type === "publish" ? mode.version : undefined;
}
