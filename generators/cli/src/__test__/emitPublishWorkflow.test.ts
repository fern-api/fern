import { spawnSync } from "child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emitCiWorkflow, emitPublishWorkflow } from "../emitPublishWorkflow.js";
import type { ResolvedNpmPublishInfo } from "../resolveOutputConfig.js";

/**
 * Direct unit tests for `emitPublishWorkflow`. Validates the emitted
 * `.github/workflows/ci.yml` content for token handling, OIDC
 * permissions, and correct interpolation of binary/package names.
 */
describe("emitPublishWorkflow", () => {
    let tmpDir: string;
    let outputDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "emitPublishWorkflow-"));
        outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function emitAndRead(
        npmPublishInfo: ResolvedNpmPublishInfo,
        binaryName = "acme",
        repoUrl: string | undefined = undefined,
        packageIdentity: Parameters<typeof emitPublishWorkflow>[0]["packageIdentity"] = undefined
    ): Promise<string> {
        await emitPublishWorkflow({ outputDir, binaryName, npmPublishInfo, repoUrl, packageIdentity });
        return readFile(path.join(outputDir, ".github", "workflows", "ci.yml"), "utf-8");
    }

    const baseInfo: ResolvedNpmPublishInfo = {
        packageName: "@acme/cli",
        registryUrl: "https://registry.npmjs.org",
        tokenEnvironmentVariable: "NPM_TOKEN",
        useOidc: false
    };

    // ── Standard token-based publishing ────────────────────────────

    it("emits NODE_AUTH_TOKEN referencing the configured secret", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}");
        expect(yaml).not.toContain("id-token: write");
    });

    it("invokes npm publish directly on a pinned Node toolchain (no wrapper, no npm@latest)", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain('npm publish "$@"');
        expect(yaml).not.toContain("npm@latest");
        expect(yaml).not.toMatch(/(^|\s)publish\(\)\s*\{/);
        expect(yaml).toContain('node-version: "lts/Krypton"');
    });

    it("includes backport detection for stable releases", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("dist-tags.latest");
        expect(yaml).toContain("--tag backport");
        expect(yaml).toContain("npx -y semver@7.8.1");
    });

    it("uses a custom token variable name in the secret reference", async () => {
        const yaml = await emitAndRead({
            ...baseInfo,
            tokenEnvironmentVariable: "CUSTOM_REGISTRY_TOKEN"
        });

        expect(yaml).toContain("NODE_AUTH_TOKEN: ${{ secrets.CUSTOM_REGISTRY_TOKEN }}");
    });

    // ── OIDC-based publishing ──────────────────────────────────────

    it("OIDC mode omits NODE_AUTH_TOKEN and adds id-token permissions", async () => {
        const yaml = await emitAndRead({
            ...baseInfo,
            tokenEnvironmentVariable: "<USE_OIDC>",
            useOidc: true
        });

        expect(yaml).not.toContain("NODE_AUTH_TOKEN");
        expect(yaml).not.toContain("secrets.");
        expect(yaml).toContain("id-token: write");
        expect(yaml).toContain("contents: read");
    });

    // ── Empty token fallback (the bug from item 1) ─────────────────

    it("does not produce an empty secrets reference (guards the empty-token bug)", async () => {
        // In local mode the token can resolve to "" before reaching the
        // generator. resolveNpmPublishInfo now normalises this to
        // "NPM_TOKEN", but even if the caller passed "" directly the
        // workflow template must never contain `secrets. }}`
        const yaml = await emitAndRead({
            ...baseInfo,
            tokenEnvironmentVariable: "NPM_TOKEN",
            useOidc: false
        });

        // Should NOT match the broken pattern `secrets. }}`
        expect(yaml).not.toMatch(/secrets\.\s*\}\}/);
    });

    // ── Structural assertions ──────────────────────────────────────

    it("contains the expected CI jobs (check, compile, test, publish, publish-launcher)", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("check:");
        expect(yaml).toContain("compile:");
        expect(yaml).toContain("test:");
        expect(yaml).toContain("publish:");
        expect(yaml).toContain("publish-launcher:");
    });

    it("interpolates the binary name and package name into the workflow", async () => {
        const yaml = await emitAndRead(baseInfo, "my-tool");

        expect(yaml).toContain('BINARY_NAME="my-tool"');
        expect(yaml).toContain("@acme/cli");
        expect(yaml).toContain("x86_64-unknown-linux-musl");
        expect(yaml).toContain("aarch64-apple-darwin");
    });

    it("uses the configured registry URL in setup-node", async () => {
        const yaml = await emitAndRead({
            ...baseInfo,
            registryUrl: "https://npm.pkg.github.com"
        });

        expect(yaml).toContain('registry-url: "https://npm.pkg.github.com"');
    });

    it("tag-based publishing only triggers on tag pushes", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("contains(github.ref, 'refs/tags/')");
    });

    it("uses actions/checkout@v6 and actions/setup-node@v6", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("actions/checkout@v6");
        expect(yaml).not.toContain("actions/checkout@v4");
        expect(yaml).toContain("actions/setup-node@v6");
        expect(yaml).not.toContain("actions/setup-node@v4");
    });

    it("uses musl targets for Linux with native ARM runner", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("x86_64-unknown-linux-musl");
        expect(yaml).toContain("aarch64-unknown-linux-musl");
        expect(yaml).not.toContain("unknown-linux-gnu");
        expect(yaml).toContain("ubuntu-24.04-arm");
    });

    it("installs musl-tools and leaves feature selection to Cargo.toml", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("musl-tools");
        expect(yaml).not.toContain("--no-default-features");
        expect(yaml).not.toContain("--features rustls");
        expect(yaml).not.toContain("gcc-aarch64-linux-gnu");
    });

    it("gates publishing on the tag matching the crate version", async () => {
        const yaml = await emitAndRead(baseInfo);

        // The version job exists and publish depends on it.
        expect(yaml).toContain("version:");
        expect(yaml).toContain("needs: [check, compile, test, version]");
        expect(yaml).toContain('TAG_VERSION="${GITHUB_REF_NAME#v}"');
        expect(yaml).toContain("cargo metadata --no-deps --format-version 1");
        expect(yaml).toContain('if [[ "${TAG_VERSION}" != "${CRATE_VERSION}" ]]; then');
    });

    it("fails clearly when the crate version can't be resolved (empty CRATE_VERSION guard)", async () => {
        const yaml = await emitAndRead(baseInfo);

        // The guard must run after CRATE_VERSION is computed and before the
        // tag comparison, so an unresolved lookup produces an actionable
        // error rather than a misleading empty-string mismatch.
        expect(yaml).toContain('if [[ -z "${CRATE_VERSION}" ]]; then');
        expect(yaml).toContain(
            "Could not determine the crate version from cargo metadata (no package matched ${PWD}/Cargo.toml)."
        );

        const crateVersionIndex = yaml.indexOf("| .version')");
        const guardIndex = yaml.indexOf('if [[ -z "${CRATE_VERSION}" ]]; then');
        const comparisonIndex = yaml.indexOf('if [[ "${TAG_VERSION}" != "${CRATE_VERSION}" ]]; then');
        expect(crateVersionIndex).toBeGreaterThan(-1);
        expect(guardIndex).toBeGreaterThan(crateVersionIndex);
        expect(comparisonIndex).toBeGreaterThan(guardIndex);
    });

    it("does not select rustls via build flags — feature selection lives in Cargo.toml (musl regression guard)", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).not.toContain("--features rustls");
        expect(yaml).not.toContain("--no-default-features");
    });

    it("gives musl targets a C compiler but leaves linking to rustc, so the binary is static-pie", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("CC_${TARGET_UNDERSCORE}=musl-gcc");
        expect(yaml).not.toContain("_LINKER=musl-gcc");
        expect(yaml).not.toContain("export CC=musl-gcc");
    });

    it("includes repository.url in package.json when repoUrl is provided", async () => {
        const yaml = await emitAndRead(baseInfo, "acme", "https://github.com/acme/acme-cli");

        expect(yaml).toContain('"repository"');
        expect(yaml).toContain('"url": "https://github.com/acme/acme-cli"');
    });

    it("omits repository field from package.json when repoUrl is undefined", async () => {
        const yaml = await emitAndRead(baseInfo, "acme", undefined);

        expect(yaml).not.toContain('"repository"');
    });

    it("both publish steps publish through npm_publish_once with backport logic", async () => {
        const yaml = await emitAndRead(baseInfo);

        // Each step has three publish calls (pre-release, backport, stable).
        // The pre-release branch is one call whose dist-tag is derived from
        // the version.
        const npmPublishMatches = yaml.match(/npm_publish_once --access public/g);
        expect(npmPublishMatches).toHaveLength(6);

        // Both platform and launcher steps should have backport logic
        // Each step has 2 occurrences: the echo message + the publish call
        const backportMatches = yaml.match(/--tag backport/g);
        expect(backportMatches).toHaveLength(4);
    });

    it("builds npm binaries with the same profile as the GitHub Release", async () => {
        const yaml = await emitAndRead(baseInfo);

        // `ci.yml` built `--release` while cargo-dist's `release.yml` builds
        // `--profile dist` (release + thin LTO), so npm and the GitHub Release
        // shipped different bytes under one version tag.
        expect(yaml).toContain("cargo build --profile dist --target");
        expect(yaml).not.toMatch(/cargo build --release --target/);
        // A custom cargo profile writes to target/<triple>/<profile>/.
        expect(yaml).toContain("/dist/${BINARY_NAME}");
        expect(yaml).not.toContain("/release/${BINARY_NAME}");
    });

    it("carries packageIdentity into the published npm package", async () => {
        // `packageIdentity` fed Cargo.toml but not the launcher's package.json,
        // so npm rendered the CLI as "License: none" with no keywords, no
        // homepage and a hardcoded description. The license is the part that
        // isn't cosmetic — scanners and policy gates reject unlicensed packages.
        const yaml = await emitAndRead(baseInfo, "acme", undefined, {
            license: "MIT",
            description: "Command-line interface for the Acme API, it's great",
            homepage: "https://acme.example",
            keywords: ["acme", "cli"],
            authors: ["Acme <dev@acme.example>", "Second <two@acme.example>"]
        });

        expect(yaml).toContain('"license": "MIT"');
        expect(yaml).toContain('"keywords": ["acme","cli"]');
        expect(yaml).toContain('"homepage": "https://acme.example"');
        expect(yaml).toContain('"author": "Acme <dev@acme.example>"');
        expect(yaml).toContain('"contributors": ["Second <two@acme.example>"]');
        // The apostrophe must survive as valid JSON, not break the heredoc.
        expect(yaml).toContain('"description": "Command-line interface for the Acme API, it\'s great"');
        expect(yaml).not.toContain('"description": "CLI for acme"');
    });

    it("emits a launcher package.json that parses as JSON", async () => {
        // The identity values are user prose interpolated into a JSON heredoc.
        // A stray quote or newline would emit something npm cannot parse, and
        // the failure would only surface at publish time.
        const yaml = await emitAndRead(baseInfo, "acme", "https://github.com/acme/cli", {
            license: "MIT",
            description: 'He said "hello", then left — with a comma, and an \\ escape',
            keywords: ["a", "b"],
            authors: ["Acme <dev@acme.example>"]
        });

        // The launcher block is the second `cat > .../package.json` heredoc.
        const blocks = [...yaml.matchAll(/cat > "\$\{PKG_DIR\}\/package\.json" <<PKGJSON\n([\s\S]*?)\n\s*PKGJSON/g)];
        expect(blocks).toHaveLength(2);
        const launcherMatch = blocks[1];
        if (launcherMatch == null) {
            throw new Error("expected a launcher package.json heredoc");
        }
        const launcher = launcherMatch[1];
        if (launcher == null) {
            throw new Error("expected the heredoc body to be captured");
        }

        // Strip the workflow's indentation and substitute the shell variables
        // the runner would expand, then parse.
        const rendered = launcher
            .split("\n")
            .map((line) => line.replace(/^ {10}/, ""))
            .join("\n")
            .replace(/\$\{VERSION\}/g, "1.2.3")
            .replace(/\$\{OPTIONAL_DEPS\}/g, '"acme-linux-x64": "1.2.3"');

        const parsed = JSON.parse(rendered);
        expect(parsed.license).toBe("MIT");
        expect(parsed.description).toBe('He said "hello", then left — with a comma, and an \\ escape');
        expect(parsed.keywords).toEqual(["a", "b"]);
        expect(parsed.author).toBe("Acme <dev@acme.example>");
        expect(parsed.bin).toEqual({ acme: "bin/cli.js" });
        expect(parsed.version).toBe("1.2.3");
    });

    it("emits identity values that no shell can act on", async () => {
        // The launcher package.json goes through an UNQUOTED heredoc
        // (`<<PKGJSON`), which it must, since `${VERSION}` and
        // `${OPTIONAL_DEPS}` are meant to expand. So the shell also expands
        // `$VAR` / `${...}` / `$(...)` and backticks in user prose and collapses
        // `\\` to `\`. `JSON.stringify` guards the JSON syntax and nothing else:
        // a description reading `Uses ${HOME}` was substituted at publish time,
        // a backtick or `$(...)` ran a command in the publish workflow, and a
        // literal backslash corrupted the JSON.
        const yaml = await emitAndRead(baseInfo, "acme", undefined, {
            license: "MIT",
            description: "Uses ${HOME} and $(whoami) and `hostname` and a \\ backslash",
            homepage: "https://acme.example",
            authors: ["Acme `id` <dev@acme.example>"]
        });

        // The launcher block is the second `cat > .../package.json` heredoc.
        const blocks = [...yaml.matchAll(/cat > "\$\{PKG_DIR\}\/package\.json" <<PKGJSON\n([\s\S]*?)\n\s*PKGJSON/g)];
        const heredoc = blocks[1]?.[1];
        if (heredoc == null) {
            throw new Error("expected the launcher heredoc body to be captured");
        }

        // Escaped as \uXXXX rather than backslash-escaped, so the body stays
        // valid JSON as written instead of only becoming valid once the shell
        // has processed it.
        expect(heredoc).toContain("\\u0024{HOME}");
        expect(heredoc).toContain("\\u0024(whoami)");
        expect(heredoc).toContain("\\u0060hostname\\u0060");
        expect(heredoc).toContain("Acme \\u0060id\\u0060");

        // The property that actually matters: nothing the shell acts on is left
        // in any identity value. `${VERSION}` and friends are the workflow's
        // own placeholders and are meant to expand, so only the value lines are
        // checked.
        const valueLines = heredoc
            .split("\n")
            .filter((line) => /"(description|license|homepage|author|contributors|keywords)":/.test(line));
        expect(valueLines.length).toBeGreaterThan(0);
        for (const line of valueLines) {
            expect(line).not.toMatch(/[$`]/);
            expect(line).not.toMatch(/\\(?!u)/);
        }
    });

    it("falls back to the generated description and omits absent identity fields", async () => {
        const yaml = await emitAndRead(baseInfo);
        expect(yaml).toContain('"description": "CLI for acme"');
        // Nothing invented: no license key at all rather than a wrong one.
        const launcher = yaml.slice(yaml.indexOf("publish-launcher"));
        expect(launcher).not.toContain('"license"');
        expect(launcher).not.toContain('"keywords"');

        // With every identity field absent the join produced an empty string on
        // its own line, leaving a blank line inside the emitted package.json.
        // Valid JSON, but it churned every fixture and read like a template bug.
        const heredoc = launcher.slice(
            launcher.indexOf("<<PKGJSON"),
            launcher.indexOf("PKGJSON", launcher.indexOf("<<PKGJSON") + 1)
        );
        expect(heredoc.split("\n").filter((line) => line.trim() === "")).toHaveLength(0);
    });

    it("gives every SemVer pre-release a non-latest dist-tag", async () => {
        const yaml = await emitAndRead(baseInfo);

        // Matching only -alpha/-beta let a v1.1.0-rc.1 or -next.1 tag fall
        // through to a bare `npm publish`, moving `latest` to a pre-release.
        // The branch condition must now be the generic SemVer "-" test.
        expect(yaml).not.toMatch(/== \*-alpha\*/);
        expect(yaml).not.toMatch(/== \*-beta\*/);

        const prereleaseBranches = yaml.match(/if \[\[ "\$\{VERSION\}" == \*-\* \]\]; then/g);
        expect(prereleaseBranches).toHaveLength(2);

        // The tag is the first pre-release identifier, with a fallback for an
        // all-numeric or empty one (npm rejects a numeric dist-tag).
        const derivedTags = yaml.match(/TAG=\$\(echo "\$\{PRERELEASE%%\.\*\}" \| tr -cd/g);
        expect(derivedTags).toHaveLength(2);
        const fallbacks = yaml.match(/TAG=prerelease/g);
        expect(fallbacks).toHaveLength(2);
    });

    it("exits non-zero when the binary dies on a signal", async () => {
        const yaml = await emitAndRead(baseInfo);

        // `execFileSync` throws with `status: null` and `signal: "SIGTERM"` on
        // a signal death. The old `"status" in e` test matched that and called
        // `process.exit(null)`, which Node coerces to 0 — so CI timeouts,
        // SIGSEGV and OOM-kills all reported success to `$?`.
        expect(yaml).not.toMatch(/"status" in e/);
        expect(yaml).toMatch(/typeof e\.status === "number"/);
        expect(yaml).toMatch(/typeof e\.signal === "string"/);
        // 128 + signum is the shell convention (SIGTERM -> 143).
        expect(yaml).toMatch(/process\.exit\(128 \+ \(SIGNUM\[e\.signal\] \|\| 0\)\)/);
        expect(yaml).toMatch(/SIGTERM: 15/);
    });
});

describe("emitPublishWorkflow npm_publish_once helper", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "npmPublishOnce-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    const baseInfo: ResolvedNpmPublishInfo = {
        packageName: "@acme/cli",
        registryUrl: "https://registry.example.test/npm/",
        tokenEnvironmentVariable: "NPM_TOKEN",
        useOidc: false
    };

    async function emitYaml(npmPublishInfo: ResolvedNpmPublishInfo = baseInfo): Promise<string> {
        const outputDir = path.join(tmpDir, "out");
        await emitPublishWorkflow({ outputDir, binaryName: "acme", npmPublishInfo, repoUrl: undefined });
        return readFile(path.join(outputDir, ".github", "workflows", "ci.yml"), "utf-8");
    }

    function extractHelpers(yaml: string): string[] {
        const helpers = [...yaml.matchAll(/^ {10}npm_publish_once\(\) \{\n[\s\S]*?\n {10}\}$/gm)].map((m) => m[0]);
        return helpers.map((helper) =>
            helper
                .split("\n")
                .map((line) => line.replace(/^ {10}/, ""))
                .join("\n")
        );
    }

    function stepBody(yaml: string, stepName: string): string {
        const start = yaml.indexOf(`- name: ${stepName}`);
        if (start === -1) {
            throw new Error(`expected a "${stepName}" step`);
        }
        const next = yaml.indexOf("\n  publish-launcher:", start);
        return yaml.slice(start, next === -1 ? undefined : next);
    }

    it("emits the same helper in the platform and launcher publish steps", async () => {
        const yaml = await emitYaml();

        const helpers = extractHelpers(yaml);
        expect(helpers).toHaveLength(2);
        expect(helpers[0]).toBe(helpers[1]);

        for (const step of ["Package and publish npm platform package", "Publish launcher package"]) {
            const body = stepBody(yaml, step);
            expect(body).toContain("npm_publish_once() {");
            expect(body).toContain("npm_publish_once --access public");
            expect(body).not.toMatch(/^\s*npm publish --access/m);
        }
    });

    it("checks the configured registry for the exact version and skips with a notice", async () => {
        const [helper] = extractHelpers(await emitYaml());

        expect(helper).toContain(
            'npm view "${name}@${version}" version --registry "https://registry.example.test/npm/" 2>"${view_err}") || view_status=$?'
        );
        expect(helper).toContain('echo "::notice::${name}@${version} is already published; skipping."');
        expect(helper).toContain("grep -Eq 'E404|404 Not Found'");
    });

    it("captures publish output without losing npm's exit status and explains EOTP", async () => {
        const [helper] = extractHelpers(await emitYaml());

        expect(helper).toContain('npm publish "$@" 2>&1 | tee "${publish_log}" || publish_status=$?');
        expect(helper).toContain("grep -q 'EOTP'");
        expect(helper).toContain('\\"Bypass 2FA\\"');
        expect(helper).toContain("trusted publishing (OIDC)");
        expect(helper).toContain('return "${publish_status}"');
    });

    it("keeps the launcher waiting on every platform package", async () => {
        const yaml = await emitYaml();

        const launcher = yaml.slice(yaml.indexOf("  publish-launcher:"));
        expect(launcher).toContain("needs: [publish]");
    });

    it("leaves the OIDC token handling unchanged", async () => {
        const yaml = await emitYaml({ ...baseInfo, tokenEnvironmentVariable: "<USE_OIDC>", useOidc: true });

        expect(extractHelpers(yaml)).toHaveLength(2);
        expect(yaml).not.toContain("NODE_AUTH_TOKEN");
        expect(yaml.match(/id-token: write/g)).toHaveLength(2);
    });

    describe.skipIf(process.platform === "win32")("against a stub npm", () => {
        const STUB_NPM = `#!/usr/bin/env bash
echo "npm $*" >> "$STUB_CALLS"
case "$1" in
  view)
    case "$STUB_VIEW" in
      published) echo "\${2##*@}" ;;
      e404) echo "npm error code E404" >&2; echo "npm error 404 No match found for version \${2##*@}" >&2; exit 1 ;;
      network) echo "npm error code ETIMEDOUT" >&2; echo "npm error network request failed" >&2; exit 1 ;;
    esac
    ;;
  publish)
    case "$STUB_PUBLISH" in
      ok) echo "+ acme@1.2.3" ;;
      eotp) echo "npm error code EOTP" >&2; echo "npm error This operation requires a one-time password." >&2; exit 1 ;;
      fail) echo "npm error code E403" >&2; exit 3 ;;
    esac
    ;;
