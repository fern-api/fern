import { readFile } from "node:fs/promises";
import path from "node:path";

import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Configuration specification for a static Rust file that gets included as-is in the generated SDK.
 * This serves as the raw configuration that gets transformed into a fully resolved {@link AsIsFileDefinition}
 * during the build process.
 */
interface AsIsFileSpec {
    relativePathToDir: string;
    filename: string;
}

/**
 * Registry of all static Rust file specifications.
 *
 * This constant defines the complete catalog of pre-written Rust files that can be
 * included in generated SDKs. Each entry maps a unique identifier to a file specification
 * containing the file's intended path.
 */
const AsIsFileSpecs = {
    // Core infrastructure templates
    ApiClientBuilder: {
        relativePathToDir: "src",
        filename: "client.rs"
    },
    Prelude: {
        relativePathToDir: "src",
        filename: "prelude.rs"
    },
    HttpClient: {
        relativePathToDir: "src/core",
        filename: "http_client.rs"
    },
    RequestOptions: {
        relativePathToDir: "src/core",
        filename: "request_options.rs"
    },
    Pagination: {
        relativePathToDir: "src/core",
        filename: "pagination.rs"
    },
    QueryParameterBuilder: {
        relativePathToDir: "src/core",
        filename: "query_parameter_builder.rs"
    },
    Utils: {
        relativePathToDir: "src/core",
        filename: "utils.rs"
    },
    SseStream: {
        relativePathToDir: "src/core",
        filename: "sse_stream.rs"
    },
    CoreMod: {
        relativePathToDir: "src/core",
        filename: "mod.rs"
    },
    // Project-level configuration files
    CargoToml: {
        relativePathToDir: "",
        filename: "Cargo.toml"
    },
    Gitignore: {
        relativePathToDir: "",
        filename: ".gitignore"
    },
    RustfmtToml: {
        relativePathToDir: "",
        filename: "rustfmt.toml"
    },
    // GitHub workflows
    CiYml: {
        relativePathToDir: ".github/workflows",
        filename: "ci.yml"
    }
} satisfies Record<string, AsIsFileSpec>;

/**
 * A fully resolved definition of a static Rust file, ready for use in codegen.
 */
export interface AsIsFileDefinition {
    /**
     * The filename (including extension) of the Rust file.
     */
    filename: string;
    /**
     * The relative directory path where this file should be placed in the generated project.
     *
     * @example RelativeFilePath.of("src")
     */
    directory: RelativeFilePath;
    /**
     * Asynchronously loads the contents of the Rust file from disk.
     *
     * @returns Promise that resolves to the raw Rust source code as a string
     */
    loadContents: () => Promise<string>;
}

/**
 * Union type of all available static file identifiers.
 */
export type AsIsFileId = keyof typeof AsIsFileSpecs;

/**
 * Mapped type that provides strongly-typed access to all static file definitions.
 *
 * Each key corresponds to an {@link AsIsFileId} and maps to its resolved
 * {@link AsIsFileDefinition}.
 */
export type AsIsFileDefinitionsById = {
    [K in AsIsFileId]: AsIsFileDefinition;
};

/**
 * Registry of all static Rust files available for inclusion in generated SDKs.
 *
 * This constant provides access to resolved file definitions that can be used
 * by code generators to include pre-written Rust files in the output.
 *
 * @example
 * ```typescript
 * // Access a specific file
 * const httpFile = AsIsFiles.HttpClient;
 * const content = await httpFile.loadContents();
 *
 * // Iterate over all files
 * for (const [id, definition] of Object.entries(AsIsFiles)) {
 *   console.log(`${id}: ${definition.filename}`);
 * }
 * ```
 */
export const AsIsFiles = createAsIsFiles();

/**
 * Transforms the raw file specifications into fully resolved file definitions.
 */
function createAsIsFiles(): AsIsFileDefinitionsById {
    const result = {} as AsIsFileDefinitionsById;

    for (const [key, spec] of entries(AsIsFileSpecs)) {
        const { relativePathToDir, filename } = spec as AsIsFileSpec;
        result[key] = {
            filename,
            directory: RelativeFilePath.of(relativePathToDir),
            loadContents: () => {
                const absolutePath = path.join(__dirname, "asIs", filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
