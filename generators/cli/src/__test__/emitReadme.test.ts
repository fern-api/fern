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
        expect(readme).toContain("npm install -g @petstore/cli");
        expect(readme).toContain("npx @petstore/cli --help");
        expect(readme).toContain('export PETSTORE_API_TOKEN="<your token>"');
        expect(readme).toContain("petstore-api --help");
        expect(readme).toContain("--format json");
        expect(readme).toContain("--base-url");
        expect(readme).toContain("PETSTORE_API_BASE_URL");
        expect(readme).toContain("petstore-api completion <bash|zsh|fish|powershell>");
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
        expect(readme).toContain("target/release/acme");
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
            npmPublishInfo: undefined
        });

        expect(readme).toContain("This API requires authentication. Run `my-api --help` for details.");
        // The Authentication section should not contain env-var export lines.
        // (The Configuration section legitimately contains an export for BASE_URL.)
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

    // ── Section order ───────────────────────────────────────────────

    it("emits sections in the specified order", async () => {
        const readme = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: "Acme",
            authBindings: [bearerBinding],
            npmPublishInfo
        });

        const expectedOrder = [
            "## Installation",
            "## Authentication",
            "## Usage",
            "## Output formats",
            "## Configuration",
            "## Shell completion"
        ];

        let lastIndex = -1;
        for (const section of expectedOrder) {
            const idx = readme.indexOf(section);
            expect(idx, `${section} should appear in README`).toBeGreaterThan(lastIndex);
            lastIndex = idx;
        }
    });
});
