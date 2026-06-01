import { FernIr } from "@fern-fern/ir-sdk";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { IrSummary } from "../ir.js";
import type { ResolvedOutputConfig } from "../resolveOutputConfig.js";
import { runPipeline } from "../runPipeline.js";

/**
 * Locks in the ordering invariants between copySdk, patchCargoToml,
 * and copySpecs without standing up Docker. Tests use a minimal
 * synthetic SDK template (just the files patchCargoToml needs to
 * anchor against) and build `IrSummary` fixtures directly so we
 * don't need a parseable IR JSON per test.
 */
describe("runPipeline", () => {
    let tmpDir: string;
    let sdkTemplateDir: string;
    let specsDir: string;
    let outputDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "runPipeline-"));
        sdkTemplateDir = path.join(tmpDir, "sdk");
        specsDir = path.join(tmpDir, "specs");
        outputDir = path.join(tmpDir, "out");
        await mkdir(sdkTemplateDir, { recursive: true });
        await mkdir(specsDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function stageSdkTemplate(): Promise<void> {
        await writeFile(
            path.join(sdkTemplateDir, "Cargo.toml"),
            [
                "# `name`, `repository`, `homepage`, `authors`, and `keywords` are Fern's —",
                "# they identify the SDK template's source on crates.io. The fern-cli",
                "# generator does NOT rewrite this block when producing your CLI; only the",
                "# [[bin]] entry below is templated. If you want to publish *your* CLI as",
                "# its own crate on crates.io, edit this block to your org's metadata.",
                "# The [lib] name (`fern_cli_sdk`) is the import path every `use",
                "# fern_cli_sdk::...` site in src/ depends on — do NOT rename it.",
                "[package]",
                'name = "fern-cli-sdk"',
                'version = "0.0.0"',
                'readme = "README.md"',
                "",
                "# Rewritten by the fern-cli generator's `patchCargoToml` step — both the",
                "# `name` and `path` are replaced with the derived binary name so users",
                "# get `cargo install`-able binaries named after their API rather than",
                '# the template\'s literal "openapi-fixture".',
                "[[bin]]",
                'name = "openapi-fixture"',
                'path = "cli/openapi-fixture/main.rs"',
                "",
                "# Internal tool used by the SDK template itself — not the user's CLI.",
                "[[bin]]",
                'name = "strip-schema"',
                'path = "src/bin/strip_schema.rs"',
                "",
                "[package.metadata.dist]",
                "dist = false",
                ""
            ].join("\n")
        );
        await writeFile(path.join(sdkTemplateDir, "LICENSE"), "Apache-2.0");
        await mkdir(path.join(sdkTemplateDir, "src"), { recursive: true });
        await writeFile(path.join(sdkTemplateDir, "src", "lib.rs"), "// SDK lib");
    }

    async function stageSpecs(specs: Array<{ filename: string; body: object }>): Promise<void> {
        for (const { filename, body } of specs) {
            await writeFile(path.join(specsDir, filename), JSON.stringify(body));
        }
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: specs.map(({ filename }) => ({
                    type: "openapi",
                    specPath: path.join(specsDir, filename)
                }))
            })
        );
    }

    const ir = (overrides: Partial<IrSummary> = {}): IrSummary => ({
        apiDisplayName: overrides.apiDisplayName,
        auth: overrides.auth ?? { schemes: [] }
    });

    const localFilesConfig: ResolvedOutputConfig = {
        version: "0.0.0",
        npmPublishInfo: undefined
    };

    const githubConfig: ResolvedOutputConfig = {
        version: "1.5.0",
        npmPublishInfo: {
            packageName: "@acme/cli",
            registryUrl: "https://registry.npmjs.org",
            tokenEnvironmentVariable: "NPM_TOKEN"
        }
    };

    it("returns skipped when no OpenAPI specs are mounted; never touches the output dir", async () => {
        await stageSdkTemplate();

        // Bails before reading the IR, so contents don't matter.
        const outcome = await runPipeline({
            outputDir,
            customConfig: {},
            ir: ir(),
            outputConfig: localFilesConfig,
            sdkTemplateDir,
            specsDir
        });

        expect(outcome).toEqual({ status: "skipped", reason: "no-openapi-specs" });
        await expect(access(outputDir)).rejects.toThrow();
    });

    it("runs copySdk → patchCargoToml → copySpecs in order; outputs are mutually consistent", async () => {
        await stageSdkTemplate();
        await stageSpecs([
            { filename: "openapi0.json", body: { openapi: "3.0.0", info: { title: "Should Not Be Used" } } }
        ]);

        const outcome = await runPipeline({
            outputDir,
            customConfig: {},
            ir: ir({ apiDisplayName: "My API" }),
            outputConfig: localFilesConfig,
            sdkTemplateDir,
            specsDir
        });

        expect(outcome).toEqual({ status: "generated", binaryName: "my-api" });

        // copySdk landed the template.
        expect(await readFile(path.join(outputDir, "LICENSE"), "utf-8")).toBe("Apache-2.0");
        expect(await readFile(path.join(outputDir, "src", "lib.rs"), "utf-8")).toBe("// SDK lib");

        // patchCargoToml rewrote the [[bin]] block to reference the derived binary name.
        const cargo = await readFile(path.join(outputDir, "Cargo.toml"), "utf-8");
        expect(cargo).toContain('name = "my-api"');
        expect(cargo).toContain('path = "cli/my-api/main.rs"');

        // copySpecs created `cli/<binaryName>/` with the spec + main.rs.
        const main = await readFile(path.join(outputDir, "cli", "my-api", "main.rs"), "utf-8");
        expect(main).toContain('CliApp::new("my-api")');
        await expect(access(path.join(outputDir, "cli", "my-api", "openapi0.json"))).resolves.toBeUndefined();

        // writeGitignore placed a .gitignore with Rust build artifacts.
        const gitignore = await readFile(path.join(outputDir, ".gitignore"), "utf-8");
        expect(gitignore).toContain("/target");
    });

    it("customConfig.binaryName overrides IR apiDisplayName", async () => {
        await stageSdkTemplate();
        await stageSpecs([{ filename: "openapi0.json", body: { openapi: "3.0.0" } }]);

        const outcome = await runPipeline({
            outputDir,
            customConfig: { binaryName: "Override CLI" },
            ir: ir({ apiDisplayName: "Should Not Win" }),
            outputConfig: localFilesConfig,
            sdkTemplateDir,
            specsDir
        });

        expect(outcome).toEqual({ status: "generated", binaryName: "override-cli" });
        await expect(access(path.join(outputDir, "cli", "override-cli", "main.rs"))).resolves.toBeUndefined();
    });

    it("IR-driven auth bindings reach the codegen'd main.rs", async () => {
        await stageSdkTemplate();
        await stageSpecs([{ filename: "openapi0.json", body: { openapi: "3.0.0" } }]);

        const outcome = await runPipeline({
            outputDir,
            customConfig: { binaryName: "close" },
            ir: ir({
                apiDisplayName: "Close API",
                auth: {
                    schemes: [
                        FernIr.AuthScheme.basic({
                            key: "ApiKeyAuth",
                            username: "username",
                            usernameEnvVar: "CLOSE_API_KEY",
                            usernameOmit: undefined,
                            usernamePlaceholder: undefined,
                            password: "password",
                            passwordEnvVar: undefined,
                            passwordOmit: true,
                            passwordPlaceholder: undefined,
                            docs: undefined
                        }),
                        FernIr.AuthScheme.bearer({
                            key: "OAuth2",
                            token: "token",
                            tokenEnvVar: undefined,
                            tokenPlaceholder: undefined,
                            docs: undefined
                        })
                    ]
                }
            }),
            outputConfig: localFilesConfig,
            sdkTemplateDir,
            specsDir
        });

        expect(outcome).toEqual({ status: "generated", binaryName: "close" });
        const main = await readFile(path.join(outputDir, "cli", "close", "main.rs"), "utf-8");
        expect(main).toContain(
            '.auth_provider("ApiKeyAuth", BasicAuthProvider::username_only("ApiKeyAuth", AuthCredentialSource::from_env("CLOSE_API_KEY")))'
        );
        expect(main).toContain('.auth(BearerAuth::new("OAuth2").env("CLOSE_TOKEN"))');
        expect(main).toContain("use fern_cli_sdk::auth::{AuthCredentialSource, BasicAuthProvider, BearerAuth};");
    });

    it("no customConfig.binaryName + no IR apiDisplayName surfaces a clear error before any disk write", async () => {
        await stageSdkTemplate();
        await stageSpecs([{ filename: "openapi0.json", body: { openapi: "3.0.0" } }]);

        await expect(
            runPipeline({ outputDir, customConfig: {}, ir: ir(), outputConfig: localFilesConfig, sdkTemplateDir, specsDir })
        ).rejects.toThrow(/Set `customConfig.binaryName`/);

        // The error came BEFORE any output got created.
        await expect(access(outputDir)).rejects.toThrow();
    });

    it("stamps the resolved version into Cargo.toml [package] version", async () => {
        await stageSdkTemplate();
        await stageSpecs([{ filename: "openapi0.json", body: { openapi: "3.0.0" } }]);

        const versionedConfig: ResolvedOutputConfig = { version: "2.3.1", npmPublishInfo: undefined };
        await runPipeline({
            outputDir,
            customConfig: { binaryName: "acme" },
            ir: ir({ apiDisplayName: "Acme" }),
            outputConfig: versionedConfig,
            sdkTemplateDir,
            specsDir
        });

        const cargo = await readFile(path.join(outputDir, "Cargo.toml"), "utf-8");
        expect(cargo).toContain('version = "2.3.1"');
    });

    it("does NOT emit .github/ when output mode is local_files (no npmPublishInfo)", async () => {
        await stageSdkTemplate();
        await stageSpecs([{ filename: "openapi0.json", body: { openapi: "3.0.0" } }]);

        await runPipeline({
            outputDir,
            customConfig: { binaryName: "acme" },
            ir: ir({ apiDisplayName: "Acme" }),
            outputConfig: localFilesConfig,
            sdkTemplateDir,
            specsDir
        });

        await expect(access(path.join(outputDir, ".github"))).rejects.toThrow();
    });

    it("emits .github/workflows/ci.yml when github mode with npm publish info", async () => {
        await stageSdkTemplate();
        await stageSpecs([{ filename: "openapi0.json", body: { openapi: "3.0.0" } }]);

        await runPipeline({
            outputDir,
            customConfig: { binaryName: "acme" },
            ir: ir({ apiDisplayName: "Acme" }),
            outputConfig: githubConfig,
            sdkTemplateDir,
            specsDir
        });

        const ciYml = await readFile(path.join(outputDir, ".github", "workflows", "ci.yml"), "utf-8");
        expect(ciYml).toContain("name: ci");
        expect(ciYml).toContain("contains(github.ref, 'refs/tags/')");
        expect(ciYml).toContain("NPM_TOKEN");
        expect(ciYml).toContain("@acme/cli");
        expect(ciYml).toContain("npm publish");
        expect(ciYml).toContain("x86_64-unknown-linux-gnu");
        expect(ciYml).toContain("aarch64-apple-darwin");
    });
});
