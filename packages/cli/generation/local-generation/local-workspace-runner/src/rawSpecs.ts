import { Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { copyFile, cp, mkdir, readFile } from "fs/promises";
import yaml from "js-yaml";
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
 * Collects raw API spec files (OAS, protobuf, OpenRPC, GraphQL) and copies only
 * the declared spec/override/overlay files plus any files discovered via external
 * $ref resolution. Protobuf roots are copied as full directories.
 *
 * Directory structure is preserved relative to a computed common root so that
 * relative $ref paths between files remain valid at runtime inside the container.
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

    // Gather all explicitly-declared file paths and directory paths.
    const declaredFiles: string[] = [];
    const directoryPaths = new Set<string>();
    for (const spec of specs) {
        switch (spec.type) {
            case "openapi":
            case "openrpc":
            case "graphql":
                declaredFiles.push(spec.absoluteFilepath);
                if (spec.absoluteFilepathToOverrides != null) {
                    if (Array.isArray(spec.absoluteFilepathToOverrides)) {
                        declaredFiles.push(...spec.absoluteFilepathToOverrides);
                    } else {
                        declaredFiles.push(spec.absoluteFilepathToOverrides);
                    }
                }
                if (spec.type === "openapi" && spec.absoluteFilepathToOverlays != null) {
                    declaredFiles.push(spec.absoluteFilepathToOverlays);
                }
                break;
            case "protobuf":
                declaredFiles.push(spec.absoluteFilepathToProtobufRoot);
                directoryPaths.add(spec.absoluteFilepathToProtobufRoot);
                if (spec.absoluteFilepathToOverrides != null) {
                    if (Array.isArray(spec.absoluteFilepathToOverrides)) {
                        declaredFiles.push(...spec.absoluteFilepathToOverrides);
                    } else {
                        declaredFiles.push(spec.absoluteFilepathToOverrides);
                    }
                }
                break;
        }
    }

    // Discover external $ref targets by scanning non-directory files.
    const refTargets = new Set<string>();
    for (const filePath of declaredFiles) {
        if (!directoryPaths.has(filePath)) {
            await discoverExternalRefs(filePath, refTargets, context);
        }
    }

    // Combine declared files with discovered $ref targets for common root calculation.
    const allPaths = [...declaredFiles, ...refTargets];

    const commonRoot = findCommonDirectory(allPaths, directoryPaths);
    context.logger.debug(`Raw specs common root: ${commonRoot}`);

    // Copy each file/directory individually, preserving structure relative to commonRoot.
    const copiedPaths = new Set<string>();
    for (const filePath of allPaths) {
        if (copiedPaths.has(filePath)) {
            continue;
        }
        copiedPaths.add(filePath);
        await copyPathPreservingStructure(filePath, commonRoot, hostOutputDir, directoryPaths.has(filePath));
    }
    context.logger.debug(`Copied ${copiedPaths.size} file(s)/director(ies) to ${hostOutputDir}`);

    // Build manifest entries with container paths for each spec file.
    for (const spec of specs) {
        const entry = buildManifestEntry({ spec, commonRoot, containerBaseDir });
        manifest.specs.push(entry);
    }

    return manifest;
}

/**
 * Recursively scans a YAML/JSON file for external $ref values and collects the
 * absolute paths of all referenced files. Follows transitive $ref chains.
 */
export async function discoverExternalRefs(
    absoluteFilePath: string,
    discovered: Set<string>,
    context: TaskContext,
    visited?: Set<string>
): Promise<void> {
    const seen = visited ?? new Set<string>();
    if (seen.has(absoluteFilePath)) {
        return;
    }
    seen.add(absoluteFilePath);

    let content: string;
    try {
        content = await readFile(absoluteFilePath, "utf-8");
    } catch {
        context.logger.debug(`Could not read file for $ref discovery: ${absoluteFilePath}`);
        return;
    }

    let parsed: unknown;
    try {
        if (absoluteFilePath.endsWith(".json")) {
            parsed = JSON.parse(content);
        } else {
            parsed = yaml.load(content);
        }
    } catch {
        context.logger.debug(`Could not parse file for $ref discovery: ${absoluteFilePath}`);
        return;
    }

    const baseDir = path.dirname(absoluteFilePath);
    const refs = collectExternalRefPaths(parsed);

    for (const ref of refs) {
        const resolved = path.resolve(baseDir, ref);
        if (!discovered.has(resolved)) {
            discovered.add(resolved);
            await discoverExternalRefs(resolved, discovered, context, seen);
        }
    }
}

/**
 * Walks a parsed YAML/JSON document and extracts the file-path portion of every
 * external $ref value (not internal `#/...` refs, not HTTP URLs).
 */
export function collectExternalRefPaths(obj: unknown): string[] {
    const refs: string[] = [];
    walkForRefs(obj, refs);
    return refs;
}

function walkForRefs(obj: unknown, refs: string[]): void {
    if (obj == null || typeof obj !== "object") {
        return;
    }

    if (Array.isArray(obj)) {
        for (const item of obj) {
            walkForRefs(item, refs);
        }
        return;
    }

    const record = obj as Record<string, unknown>;
    const ref = record["$ref"];
    if (typeof ref === "string" && ref.length > 0 && !ref.startsWith("#") && !isUrlRef(ref)) {
        const hashIndex = ref.indexOf("#");
        const filePath = hashIndex >= 0 ? ref.slice(0, hashIndex) : ref;
        if (filePath.length > 0) {
            refs.push(filePath);
        }
    }

    for (const value of Object.values(record)) {
        walkForRefs(value, refs);
    }
}

function isUrlRef(ref: string): boolean {
    return ref.startsWith("http://") || ref.startsWith("https://");
}

/**
 * Copies a single file (or directory for protobuf) into hostOutputDir,
 * preserving its path relative to commonRoot.
 */
async function copyPathPreservingStructure(
    absolutePath: string,
    commonRoot: string,
    hostOutputDir: string,
    isDirectory: boolean
): Promise<void> {
    const relativePath = path.relative(commonRoot, absolutePath);
    const destPath = path.join(hostOutputDir, relativePath);

    try {
        if (isDirectory) {
            await cp(absolutePath, destPath, { recursive: true });
        } else {
            await mkdir(path.dirname(destPath), { recursive: true });
            await copyFile(absolutePath, destPath);
        }
    } catch {
        // $ref target may not exist on disk — skip silently.
    }
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
