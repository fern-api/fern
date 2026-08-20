import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { constructReleaseWorkflowYaml, constructScoopJobYaml } from "../index.js";

const BASE_ARGS = {
    binaryName: "acme-cli",
    scoop: { bucket: "acme/scoop-bucket" },
    repoUrl: "https://github.com/acme/acme-cli",
    license: "MIT",
    description: "CLI for the Acme API",
    // Auth is resolved by `constructReleaseWorkflowYaml`, so the emitter
    // takes it already decided rather than re-deriving it from
    // `scoop.tokenEnvironmentVariable`.
    auth: { type: "pat", tokenSecret: "SCOOP_BUCKET_TOKEN" },
    preflightJob: false
} as const;

const APP = {
    appIdSecret: "PUBLISH_APP_ID",
    privateKeySecret: "PUBLISH_APP_PRIVATE_KEY"
} as const;

/**
 * The job is emitted as a YAML fragment appended to `ci.yml`, so parsing
 * it standalone requires re-attaching the `jobs:` key it lives under.
 */
function parseJob(jobYaml: string): Record<string, unknown> {
    const parsed = yaml.load(`jobs:\n${jobYaml}`);
    if (typeof parsed !== "object" || parsed == null) {
        throw new Error("expected the scoop job fragment to parse to an object");
    }
    const jobs = (parsed as Record<string, unknown>).jobs;
    if (typeof jobs !== "object" || jobs == null) {
        throw new Error("expected a jobs map");
    }
    const job = (jobs as Record<string, unknown>)["publish-scoop"];
    if (typeof job !== "object" || job == null) {
        throw new Error("expected a publish-scoop job");
    }
    return job as Record<string, unknown>;
}