esac
`;

        async function runHelper(
            view: "published" | "e404" | "network",
            publish: "ok" | "eotp" | "fail"
        ): Promise<{ status: number; stdout: string; stderr: string; calls: string[] }> {
            const [helper] = extractHelpers(await emitYaml());
            if (helper == null) {
                throw new Error("expected the helper to be emitted");
            }
            const binDir = path.join(tmpDir, "bin");
            const pkgDir = path.join(tmpDir, "pkg");
            await mkdir(binDir, { recursive: true });
            await mkdir(pkgDir, { recursive: true });
            await writeFile(path.join(binDir, "npm"), STUB_NPM, { mode: 0o755 });
            await writeFile(path.join(pkgDir, "package.json"), JSON.stringify({ name: "acme", version: "1.2.3" }));
            const callsFile = path.join(tmpDir, "calls.log");
            await writeFile(callsFile, "");

            const script = `set -euo pipefail\n${helper}\nnpm_publish_once --access public\necho "after publish"\n`;
            const result = spawnSync("bash", ["-c", script], {
                cwd: pkgDir,
                encoding: "utf-8",
                env: {
                    ...process.env,
                    PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}`,
                    STUB_VIEW: view,
                    STUB_PUBLISH: publish,
                    STUB_CALLS: callsFile
                }
            });
            const calls = (await readFile(callsFile, "utf-8")).split("\n").filter((line) => line !== "");
            return { status: result.status ?? -1, stdout: result.stdout, stderr: result.stderr, calls };
        }

        it("skips an already-published version without calling npm publish", async () => {
            const result = await runHelper("published", "ok");

            expect(result.status).toBe(0);
            expect(result.stdout).toContain("::notice::acme@1.2.3 is already published; skipping.");
            expect(result.stdout).toContain("after publish");
            expect(result.calls).toEqual(["npm view acme@1.2.3 version --registry https://registry.example.test/npm/"]);
        });

        it("publishes when npm view reports E404", async () => {
            const result = await runHelper("e404", "ok");

            expect(result.status).toBe(0);
            expect(result.stdout).toContain("+ acme@1.2.3");
            expect(result.stdout).toContain("after publish");
            expect(result.calls).toEqual([
                "npm view acme@1.2.3 version --registry https://registry.example.test/npm/",
                "npm publish --access public"
            ]);
        });

        it("fails without publishing when npm view fails for any other reason", async () => {
            const result = await runHelper("network", "ok");

            expect(result.status).not.toBe(0);
            expect(result.stdout).toContain("::error::Could not check whether acme@1.2.3 is already published");
            expect(result.stderr).toContain("ETIMEDOUT");
            expect(result.stdout).not.toContain("after publish");
            expect(result.calls.some((call) => call.startsWith("npm publish"))).toBe(false);
        });

        it("explains EOTP and exits non-zero when publish needs a one-time password", async () => {
            const result = await runHelper("e404", "eotp");

            expect(result.status).toBe(1);
            expect(result.stdout).toContain("npm error code EOTP");
            expect(result.stdout).toContain("::error::npm publish of acme@1.2.3 requires a one-time password (EOTP).");
            expect(result.stdout).toContain('"Bypass 2FA"');
            expect(result.stdout).not.toContain("after publish");
        });

        it("propagates npm's exit status on other publish failures without the EOTP hint", async () => {
            const result = await runHelper("e404", "fail");

            expect(result.status).toBe(3);
            expect(result.stdout).toContain("npm error code E403");
            expect(result.stdout).not.toContain("EOTP");
            expect(result.stdout).not.toContain("after publish");
        });
    });
});

