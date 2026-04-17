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
 * Returns the name of the CI provider the CLI is running in, if any.
 *
 * Only the provider's name is returned — we intentionally do not expose any
 * repository, run, branch, commit, or actor metadata because those values can
 * leak private information into the generated SDK's `.fern/metadata.json`.
 */
export function detectCiProvider(): string | undefined {
    if (process.env.GITHUB_ACTIONS === "true") {
        return "github";
    }
    if (process.env.GITLAB_CI === "true") {
        return "gitlab";
    }
    if (process.env.BITBUCKET_BUILD_NUMBER != null) {
        return "bitbucket";
    }
    if (process.env.CIRCLECI === "true") {
        return "circleci";
    }
    if (process.env.TRAVIS === "true") {
        return "travis";
    }
    if (process.env.JENKINS_URL != null || process.env.JENKINS_HOME != null) {
        return "jenkins";
    }
    if (process.env.TF_BUILD != null) {
        return "azure-pipelines";
    }
    if (process.env.BUILDKITE === "true") {
        return "buildkite";
    }
    if (process.env.CODEBUILD_BUILD_ID != null) {
        return "codebuild";
    }
    if (process.env.TEAMCITY_VERSION != null) {
        return "teamcity";
    }
    if (process.env.DRONE === "true") {
        return "drone";
    }
    if (process.env.SEMAPHORE === "true") {
        return "semaphore";
    }
    if (process.env.APPVEYOR === "true" || process.env.APPVEYOR === "True") {
        return "appveyor";
    }
    if (isCIEnvironment()) {
        return "unknown";
    }
    return undefined;
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
