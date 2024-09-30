import grayMatter from "gray-matter";
import { MintlifyFrontmatter } from "./mintlify";
import { readFile } from "fs/promises";
import { FernRegistry as CjsFdrSdk } from "@fern-fern/fdr-cjs-sdk";
import { AbsoluteFilePath, dirname, join, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import { FernDocsBuilder } from "@fern-api/docs-importer-commons";

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

    let transformedContent = markReferencedAssets({
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
            image: data["og:image"] as any,
            slug
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
