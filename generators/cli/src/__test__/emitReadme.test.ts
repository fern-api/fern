import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { DetectedAuthBinding } from "../detectAuth.js";
import { emitReadme } from "../emitReadme.js";
import type { ResolvedNpmPublishInfo } from "../resolveOutputConfig.js";

describe("emitReadme", () => {
    let tmpDir: string;
    let outputDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "emitReadme-"));
        outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function emitAndRead(args: Parameters<typeof emitReadme>[0]): Promise<string> {
        await emitReadme(args);
        return readFile(path.join(args.outputDir, "README.md"), "utf-8");
    }

    // ── Fixtures ────────────────────────────────────────────────────

    const npmPublishInfo: ResolvedNpmPublishInfo = {
        packageName: "@petstore/cli",
        registryUrl: "https://registry.npmjs.org",
        tokenEnvironmentVariable: "NPM_TOKEN",
        useOidc: false
    };

    const bearerBinding: DetectedAuthBinding = {
        schemeName: "BearerAuth",
        rustCall: '.auth(BearerAuth::new("BearerAuth").env("PETSTORE_API_TOKEN"))',
        placement: "root",
        authTypeImport: "BearerAuth",
        envVars: ["PETSTORE_API_TOKEN"],
        kind: "bearer"
    };

    // ── npm + bearer auth ───────────────────────────────────────────

    it("generates a complete README with npm install and bearer auth", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "petstore-api",
            apiDisplayName: "Petstore",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/fern-api/petstore-cli"
        });

        expect(readme).toContain("# Petstore CLI");
        expect(readme).toContain("Command-line interface for the Petstore API.");
        expect(readme).toContain("## Table of contents");
        expect(readme).toContain("npm install -g @petstore/cli");
        expect(readme).toContain("npx @petstore/cli --help");
        expect(readme).toContain("### Build from source");
        expect(readme).toContain("cargo build --release");
        expect(readme).toContain('export PETSTORE_API_TOKEN="<your token>"');
        expect(readme).toContain(".env");
        expect(readme).toContain("petstore-api --help");
        expect(readme).toContain("--format");
        expect(readme).toContain("--dry-run");
        expect(readme).toContain("PETSTORE_API_BASE_URL");
        expect(readme).toContain("PETSTORE_API_CA_BUNDLE");
        expect(readme).toContain("PETSTORE_API_TIMEOUT_SECS");
        expect(readme).toContain("petstore-api completion <bash|zsh|fish|powershell>");
        expect(readme).toContain("reference.md");
    });

    // ── npm badge in header ─────────────────────────────────────────

    it("includes npm version badge when npmPublishInfo is present", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "petstore-api",
            apiDisplayName: "Petstore",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/fern-api/petstore-cli"
        });

        expect(readme).toContain("[![npm shield](https://img.shields.io/npm/v/@petstore/cli)]");
        expect(readme).toContain("(https://www.npmjs.com/package/@petstore/cli)");
    });

    it("omits npm badge when npmPublishInfo is absent", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        expect(readme).not.toContain("npm shield");
        expect(readme).not.toContain("img.shields.io/npm");
    });

    // ── Fern shield in header ───────────────────────────────────────

    it("includes the Fern shield linked to the repo", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "petstore-api",
            apiDisplayName: "Petstore",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/fern-api/petstore-cli"
        });

        expect(readme).toContain(
            "[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-CLI%20generated%20by%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Ffern-api%2Fpetstore-cli)"
        );
    });

    it("falls back to the display name in the Fern shield link when repoUrl is absent", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        expect(readme).toContain(
            "[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-CLI%20generated%20by%20Fern-brightgreen)]"
        );
        expect(readme).toContain("utm_source=Acme%2FCLI)");
    });

    it("omits the Fern shield when white-labeling is enabled", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/acme/acme-cli",
            whiteLabel: true
        });

        expect(readme).not.toContain("fern shield");
        expect(readme).not.toContain("buildwithfern.com");
        // The npm badge is unaffected by white-labeling.
        expect(readme).toContain("npm shield");
    });

    // ── Build from source when npmPublishInfo absent ────────────────

    it("shows curl|bash primary install when npmPublishInfo is absent", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo: undefined,
            repoUrl: "https://github.com/acme/acme-cli",
            packageName: "acme-cli"
        });

        // The installer is named after the cargo package, not the binary —
        // cargo-dist publishes `<package>-installer.sh`.
        expect(readme).toContain(
            "curl --proto '=https' --tlsv1.2 -LsSf https://github.com/acme/acme-cli/releases/latest/download/acme-cli-installer.sh | sh"
        );
        expect(readme).toContain("### Build from source");
        expect(readme).toContain("cargo build --release");
        expect(readme).toContain("rustup.rs");
        expect(readme).not.toContain("npm install");
        expect(readme).not.toContain("npx");
    });

    // ── Generic auth when no supported bindings ─────────────────────

    it("shows generic auth line when there are no supported bindings", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "my-api",
            apiDisplayName: "My API",
            authBindings: [],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        expect(readme).toContain("This API requires authentication. Run `my-api --help` for details.");
        // The Authentication section should not contain env-var export lines.
        const authSection = readme.split("## Authentication")[1]?.split("##")[0] ?? "";
        expect(authSection).not.toContain("export ");
    });

    // ── apiDisplayName fallback to binaryName ───────────────────────

    it("falls back to binaryName when apiDisplayName is undefined", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "my-tool",
            apiDisplayName: undefined,
            authBindings: [],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        expect(readme).toContain("# my-tool CLI");
        expect(readme).toContain("Command-line interface for the my-tool API.");
    });

    // ── Multiple auth bindings ──────────────────────────────────────

    it("renders one env-var line per auth binding", async () => {
        const headerBinding: DetectedAuthBinding = {
            schemeName: "ApiKey",
            rustCall: '.auth(ApiKeyAuth::new("ApiKey").env("ACME_API_KEY"))',
            placement: "root",
            authTypeImport: "ApiKeyAuth",
            envVars: ["ACME_API_KEY"],
            kind: "header"
        };
        const basicBinding: DetectedAuthBinding = {
            schemeName: "Basic",
            rustCall: '.auth_basic_scheme("Basic", ...)',
            placement: "binding",
            authTypeImport: "AuthCredentialSource",
            envVars: ["ACME_USERNAME", "ACME_PASSWORD"],
            kind: "basic"
        };

        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [headerBinding, basicBinding],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        expect(readme).toContain('export ACME_API_KEY="<your api key>"');
        expect(readme).toContain('export ACME_USERNAME="<your credential>"');
        expect(readme).toContain('export ACME_PASSWORD="<your credential>"');
    });

    it("documents OAuth client-credentials env vars", async () => {
        const oauthBinding: DetectedAuthBinding = {
            schemeName: "OAuth2",
            rustCall:
                '.auth(OAuth2Auth::new("OAuth2").token_url("https://api.example.com/token").client_id_env("ACME_CLIENT_ID").client_secret_env("ACME_CLIENT_SECRET"))',
            placement: "root",
            authTypeImport: "OAuth2Auth",
            envVars: ["ACME_CLIENT_ID", "ACME_CLIENT_SECRET"],
            optionalEnvVars: ["ACME_AUDIENCE"],
            kind: "oauth-client-credentials"
        };

        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [oauthBinding],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        expect(readme).toContain('export ACME_CLIENT_ID="<your OAuth client credential>"');
        expect(readme).toContain('export ACME_CLIENT_SECRET="<your OAuth client credential>"');
        expect(readme).toContain('# export ACME_AUDIENCE="<your OAuth client credential>" # optional');
    });

    // ── Merge preserves customer-added sections ─────────────────────

    it("preserves a customer-added section while regenerating generated ones", async () => {
        const existingReadme = [
            "# Old Header",
            "",
            "## Installation",
            "",
            "Old installation content",
            "",
            "## Custom Section",
            "",
            "This is a custom section added by the user.",
            "",
            "## Usage",
            "",
            "Old usage content",
            ""
        ].join("\n");

        await writeFile(path.join(outputDir, "README.md"), existingReadme);

        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        // Header is regenerated.
        expect(readme).toContain("# Acme CLI");
        expect(readme).not.toContain("# Old Header");

        // Generated sections are updated.
        expect(readme).toContain("## Installation");
        expect(readme).toContain("cargo build --release");
        expect(readme).not.toContain("Old installation content");

        // Customer section is preserved.
        expect(readme).toContain("## Custom Section");
        expect(readme).toContain("This is a custom section added by the user.");

        // Order: customer section sits between the sections that
        // originally surrounded it.
        const installIdx = readme.indexOf("## Installation");
        const customIdx = readme.indexOf("## Custom Section");
        const usageIdx = readme.indexOf("## Usage");
        expect(customIdx).toBeGreaterThan(installIdx);
        expect(usageIdx).toBeGreaterThan(customIdx);
    });

    // ── Section order (progressive disclosure) ──────────────────────

    it("emits sections in progressive disclosure order", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/acme/acme-cli"
        });

        const expectedOrder = [
            "## Table of contents",
            "## Installation",
            "## Authentication",
            "## Quick start",
            "## Usage",
            "## Documentation",
            "## Advanced"
        ];

        let lastIndex = -1;
        for (const section of expectedOrder) {
            const idx = readme.indexOf(section);
            expect(idx, `${section} should appear in README`).toBeGreaterThan(lastIndex);
            lastIndex = idx;
        }
    });

    // ── Advanced subsections ────────────────────────────────────────

    it("nests Common flags, Environment variables, Output formats, Shell completion under Advanced", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/acme/acme-cli"
        });

        const advancedSection = readme.split("## Advanced")[1] ?? "";
        expect(advancedSection).toContain("### Common flags");
        expect(advancedSection).toContain("### Environment variables");
        expect(advancedSection).toContain("### Output formats");
        expect(advancedSection).toContain("### Shell completion");
    });

    // ── Quick start section ─────────────────────────────────────────

    it("renders a Quick start section with basic examples", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "petstore-api",
            apiDisplayName: "Petstore",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/fern-api/petstore-cli"
        });

        const quickStartSection = readme.split("## Quick start")[1]?.split("## Usage")[0] ?? "";
        expect(quickStartSection).toContain("petstore-api --help");
        expect(quickStartSection).toContain("petstore-api <resource> <method>");
        expect(quickStartSection).toContain("petstore-api <resource> --help");
    });

    // ── Usage is trimmed (no --help dump) ───────────────────────────

    it("renders trimmed Usage without --help dump", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "petstore-api",
            apiDisplayName: "Petstore",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/fern-api/petstore-cli"
        });

        const usageSection = readme.split("## Usage")[1]?.split("## Documentation")[0] ?? "";
        expect(usageSection).toContain("petstore-api <resource> <method>");
        expect(usageSection).toContain("--json");
        // No --help dump
        expect(usageSection).not.toContain("Commands:");
        expect(usageSection).not.toContain("generate-skills");
        expect(usageSection).not.toContain("Options:");
    });

    // ── Table of contents ───────────────────────────────────────────

    it("generates a table of contents with Advanced subsections", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo,
            repoUrl: "https://github.com/acme/acme-cli"
        });

        const tocSection = readme.split("## Table of contents")[1]?.split("## Installation")[0] ?? "";
        expect(tocSection).toContain("[Installation](#installation)");
        expect(tocSection).toContain("[Authentication](#authentication)");
        expect(tocSection).toContain("[Quick start](#quick-start)");
        expect(tocSection).toContain("[Usage](#usage)");
        expect(tocSection).toContain("[Documentation](#documentation)");
        expect(tocSection).toContain("[Advanced](#advanced)");
        expect(tocSection).toContain("[Common flags](#common-flags)");
        expect(tocSection).toContain("[Shell completion](#shell-completion)");
    });

    // ── TOC includes customer-added sections ────────────────────────

    it("includes customer-added sections in the table of contents", async () => {
        const existingReadme = [
            "# Old Header",
            "",
            "## Installation",
            "",
            "Old content",
            "",
            "## My Custom Section",
            "",
            "Custom content",
            ""
        ].join("\n");

        await writeFile(path.join(outputDir, "README.md"), existingReadme);

        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        const tocSection = readme.split("## Table of contents")[1]?.split("## Installation")[0] ?? "";
        expect(tocSection).toContain("[My Custom Section](#my-custom-section)");
    });

    // ── .env support mentioned in Authentication ────────────────────

    it("mentions .env file support in Authentication when auth bindings present", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo: undefined,
            repoUrl: undefined
        });

        const authSection = readme.split("## Authentication")[1]?.split("##")[0] ?? "";
        expect(authSection).toContain(".env");
    });
});

