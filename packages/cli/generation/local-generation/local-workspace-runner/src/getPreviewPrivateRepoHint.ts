/**
 * `--preview` replaces every `${VAR}` in generators.yml with an empty value, so a self-hosted
 * `github.token` that references an environment variable is always empty in preview. Returns a
 * hint explaining why the generator cannot clone a private repository in that case.
 */
export function getPreviewPrivateRepoHint({
    uri,
    token,
    previewMode
}: {
    uri: string;
    token: string;
    previewMode: boolean;
}): string | undefined {
    if (!previewMode || token.trim() !== "") {
        return undefined;
    }
    return (
        `--preview replaces every \${VAR} in generators.yml with an empty value, so github.token for ${uri} is empty. ` +
        "If that repository is private, the generator cannot clone it (for example, to generate README.md), " +
        "so --local --preview cannot generate it. " +
        "To test with the token, run `fern generate --local` without --preview, " +
        "with the environment variable that github.token references (e.g. GITHUB_TOKEN) set."
    );
}
