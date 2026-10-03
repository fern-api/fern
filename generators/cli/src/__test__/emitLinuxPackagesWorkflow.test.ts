import { execFileSync } from "child_process";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import {
    constructLinuxPackagesJobYaml,
    constructReleaseWorkflowYaml,
    type LinuxPackagesJobYamlArgs
} from "../index.js";

const JOB = "publish-linux-packages";
const BUILD_STEP = "Build the packages from the musl release archives";
const PUBLISH_STEP = "Add the packages and sign the repository metadata";

const BASE_ARGS: LinuxPackagesJobYamlArgs = {
    binaryName: "acme-cli",
    linuxPackages: { repository: "acme/packages" },
    repoUrl: "https://github.com/acme/acme-cli",
    license: "MIT",
    description: "CLI for the Acme API",
    auth: { type: "pat", tokenSecret: "LINUX_PACKAGES_TOKEN" },
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
    const job = parseJobs(`jobs:\n${jobYaml}`)[JOB];
    if (job == null) {
        throw new Error(`expected a ${JOB} job`);
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

function run(args: Partial<LinuxPackagesJobYamlArgs>, step: string): string {
    return stepRun(parseJob(constructLinuxPackagesJobYaml({ ...BASE_ARGS, ...args })), step);
}

/** Run the emitted tag → package version normalization for `tag`. */
function packageVersionFor(tag: string): string {
    const script = run({}, BUILD_STEP);
    const start = script.indexOf('TAG="${GITHUB_REF_NAME}"');
    const end = script.indexOf('OUT="${RUNNER_TEMP}/packages"');
    if (start < 0 || end <= start) {
        throw new Error("could not locate the version normalization in the emitted script");
    }
    const snippet = `set -euo pipefail\n${script.slice(start, end)}\nprintf '%s' "\${VERSION}"`;
    return execFileSync("bash", ["-c", snippet], { env: { GITHUB_REF_NAME: tag }, encoding: "utf-8" });
}

describe("constructLinuxPackagesJobYaml", () => {
    it("emits a job gated on host and cargo-dist's prerelease expression", () => {
        const job = parseJob(constructLinuxPackagesJobYaml(BASE_ARGS));
        expect(job.needs).toEqual(["plan", "host"]);
        expect(job["runs-on"]).toBe("ubuntu-22.04");
        expect(job.if).toContain("announcement_is_prerelease");
        expect(job.if).toContain("publish_prereleases");
        expect(job.env).toEqual({
            PACKAGE: "acme-cli",
            BRANCH: "gh-pages",
            REPOSITORY_URL: "https://acme.github.io/packages"
        });
    });

    it("builds both formats from both musl archives by default", () => {
        const script = run({}, BUILD_STEP);
        expect(script).toContain("amd64:x86_64:x86_64-unknown-linux-musl");
        expect(script).toContain("arm64:aarch64:aarch64-unknown-linux-musl");
        expect(script).toContain('find "${DOWNLOAD}" -type f -perm -u+x -name "acme-cli"');
        expect(script).toContain("dpkg-deb -Zxz --root-owner-group --build");
        expect(script).toContain('rpmbuild -bb --quiet --target "${RPM_ARCH}"');
        expect(script).toContain("rpmsign --addsign");
    });

    it("writes the deb control fields", () => {
        const script = run({}, BUILD_STEP);
        expect(script).toContain("echo 'Homepage: https://github.com/acme/acme-cli'");
        expect(script).toContain("echo 'Description: CLI for the Acme API'");
    });

    it("writes the rpm spec fields with a static, dependency-free payload", () => {
        const script = run({}, BUILD_STEP);
        expect(script).toContain("echo 'Summary: CLI for the Acme API'");
        expect(script).toContain("echo 'License: MIT'");
        expect(script).toContain("echo 'URL: https://github.com/acme/acme-cli'");
        expect(script).toContain('echo "AutoReqProv: no"');
        expect(script).toContain('--define "_binary_payload w9.xzdio"');
        expect(script).toContain('echo "install -D -m 0755 %{SOURCE0} %{buildroot}/usr/bin/acme-cli"');
    });

    it("escapes rpm macros and shell-quotes the description", () => {
        const script = run({ description: "Acme's\n  100% CLI" }, BUILD_STEP);
        expect(script).toContain(`echo 'Description: Acme'\\''s 100% CLI'`);
        expect(script).toContain(`echo 'Summary: Acme'\\''s 100%% CLI'`);
    });

    it("falls back to an unspecified rpm license and omits homepage fields without a repository URL", () => {
        const script = run({ license: undefined, repoUrl: undefined }, BUILD_STEP);
        expect(script).toContain("echo 'License: LicenseRef-Unspecified'");
        expect(script).not.toContain("Homepage:");
        expect(script).not.toContain("URL:");
    });

    it.each([
        ["v1.2.3", "1.2.3"],
        ["1.2.3", "1.2.3"],
        ["my-app/1.2.3", "1.2.3"],
        ["releases/v1.2.3-rc.1", "1.2.3~rc.1"],
        ["v1.2.3+build.5", "1.2.3+build.5"]
    ])("derives package version %s → %s", (tag, expected) => {
        expect(packageVersionFor(tag)).toBe(expected);
    });

    it("builds only deb when formats is [deb]", () => {
        const job = parseJob(
            constructLinuxPackagesJobYaml({
                ...BASE_ARGS,
                linuxPackages: { repository: "acme/packages", formats: ["deb"] }
            })
        );
        expect(job.env.REPOSITORY_URL).toBeUndefined();
        const build = stepRun(job, BUILD_STEP);
        expect(build).toContain("dpkg-deb");
        expect(build).not.toContain("rpmbuild");
        const publish = stepRun(job, PUBLISH_STEP);
        expect(publish).toContain("apt-ftparchive");
        expect(publish).not.toContain("createrepo_c");
    });

    it("builds only rpm when formats is [rpm]", () => {
        const linuxPackages = { repository: "acme/packages", formats: ["rpm" as const] };
        const build = run({ linuxPackages }, BUILD_STEP);
        expect(build).toContain("rpmbuild");
        expect(build).not.toContain("dpkg-deb");
        const publish = run({ linuxPackages }, PUBLISH_STEP);
        expect(publish).toContain("createrepo_c");
        expect(publish).not.toContain("apt-ftparchive");
    });

    it("reads the signing key from LINUX_PACKAGES_SIGNING_KEY by default, with no passphrase", () => {
        const job = parseJob(constructLinuxPackagesJobYaml(BASE_ARGS));
        const importStep = job.steps.find((s) => s.name === "Import the signing key");
        expect(importStep?.env).toEqual({ SIGNING_KEY: "${{ secrets.LINUX_PACKAGES_SIGNING_KEY }}" });
        expect(stepRun(job, BUILD_STEP)).not.toContain("_gpg_sign_cmd_extra_args");
    });

    it("uses configured signing key and passphrase secrets", () => {
        const job = parseJob(
            constructLinuxPackagesJobYaml({
                ...BASE_ARGS,
                linuxPackages: {
                    repository: "acme/packages",
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
        for (const name of [BUILD_STEP, PUBLISH_STEP]) {
            const step = job.steps.find((s) => s.name === name);
            expect(step?.env?.SIGNING_KEY_PASSPHRASE).toBe("${{ secrets.ACME_GPG_PASSPHRASE }}");
        }
        expect(stepRun(job, BUILD_STEP)).toContain(
            '--define "_gpg_sign_cmd_extra_args --pinentry-mode loopback --passphrase-file ${RUNNER_TEMP}/signing-passphrase"'
        );
    });

    it("requires exactly one secret key and takes the maintainer from it", () => {
        const script = run({}, "Import the signing key");
        expect(script).toContain("must contain exactly one GPG secret key");
        expect(script).toContain('--list-secret-keys --with-colons "${FINGERPRINT}"');
    });

    it("checks out the package repository with the PAT", () => {
        const job = parseJob(constructLinuxPackagesJobYaml(BASE_ARGS));
        const checkout = job.steps.find((s) => s.name === "Check out the package repository");
        expect(checkout?.with).toEqual({
            repository: "acme/packages",
            token: "${{ secrets.LINUX_PACKAGES_TOKEN }}",
            path: "linux-repo",
            "persist-credentials": true
        });
        expect(job.steps.some((s) => s.uses?.startsWith("actions/create-github-app-token") === true)).toBe(false);
    });

    it("mints an App token scoped to the package repository", () => {
        const job = parseJob(
            constructLinuxPackagesJobYaml({ ...BASE_ARGS, auth: { type: "githubApp", app: APP }, preflightJob: true })
        );
        expect(job.needs).toEqual(["plan", "host", "preflight-distribution"]);
        const mint = job.steps.find((s) => s.uses?.startsWith("actions/create-github-app-token") === true);
        expect(mint?.with).toMatchObject({ owner: "acme", repositories: "packages" });
        const checkout = job.steps.find((s) => s.name === "Check out the package repository");
        expect(checkout?.with?.token).toBe("${{ steps.app-token.outputs.token }}");
    });

    it("publishes to a configured branch and url", () => {
        const job = parseJob(
            constructLinuxPackagesJobYaml({
                ...BASE_ARGS,
                linuxPackages: { repository: "acme/packages", branch: "main", url: "https://packages.acme.com" }
            })
        );
        expect(job.env.BRANCH).toBe("main");
        expect(job.env.REPOSITORY_URL).toBe("https://packages.acme.com");
    });

    it("writes a signed APT tree under deb/", () => {
        const script = run({}, PUBLISH_STEP);
        expect(script).toContain('DEB_POOL="pool/main/a/acme-cli"');
        expect(script).toContain("cd deb");
        expect(script).toContain('DIST="dists/stable"');
        expect(script).toContain("apt-ftparchive --arch");
        expect(script).toContain('--clearsign --output "${DIST}/InRelease"');
        expect(script).toContain('--detach-sign --output "${DIST}/Release.gpg"');
    });

    it("writes signed RPM metadata and a .repo file under rpm/", () => {
        const script = run({}, PUBLISH_STEP);
        expect(script).toContain("createrepo_c --quiet --update --general-compress-type gz rpm");
        expect(script).toContain("--output rpm/repodata/repomd.xml.asc rpm/repodata/repomd.xml");
        expect(script).toContain('echo "baseurl=${REPOSITORY_URL}/rpm"');
        expect(script).toContain('echo "repo_gpgcheck=1"');
        expect(script).toContain('echo "gpgkey=${REPOSITORY_URL}/gpg.key"');
        expect(script).toContain('} > "rpm/${PACKAGE}.repo"');
    });

    it("publishes the public key once at the root", () => {
        const script = run({}, PUBLISH_STEP);
        expect(script).toContain('gpg --batch --armor --export "${FINGERPRINT}" > gpg.key');
        expect(script).toContain("touch .nojekyll");
    });

    it("orphans the branch only when it does not exist", () => {
        const script = run({}, PUBLISH_STEP);
        expect(script).toContain('git ls-remote --exit-code --heads origin "${BRANCH}"');
        expect(script).toContain('elif [ "${BRANCH_STATUS}" = 2 ]; then\n  git checkout --orphan "${BRANCH}"');
        expect(script).toContain("Could not read ${BRANCH} from the package repository");
    });

    it("skips publishing only when every index already lists every package", () => {
        const script = run({}, PUBLISH_STEP);
        expect(script).toContain('grep -qxF "Filename: ${DEB_POOL}/${NAME}.deb"');
        expect(script).toContain('grep -F "href=\\"packages/${NAME}\\""');
        const skip = script.indexOf("is already published; nothing to commit");
        expect(skip).toBeGreaterThan(script.indexOf("repomd.xml.asc ] || INDEXED=0"));
        expect(skip).toBeLessThan(script.indexOf("apt-ftparchive --arch"));
        expect(skip).toBeLessThan(script.indexOf("createrepo_c --quiet"));
    });

    it.each([
        [["deb" as const]],
        [["rpm" as const]],
        [undefined]
    ])("emits bash that parses for formats %j", (formats) => {
        const job = parseJob(
            constructLinuxPackagesJobYaml({
                ...BASE_ARGS,
                linuxPackages: { repository: "acme/packages", formats, signingKeyPassphraseEnvironmentVariable: "P" }
            })
        );
        for (const step of job.steps) {
            if (step.run != null) {
                expect(() => execFileSync("bash", ["-n"], { input: step.run })).not.toThrow();
            }
        }
    });
});

describe("constructReleaseWorkflowYaml — linuxPackages", () => {
    const linuxPackages = {
        binaryName: "acme-cli",
        linuxPackages: { repository: "acme/packages" },
        repoUrl: "https://github.com/acme/acme-cli",
        license: "MIT",
        description: "CLI for the Acme API"
    };

    it("leaves the workflow unchanged when linuxPackages is not configured", () => {
        expect(constructReleaseWorkflowYaml({})).not.toContain(JOB);
    });

    it("appends publish-linux-packages and makes announce wait on it", () => {
        const jobs = parseJobs(constructReleaseWorkflowYaml({ linuxPackages }));
        expect(jobs[JOB]).toBeDefined();
        expect(jobs.announce?.needs).toContain(JOB);
    });

    it("defaults the token secret to LINUX_PACKAGES_TOKEN", () => {
        const jobs = parseJobs(constructReleaseWorkflowYaml({ linuxPackages }));
        const checkout = jobs[JOB]?.steps.find((s) => s.name === "Check out the package repository");
        expect(checkout?.with?.token).toBe("${{ secrets.LINUX_PACKAGES_TOKEN }}");
    });

    it("preflights the shared GitHub App once across channels", () => {
        const yamlText = constructReleaseWorkflowYaml({
            linuxPackages,
            homebrew: { tap: "acme/homebrew-tap" },
            githubApp: APP
        });
        const jobs = parseJobs(yamlText);
        expect(jobs["preflight-distribution"]).toBeDefined();
        expect(yamlText).toContain("Homebrew tap / Linux package repository");
        expect(jobs[JOB]?.needs).toContain("preflight-distribution");
    });
});