describe("emitReadme — distribution channels", () => {
    let outputDir: string;

    beforeEach(async () => {
        outputDir = await mkdtemp(path.join(os.tmpdir(), "readmeDistribution-"));
    });

    afterEach(async () => {
        await rm(outputDir, { recursive: true, force: true });
    });

    async function readReadme(): Promise<string> {
        return readFile(path.join(outputDir, "README.md"), "utf-8");
    }

    const base = {
        binaryName: "acme-cli",
        apiDisplayName: "Acme",
        authBindings: [],
        npmPublishInfo: undefined,
        repoUrl: "https://github.com/acme/acme-cli"
    };

    it("shows no brew/scoop stanzas when distribution is unconfigured", async () => {
        await emitReadme({ outputDir, ...base });
        const readme = await readReadme();
        expect(readme).not.toContain("Homebrew");
        expect(readme).not.toContain("Scoop");
    });

    // The three-segment form auto-taps, so first install is one copy-pasteable
    // line — `acme/homebrew-tap` is addressed by brew as `acme/tap`.
    it("renders the auto-tapping brew one-liner", async () => {
        await emitReadme({ outputDir, ...base, distribution: { homebrew: { tap: "acme/homebrew-tap" } } });
        expect(await readReadme()).toContain("brew install acme/tap/acme-cli");
    });

    it("uses an explicit formula name over the binary name", async () => {
        await emitReadme({
            outputDir,
            ...base,
            distribution: { homebrew: { tap: "acme/homebrew-tap", formula: "acme" } }
        });
        expect(await readReadme()).toContain("brew install acme/tap/acme");
    });

    it("leaves a tap repo that is not homebrew-prefixed alone", async () => {
        await emitReadme({ outputDir, ...base, distribution: { homebrew: { tap: "acme/taps" } } });
        expect(await readReadme()).toContain("brew install acme/taps/acme-cli");
    });

    it("renders the two-step scoop install and flags the ARM64 Windows gap", async () => {
        await emitReadme({ outputDir, ...base, distribution: { scoop: { bucket: "acme/scoop-bucket" } } });
        const readme = await readReadme();
        expect(readme).toContain("scoop bucket add acme https://github.com/acme/scoop-bucket");
        expect(readme).toContain("scoop install acme-cli");
        expect(readme).toContain("ARM64 Windows under emulation");
    });

    it("lists every configured channel in the table of contents", async () => {
        await emitReadme({
            outputDir,
            ...base,
            npmPublishInfo: {
                packageName: "@acme/cli",
                registryUrl: "https://registry.npmjs.org",
                tokenEnvironmentVariable: "NPM_TOKEN",
                useOidc: false
            },
            distribution: { homebrew: { tap: "acme/homebrew-tap" }, scoop: { bucket: "acme/scoop-bucket" } }
        });
        const readme = await readReadme();
        expect(readme).toContain("### npm");
        expect(readme).toContain("### Homebrew (macOS / Linux)");
        expect(readme).toContain("### Scoop (Windows)");
        // curl|bash still leads, build-from-source still trails.
        expect(readme.indexOf("### Shell (macOS / Linux)")).toBeLessThan(readme.indexOf("### Homebrew"));
        expect(readme.indexOf("### Scoop (Windows)")).toBeLessThan(readme.indexOf("### Build from source"));
    });
});

