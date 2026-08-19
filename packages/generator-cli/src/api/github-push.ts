import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import { GitHub } from "../github/GitHub.js";

export interface GithubPushParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubPush(params: GithubPushParams) {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.push();
}
