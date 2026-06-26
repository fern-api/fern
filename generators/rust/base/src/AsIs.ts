import { accessSync, constants } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
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
    WebSocket: {
        relativePathToDir: "src/core",
        filename: "websocket.rs"
    },
    FlexibleDatetime: {
        relativePathToDir: "src/core",
        filename: "flexible_datetime.rs"
    },
    Base64Bytes: {
        relativePathToDir: "src/core",
        filename: "base64_bytes.rs"
    },
    BigIntString: {
        relativePathToDir: "src/core",
        filename: "bigint_string.rs"
    },
    NumberSerializers: {
        relativePathToDir: "src/core",
        filename: "number_serializers.rs"
    },
    OAuthTokenProvider: {
        relativePathToDir: "src/core",
        filename: "oauth_token_provider.rs"
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
    },
    // Documentation files
    ContributingMd: {
        relativePathToDir: "",
        filename: "CONTRIBUTING.md"
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
 * Resolve the directory containing the as-is Rust template files.
 *
 * Resolution order:
 *   1. Env var override (`FERN_RUST_ASIS_DIR`) — set by the CLI generator's
 *      `generateEmbeddedSdk.ts` when invoking the Rust SDK in-process.
 *   2. `<scriptDir>/asIs/` — standalone Rust SDK Docker image layout.
 *   3. `<scriptDir>/rust-sdk-dist/asIs/` — embedded in CLI generator Docker.
 *   4. Monorepo dev — `@fern-api/rust-base` package's `src/asIs/`.
 */
function resolveAsIsDir(): string {
    // 1. Explicit override via environment variable.
    const envOverride = process.env.FERN_RUST_ASIS_DIR;
    if (envOverride != null && envOverride !== "") {
        try {
            accessSync(path.join(envOverride, "prelude.rs"), constants.R_OK);
            return envOverride;
        } catch (_e: unknown) {
            // fall through
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const scriptDir: string = typeof __dirname !== "undefined" ? __dirname : ".";

    // 2. Standalone Docker layout: <dist>/asIs/
    const standalone = path.join(scriptDir, "asIs");
    try {
        accessSync(path.join(standalone, "prelude.rs"), constants.R_OK);
        return standalone;
    } catch (_e: unknown) {
        // fall through
    }

    // 3. Embedded in CLI generator Docker: <dist>/rust-sdk-dist/asIs/
    const embedded = path.join(scriptDir, "rust-sdk-dist", "asIs");
    try {
        accessSync(path.join(embedded, "prelude.rs"), constants.R_OK);
        return embedded;
    } catch (_e: unknown) {
        // fall through
    }

    // 4. Monorepo dev — resolve via @fern-api/rust-base package.
    try {
        const base = typeof __filename !== "undefined" ? `file://${__filename}` : "file:///";
        const require = createRequire(base);
        const basePkg = require.resolve("@fern-api/rust-base/package.json");
        const baseRoot = path.dirname(basePkg);
        const devAsIs = path.join(baseRoot, "src", "asIs");
        accessSync(path.join(devAsIs, "prelude.rs"), constants.R_OK);
        return devAsIs;
    } catch (_e: unknown) {
        // fall through
    }

    throw new Error(
        "Could not resolve Rust core as-is files. " +
            "Ensure the rust-sdk dist has been built (`pnpm turbo run dist:cli --filter @fern-api/rust-sdk`), " +
            "or that @fern-api/rust-base is installed in the workspace."
    );
}

/** Lazily resolved asIs directory (cached after first call). */
let _resolvedAsIsDir: string | undefined;
function getAsIsDir(): string {
    if (_resolvedAsIsDir == null) {
        _resolvedAsIsDir = resolveAsIsDir();
    }
    return _resolvedAsIsDir;
}

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
                const absolutePath = path.join(getAsIsDir(), filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
