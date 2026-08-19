import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import { GitHub } from "../github/GitHub.js";

export interface GithubPrParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubPr(params: GithubPrParams) {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.pr();
}
