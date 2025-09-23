/**
 * The configuration used to interact with a GitHub repository.
 */
export interface RawGithubConfig {
    sourceDirectory: string;
    type?: string;
    uri?: string;
    token?: string;
    branch?: string;
    mode?: "pull-request";
}

export interface ResolvedGithubConfig {
    sourceDirectory: string;
    uri: string;
    token: string;
    branch?: string;
    mode?: "pull-request";
}