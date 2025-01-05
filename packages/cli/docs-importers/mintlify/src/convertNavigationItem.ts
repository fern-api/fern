import { docsYml } from "@fern-api/configuration";
import { isNonNullish } from "@fern-api/core-utils";
import { FernDocsBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, dirname, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { convertMarkdown } from "./convertMarkdown";
import { MintNavigationItem } from "./mintlify";

export declare namespace convertNavigationItem {
    interface Args {
        absolutePathToMintJson: AbsoluteFilePath;
        builder: FernDocsBuilder;
        context: TaskContext;
        item: MintNavigationItem;
    }
}

export async function convertNavigationItem({
    absolutePathToMintJson,
    item,
    builder,
    context
}: convertNavigationItem.Args): Promise<docsYml.RawSchemas.NavigationItem | undefined> {
    const section: docsYml.RawSchemas.SectionConfiguration = {
        section: item.group,
        contents: (
            await Promise.all(
                item.pages.map(async (item): Promise<docsYml.RawSchemas.NavigationItem | undefined> => {
                    if (typeof item === "string") {
                        const relativeFilepathFromRoot = RelativeFilePath.of(
                            item.endsWith("mdx") ? item : `${item}.mdx`
                        );

                        const absoluteFilepathToMarkdown = join(
                            dirname(absolutePathToMintJson),
                            relativeFilepathFromRoot
                        );

                        // Ensure the file exists before we convert it
                        const fileExists = await doesPathExist(absoluteFilepathToMarkdown);

                        // If we return undefined then we will filter out the page from the section below
                        if (!fileExists) {
                            return undefined;
                        }

                        const convertedMarkdown = await convertMarkdown({
                            absolutePathToMintJson,
                            relativeFilepathFromRoot,
                            absoluteFilepathToMarkdown,
                            builder
                        });

                        if (convertedMarkdown.mintlifyFrontmatter.openapi != null) {
                            return undefined;
                        }

                        builder.addMarkdownPage({
                            frontmatter: convertedMarkdown.frontmatter,
                            markdown: convertedMarkdown.content,
                            relativeFilePathFromDocsYml: relativeFilepathFromRoot
                        });
                        return {
                            page: convertedMarkdown.sidebarTitle ?? "",
                            path: relativeFilepathFromRoot
                        };
                    } else {
                        return await convertNavigationItem({ absolutePathToMintJson, item, builder, context });
                    }
                })
            )
        ).filter(isNonNullish)
    };
    return section;
}
