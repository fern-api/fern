import type { FernGeneratorCli } from "../configuration/generated";
import { GitHub } from "../github/GitHub";

export interface GithubReleaseParams {
    githubConfig: FernGeneratorCli.GitHubConfig;
}

export async function githubRelease(params: GithubReleaseParams) {
    const { githubConfig } = params;
    const github = new GitHub({ githubConfig });
    await github.release();
}
