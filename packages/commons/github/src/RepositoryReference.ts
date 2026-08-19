// RepositoryReference is a parsed GitHub repository reference, which
// contains a variety of formats.
export interface RepositoryReference {
    remote: string; // e.g. github.com
    owner: string; // e.g. fern-api
    repo: string; // e.g. fern
    repoUrl: string; // e.g. https://github.com/fern-api/fern
    cloneUrl: string; // e.g. https://github.ccom/fern-api/fern.git

    getAuthedCloneUrl: (installationToken: string) => string;
}
