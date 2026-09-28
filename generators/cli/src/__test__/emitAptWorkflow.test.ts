import { execFileSync } from "child_process";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { type AptJobYamlArgs, constructAptJobYaml, constructReleaseWorkflowYaml } from "../index.js";

const BASE_ARGS: AptJobYamlArgs = {
    binaryName: "acme-cli",
    apt: { repository: "acme/apt" },
    repoUrl: "https://github.com/acme/acme-cli",
    description: "CLI for the Acme API",
    auth: { type: "pat", tokenSecret: "APT_REPOSITORY_TOKEN" },
    preflightJob: false
};

const APP = {
    appIdSecret: "PUBLISH_APP_ID",
    privateKeySecret: "PUBLISH_APP_PRIVATE_KEY"
} as const;

interface Step {
    name?: string;
    id?: string;
    uses?: string;
    run?: string;
    env?: Record<string, string>;
    with?: Record<string, unknown>;
}

interface Job {
    needs: string[];
    if: string;
    "runs-on": string;
    env: Record<string, string>;
    steps: Step[];
}

function parseJobs(workflowYaml: string): Record<string, Job> {
    const parsed = yaml.load(workflowYaml) as { jobs: Record<string, Job> };
    return parsed.jobs;
}

function parseJob(jobYaml: string): Job {
    const job = parseJobs(`jobs:\n${jobYaml}`)["publish-apt"];
    if (job == null) {
        throw new Error("expected a publish-apt job");
    }
    return job;
}

function stepRun(job: Job, name: string): string {
    const step = job.steps.find((s) => s.name === name);
    if (step?.run == null) {
        throw new Error(`expected a run step named ${name}`);
    }
    return step.run;
}

/** Run the emitted tag → Debian version normalization for `tag`. */
function debianVersionFor(tag: string): string {
    const run = stepRun(
        parseJob(constructAptJobYaml(BASE_ARGS)),
        "Build the .deb packages from the musl release archives"
    );
    const start = run.indexOf('TAG="${GITHUB_REF_NAME}"');
    const end = run.indexOf('OUT="${RUNNER_TEMP}/debs"');
    const script = `set -euo pipefail\n${run.slice(start, end)}\nprintf '%s' "\${VERSION}"`;
    return execFileSync("bash", ["-c", script], { env: { GITHUB_REF_NAME: tag }, encoding: "utf-8" });
}