/**
 * Tests for `emitCiWorkflow` — the build+test-only workflow emitted
 * when the output mode is `github` without npm publish info.
 */
describe("emitCiWorkflow", () => {
    let tmpDir: string;
    let outputDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "emitCiWorkflow-"));
        outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function emitAndRead(binaryName = "acme"): Promise<string> {
        await emitCiWorkflow({ outputDir, binaryName });
        return readFile(path.join(outputDir, ".github", "workflows", "ci.yml"), "utf-8");
    }

    it("emits check, compile, and test jobs", async () => {
        const yaml = await emitAndRead();

        expect(yaml).toContain("name: ci");
        expect(yaml).toContain("check:");
        expect(yaml).toContain("compile:");
        expect(yaml).toContain("test:");
    });

    it("does not contain publish or npm references", async () => {
        const yaml = await emitAndRead();

        expect(yaml).not.toContain("publish:");
        expect(yaml).not.toContain("publish-launcher:");
        expect(yaml).not.toContain("NPM_TOKEN");
        expect(yaml).not.toContain("NODE_AUTH_TOKEN");
        expect(yaml).not.toContain("npm");
        expect(yaml).not.toContain("setup-node");
    });

    it("triggers on push", async () => {
        const yaml = await emitAndRead();

        expect(yaml).toContain("on: [push]");
    });

    it("uses actions/checkout@v6 and actions-rust-lang/setup-rust-toolchain@v1", async () => {
        const yaml = await emitAndRead();

        expect(yaml).toContain("actions/checkout@v6");
        expect(yaml).toContain("actions-rust-lang/setup-rust-toolchain@v1");
    });
});
