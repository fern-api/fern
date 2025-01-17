import { wrapWithHttps } from "@fern-api/docs-resolver";
import { AbsoluteFilePath, RelativeFilePath, dirname, doesPathExist, join } from "@fern-api/fs-utils";

import { getRedirectForPath } from "./redirect-for-path";
import { addLeadingSlash, removeLeadingSlash } from "./url-utils";

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
    pathname: string;
    markdown: boolean;
    absoluteFilepath?: AbsoluteFilePath;
    workspaceAbsoluteFilePath: AbsoluteFilePath;
    pageSlugs: Set<string>;
    absoluteFilePathsToSlugs: Map<AbsoluteFilePath, string[]>;
    redirects?: {
        source: string;
        destination: string;
        permanent?: boolean;
    }[];
    baseUrl: {
        domain: string;
        basePath?: string;
    };
}): Promise<true | string[]> {
    const slugs = absoluteFilepath != null ? (absoluteFilePathsToSlugs.get(absoluteFilepath) ?? []) : [];
    console.log('Initial slugs:', slugs);
    console.log('Checking pathname:', pathname);

    // base case: empty pathname is valid 
    if (pathname.trim() === "") {
        console.log('Empty pathname - returning true');
        console.log('Returning:', true);
        return true;
    }

    // if the pathname starts with `/`, it must either be a slug or a file in the current workspace
    if (pathname.startsWith("/")) {
        console.log('Pathname starts with /, checking if valid slug or file');
        
        // only check slugs if the file is expected to be a markdown file
        const redirectedPath = withRedirects(pathname, baseUrl, redirects);
        console.log('Redirected path:', redirectedPath);
        
        if (markdown && pageSlugs.has(removeLeadingSlash(redirectedPath))) {
            console.log('Found valid markdown slug');
            console.log('Returning:', true);
            return true;
        }

        const absolutePath = join(workspaceAbsoluteFilePath, RelativeFilePath.of(removeLeadingSlash(pathname)));
        console.log('Checking if file exists at:', absolutePath);

        if (await doesPathExist(absolutePath, "file")) {
            console.log('File exists');
            console.log('Returning:', true);
            return true;
        }

        console.log('File does not exist at:', absolutePath);
        console.log('No valid slug or file found, proceeding to check slugs');
        const result = slugs.map((slug) => addLeadingSlash(slug));
        console.log('Returning result:', result);
        return result;
    }

    if (absoluteFilepath != null) {
        console.log('Checking relative path from:', absoluteFilepath);
        // if the pathname does not start with a `/`, it is a relative path.
        // first, we'll check if the pathname is a relativized path
        const relativizedPathname = join(dirname(absoluteFilepath), RelativeFilePath.of(pathname));
        console.log('Checking relativized path:', relativizedPathname);

        if (await doesPathExist(relativizedPathname, "file")) {
            console.log('Found file at relativized path');
            console.log('Returning:', true);
            return true;
        }
    }

    // if this file isn't expected to be a markdown file, we don't have to check the slugs
    if (!markdown) {
        console.log('Not a markdown file, returning slugs');
        const result = slugs.map((slug) => addLeadingSlash(slug));
        console.log('Returning:', result);
        return result;
    }

    console.log('Checking all slugs for current file');
    // if that fails, we need to check if the path exists against all of the slugs for the current file

    const brokenSlugs: string[] = [];
    for (const slug of slugs) {
        console.log('Checking slug:', slug);
        const url = new URL(`/${slug}`, wrapWithHttps(baseUrl.domain));
        console.log('Constructed URL:', url.toString());
        const targetSlug = withRedirects(new URL(pathname, url).pathname, baseUrl, redirects);
        console.log('Target slug:', targetSlug);
        console.log('Page slugs:', Array.from(pageSlugs));
        if (!pageSlugs.has(removeLeadingSlash(targetSlug))) {
            console.log('Broken slug found:', slug);
            brokenSlugs.push(slug);
        }
    }

    console.log('Final broken slugs:', brokenSlugs);
    const result = brokenSlugs.length > 0 ? brokenSlugs : true;
    console.log('Returning:', result);
    return result;
}

function withRedirects(
    pathname: string,
    baseUrl: { domain: string; basePath?: string },
    redirects: { source: string; destination: string; permanent?: boolean }[]
) {
    const result = getRedirectForPath(pathname, baseUrl, redirects);
    if (result == null) {
        return pathname;
    }
    return result.redirect.destination;
}
