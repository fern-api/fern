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
            npmPublishInfo
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
            npmPublishInfo
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
            npmPublishInfo: undefined
        });

        expect(readme).not.toContain("npm shield");
        expect(readme).not.toContain("img.shields.io");
    });

    // ── Build from source when npmPublishInfo absent ────────────────

    it("shows build-from-source when npmPublishInfo is absent", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo: undefined
        });

        expect(readme).toContain("cargo build --release");
        expect(readme).toContain("rustup.rs");
        expect(readme).not.toContain("npm install");
        expect(readme).not.toContain("npx");
        expect(readme).not.toContain("### Build from source");
    });

    // ── Generic auth when no supported bindings ─────────────────────

    it("shows generic auth line when there are no supported bindings", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "my-api",
            apiDisplayName: "My API",
            authBindings: [],
            npmPublishInfo: undefined
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
            npmPublishInfo: undefined
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
            npmPublishInfo: undefined
        });

        expect(readme).toContain('export ACME_API_KEY="<your api key>"');
        expect(readme).toContain('export ACME_USERNAME="<your credential>"');
        expect(readme).toContain('export ACME_PASSWORD="<your credential>"');
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
            npmPublishInfo: undefined
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
            npmPublishInfo
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
            npmPublishInfo
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
            npmPublishInfo
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
            npmPublishInfo
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
            npmPublishInfo
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
            npmPublishInfo: undefined
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
            npmPublishInfo: undefined
        });

        const authSection = readme.split("## Authentication")[1]?.split("##")[0] ?? "";
        expect(authSection).toContain(".env");
    });
});
