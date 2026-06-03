import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import { GitHub } from "../github/GitHub.js";

export interface GithubReleaseParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
    version: string;
    body?: string;
}

export async function githubRelease(params: GithubReleaseParams): Promise<void> {
    const { githubConfig, version, body } = params;
    const github = new GitHub({ githubConfig });
    await github.release({ version, body });
}
