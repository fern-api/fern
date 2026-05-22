import { buildGenerator, getDirname } from "@fern-api/configs/build-utils.mjs";

// Glob patterns (minimatch syntax, relative to ./sdk) of files we don't want
// shipped inside the generator image. The remaining tree is what gets copied
// verbatim into the user's output directory at runtime.
const SDK_IGNORE = [
    // Build output + macOS metadata that occasionally re-appears under
    // version control if the SDK is opened in Finder.
    "**/.DS_Store",
    "target/**",

    // SDK developers may rely on a `.gitignore` tailored to template-side
    // dev. The generated CLI gets its own `.gitignore` at codegen time.
    ".gitignore",

    // Internal planning / design docs (not for shipped CLI consumers).
    "docs/**",

    // Integration tests that exec the openapi-fixture bin and assert
    // against the placeholder spec's specific content. `copySpecs`
    // writes a fresh main.rs alongside the user's mounted spec(s), so
    // these tests are coupled to the SDK template's dev fixture and
    // not meaningful in the user's generated output. The generic
    // library tests (auth, websocket, tls, lib_api against the
    // internal __fixtures__ spec) still ship.
    "tests/cli_integration.rs",
    "tests/openapi_fixture_wire.rs",
    "tests/fixtures/**",

    // Template-author dev bin. `copySpecs` writes the whole folder
    // (main.rs + every mounted spec) from scratch at codegen time, so
    // none of the source-side files in here belong in user output.
    "cli/openapi-fixture/**",

    // Rich (33 KB) test fixture used only by the template's own dev
    // bin and `cli_integration.rs` / `openapi_fixture_wire.rs` (also
    // ignored above). User output ships only the slimmer
    // `__fixtures__/openapi.json` (≈ 1 KB) referenced by the
    // lib-level overlay tests in src/openapi/overlay.rs and
    // tests/lib_api.rs.
    "src/openapi/__fixtures__/rich.json",

    // Fern's own CI workflows for the SDK template repo — ci.yml runs
    // clippy + tests on the template itself, release.yml ships
    // cargo-dist tags. Neither is meaningful inside a customer's repo
    // and shipping them creates confusing CI runs against the wrong
    // branding. Customers wire up their own CI; we just keep our
    // hands off `.github/`.
    ".github/**",

    // Internal helper bin used by the SDK template's CI to verify
    // spec stripping behavior — not relevant to customer output.
    // Paired with the [[bin]] strip-schema entry removal in
    // patchCargoToml.
    "src/bin/strip_schema.rs",

    // Build script used by the cli-sdk template for generating test
    // constants from spec files. Not needed in customer output.
    "build.rs",

    // Template-only test files that reference the openapi-fixture spec
    // or internal test infrastructure not shipped to customers.
    "tests/common/**",
    "tests/auth_routing_wire.rs",
    "tests/extension_surface_behavior.rs",
    "tests/lib_api.rs",
    "tests/tls_env_vars.rs",

    // Changelog entries for the SDK template itself — not relevant to
    // customer output.
    "changes/**"
];

await buildGenerator(getDirname(import.meta.url), {
    copy: { from: "./sdk", to: "./dist/sdk", ignore: SDK_IGNORE }
});
