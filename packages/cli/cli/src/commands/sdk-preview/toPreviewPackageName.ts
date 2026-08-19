/**
 * Transforms a package name into a preview-scoped package name.
 * Uses the Fern org name to create a dedicated preview scope,
 * stripping any existing scope from the original package name.
 *
 * Examples (org = "fern"):
 *   @fern-fern/docs-parsers → @fern-preview/docs-parsers
 *   my-package → @fern-preview/my-package
 * Examples (org = "acme"):
 *   @acme/python-sdk → @acme-preview/python-sdk
 */
export function toPreviewPackageName(packageName: string, org: string): string {
    const scopeMatch = packageName.match(/^@[^/]+\/(.+)$/);
    if (scopeMatch != null) {
        const [, name] = scopeMatch;
        return `@${org}-preview/${name}`;
    }
    return `@${org}-preview/${packageName}`;
}