describe("emitReadme — installer URLs", () => {
    let outputDir: string;
    beforeEach(async () => {
        outputDir = await mkdtemp(path.join(os.tmpdir(), "readmeInstaller-"));
    });
    afterEach(async () => {
        await rm(outputDir, { recursive: true, force: true });
    });

    const base = {
        binaryName: "elevenlabs",
        apiDisplayName: "ElevenLabs",
        authBindings: [],
        npmPublishInfo: undefined,
        repoUrl: "https://github.com/acme/elevenlabs-cli"
    };

    // cargo-dist names installer scripts after the cargo *package*, not the
    // binary. Using binaryName produced a curl|bash command that 404s
    // whenever the two differ — which is always, since the package defaults
    // to the template's `fern-cli-sdk`.
    it("names the installer after the cargo package, not the binary", async () => {
        await emitReadme({ outputDir, ...base, packageName: "elevenlabs-cli" });
        const readme = await readFile(path.join(outputDir, "README.md"), "utf-8");
        expect(readme).toContain("elevenlabs-cli-installer.sh");
        expect(readme).toContain("elevenlabs-cli-installer.ps1");
        expect(readme).not.toContain("/elevenlabs-installer.sh");
    });

    it("falls back to the template package name when none is configured", async () => {
        await emitReadme({ outputDir, ...base });
        const readme = await readFile(path.join(outputDir, "README.md"), "utf-8");
        expect(readme).toContain("fern-cli-sdk-installer.sh");
    });
});
