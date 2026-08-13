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
});
