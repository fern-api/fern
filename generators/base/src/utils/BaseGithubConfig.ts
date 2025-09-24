/**
 * The configuration used to interact with a GitHub repository.
 */
export interface BaseGitHubConfig {
    /** The directory from which to read the contents of the GitHub repository. */
    sourceDirectory: string;
    /** The URI of the GitHub repository. */
    uri: string;
    /** The token used to access the GitHub repository. */
    token: string;
    /** The branch to use when interacting with the GitHub repository. */
    branch?: string;
    /** The mode to use when interacting with the GitHub repository. */
    mode?: "pull-request";
}
