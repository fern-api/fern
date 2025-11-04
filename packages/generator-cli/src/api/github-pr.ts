import type { FernGeneratorCli } from "../configuration/generated";
import { GitHub } from "../github/GitHub";

export interface GithubPrParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubPr(params: GithubPrParams) {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.pr();
}
