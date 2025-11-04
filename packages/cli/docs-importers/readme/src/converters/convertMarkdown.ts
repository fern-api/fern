import { FernRegistry as CjsFdrSdk, FernRegistry } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import grayMatter from "gray-matter";

import { ParsedFrontmatter } from "../types/parsedFrontmatter";

export declare namespace convertMarkdown {
    interface Args {
        absoluteFilepathToMarkdown: AbsoluteFilePath;
        relativeFilepathFromRoot: RelativeFilePath;
    }

    interface Return {
        mintlifyFrontmatter: ParsedFrontmatter;
        relativeFilepathFromRoot: RelativeFilePath;
        frontmatter: CjsFdrSdk.docs.latest.Frontmatter;
        sidebarTitle: string | undefined;
        content: string;
    }
}

export async function convertMarkdown({
    absoluteFilepathToMarkdown,
    relativeFilepathFromRoot
}: convertMarkdown.Args): Promise<convertMarkdown.Return> {
    const text = await readFile(absoluteFilepathToMarkdown, "utf-8");
    const { data, content } = parseFrontmatter(text);
    const slug = relativeFilepathFromRoot.replace(/\.(md|mdx)$/, "");
    const transformedContent = markReferencedAssets({ content });
    return {
        mintlifyFrontmatter: data,
        relativeFilepathFromRoot,
        sidebarTitle: data.sidebarTitle ?? data.title,
        frontmatter: {
            "max-toc-depth": undefined,
            title: data.title,
            subtitle: data.description,
            layout: data.mode != null ? "reference" : undefined,
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            image: data["og:image"] as any,
            slug: FernRegistry.navigation.latest.Slug(slug),

            // TODO: check if any of these can be set:
            headline: undefined,
            description: undefined,
            "edit-this-page-url": undefined,
            "hide-toc": undefined,
            "hide-feedback": undefined,
            "no-image-zoom": undefined,
            "force-toc": undefined,
            "hide-nav-links": undefined,
            breadcrumb: undefined,
            excerpt: undefined,
            "canonical-url": undefined,
            "og:site_name": undefined,
            "og:title": undefined,
            "og:description": undefined,
            "og:url": undefined,
            "og:image": undefined,
            "og:image:width": undefined,
            "og:image:height": undefined,
            "og:locale": undefined,
            "og:logo": undefined,
            "twitter:title": undefined,
            "twitter:description": undefined,
            "twitter:handle": undefined,
            "twitter:image": undefined,
            "twitter:site": undefined,
            "twitter:url": undefined,
            "twitter:card": undefined,
            noindex: undefined,
            nofollow: undefined,
            "jsonld:breadcrumb": undefined,
            logo: undefined,
            keywords: undefined,
            tags: undefined
        },
        content: transformedContent
    };
}

function parseFrontmatter(mdContent: string): { data: ParsedFrontmatter; content: string } {
    const { data, content } = grayMatter(mdContent);
    return { data: data as ParsedFrontmatter, content };
}

function isExternalUrl(url: string): boolean {
    return url.startsWith("http:") || url.startsWith("https:") || url.startsWith("mailto:") || url.startsWith("tel:");
}

function markReferencedAssets({ content }: { content: string }): string {
    const transformedContent = content.replaceAll(
        /src=["']([^"']+)["']/g,
        (original: string, srcPath: string): string => {
            if (isExternalUrl(srcPath)) {
                return original;
            }

            if (srcPath.startsWith("/")) {
                const relativePath = RelativeFilePath.of(srcPath.substring(1));
                return `src="${relativePath}"`;
            }

            return original;
        }
    );
    return transformedContent;
}
