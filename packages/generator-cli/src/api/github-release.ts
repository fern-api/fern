import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import { GitHub } from "../github/GitHub.js";

export interface GithubReleaseParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubRelease(params: GithubReleaseParams) {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.release();
}
