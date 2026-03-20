export interface CISource {
    type: "github" | "gitlab" | "bitbucket";
    repo?: string;
    runId?: string;
    runUrl?: string;
    commitSha?: string;
    branch?: string;
    actor?: string;
}

/**
 * Auto-detects CI environment and returns structured source metadata.
 * Returns undefined when not running in a recognized CI environment.
 */
export function detectCISource(): CISource | undefined {
    if (process.env.GITHUB_ACTIONS === "true") {
        const repo = process.env.GITHUB_REPOSITORY;
        const serverUrl = process.env.GITHUB_SERVER_URL ?? "https://github.com";
        const runId = process.env.GITHUB_RUN_ID;
        return {
            type: "github",
            repo,
            runId,
            runUrl: repo && runId ? `${serverUrl}/${repo}/actions/runs/${runId}` : undefined,
            commitSha: process.env.GITHUB_SHA,
            branch: process.env.GITHUB_REF_NAME,
            actor: process.env.GITHUB_ACTOR
        };
    }
    if (process.env.GITLAB_CI === "true") {
        return {
            type: "gitlab",
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
            type: "bitbucket",
            repo: workspace && repoSlug ? `${workspace}/${repoSlug}` : undefined,
            runId: buildNumber,
            runUrl:
                workspace && repoSlug && buildNumber
                    ? `https://bitbucket.org/${workspace}/${repoSlug}/pipelines/results/${buildNumber}`
                    : undefined,
            commitSha: process.env.BITBUCKET_COMMIT,
            branch: process.env.BITBUCKET_BRANCH
        };
    }
    return undefined;
}

/**
 * Checks if the current process is running in a CI/CD environment
 * @returns true if running in any common CI/CD environment
 */
export function isCI(): boolean {
    return !!(
        (
            process.env.CI || // Generic CI flag (used by many CI systems)
            process.env.CONTINUOUS_INTEGRATION || // Alternative generic flag
            process.env.GITHUB_ACTIONS || // GitHub Actions
            process.env.GITLAB_CI || // GitLab CI
            process.env.CIRCLECI || // CircleCI
            process.env.TRAVIS || // Travis CI
            process.env.JENKINS_URL || // Jenkins
            process.env.JENKINS_HOME || // Jenkins (alternative)
            process.env.TF_BUILD || // Azure Pipelines
            process.env.BUILDKITE || // Buildkite
            process.env.CODEBUILD_BUILD_ID || // AWS CodeBuild
            process.env.TEAMCITY_VERSION || // TeamCity
            process.env.BITBUCKET_BUILD_NUMBER || // Bitbucket Pipelines
            process.env.DRONE || // Drone CI
            process.env.SEMAPHORE || // Semaphore CI
            process.env.APPVEYOR || // AppVeyor
            process.env.BUDDY_WORKSPACE_ID || // Buddy
            process.env.WERCKER_RUN_ID
        ) // Wercker
    );
}
