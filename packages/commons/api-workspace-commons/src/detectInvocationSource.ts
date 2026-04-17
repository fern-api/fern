import { FernIr } from "@fern-api/ir-sdk";

/**
 * Resolves the source that triggered the current Fern CLI invocation.
 *
 * Precedence:
 * 1. The `FERN_INVOKER` environment variable, when it holds one of the known
 *    {@link FernIr.InvocationSource} values. Systems such as `fern-autopilot`
 *    and autorelease workflows should set this explicitly.
 * 2. A fallback to `"ci"` when any well-known CI environment variable is set.
 * 3. `"manual"` otherwise.
 */
export function detectInvocationSource(): FernIr.InvocationSource {
    const fromEnv = normalizeInvoker(process.env.FERN_INVOKER);
    if (fromEnv != null) {
        return fromEnv;
    }
    if (isCIEnvironment()) {
        return "ci";
    }
    return "manual";
}

/**
 * Returns structured metadata about the CI environment, if one is detected.
 * Currently supports GitHub Actions, GitLab CI, and Bitbucket Pipelines.
 */
export function detectCiEnvironmentMetadata(): FernIr.CiEnvironmentMetadata | undefined {
    if (process.env.GITHUB_ACTIONS === "true") {
        const repo = process.env.GITHUB_REPOSITORY;
        const serverUrl = process.env.GITHUB_SERVER_URL ?? "https://github.com";
        const runId = process.env.GITHUB_RUN_ID;
        return {
            provider: "github",
            repo,
            runId,
            runUrl: repo != null && runId != null ? `${serverUrl}/${repo}/actions/runs/${runId}` : undefined,
            commitSha: process.env.GITHUB_SHA,
            branch: process.env.GITHUB_REF_NAME,
            actor: process.env.GITHUB_ACTOR
        };
    }
    if (process.env.GITLAB_CI === "true") {
        return {
            provider: "gitlab",
            repo: process.env.CI_PROJECT_PATH,
            runId: process.env.CI_PIPELINE_ID,
            runUrl: process.env.CI_PIPELINE_URL,
            commitSha: process.env.CI_COMMIT_SHA,
            branch: process.env.CI_COMMIT_REF_NAME,
            actor: process.env.GITLAB_USER_LOGIN
        };
    }
    if (process.env.BITBUCKET_BUILD_NUMBER != null) {
        const workspace = process.env.BITBUCKET_WORKSPACE;
        const repoSlug = process.env.BITBUCKET_REPO_SLUG;
        const buildNumber = process.env.BITBUCKET_BUILD_NUMBER;
        return {
            provider: "bitbucket",
            repo: workspace != null && repoSlug != null ? `${workspace}/${repoSlug}` : undefined,
            runId: buildNumber,
            runUrl:
                workspace != null && repoSlug != null
                    ? `https://bitbucket.org/${workspace}/${repoSlug}/pipelines/results/${buildNumber}`
                    : undefined,
            commitSha: process.env.BITBUCKET_COMMIT,
            branch: process.env.BITBUCKET_BRANCH,
            actor: undefined
        };
    }
    return undefined;
}

/**
 * Returns the CLI arguments the Fern CLI was invoked with (i.e. everything after
 * the node binary and script path) joined by spaces. Returns `undefined` when
 * not enough argv is available.
 */
export function getCliInvocation(): string | undefined {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        return undefined;
    }
    return args.join(" ");
}

function normalizeInvoker(raw: string | undefined): FernIr.InvocationSource | undefined {
    if (raw == null) {
        return undefined;
    }
    const normalized = raw.trim().toLowerCase();
    switch (normalized) {
        case "autopilot":
        case "autorelease":
        case "ci":
        case "manual":
            return normalized;
        default:
            return undefined;
    }
}

function isCIEnvironment(): boolean {
    return !!(
        process.env.CI ||
        process.env.CONTINUOUS_INTEGRATION ||
        process.env.GITHUB_ACTIONS ||
        process.env.GITLAB_CI ||
        process.env.CIRCLECI ||
        process.env.TRAVIS ||
        process.env.JENKINS_URL ||
        process.env.JENKINS_HOME ||
        process.env.TF_BUILD ||
        process.env.BUILDKITE ||
        process.env.CODEBUILD_BUILD_ID ||
        process.env.TEAMCITY_VERSION ||
        process.env.BITBUCKET_BUILD_NUMBER ||
        process.env.DRONE ||
        process.env.SEMAPHORE ||
        process.env.APPVEYOR ||
        process.env.BUDDY_WORKSPACE_ID ||
        process.env.WERCKER_RUN_ID
    );
}
