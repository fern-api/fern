import { readFile } from "fs/promises";
import path from "path";
import url from "url";
import { beforeAll, describe, expect, it } from "vitest";
import { constructReleaseWorkflowYaml } from "../index.js";

/**
 * A committed seed fixture generated before Homebrew support existed.
 * Diffing against it is the mechanical proof that splitting the
 * cargo-dist template into `head + publish jobs + announce` did not
 * perturb the workflow every existing consumer already ships.
 */
const COMMITTED_RELEASE_YAML_PATH = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    "../../../../seed/cli/query-parameters-openapi/github-npm/.github/workflows/release.yml"
);

describe("constructReleaseWorkflowYaml", () => {
    let committed: string;
    beforeAll(async () => {
        committed = await readFile(COMMITTED_RELEASE_YAML_PATH, "utf-8");
    });

    // Guards the head+publish-jobs+announce composition against drift: the
    // unconfigured output must equal what is committed for a github fixture.
    it("matches the committed unconfigured output exactly", () => {
        expect(constructReleaseWorkflowYaml({})).toBe(committed);
    });

    // cargo-dist applies pipefail to the installer download in `plan` but not
    // in the build matrix, where the same `curl | sh` runs per leg. A dead curl
    // leaves `sh` exiting 0, so the step passes and `dist build` dies two steps
    // later on exit 127. Hit 2 of 3 real releases.
    it("retries the dist installer and verifies it before building", () => {
        const yaml = constructReleaseWorkflowYaml({});
        expect(yaml).toContain("- id: dist-check");
        expect(yaml).toContain("- name: Install dist (retry)");
        expect(yaml).toContain("if: ${{ steps.dist-check.outputs.ok == 'no' }}");
        expect(yaml).toContain("- name: Verify dist");
        expect(yaml).toContain("::error::The cargo-dist installer failed twice");
    });

    // The retry must reuse the matrix's own command and shell. Branching on
    // `matrix.install_dist.shell` would mean a future cargo-dist field rename
    // silently skips both legs and installs nothing — trading a flake for a
    // hard failure.
    it("does not branch on the matrix shell", () => {
        const yaml = constructReleaseWorkflowYaml({});
        // The interpolated form specifically — the explanatory comment above
        // the steps legitimately names the field.
        expect(yaml).not.toContain("${{ matrix.install_dist.shell }}");
        // Both install attempts go through the same upstream expression.
        expect(yaml.match(/run: \$\{\{ matrix\.install_dist\.run \}\}/g)).toHaveLength(2);
    });

    it("emits no homebrew job when no distribution is configured", () => {
        const yaml = constructReleaseWorkflowYaml({});
        expect(yaml).not.toContain("publish-homebrew-formula");
        expect(yaml).not.toContain("HOMEBREW_TAP_TOKEN");
    });

    it("updates an existing GitHub release and overwrites its assets", () => {
        const yaml = constructReleaseWorkflowYaml({});
        const releaseStep = yaml.slice(yaml.indexOf("gh release view"));

        expect(releaseStep).toContain('gh release view "${{ needs.plan.outputs.tag }}"');
        expect(releaseStep).toContain("gh release edit");
        expect(releaseStep).toContain("--prerelease=false");
        // A release drafted in the UI must be published, not just filled in —
        // and its tag must land on the commit that was actually built.
        expect(releaseStep).toContain("--draft=false");
        for (const edit of releaseStep.split("\n").filter((line) => line.includes("gh release edit"))) {
            expect(edit).toContain('--target "$RELEASE_COMMIT"');
        }
        expect(releaseStep).toContain("gh release upload");
        expect(releaseStep).toContain("--clobber");
        expect(releaseStep).toContain("gh release create");
    });

    describe("with homebrew configured", () => {
        const yaml = constructReleaseWorkflowYaml({ homebrew: { tap: "acme/homebrew-tap" } });

        it("appends the publish-homebrew-formula job pointed at the tap", () => {
            expect(yaml).toContain("  publish-homebrew-formula:");
            expect(yaml).toContain('repository: "acme/homebrew-tap"');
        });

        it("defaults the token secret to HOMEBREW_TAP_TOKEN", () => {
            expect(yaml).toContain("token: ${{ secrets.HOMEBREW_TAP_TOKEN }}");
        });

        it("honors a custom token secret name", () => {
            const custom = constructReleaseWorkflowYaml({
                homebrew: { tap: "acme/homebrew-tap", tokenEnvironmentVariable: "TAP_PAT" }
            });
            expect(custom).toContain("token: ${{ secrets.TAP_PAT }}");
            expect(custom).not.toContain("HOMEBREW_TAP_TOKEN");
        });

        // The built-in GITHUB_TOKEN cannot push cross-repo, so the checkout
        // must keep the PAT around for the push step.
        it("keeps credentials on the tap checkout so the formula can be pushed", () => {
            expect(yaml).toContain("persist-credentials: true");
        });

        it("gates the announcement on the formula having been pushed", () => {
            const announce = yaml.slice(yaml.indexOf("  announce:"));
            expect(announce).toContain("      - publish-homebrew-formula");
        });

        it("preserves the base cargo-dist jobs verbatim", () => {
            const base = constructReleaseWorkflowYaml({});
            const upToAnnounce = base.slice(0, base.indexOf("\n  announce:"));
            expect(yaml.startsWith(upToAnnounce)).toBe(true);
        });

        // GitHub's ubuntu runners no longer ship Homebrew. cargo-dist's
        // unconditional `brew --prefix` exited 127 under `bash -e`, killing the
        // step before the formula was committed. Observed on a real release.
        it("does not let a missing brew abort the formula push", () => {
            expect(yaml).toContain("if command -v brew > /dev/null 2>&1; then");
            expect(yaml).toContain("skipping the formula style pass");
            const commitStep = yaml.slice(yaml.indexOf("Commit formula files"));
            expect(commitStep.indexOf("git add Formula/*.rb")).toBeGreaterThan(commitStep.indexOf("brew --prefix"));
            expect(commitStep).toContain("git push");
        });

        it("re-running a release rewrites rather than failing on an empty commit", () => {
            expect(yaml).toContain("if git diff --cached --quiet; then");
        });

        it("emits exactly one announce job", () => {
            expect(yaml.match(/^ {2}announce:$/gm)).toHaveLength(1);
        });
    });

    describe("with a github app", () => {
        const app = { appIdSecret: "PUBLISH_APP_ID", privateKeySecret: "PUBLISH_APP_PRIVATE_KEY" };
        const yaml = constructReleaseWorkflowYaml({ homebrew: { tap: "acme/homebrew-tap" }, githubApp: app });

        it("mints a tap-scoped token and checks the tap out with it", () => {
            expect(yaml).toContain("uses: actions/create-github-app-token@v2");
            expect(yaml).toContain("app-id: ${{ secrets.PUBLISH_APP_ID }}");
            expect(yaml).toContain("private-key: ${{ secrets.PUBLISH_APP_PRIVATE_KEY }}");
            expect(yaml).toContain("owner: acme");
            expect(yaml).toContain("repositories: homebrew-tap");
            expect(yaml).toContain("token: ${{ steps.app-token.outputs.token }}");
            expect(yaml).not.toContain("secrets.HOMEBREW_TAP_TOKEN");
        });

        /**
         * The highest-severity regression available here, and the one no
         * other assertion catches. A tap has no prerelease channel — a
         * formula simply *is* the version `brew install` hands out — so
         * losing this guard means a `v2.0.0-rc.1` tag commits an RC formula
         * that every subsequent `brew upgrade` installs, with a green
         * workflow and no error anywhere.
         *
         * It is lost by authoring the App branch as a second copy of the
         * job, which is why the emitter interpolates into one template.
         */
        it("retains cargo-dist's prerelease guard", () => {
            const job = yaml.slice(yaml.indexOf("  publish-homebrew-formula:"), yaml.indexOf("  announce:"));
            expect(job).toContain("announcement_is_prerelease");
            expect(job).toContain("publish_prereleases");
        });

        /**
         * Job-level `env` cannot read `steps.*`, so a `GITHUB_TOKEN` left up
         * there would render as the empty string. In the App branch it moves
         * to the commit step.
         */
        it("carries no job-level GITHUB_TOKEN", () => {
            const job = yaml.slice(yaml.indexOf("  publish-homebrew-formula:"), yaml.indexOf("  announce:"));
            const jobEnv = job.slice(job.indexOf("    env:"), job.indexOf("    if:"));
            expect(jobEnv).not.toContain("GITHUB_TOKEN");
            expect(jobEnv).toContain("PLAN:");
            // Moved down to where it can actually read the step output.
            const commitStep = job.slice(job.indexOf("Commit formula files"));
            expect(commitStep).toContain("GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}");
        });

        it("emits a preflight job the publish job waits on", () => {
            expect(yaml).toContain("  preflight-distribution:");
            const job = yaml.slice(yaml.indexOf("  publish-homebrew-formula:"), yaml.indexOf("  announce:"));
            expect(job).toContain("      - preflight-distribution");
            // Starts immediately rather than after the build, which is the
            // whole point: the credential failure lands in ~20s, not at
            // minute 40 after the release has already been created.
            const preflight = yaml.slice(yaml.indexOf("  preflight-distribution:"));
            expect(preflight.slice(0, preflight.indexOf("steps:"))).not.toContain("needs:");
        });

        it("skips preflight on pull requests, where fork secrets are absent", () => {
            const preflight = yaml.slice(yaml.indexOf("  preflight-distribution:"));
            expect(preflight).toContain("if: ${{ !github.event.pull_request }}");
        });

        it("names the failing secret and the secret-vs-variable trap", () => {
            expect(yaml).toContain("secrets.PUBLISH_APP_ID is empty");
            expect(yaml).toContain("An Actions *variable* of the same name is not readable");
            expect(yaml).toContain("is a single line");
            expect(yaml).toContain("secretOrPrivateKey must be an asymmetric key");
        });

        // App IDs are numeric but `create-github-app-token` also accepts the
        // App's Client ID (`Iv23…`), so a shape assertion would reject a
        // valid configuration.
        it("does not assert the app id is numeric", () => {
            expect(yaml).not.toContain("^[0-9]+$");
        });

        it("emits one preflight check when both channels share the app", () => {
            const both = constructReleaseWorkflowYaml({
                homebrew: { tap: "acme/homebrew-tap" },
                scoop: {
                    binaryName: "acme-cli",
                    scoop: { bucket: "acme/scoop-bucket" },
                    repoUrl: "https://github.com/acme/acme-cli",
                    license: "MIT",
                    description: "CLI for the Acme API"
                },
                githubApp: app
            });
            expect(both.match(/- name: Verify the .* App credentials/g)).toHaveLength(1);
            expect(both).toContain("Verify the Homebrew tap / Scoop bucket App credentials");
        });

        // A channel pinning its own PAT opts that channel out — the
        // migrate-one-at-a-time path.
        it("lets a channel keep a PAT alongside a shared app", () => {
            const mixed = constructReleaseWorkflowYaml({
                homebrew: { tap: "acme/homebrew-tap", tokenEnvironmentVariable: "TAP_PAT" },
                githubApp: app
            });
            expect(mixed).toContain("token: ${{ secrets.TAP_PAT }}");
            expect(mixed).not.toContain("create-github-app-token");
            expect(mixed).not.toContain("preflight-distribution");
        });

        /**
         * Half-migrated: Scoop on the App, Homebrew still on its PAT. The
         * preflight job checks only the App credentials, so gating the PAT
         * channel on it would let a malformed App secret skip a publish that
         * never touches the App — collapsing the "a bad secret costs one
         * channel" property the job was designed around.
         */
        it("does not gate a PAT channel on the other channel's preflight", () => {
            const mixed = constructReleaseWorkflowYaml({
                homebrew: { tap: "acme/homebrew-tap", tokenEnvironmentVariable: "TAP_PAT" },
                scoop: {
                    binaryName: "acme-cli",
                    scoop: { bucket: "acme/scoop-bucket" },
                    repoUrl: "https://github.com/acme/acme-cli",
                    license: "MIT",
                    description: "CLI for the Acme API"
                },
                githubApp: app
            });
            expect(mixed).toContain("  preflight-distribution:");

            const homebrewJob = mixed.slice(
                mixed.indexOf("  publish-homebrew-formula:"),
                mixed.indexOf("  publish-scoop:")
            );
            const scoopJob = mixed.slice(mixed.indexOf("  publish-scoop:"), mixed.indexOf("  announce:"));
            expect(homebrewJob).not.toContain("preflight-distribution");
            expect(scoopJob).toContain("      - preflight-distribution");
            // Only the App channel is checked, so only its label appears.
            expect(mixed).toContain("Verify the Scoop bucket App credentials");
        });
    });

    it("emits no preflight job for a PAT-only generation", () => {
        const yaml = constructReleaseWorkflowYaml({ homebrew: { tap: "acme/homebrew-tap" } });
        expect(yaml).not.toContain("preflight-distribution");
        expect(yaml).not.toContain("create-github-app-token");
    });
});
