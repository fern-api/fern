import { readFile } from "fs/promises";

import { stripLeadingSlash } from "@fern-api/core-utils";
import { DocsImporter, FernDocsNavigationBuilder } from "@fern-api/docs-importer-commons";
import { FernDocsBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, dirname, join } from "@fern-api/fs-utils";

import { convertColors } from "./convertColors";
import { convertLogo } from "./convertLogo";
import { convertNavigationItem } from "./convertNavigationItem";
import { MintJsonSchema, MintNavigationItem } from "./mintlify";
import { getTabForMintItem } from "./utils/getTabForMintItem";

export declare namespace MintlifyImporter {
    interface Args {
        absolutePathToMintJson: AbsoluteFilePath;
    }
}

interface TabInfo {
    name: string;
    url: string;
    navigationBuilder: FernDocsNavigationBuilder;
}

export class MintlifyImporter extends DocsImporter<MintlifyImporter.Args> {
    private documentationTab: TabInfo | undefined = undefined;
    private tabUrlToInfo: Record<string, TabInfo> = {};

    public async import({ args, builder }: { args: MintlifyImporter.Args; builder: FernDocsBuilder }): Promise<void> {
        const mintJsonContent = await readFile(args.absolutePathToMintJson, "utf-8");
        const mint = JSON.parse(mintJsonContent) as MintJsonSchema;

        builder.setTitle({ title: mint.name });

        const relativePathToFavicon = RelativeFilePath.of(mint.favicon.substring(1));
        builder.setFavicon({ favicon: relativePathToFavicon });
        builder.addAsset({
            absoluteFilePathToAsset: join(dirname(args.absolutePathToMintJson), relativePathToFavicon),
            relativeFilePathFromDocsYml: relativePathToFavicon
        });

        const logo = convertLogo({ logo: mint.logo, builder, absolutePathToMintJson: args.absolutePathToMintJson });
        if (logo != null) {
            builder.setLogo({ logo });
        }
        this.context.logger.debug("Converted logo");

        const colors = convertColors(mint.colors);
        if (colors != null) {
            builder.setColors({ colors });
        }
        this.context.logger.debug("Converted color configuration");

        for (const tab of mint.tabs ?? []) {
            this.tabUrlToInfo[tab.url] = {
                name: tab.name,
                url: tab.url,
                navigationBuilder: builder.getNavigationBuilder({
                    tabId: tab.url,
                    tabConfig: { slug: tab.url, displayName: tab.name }
                })
            };
        }

        for (const mintItem of mint.navigation) {
            const section = await convertNavigationItem({
                absolutePathToMintJson: args.absolutePathToMintJson,
                item: mintItem,
                builder,
                context: this.context
            });
            const nav = await this.getNavigationBuilder({ mintItem, builder });
            if (section != null) {
                nav.addItem({ item: section });
            }
        }
        this.context.logger.debug("Converted navigation");

        if (typeof mint.openapi === "string") {
            const absolutePathToOpenAPI = join(
                dirname(args.absolutePathToMintJson),
                RelativeFilePath.of(stripLeadingSlash(mint.openapi))
            );
            builder.addOpenAPI({
                absolutePathToOpenAPI
            });
        } else if (mint.openapi != null) {
            for (const openapi of mint.openapi) {
                const absolutePathToOpenAPI = join(
                    dirname(args.absolutePathToMintJson),
                    RelativeFilePath.of(stripLeadingSlash(openapi))
                );
                builder.addOpenAPI({
                    absolutePathToOpenAPI
                });
            }
        }
        this.context.logger.debug("Imported OpenAPI specs");

        // We're currently setting one instance so that clients can generate docs out of the box,
        // but they'll have the option to add additional instances and custom domains later.
        const instanceUrl = builder.setInstance({
            companyName: mint.name
        });
        this.context.logger.debug(`Added instance ${instanceUrl} to docs.yml`);
    }

    private async getNavigationBuilder({
        mintItem,
        builder
    }: {
        mintItem: MintNavigationItem;
        builder: FernDocsBuilder;
    }): Promise<FernDocsNavigationBuilder> {
        if (Object.keys(this.tabUrlToInfo).length > 0) {
            const tabUrl = getTabForMintItem({ mintItem });
            if (tabUrl == null) {
                return this.context.failAndThrow(`Failed to assign navigation item to a tab group: ${mintItem.group}`);
            }
            const tab = this.tabUrlToInfo[tabUrl] ?? this.getDefaultDocumentationTab(builder);
            return tab.navigationBuilder;
        }
        return builder.getNavigationBuilder();
    }

    private getDefaultDocumentationTab(builder: FernDocsBuilder): TabInfo {
        if (this.documentationTab == null) {
            this.documentationTab = {
                name: "Documentation",
                url: "documentation",
                navigationBuilder: builder.getNavigationBuilder({
                    tabId: "documentation",
                    tabConfig: { displayName: "Documentation", slug: "documentation" }
                })
            };
        }
        return this.documentationTab;
    }
}
