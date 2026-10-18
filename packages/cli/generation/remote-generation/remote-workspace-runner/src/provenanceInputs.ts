import {
    type AbstractAPIWorkspace,
    exposesSourceSpecs,
    getOriginGitCommit,
    type Spec
} from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { execSync } from "child_process";
import { createHash } from "crypto";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";

/** Digest of one input file, keyed by its path relative to the repository root. */
export interface ProvenanceFileDigest {
    path: string;
    sha256: string;
}

/**
 * Client-observed generation inputs sent to Fiddle when `provenance: true` is set on a
 * generator. Fiddle embeds these in the signed in-toto statement as `resolvedDependencies`.
 * They are client-reported: they bind the attestation to the files the CLI read in the
 * caller's CI, which the caller can independently re-hash at the config repo commit.
 */
export interface ProvenanceInputs {
    /** API definition files: specs, overlays, overrides (or Fern definition files). Sorted by path. */
    specs: ProvenanceFileDigest[];
    generatorsYml: ProvenanceFileDigest | undefined;
    cliVersion: string;
    /** Commit of the config repo the CLI ran from, when available. */
    sourceGitCommit: string | undefined;
}

export async function computeProvenanceInputs({
    workspace,
    specsOverride,
    generatorsYmlAbsolutePath,
    cliVersion,
    rootDirectory = resolveRepositoryRoot()
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema | undefined;
    generatorsYmlAbsolutePath: AbsoluteFilePath | undefined;
    cliVersion: string;
    rootDirectory?: string;
}): Promise<ProvenanceInputs> {
    const specPaths = exposesSourceSpecs(workspace)
        ? getSpecFilePaths(await workspace.getAllSpecsForGenerator(specsOverride))
        : [workspace.absoluteFilePath];
    const specFiles = (await Promise.all(specPaths.map(expandToFiles))).flat();
    const uniqueSpecFiles = [...new Set(specFiles)].filter((file) => file !== generatorsYmlAbsolutePath);
    const specs = await Promise.all(uniqueSpecFiles.map((file) => digestFile(file, rootDirectory)));
    specs.sort((a, b) => a.path.localeCompare(b.path));
    return {
        specs,
        generatorsYml:
            generatorsYmlAbsolutePath != null ? await digestFile(generatorsYmlAbsolutePath, rootDirectory) : undefined,
        cliVersion,
        sourceGitCommit: getOriginGitCommit()
    };
}

export function getSpecFilePaths(specs: Spec[]): string[] {
    return specs.flatMap((spec) => {
        switch (spec.type) {
            case "openapi":
                return [
                    spec.absoluteFilepath,
                    ...toArray(spec.absoluteFilepathToOverrides),
                    ...toArray(spec.absoluteFilepathToOverlays)
                ];
            case "openrpc":
                return [spec.absoluteFilepath, ...toArray(spec.absoluteFilepathToOverrides)];
            case "graphql":
                return [
                    spec.absoluteFilepath,
                    ...toArray(spec.absoluteFilepathToOverrides),
                    ...toArray(spec.absoluteFilepathToExamples)
                ];
            case "protobuf":
                // Protobuf targets import sibling files, so every file under the root is an input.
                return [spec.absoluteFilepathToProtobufRoot, ...toArray(spec.absoluteFilepathToOverrides)];
            default:
                assertNever(spec);
        }
    });
}

export async function digestFile(absolutePath: string, rootDirectory: string): Promise<ProvenanceFileDigest> {
    const contents = await readFile(absolutePath);
    return {
        path: toPosixRelativePath(absolutePath, rootDirectory),
        sha256: createHash("sha256").update(contents).digest("hex")
    };
}

function toPosixRelativePath(absolutePath: string, rootDirectory: string): string {
    const relative = path.relative(rootDirectory, absolutePath);
    const resolved = relative.startsWith("..") || path.isAbsolute(relative) ? absolutePath : relative;
    return resolved.split(path.sep).join("/");
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value == null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

async function expandToFiles(filePath: string): Promise<string[]> {
    if (!(await stat(filePath)).isDirectory()) {
        return [filePath];
    }
    const entries = await readdir(filePath, { withFileTypes: true, recursive: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => path.join(entry.parentPath, entry.name));
}

function resolveRepositoryRoot(): string {
    try {
        return execSync("git rev-parse --show-toplevel", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        }).trim();
    } catch {
        // Not a git checkout: fall back to the working directory so paths stay relative.
        return process.cwd();
    }
}
