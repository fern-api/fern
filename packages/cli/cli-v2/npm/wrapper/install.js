#!/usr/bin/env node
// Postinstall validator for @fern-api/fern.
//
// Verifies that the platform-specific binary package was installed alongside
// this wrapper (via npm's optionalDependencies + os/cpu fields). If it wasn't
// (e.g. because the user passed --no-optional / --omit=optional, or because
// the package manager skipped the optional), prints a clear error message
// without failing the install so that the user can decide how to recover.
//
// The actual launcher (bin/fern) will produce the same diagnostic at execution
// time if the binary is genuinely missing.

"use strict";

const PLATFORM_PACKAGES = {
    "darwin arm64": "@fern-api/fern-darwin-arm64",
    "darwin x64": "@fern-api/fern-darwin-x64",
    "linux arm64": "@fern-api/fern-linux-arm64",
    "linux x64": "@fern-api/fern-linux-x64",
    "win32 x64": "@fern-api/fern-win32-x64"
};

const key = `${process.platform} ${process.arch}`;
const pkg = PLATFORM_PACKAGES[key];

if (pkg == null) {
    process.stderr.write(
        `[fern] Warning: unsupported platform ${key}.\n` +
            `       The Fern CLI is published for: ${Object.keys(PLATFORM_PACKAGES).join(", ")}.\n` +
            `       If you believe your platform should be supported, please file an issue at\n` +
            `       https://github.com/fern-api/fern/issues.\n`
    );
    // Do not fail the install — let users discover the limitation when they
    // actually try to run `fern`.
    process.exit(0);
}

const subpath = process.platform === "win32" ? "bin/fern.exe" : "bin/fern";

try {
    require.resolve(`${pkg}/${subpath}`);
} catch (_err) {
    process.stderr.write(
        `[fern] Warning: could not find the Fern binary for your platform.\n` +
            `       The package ${pkg} was not installed alongside @fern-api/fern.\n` +
            `\n` +
            `       This usually happens when --no-optional or --omit=optional was passed at install time,\n` +
            `       or when your package manager skipped the optional dependency.\n` +
            `\n` +
            `       Try reinstalling with:\n` +
            `         npm install ${pkg}\n` +
            `       or rerun the install without skipping optional dependencies.\n`
    );
    // Do not fail the postinstall — CI installs sometimes intentionally strip
    // optionals, and we still want package metadata to be installable. The
    // launcher (bin/fern) will produce a clearer error at run time.
    process.exit(0);
}