describe("constructAptJobYaml", () => {
    it("emits a publish-apt job gated on host and cargo-dist's prerelease expression", () => {
        const job = parseJob(constructAptJobYaml(BASE_ARGS));
        expect(job.needs).toEqual(["plan", "host"]);
        expect(job["runs-on"]).toBe("ubuntu-22.04");
        expect(job.if).toContain("announcement_is_prerelease");
        expect(job.if).toContain("publish_prereleases");
        expect(job.env).toEqual({ PACKAGE: "acme-cli", BRANCH: "gh-pages" });
    });

    it("packages both musl archives with xz compression", () => {
        const run = stepRun(
            parseJob(constructAptJobYaml(BASE_ARGS)),
            "Build the .deb packages from the musl release archives"
        );
        expect(run).toContain("amd64:x86_64-unknown-linux-musl");
        expect(run).toContain("arm64:aarch64-unknown-linux-musl");
        expect(run).toContain("dpkg-deb -Zxz --root-owner-group --build");
        expect(run).toContain('find "${DOWNLOAD}" -type f -perm -u+x -name "acme-cli"');
        expect(run).toContain("echo 'Homepage: https://github.com/acme/acme-cli'");
        expect(run).toContain("echo 'Description: CLI for the Acme API'");
    });

    it("flattens and shell-quotes the description", () => {
        const run = stepRun(
            parseJob(constructAptJobYaml({ ...BASE_ARGS, description: "Acme's\n  CLI" })),
            "Build the .deb packages from the musl release archives"
        );
        expect(run).toContain(`echo 'Description: Acme'\\''s CLI'`);
    });

    it("omits Homepage when there is no repository URL", () => {
        const run = stepRun(
            parseJob(constructAptJobYaml({ ...BASE_ARGS, repoUrl: undefined })),
            "Build the .deb packages from the musl release archives"
        );
        expect(run).not.toContain("Homepage:");
    });

    it.each([
        ["v1.2.3", "1.2.3"],
        ["1.2.3", "1.2.3"],
        ["my-app/1.2.3", "1.2.3"],
        ["releases/v1.2.3-rc.1", "1.2.3~rc.1"],
        ["v1.2.3+build.5", "1.2.3+build.5"]
    ])("derives Debian version %s → %s", (tag, expected) => {
        expect(debianVersionFor(tag)).toBe(expected);
    });

    it("reads the signing key from APT_SIGNING_KEY by default, with no passphrase", () => {
        const job = parseJob(constructAptJobYaml(BASE_ARGS));
        const importStep = job.steps.find((s) => s.name === "Import the signing key");
        expect(importStep?.env).toEqual({ SIGNING_KEY: "${{ secrets.APT_SIGNING_KEY }}" });
    });

    it("uses configured signing key and passphrase secrets", () => {
        const job = parseJob(
            constructAptJobYaml({
                ...BASE_ARGS,
                apt: {
                    repository: "acme/apt",
                    signingKeyEnvironmentVariable: "ACME_GPG_KEY",
                    signingKeyPassphraseEnvironmentVariable: "ACME_GPG_PASSPHRASE"
                }
            })
        );
        const importStep = job.steps.find((s) => s.name === "Import the signing key");
        expect(importStep?.env).toEqual({
            SIGNING_KEY: "${{ secrets.ACME_GPG_KEY }}",
            SIGNING_KEY_PASSPHRASE: "${{ secrets.ACME_GPG_PASSPHRASE }}"
        });
        const signStep = job.steps.find((s) => s.name === "Add the packages and sign the repository metadata");
        expect(signStep?.env?.SIGNING_KEY_PASSPHRASE).toBe("${{ secrets.ACME_GPG_PASSPHRASE }}");
    });

    it("checks out the APT repository with the PAT", () => {
        const job = parseJob(constructAptJobYaml(BASE_ARGS));
        const checkout = job.steps.find((s) => s.name === "Check out the APT repository");
        expect(checkout?.with).toEqual({
            repository: "acme/apt",
            token: "${{ secrets.APT_REPOSITORY_TOKEN }}",
            path: "apt-repo",
            "persist-credentials": true
        });
        expect(job.steps.some((s) => s.uses?.startsWith("actions/create-github-app-token") === true)).toBe(false);
    });

    it("mints an App token scoped to the APT repository", () => {
        const job = parseJob(
            constructAptJobYaml({ ...BASE_ARGS, auth: { type: "githubApp", app: APP }, preflightJob: true })
        );
        expect(job.needs).toEqual(["plan", "host", "preflight-distribution"]);
        const mint = job.steps.find((s) => s.uses?.startsWith("actions/create-github-app-token") === true);
        expect(mint?.with).toMatchObject({ owner: "acme", repositories: "apt" });
        const checkout = job.steps.find((s) => s.name === "Check out the APT repository");
        expect(checkout?.with?.token).toBe("${{ steps.app-token.outputs.token }}");
    });

    it("publishes to a configured branch", () => {
        const job = parseJob(constructAptJobYaml({ ...BASE_ARGS, apt: { repository: "acme/apt", branch: "main" } }));
        expect(job.env.BRANCH).toBe("main");
    });

    it("writes a signed stable/main repository", () => {
        const run = stepRun(
            parseJob(constructAptJobYaml(BASE_ARGS)),
            "Add the packages and sign the repository metadata"
        );
        expect(run).toContain('POOL="pool/main/a/acme-cli"');
        expect(run).toContain('DIST="dists/stable"');
        expect(run).toContain("apt-ftparchive --arch");
        expect(run).toContain('--clearsign --output "${DIST}/InRelease"');
        expect(run).toContain('--detach-sign --output "${DIST}/Release.gpg"');
        expect(run).toContain("> gpg.key");
        expect(run).toContain("touch .nojekyll");
    });

    it("emits bash that parses", () => {
        const job = parseJob(constructAptJobYaml(BASE_ARGS));
        for (const step of job.steps) {
            if (step.run != null) {
                expect(() => execFileSync("bash", ["-n"], { input: step.run })).not.toThrow();
            }
        }
    });
});

describe("constructReleaseWorkflowYaml — apt", () => {
    const apt = {
        binaryName: "acme-cli",
        apt: { repository: "acme/apt" },
        repoUrl: "https://github.com/acme/acme-cli",
        description: "CLI for the Acme API"
    };

    it("leaves the workflow unchanged when apt is not configured", () => {
        expect(constructReleaseWorkflowYaml({})).not.toContain("publish-apt");
    });

    it("appends publish-apt and makes announce wait on it", () => {
        const jobs = parseJobs(constructReleaseWorkflowYaml({ apt }));
        expect(jobs["publish-apt"]).toBeDefined();
        expect(jobs.announce?.needs).toContain("publish-apt");
    });

    it("defaults the token secret to APT_REPOSITORY_TOKEN", () => {
        const jobs = parseJobs(constructReleaseWorkflowYaml({ apt }));
        const checkout = jobs["publish-apt"]?.steps.find((s) => s.name === "Check out the APT repository");
        expect(checkout?.with?.token).toBe("${{ secrets.APT_REPOSITORY_TOKEN }}");
    });

    it("preflights the shared GitHub App once across channels", () => {
        const yamlText = constructReleaseWorkflowYaml({
            apt,
            homebrew: { tap: "acme/homebrew-tap" },
            githubApp: APP
        });
        const jobs = parseJobs(yamlText);
        expect(jobs["preflight-distribution"]).toBeDefined();
        expect(yamlText).toContain("Homebrew tap / APT repository");
        expect(jobs["publish-apt"]?.needs).toContain("preflight-distribution");
    });
});
