import { readFile } from "fs/promises";
import grayMatter from "gray-matter";

import { FernDocsBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, dirname, join, relativize } from "@fern-api/fs-utils";

import { FernRegistry as CjsFdrSdk, FernRegistry } from "@fern-fern/fdr-cjs-sdk";

import { MintlifyFrontmatter } from "./mintlify";

export declare namespace convertMarkdown {
    interface Args {
        absolutePathToMintJson: AbsoluteFilePath;
        absoluteFilepathToMarkdown: AbsoluteFilePath;
        relativeFilepathFromRoot: RelativeFilePath;
        builder: FernDocsBuilder;
    }

    interface Return {
        mintlifyFrontmatter: MintlifyFrontmatter;
        relativeFilepathFromRoot: RelativeFilePath;
        frontmatter: CjsFdrSdk.docs.latest.Frontmatter;
        sidebarTitle: string | undefined;
        content: string;
    }
}

export async function convertMarkdown({
    absolutePathToMintJson,
    absoluteFilepathToMarkdown,
    relativeFilepathFromRoot,
    builder
}: convertMarkdown.Args): Promise<convertMarkdown.Return> {
    const text = await readFile(absoluteFilepathToMarkdown, "utf-8");
    const { data, content } = parseMintlifyFrontmatter(text);
    const slug = relativeFilepathFromRoot.replace(/\.(md|mdx)$/, "");

    const transformedContent = markReferencedAssets({
        absolutePathToMintJson,
        absoluteFilepathToMarkdown,
        content,
        builder
    });

    return {
        mintlifyFrontmatter: data,
        relativeFilepathFromRoot,
        sidebarTitle: data.sidebarTitle ?? data.title,
        frontmatter: {
            title: data.title,
            subtitle: data.description,
            layout: data.mode != null ? "reference" : undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            "jsonld:breadcrumb": undefined
        },
        content: transformedContent
    };
}

function parseMintlifyFrontmatter(mdContent: string): { data: MintlifyFrontmatter; content: string } {
    const { data, content } = grayMatter(mdContent);
    return { data: data as MintlifyFrontmatter, content };
}

function isExternalUrl(url: string): boolean {
    return url.startsWith("http:") || url.startsWith("https:") || url.startsWith("mailto:") || url.startsWith("tel:");
}

function markReferencedAssets({
    absolutePathToMintJson,
    absoluteFilepathToMarkdown,
    content,
    builder
}: {
    absolutePathToMintJson: AbsoluteFilePath;
    absoluteFilepathToMarkdown: AbsoluteFilePath;
    content: string;
    builder: FernDocsBuilder;
}): string {
    const transformedContent = content.replaceAll(
        /src=["']([^"']+)["']/g,
        (original: string, srcPath: string): string => {
            if (isExternalUrl(srcPath)) {
                return original;
            }

            if (srcPath.startsWith("/")) {
                const relativePath = RelativeFilePath.of(srcPath.substring(1));
                const absoluteFilePathToAsset = join(dirname(absolutePathToMintJson), relativePath);
                builder.addAsset({
                    absoluteFilePathToAsset,
                    relativeFilePathFromDocsYml: relativePath
                });
                return `src="${relativePath}"`;
            }

            return original;
        }
    );
    return transformedContent;
}