describe("constructScoopJobYaml", () => {
    it("emits a publish-scoop job that is valid YAML", () => {
        const job = parseJob(constructScoopJobYaml(BASE_ARGS));
        // Gated on `host`, in release.yml — not on ci.yml's test suite.
        expect(job.needs).toEqual(["plan", "host"]);
        expect(job["runs-on"]).toBe("ubuntu-22.04");
    });

    // `needs: host` already implies a tag, so no separate ref guard is
    // needed. The `if` is cargo-dist's own prerelease expression, identical
    // to the one on publish-homebrew-formula, so the two channels cannot
    // disagree about what counts as a prerelease.
    it("uses cargo-dist's prerelease expression, matching the homebrew job", () => {
        const job = parseJob(constructScoopJobYaml(BASE_ARGS));
        expect(job.if).toContain("announcement_is_prerelease");
        expect(job.if).toContain("publish_prereleases");
    });

    it("checks out the configured bucket with the default token secret", () => {
        const jobYaml = constructScoopJobYaml(BASE_ARGS);
        expect(jobYaml).toContain('repository: "acme/scoop-bucket"');
        expect(jobYaml).toContain("token: ${{ secrets.SCOOP_BUCKET_TOKEN }}");
        // Cross-repo push needs the PAT to survive the checkout step.
        expect(jobYaml).toContain("persist-credentials: true");
    });

    it("honors a custom token secret name", () => {
        const jobYaml = constructScoopJobYaml({
            ...BASE_ARGS,
            scoop: { bucket: "acme/scoop-bucket", tokenEnvironmentVariable: "BUCKET_PAT" },
            auth: { type: "pat", tokenSecret: "BUCKET_PAT" }
        });
        expect(jobYaml).toContain("token: ${{ secrets.BUCKET_PAT }}");
        expect(jobYaml).not.toContain("SCOOP_BUCKET_TOKEN");
    });

    it("writes the manifest under the binary's name and commits it", () => {
        const jobYaml = constructScoopJobYaml(BASE_ARGS);
        expect(jobYaml).toContain('> "scoop-bucket/bucket/acme-cli.json"');
        expect(jobYaml).toContain('git add "bucket/acme-cli.json"');
    });

    it("points the manifest's bin at the Windows executable", () => {
        expect(constructScoopJobYaml(BASE_ARGS)).toContain("--arg bin 'acme-cli.exe'");
    });

    // The archive prefix is cargo-dist's app name (the cargo package name),
    // which the generator does not always control — so the asset is resolved
    // by target-triple suffix rather than by a guessed full name.
    it("resolves the release asset by target-triple suffix", () => {
        const jobYaml = constructScoopJobYaml(BASE_ARGS);
        expect(jobYaml).toContain('SUFFIX="-x86_64-pc-windows-msvc.zip"');
        expect(jobYaml).toContain("select(endswith(");
    });

    // `needs: host` means the release already exists, so this is not a race
    // with the release pipeline — only a short absorber for GitHub API
    // eventual consistency between a release existing and its assets being
    // listable. The old 30-minute poll existed solely because the job used
    // to live in a separate workflow.
    it("does a short bounded lookup, not a cross-workflow poll", () => {
        const jobYaml = constructScoopJobYaml(BASE_ARGS);
        expect(jobYaml).toContain("for attempt in $(seq 1 6); do");
        expect(jobYaml).toContain("sleep 10");
        expect(jobYaml).not.toContain("Timed out after");
        expect(jobYaml).toContain("build-local-artifacts leg for x86_64-pc-windows-msvc");
    });

    // The bash `case "${TAG#v}"` guard this used to carry is gone: the
    // job-level `if` defers to cargo-dist's own semver determination, so
    // every publishing step is unconditional again.
    it("no longer carries a hand-rolled prerelease guard", () => {
        const jobYaml = constructScoopJobYaml(BASE_ARGS);
        expect(jobYaml).not.toContain("skip=true");
        const job = parseJob(jobYaml);
        const steps = job.steps as Array<Record<string, unknown>>;
        expect(steps).toHaveLength(4);
        for (const step of steps) {
            expect(step.if).toBeUndefined();
        }
    });

    it("re-running a release is a no-op rather than an empty-commit failure", () => {
        expect(constructScoopJobYaml(BASE_ARGS)).toContain("if git diff --cached --quiet; then");
    });

    it("omits license and checkver when they are unknown", () => {
        const jobYaml = constructScoopJobYaml({ ...BASE_ARGS, license: undefined, repoUrl: undefined });
        expect(jobYaml).not.toContain("--arg license");
        expect(jobYaml).not.toContain("checkver");
        expect(jobYaml).toContain("--arg homepage ''");
    });

    it("shell-quotes a description containing an apostrophe", () => {
        const jobYaml = constructScoopJobYaml({ ...BASE_ARGS, description: "Acme's CLI" });
        expect(jobYaml).toContain(`--arg description 'Acme'\\''s CLI'`);
    });

    describe("github app auth", () => {
        const APP_ARGS = { ...BASE_ARGS, auth: { type: "githubApp", app: APP } } as const;

        it("mints a token and checks the bucket out with it", () => {
            const jobYaml = constructScoopJobYaml(APP_ARGS);
            expect(jobYaml).toContain("uses: actions/create-github-app-token@v2");
            expect(jobYaml).toContain("app-id: ${{ secrets.PUBLISH_APP_ID }}");
            expect(jobYaml).toContain("private-key: ${{ secrets.PUBLISH_APP_PRIVATE_KEY }}");
            expect(jobYaml).toContain("token: ${{ steps.app-token.outputs.token }}");
            expect(jobYaml).not.toContain("secrets.SCOOP_BUCKET_TOKEN");
        });

        /**
         * The failure this exists to catch: the token step is written for
         * Homebrew first and pasted here, and `owner`/`repositories` come
         * along with it. The mint succeeds — it is simply scoped to the tap —
         * and the bucket checkout then fails with `remote: Repository not
         * found` against a repo that plainly exists.
         *
         * Asserted with the *same* App configured for both channels, because
         * that is the realistic config and the one where the mixup is
         * invisible on inspection: the secret names are identical, so only
         * the scope differs.
         */
        it("scopes the token to the bucket, not the tap", () => {
            const releaseYaml = constructReleaseWorkflowYaml({
                homebrew: { tap: "acme/homebrew-tap" },
                scoop: BASE_ARGS,
                githubApp: APP
            });
            const scoopJob = releaseYaml.slice(
                releaseYaml.indexOf("  publish-scoop:"),
                releaseYaml.indexOf("  announce:")
            );
            expect(scoopJob).toContain("repositories: scoop-bucket");
            expect(scoopJob).not.toContain("repositories: homebrew-tap");
        });

        it("keeps the release-lookup steps on the built-in token", () => {
            const jobYaml = constructScoopJobYaml(APP_ARGS);
            // `gh release view` / `gh release download` read this repo's own
            // release, which GITHUB_TOKEN can do. Only the cross-repo push
            // needs the App.
            expect(jobYaml.match(/GH_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/g)).toHaveLength(2);
        });

        it("mints the token immediately before the checkout it feeds", () => {
            const jobYaml = constructScoopJobYaml(APP_ARGS);
            const mintIndex = jobYaml.indexOf("Mint a bucket token");
            const lookupIndex = jobYaml.indexOf("Resolve the Windows release archive");
            const checkoutIndex = jobYaml.indexOf("Check out the Scoop bucket");
            expect(lookupIndex).toBeLessThan(mintIndex);
            expect(mintIndex).toBeLessThan(checkoutIndex);
        });

        it("waits on the preflight job when one was emitted", () => {
            const job = parseJob(constructScoopJobYaml({ ...APP_ARGS, preflightJob: true }));
            expect(job.needs).toEqual(["plan", "host", "preflight-distribution"]);
        });
    });
});

describe("release.yml composition", () => {
    it("omits publish-scoop when scoop is unconfigured", () => {
        expect(constructReleaseWorkflowYaml({})).not.toContain("publish-scoop");
    });

    it("appends publish-scoop and makes announce wait on it", () => {
        const yaml = constructReleaseWorkflowYaml({ scoop: BASE_ARGS });
        expect(yaml).toContain("  publish-scoop:");
        const announce = yaml.slice(yaml.indexOf("  announce:"));
        expect(announce).toContain("      - publish-scoop");
    });

    // Both channels gate on `host`, so an announcement must not fire before
    // either has written.
    it("makes announce wait on both channels when both are enabled", () => {
        const yaml = constructReleaseWorkflowYaml({
            homebrew: { tap: "acme/homebrew-tap" },
            scoop: BASE_ARGS
        });
        const announce = yaml.slice(yaml.indexOf("  announce:"));
        expect(announce).toContain("      - publish-homebrew-formula");
        expect(announce).toContain("      - publish-scoop");
        expect(yaml.match(/^ {2}announce:$/gm)).toHaveLength(1);
    });
});
