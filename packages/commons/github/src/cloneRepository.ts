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
    installationToken,
    targetDirectory
}: {
    githubRepository: string;
    installationToken: string | undefined;
    targetDirectory?: string;
}): Promise<ClonedRepository> {
    const repositoryReference = parseRepository(githubRepository);
    const cloneUrl =
        installationToken != null
            ? repositoryReference.getAuthedCloneUrl(installationToken)
            : repositoryReference.cloneUrl;
    const clonePath = targetDirectory ?? (await tmp.dir()).path;
    const git = simpleGit(clonePath);
    await git.clone(cloneUrl, ".");

    return new ClonedRepository({
        clonePath,
        git
    });
}
