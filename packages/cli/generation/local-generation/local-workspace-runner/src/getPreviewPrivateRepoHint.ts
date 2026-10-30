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
        `--preview blanks \${VAR} values, so github.token for ${uri} is empty and a private repo can't be cloned. ` +
        "Run without --preview, with the token's env var (e.g. GITHUB_TOKEN) set."
    );
}
