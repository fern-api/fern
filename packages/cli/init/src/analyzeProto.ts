/** What `fern init --proto` needs to know about one `.proto` file to decide how to configure and warn about it. */
export interface ProtoFileAnalysis {
    /** Path relative to the proto root, using forward slashes. */
    relativePath: string;
    imports: string[];
    hasService: boolean;
    hasStreamingRpc: boolean;
    /** Well-known types the C# generator is known to turn into code that does not build, e.g. `Struct`. */
    unsupportedWellKnownTypes: string[];
}

/** Imports that `buf` provides itself, so they never need to exist under the proto root. */
const WELL_KNOWN_IMPORT_PREFIX = "google/protobuf/";

// Matches a string literal, a line comment, or a block comment. Strings are matched so that
// a `//` inside one (e.g. a URL) is not mistaken for a comment.
const STRING_OR_COMMENT = /("(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
const IMPORT = /^\s*import\s+(?:public\s+|weak\s+)?"([^"]+)"\s*;/gm;
const SERVICE = /\bservice\s+\w+\s*\{/;
// Only types seen to produce C# that fails to build: Struct (no `Add` on it) and FieldMask (emitted as a string).
const UNSUPPORTED_WELL_KNOWN_TYPE = /\bgoogle\.protobuf\.(Struct|FieldMask)\b/g;
const STREAMING_RPC = /\brpc\s+\w+\s*\(\s*stream\b|\breturns\s*\(\s*stream\b/;

export function analyzeProtoFile({
    relativePath,
    contents
}: {
    relativePath: string;
    contents: string;
}): ProtoFileAnalysis {
    const source = contents.replace(
        STRING_OR_COMMENT,
        (_match, stringLiteral: string | undefined) => stringLiteral ?? ""
    );
    return {
        relativePath,
        imports: Array.from(source.matchAll(IMPORT), (match) => match[1]).filter(
            (importPath): importPath is string => importPath != null
        ),
        hasService: SERVICE.test(source),
        hasStreamingRpc: STREAMING_RPC.test(source),
        unsupportedWellKnownTypes: [
            ...new Set(
                Array.from(source.matchAll(UNSUPPORTED_WELL_KNOWN_TYPE), (match) => `google.protobuf.${match[1]}`)
            )
        ]
    };
}

/**
 * The target to write to generators.yml: the one file that defines a service, so that the files it
 * imports are not each compiled as an API of their own. Undefined means "compile every file under the
 * root", which is what the CLI does when no target is set.
 */
export function chooseProtoTarget({ files }: { files: ProtoFileAnalysis[] }): string | undefined {
    const withServices = files.filter((file) => file.hasService);
    return withServices.length === 1 ? withServices[0]?.relativePath : undefined;
}

/** Imports that are neither provided by `buf` nor present under the proto root. */
export function findMissingImports({
    files,
    existingPaths
}: {
    files: ProtoFileAnalysis[];
    existingPaths: ReadonlySet<string>;
}): string[] {
    const missing = new Set<string>();
    for (const file of files) {
        for (const importPath of file.imports) {
            if (!importPath.startsWith(WELL_KNOWN_IMPORT_PREFIX) && !existingPaths.has(importPath)) {
                missing.add(importPath);
            }
        }
    }
    return [...missing].sort();
}

/** Human-readable problems that will make the generated SDK empty or fail to build. */
export function getProtoWarnings({ files }: { files: ProtoFileAnalysis[] }): string[] {
    const warnings: string[] = [];
    const withServices = files.filter((file) => file.hasService);

    if (withServices.length === 0) {
        warnings.push("No gRPC `service` was found in the proto files, so the generated SDK will have no clients.");
        return warnings;
    }

    const streaming = withServices.filter((file) => file.hasStreamingRpc);
    if (streaming.length > 0) {
        warnings.push(
            `${list(streaming)} has streaming RPCs. The C# generator does not support streaming, ` +
                "so the generated SDK is likely to fail to build."
        );
    }

    const withUnsupportedTypes = files.filter((file) => file.unsupportedWellKnownTypes.length > 0);
    for (const file of withUnsupportedTypes) {
        warnings.push(
            `${file.relativePath} uses ${file.unsupportedWellKnownTypes.join(", ")}, which the C# generator turns into ` +
                "code that does not build. Replace it (for example with a map or a string field) before generating."
        );
    }
    return warnings;
}

function list(files: ProtoFileAnalysis[]): string {
    return files.map((file) => file.relativePath).join(", ");
}
