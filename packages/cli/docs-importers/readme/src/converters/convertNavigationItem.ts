import { docsYml } from "@fern-api/configuration";
import { isNonNullish } from "@fern-api/core-utils";
import { FernDocsBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { convertMarkdown } from "../converters/convertMarkdown";
import { scrapedNavigationGroup } from "../types/scrapedNavigation";

export declare namespace convertNavigationItem {
    interface Args {
        absolutePathToOutput: AbsoluteFilePath;
        builder: FernDocsBuilder;
        context: TaskContext;
        item: scrapedNavigationGroup;
    }
}

export async function convertNavigationItem({
    absolutePathToOutput,
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

                        const absoluteFilepathToMarkdown = join(absolutePathToOutput, relativeFilepathFromRoot);
                        const fileExists = await doesPathExist(absolutePathToOutput);
                        if (!fileExists) {
                            return undefined;
                        }

                        const convertedMarkdown = await convertMarkdown({
                            relativeFilepathFromRoot,
                            absoluteFilepathToMarkdown
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
                            icon: convertedMarkdown.mintlifyFrontmatter.icon,
                            path: relativeFilepathFromRoot
                        };
                    } else {
                        return await convertNavigationItem({ absolutePathToOutput, item, builder, context });
                    }
                })
            )
        ).filter(isNonNullish)
    };
    return section;
}
