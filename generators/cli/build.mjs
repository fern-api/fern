import { buildGenerator, getDirname } from "@fern-api/configs/build-utils.mjs";
import { cp, readFile } from "fs/promises";
import path from "path";

// ---------------------------------------------------------------------------
// SDK_IGNORE — derived from cli-sdk's sync-manifest.toml (dev-only globs)
// plus fern-side patterns for artifacts that never belong in user output.
//
// sync-sdk.sh writes .sdk-ignore.json into the vendored tree — it contains
// the dev-only globs rewritten for the vendored layout (dest overrides
// applied). We read that file so build.mjs stays in sync with the manifest
// without needing a TOML parser.
// ---------------------------------------------------------------------------
const dirname = getDirname(import.meta.url);
const sdkIgnorePath = path.join(dirname, "sdk", ".sdk-ignore.json");

let manifestIgnore;
try {
    manifestIgnore = JSON.parse(await readFile(sdkIgnorePath, "utf-8"));
} catch {
    // Fallback: if .sdk-ignore.json doesn't exist yet (first sync hasn't
    // run), use an empty array. The fern-side patterns below still apply.
    manifestIgnore = [];
}

const SDK_IGNORE = [
    // Fern-side patterns (not in cli-sdk's manifest — these are artifacts
    // of the vendored tree or build process).
    "**/.DS_Store",
    "target/**",
    ".synced-from",
    "sync-manifest.toml",
    ".sdk-ignore.json",

    // Manifest-derived dev-only globs (from cli-sdk's sync-manifest.toml).
    ...manifestIgnore
];

await buildGenerator(dirname, {
    copy: { from: "./sdk", to: "./dist/sdk", ignore: SDK_IGNORE }
});

// Copy the pre-built rust-model generator CLI into dist/ so the Docker
// image can invoke it as a child process for embedded types generation.
// In the monorepo the package resolves via pnpm workspaces; the
// `dist:cli` turbo task must have run for @fern-api/rust-model first.
try {
    // Follow the pnpm workspace symlink to find the real package root.
    const symlink = path.resolve(dirname, "node_modules", "@fern-api", "rust-model");
    const { readlink } = await import("fs/promises");
    const target = await readlink(symlink);
    const rustModelPkg = path.resolve(path.dirname(symlink), target);
    // Copy the entire rust-model dist tree into dist/rust-model-dist/ so the
    // subprocess has access to all its bundled assets (asIs/).
    const rustModelDistDir = path.join(rustModelPkg, "dist");
    await cp(rustModelDistDir, path.join(dirname, "dist", "rust-model-dist"), { recursive: true });
} catch (_e) {
    // Non-fatal: the rust-model dist may not exist during a plain
    // `pnpm compile`. It's only required for `dist:cli` / Docker.
}

// Copy the pre-built rust-sdk generator CLI into dist/ so the Docker
// image can invoke it as a child process for embedded SDK generation.
// Same pattern as the rust-model copy above.
try {
    const { readlink: readlinkSdk } = await import("fs/promises");
    const sdkSymlink = path.resolve(dirname, "node_modules", "@fern-api", "rust-sdk");
    const sdkTarget = await readlinkSdk(sdkSymlink);
    const rustSdkPkg = path.resolve(path.dirname(sdkSymlink), sdkTarget);
    const rustSdkDistDir = path.join(rustSdkPkg, "dist");
    await cp(rustSdkDistDir, path.join(dirname, "dist", "rust-sdk-dist"), { recursive: true });
} catch (_e) {
    // Non-fatal: the rust-sdk dist may not exist during a plain
    // `pnpm compile`. It's only required for `dist:cli` / Docker.
}
