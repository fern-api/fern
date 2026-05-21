import { readFile, writeFile } from "fs/promises";
import path from "path";
import { TEMPLATE_BINARY_NAME } from "./identity.js";

/**
 * Rewrite the shipped Cargo.toml so the bundled CLI binary has the
 * user's chosen name. Two substitutions, both anchored to literal
 * strings the SDK template ships with:
 *
 *   [[bin]]
 *   name = "openapi-fixture"                     →  name = "<binaryName>"
 *   path = "cli/openapi-fixture/main.rs"         →  path = "cli/<binaryName>/main.rs"
 *
 * The `[package] name = "fern-cli-sdk"` line is left untouched — it
 * matches the shipped `Cargo.lock` (cargo's `--locked` rejects any
 * mismatch), and the package name only matters when publishing to
 * crates.io, which the alpha doesn't do. The `[lib] name = "fern_cli_sdk"`
 * is the import path every `use fern_cli_sdk::...` site in the shipped
 * src/ tree depends on. The `[[bin]] name = "strip-schema"` is an
 * internal tool, not the user's CLI.
 */
export async function patchCargoToml(args: { outputDir: string; binaryName: string }): Promise<void> {
    const { outputDir, binaryName } = args;
    const cargoTomlPath = path.join(outputDir, "Cargo.toml");
    const contents = await readFile(cargoTomlPath, "utf-8");
    const patched = applyCargoTomlPatch(contents, binaryName);
    if (patched === contents) {
        throw new Error(
            `Cargo.toml at ${cargoTomlPath} did not match the expected template — no identity substitutions made. ` +
                "Did the SDK template's identity tokens change?"
        );
    }
    await writeFile(cargoTomlPath, patched);
}

/**
 * Pure transformation, exported for unit-test access.
 */
export function applyCargoTomlPatch(cargoToml: string, binaryName: string): string {
    return cargoToml
        .replace(`name = "${TEMPLATE_BINARY_NAME}"`, `name = "${binaryName}"`)
        .replace(`path = "cli/${TEMPLATE_BINARY_NAME}/main.rs"`, `path = "cli/${binaryName}/main.rs"`);
}
