export function isCI(): boolean {
    return Boolean(
        process.env.CI || // Generic CI
            process.env.GITHUB_ACTIONS || // GitHub Actions
            process.env.GITLAB_CI || // GitLab CI
            process.env.CIRCLECI || // CircleCI
            process.env.JENKINS_URL || // Jenkins
            process.env.TRAVIS // Travis CI
    );
}
