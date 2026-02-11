import type { FernGeneratorCli } from "../configuration/sdk";
import { GitHub } from "../github/GitHub";

export interface GithubReleaseParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubRelease(params: GithubReleaseParams): Promise<express.Router> {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.release();
}
