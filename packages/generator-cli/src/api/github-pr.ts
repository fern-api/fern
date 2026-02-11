import type { FernGeneratorCli } from "../configuration/sdk";
import { GitHub } from "../github/GitHub";

export interface GithubPrParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubPr(params: GithubPrParams): Promise<express.Router> {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.pr();
}
