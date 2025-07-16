import { wrapWithHttps } from "@fern-api/docs-resolver"
import { AbsoluteFilePath, RelativeFilePath, dirname, doesPathExist, join } from "@fern-api/fs-utils"

import { getRedirectForPath } from "./redirect-for-path"
import { addLeadingSlash, removeLeadingSlash, removeTrailingSlash } from "./url-utils"

/**
 * Checks if the given path exists in the docs.
 *
 * For a given pathname, there's two scenarios:
 * 1. the pathname is a slug to a page in the docs (e.g. `/docs/my-page`)
 * 2. the pathname is a path to a file in the docs (e.g. `/docs/my-file.md`)
 *
 * Crucially, the current file may referenced by two slugs, so if the target pathname contains a relativized path,
 * we will need to check that if the relativized paths can be found on all of the slugs for the current file.
 */
export async function checkIfPathnameExists({
    pathname,
    markdown,
    absoluteFilepath,
    workspaceAbsoluteFilePath,
    pageSlugs,
    absoluteFilePathsToSlugs,
    redirects = [],
    baseUrl
}: {
    pathname: string
    markdown: boolean
    absoluteFilepath?: AbsoluteFilePath
    workspaceAbsoluteFilePath: AbsoluteFilePath
    pageSlugs: Set<string>
    absoluteFilePathsToSlugs: Map<AbsoluteFilePath, string[]>
    redirects?: {
        source: string
        destination: string
        permanent?: boolean
    }[]
    baseUrl: {
        domain: string
        basePath?: string
    }
}): Promise<true | string[]> {
    pathname = removeTrailingSlash(pathname)
    const slugs = absoluteFilepath != null ? (absoluteFilePathsToSlugs.get(absoluteFilepath) ?? []) : []

    // base case: empty pathname is valid
    if (pathname.trim() === "") {
        return true
    }

    pathname = withoutAnchors(pathname)

    // if the pathname starts with `/`, it must either be a slug or a file in the current workspace
    if (pathname.startsWith("/")) {
        // only check slugs if the file is expected to be a markdown file
        let redirectedPath = withoutAnchors(withRedirects(pathname, baseUrl, redirects))
        for (let redirectCount = 0; redirectCount < 5; ++redirectCount) {
            const nextRedirectPath = withoutAnchors(withRedirects(redirectedPath, baseUrl, redirects))
            if (redirectedPath === nextRedirectPath) {
                break
            }
            redirectedPath = nextRedirectPath
        }

        if (markdown && pageSlugs.has(removeLeadingSlash(redirectedPath))) {
            return true
        }

        const absolutePath = join(workspaceAbsoluteFilePath, RelativeFilePath.of(removeLeadingSlash(pathname)))

        if (await doesPathExist(absolutePath, "file")) {
            return true
        }

        return slugs.map((slug) => addLeadingSlash(slug))
    }

    if (absoluteFilepath != null) {
        // if the pathname does not start with a `/`, it is a relative path.

        // If pathname is `.` we'll check if the current directory exists.
        if (pathname === ".") {
            const currentDirPath = dirname(absoluteFilepath)
            if (await doesPathExist(currentDirPath, "directory")) {
                return true
            }
        }

        // We'll check if the pathname is a relativized path
        const relativizedPathname = join(dirname(absoluteFilepath), RelativeFilePath.of(pathname))

        if (await doesPathExist(relativizedPathname, "file")) {
            return true
        }
    }

    // if this file isn't expected to be a markdown file, we don't have to check the slugs
    if (!markdown) {
        return slugs.map((slug) => addLeadingSlash(slug))
    }

    // if that fails, we need to check if the path exists against all of the slugs for the current file
    const brokenSlugs: string[] = []
    for (const slug of slugs) {
        const url = new URL(`/${slug}`, wrapWithHttps(baseUrl.domain))
        const targetSlug = withRedirects(new URL(pathname, url).pathname, baseUrl, redirects)
        if (!pageSlugs.has(removeLeadingSlash(targetSlug))) {
            brokenSlugs.push(slug)
        }
    }

    return brokenSlugs.length > 0 ? brokenSlugs : true
}

function withRedirects(
    pathname: string,
    baseUrl: { domain: string; basePath?: string },
    redirects: { source: string; destination: string; permanent?: boolean }[]
) {
    const result = getRedirectForPath(pathname, baseUrl, redirects)
    if (result == null) {
        return pathname
    }
    return result.redirect.destination
}

function withoutAnchors(slug: string): string {
    const hashIndex = slug.indexOf("#")
    if (hashIndex === -1) {
        return slug
    }
    return slug.substring(0, hashIndex)
}
