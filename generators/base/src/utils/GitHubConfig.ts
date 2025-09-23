/**
 * The configuration used to interact with a GitHub repository.
 */
export interface RawGitHubConfig {
    sourceDirectory: string;
    type?: string;
    uri?: string;
    token?: string;
    branch?: string;
    mode?: "pull-request";
}

export interface ResolvedGitHubConfig {
    sourceDirectory: string;
    uri: string;
    token: string;
    branch?: string;
    mode?: "pull-request";
}