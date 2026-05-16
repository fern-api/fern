import { Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { cp } from "fs/promises";
import path from "path";

export interface RawSpecsManifestEntry {
    type: "openapi" | "asyncapi" | "protobuf" | "openrpc" | "graphql";
    specPath: string;
    overridePaths?: string[];
    overlayPath?: string;
}

export interface RawSpecsManifest {
    specs: RawSpecsManifestEntry[];
}

/**
 * Collects raw API spec files (OAS, protobuf, OpenRPC, GraphQL) and copies the
 * entire common root directory tree to a host output directory. This preserves
 * the original directory structure so that relative $ref paths between files
 * remain valid — including $ref targets that live outside the spec file's own
 * directory (e.g. `../../shared/models.yaml`).
 *
 * Returns a manifest describing the container paths for each spec.
 */
export async function collectRawSpecs({
    specs,
    hostOutputDir,
    containerBaseDir,
    context
}: {
    specs: Spec[];
    hostOutputDir: AbsoluteFilePath;
    containerBaseDir: string;
    context: TaskContext;
}): Promise<RawSpecsManifest> {
    const manifest: RawSpecsManifest = { specs: [] };

    if (specs.length === 0) {
        return manifest;
    }

    // Find the common ancestor directory across all spec files so we can
    // preserve relative paths when copying into the output directory.
    const allAbsolutePaths: string[] = [];
    const directoryPaths = new Set<string>();
    for (const spec of specs) {
        switch (spec.type) {
            case "openapi":
            case "openrpc":
            case "graphql":
                allAbsolutePaths.push(spec.absoluteFilepath);
                if (spec.absoluteFilepathToOverrides != null) {
                    if (Array.isArray(spec.absoluteFilepathToOverrides)) {
                        allAbsolutePaths.push(...spec.absoluteFilepathToOverrides);
                    } else {
                        allAbsolutePaths.push(spec.absoluteFilepathToOverrides);
                    }
                }
                if (spec.type === "openapi" && spec.absoluteFilepathToOverlays != null) {
                    allAbsolutePaths.push(spec.absoluteFilepathToOverlays);
                }
                break;
            case "protobuf":
                allAbsolutePaths.push(spec.absoluteFilepathToProtobufRoot);
                directoryPaths.add(spec.absoluteFilepathToProtobufRoot);
                if (spec.absoluteFilepathToOverrides != null) {
                    if (Array.isArray(spec.absoluteFilepathToOverrides)) {
                        allAbsolutePaths.push(...spec.absoluteFilepathToOverrides);
                    } else {
                        allAbsolutePaths.push(spec.absoluteFilepathToOverrides);
                    }
                }
                break;
        }
    }

    const commonRoot = findCommonDirectory(allAbsolutePaths, directoryPaths);
    context.logger.debug(`Raw specs common root: ${commonRoot}`);

    // Copy the entire common root directory tree so that all files reachable
    // via relative $ref paths (including ../../ references) are preserved.
    await cp(commonRoot, hostOutputDir, { recursive: true });
    context.logger.debug(`Copied directory tree from ${commonRoot} to ${hostOutputDir}`);

    // Build manifest entries with container paths for each spec file.
    for (const spec of specs) {
        const entry = buildManifestEntry({ spec, commonRoot, containerBaseDir });
        manifest.specs.push(entry);
    }

    return manifest;
}

function buildManifestEntry({
    spec,
    commonRoot,
    containerBaseDir
}: {
    spec: Spec;
    commonRoot: string;
    containerBaseDir: string;
}): RawSpecsManifestEntry {
    switch (spec.type) {
        case "openapi":
        case "openrpc":
        case "graphql": {
            const specPath = toContainerPath(path.relative(commonRoot, spec.absoluteFilepath), containerBaseDir);

            const overridePaths: string[] = [];
            if (spec.absoluteFilepathToOverrides != null) {
                const overrides = Array.isArray(spec.absoluteFilepathToOverrides)
                    ? spec.absoluteFilepathToOverrides
                    : [spec.absoluteFilepathToOverrides];
                for (const overridePath of overrides) {
                    overridePaths.push(toContainerPath(path.relative(commonRoot, overridePath), containerBaseDir));
                }
            }

            let overlayPath: string | undefined;
            if (spec.type === "openapi" && spec.absoluteFilepathToOverlays != null) {
                overlayPath = toContainerPath(
                    path.relative(commonRoot, spec.absoluteFilepathToOverlays),
                    containerBaseDir
                );
            }

            const entry: RawSpecsManifestEntry = {
                type: spec.type,
                specPath
            };
            if (overridePaths.length > 0) {
                entry.overridePaths = overridePaths;
            }
            if (overlayPath != null) {
                entry.overlayPath = overlayPath;
            }
            return entry;
        }
        case "protobuf": {
            const specPath = toContainerPath(
                path.relative(commonRoot, spec.absoluteFilepathToProtobufRoot),
                containerBaseDir
            );

            const overridePaths: string[] = [];
            if (spec.absoluteFilepathToOverrides != null) {
                const overrides = Array.isArray(spec.absoluteFilepathToOverrides)
                    ? spec.absoluteFilepathToOverrides
                    : [spec.absoluteFilepathToOverrides];
                for (const overridePath of overrides) {
                    overridePaths.push(toContainerPath(path.relative(commonRoot, overridePath), containerBaseDir));
                }
            }

            const entry: RawSpecsManifestEntry = {
                type: "protobuf",
                specPath
            };
            if (overridePaths.length > 0) {
                entry.overridePaths = overridePaths;
            }
            return entry;
        }
    }
}

/**
 * Converts a relative path to a container-absolute path.
 */
function toContainerPath(relativePath: string, containerBaseDir: string): string {
    return path.posix.join(containerBaseDir, relativePath.split(path.sep).join(path.posix.sep));
}

/**
 * Finds the deepest common directory among a set of absolute paths.
 * Paths that are already directories (e.g. protobuf root) are included as-is;
 * paths that are files are reduced to their parent directory via path.dirname().
 */
export function findCommonDirectory(absolutePaths: string[], directoryPaths?: Set<string>): string {
    if (absolutePaths.length === 0) {
        return "/";
    }

    const directories = absolutePaths.map((p) => (directoryPaths?.has(p) ? p : path.dirname(p)));
    const segments = directories.map((d) => d.split(path.sep));
    const minLength = Math.min(...segments.map((s) => s.length));

    const commonSegments: string[] = [];
    for (let i = 0; i < minLength; i++) {
        const segment = segments[0]?.[i];
        if (segment != null && segments.every((s) => s[i] === segment)) {
            commonSegments.push(segment);
        } else {
            break;
        }
    }

    return commonSegments.join(path.sep) || "/";
}
