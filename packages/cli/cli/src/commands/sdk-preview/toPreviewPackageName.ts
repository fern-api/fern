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

/**
 * Transforms a PyPI package name into a preview-scoped equivalent.
 * Per PEP 503, names are normalized: lowercase, with sequences of `_`,
 * `-`, or `.` collapsed to a single `-`.
 *
 * Examples (org = "acme"):
 *   acme-sdk      -> acme-preview-acme-sdk
 *   Acme_SDK      -> acme-preview-acme-sdk
 *   acme.sdk      -> acme-preview-acme-sdk
 */
export function toPypiPreviewPackageName(packageName: string, org: string): string {
    const normalized = packageName
        .toLowerCase()
        .replace(/[-_.]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const orgNormalized = org.toLowerCase().replace(/[-_.]+/g, "-");
    return `${orgNormalized}-preview-${normalized}`;
}
