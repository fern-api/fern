import simpleGit from "simple-git";
import tmp from "tmp-promise";

import { ClonedRepository } from "./ClonedRepository";
import { parseRepository } from "./parseRepository";

/**
 * Clones the repository to the local file system.
 * @param githubRepository a string that can be parsed into a RepositoryReference (e.g. 'owner/repo')
 */
export async function cloneRepository({
    githubRepository,
    installationToken
}: {
    githubRepository: string;
    installationToken: string | undefined;
}): Promise<ClonedRepository> {
    const repositoryReference = parseRepository(githubRepository);
    const cloneUrl =
        installationToken != null
            ? repositoryReference.getAuthedCloneUrl(installationToken)
            : repositoryReference.cloneUrl;
    const dir = await tmp.dir();
    const clonePath = dir.path;
    const git = simpleGit(clonePath);
    await git.clone(cloneUrl, ".");

    return new ClonedRepository({
        clonePath,
        git
    });
}
