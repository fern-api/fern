import type { FernGeneratorCli } from "../configuration/sdk";
import { GitHub } from "../github/GitHub";

export interface GithubPushParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubPush(params: GithubPushParams): Promise<express.Router> {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.push();
}
