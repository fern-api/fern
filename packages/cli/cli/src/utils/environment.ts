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
