export function isCI(): boolean {
    return Boolean(
        process.env.CI === "true" || // Generic CI
            process.env.GITHUB_ACTIONS === "true" || // GitHub Actions
            process.env.GITLAB_CI === "true" || // GitLab CI
            process.env.CIRCLECI === "true" || // CircleCI
            process.env.JENKINS_URL === "true" || // Jenkins
            process.env.TRAVIS === "true" // Travis CI
    );
}
