import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { constructDockerJobYaml, constructReleaseWorkflowYaml } from "../index.js";

const BASE_ARGS = {
    binaryName: "acme-cli",
    docker: { image: "ghcr.io/acme/acme-cli" },
    license: "MIT",
    description: "CLI for the Acme API"
} as const;

const DOCKER_HUB_ARGS = {
    ...BASE_ARGS,
    docker: {
        image: "docker.io/acme/acme-cli",
        usernameEnvironmentVariable: "DOCKERHUB_USERNAME",
        tokenEnvironmentVariable: "DOCKERHUB_TOKEN"
    }
} as const;

interface Step {
    name?: string;
    uses?: string;
    run?: string;
    with?: Record<string, unknown>;
}

function parseJob(jobYaml: string): Record<string, unknown> & { steps: Step[] } {
    const parsed = yaml.load(`jobs:\n${jobYaml}`) as {
        jobs: Record<string, Record<string, unknown> & { steps: Step[] }>;
    };
    const job = parsed.jobs["publish-docker"];
    if (job == null) {
        throw new Error("expected a publish-docker job");
    }
    return job;
}

function stepUsing(job: { steps: Step[] }, action: string): Step {
    const step = job.steps.find((s) => s.uses?.startsWith(action) === true);
    if (step == null) {
        throw new Error(`expected a step using ${action}`);
    }
    return step;
}

describe("constructDockerJobYaml", () => {
    it("emits a publish-docker job gated on host", () => {
        const job = parseJob(constructDockerJobYaml(BASE_ARGS));
        expect(job.needs).toEqual(["plan", "host"]);
        expect(job["runs-on"]).toBe("ubuntu-22.04");
    });

    // A registry has version tags, so an RC can ship without a job-level
    // prerelease skip — it just must not move `latest`.
    it("always pushes the version tag and only moves latest for stable releases", () => {
        const job = parseJob(constructDockerJobYaml(BASE_ARGS));
        expect(job.if).toBeUndefined();
        expect((job.env as Record<string, string>).IS_PRERELEASE).toContain("announcement_is_prerelease");
        const tags = job.steps.find((s) => s.name === "Compute image tags");
        expect(tags?.run).toContain('TAGS="${IMAGE}:${VERSION}"');
        expect(tags?.run).toContain('if [ "${IS_PRERELEASE}" != "true" ]; then');
        expect(tags?.run).toContain('TAGS="${TAGS},${IMAGE}:latest"');
    });

    it("builds a multi-arch image from the musl archives", () => {
        const job = parseJob(constructDockerJobYaml(BASE_ARGS));
        const assemble = job.steps[0]?.run ?? "";
        expect(assemble).toContain("amd64:x86_64-unknown-linux-musl");
        expect(assemble).toContain("arm64:aarch64-unknown-linux-musl");
        expect(assemble).toContain('find "${DOWNLOAD}" -type f -name "acme-cli"');
        expect(stepUsing(job, "docker/build-push-action").with?.platforms).toBe("linux/amd64,linux/arm64");
    });

    it("writes a COPY-only Dockerfile, so buildx needs no QEMU", () => {
        const assemble = parseJob(constructDockerJobYaml(BASE_ARGS)).steps[0]?.run ?? "";
        const dockerfile = assemble.slice(assemble.indexOf("<<'DOCKERFILE'"));
        expect(dockerfile).toContain("FROM alpine:3.23\n");
        expect(dockerfile).toContain("COPY ${TARGETARCH}/acme-cli /usr/local/bin/acme-cli\n");
        expect(dockerfile).toContain('ENTRYPOINT ["/usr/local/bin/acme-cli"]\n');
        expect(dockerfile).not.toMatch(/^RUN /m);
        // The heredoc terminator must land at column 0 once YAML strips the
        // block's indentation, or bash never closes it.
        expect(dockerfile).toMatch(/^DOCKERFILE$/m);
    });

    it("pushes to ghcr.io with the built-in token and packages: write", () => {
        const job = parseJob(constructDockerJobYaml(BASE_ARGS));
        expect(job.permissions).toEqual({ contents: "read", packages: "write" });
        expect(stepUsing(job, "docker/login-action").with).toEqual({
            registry: "ghcr.io",
            username: "${{ github.actor }}",
            password: "${{ secrets.GITHUB_TOKEN }}"
        });
    });

    it("logs in with the configured secrets and no extra permissions otherwise", () => {
        const job = parseJob(constructDockerJobYaml(DOCKER_HUB_ARGS));
        expect(job.permissions).toBeUndefined();
        expect(stepUsing(job, "docker/login-action").with).toEqual({
            registry: "docker.io",
            username: "${{ secrets.DOCKERHUB_USERNAME }}",
            password: "${{ secrets.DOCKERHUB_TOKEN }}"
        });
    });

    it("labels the image with its source repo, version, and license", () => {
        const labels = String(
            stepUsing(parseJob(constructDockerJobYaml(BASE_ARGS)), "docker/build-push-action").with?.labels
        );
        expect(labels).toContain("org.opencontainers.image.source=${{ github.server_url }}/${{ github.repository }}");
        expect(labels).toContain("org.opencontainers.image.version=${{ steps.tags.outputs.version }}");
        expect(labels).toContain("org.opencontainers.image.licenses=MIT");
    });

    it("omits the license label when the license is unknown and flattens multi-line descriptions", () => {
        const labels = String(
            stepUsing(
                parseJob(
                    constructDockerJobYaml({ ...BASE_ARGS, license: undefined, description: "Line one\nline two" })
                ),
                "docker/build-push-action"
            ).with?.labels
        );
        expect(labels).not.toContain("licenses");
        expect(labels).toContain("org.opencontainers.image.description=Line one line two\n");
    });
});

describe("release.yml composition — docker", () => {
    it("omits publish-docker when docker is unconfigured", () => {
        expect(constructReleaseWorkflowYaml({})).not.toContain("publish-docker");
    });

    it("appends publish-docker and makes announce wait on it", () => {
        const workflow = constructReleaseWorkflowYaml({ docker: BASE_ARGS });
        expect(workflow).toContain("  publish-docker:");
        expect(workflow.slice(workflow.indexOf("  announce:"))).toContain("      - publish-docker");
        expect(() => yaml.load(workflow)).not.toThrow();
    });

    // Registry credentials are never the GitHub App, so the preflight job
    // must not appear on the docker channel's account.
    it("does not emit the App preflight for docker alone", () => {
        const workflow = constructReleaseWorkflowYaml({
            docker: BASE_ARGS,
            githubApp: { appIdSecret: "PUBLISH_APP_ID", privateKeySecret: "PUBLISH_APP_PRIVATE_KEY" }
        });
        expect(workflow).not.toContain("preflight-distribution");
    });
});
