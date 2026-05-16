import { stripLeadingSlash } from "@fern-api/core-utils";
import {
    DEFAULT_LAYOUT,
    DocsImporter,
    FernDocsBuilder,
    FernDocsNavigationBuilder,
    TabInfo
} from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";

import { convertColors } from "./convertColors.js";
import { convertLogo } from "./convertLogo.js";
import { convertNavigationItem } from "./convertNavigationItem.js";
import { MintJsonSchema, MintNavigationItem } from "./mintlify.js";
import { convertInstanceName } from "./utils/convertInstanceName.js";
import { getTabForMintItem } from "./utils/getTabForMintItem.js";

export declare namespace MintlifyImporter {
    interface Args {
        absolutePathToMintJson: AbsoluteFilePath;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isMintJsonSchema(value: unknown): value is MintJsonSchema {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.name === "string" &&
        typeof value.favicon === "string" &&
        isRecord(value.colors) &&
        typeof value.colors.primary === "string" &&
        Array.isArray(value.navigation) &&
        (value.openapi == null || typeof value.openapi === "string" || isStringArray(value.openapi)) &&
        (value.tabs == null || Array.isArray(value.tabs)) &&
        (value.anchors == null || Array.isArray(value.anchors))
    );
}

export class MintlifyImporter extends DocsImporter<MintlifyImporter.Args> {
    private documentationTab: TabInfo | undefined = undefined;
    private tabUrlToInfo: Record<string, TabInfo> = {};

    public async import({ args, builder }: { args: MintlifyImporter.Args; builder: FernDocsBuilder }): Promise<void> {
        const mintJsonContent = await readFile(args.absolutePathToMintJson, "utf-8");
        const mint = this.parseMintJson({
            content: mintJsonContent,
            absolutePathToMintJson: args.absolutePathToMintJson
        });

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

        builder.setLayout({ layout: DEFAULT_LAYOUT });

        if (mint.tabs != null) {
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
        } else if (mint.anchors != null) {
            for (const anchor of mint.anchors) {
                if ("url" in anchor && anchor.url != null && anchor.url.startsWith("https://")) {
                    this.tabUrlToInfo[anchor.url] = {
                        name: anchor.name,
                        url: anchor.url,
                        navigationBuilder: builder.getNavigationBuilder({
                            tabId: anchor.name,
                            tabConfig: { href: anchor.url, displayName: anchor.name }
                        })
                    };
                } else if ("url" in anchor && anchor.url != null) {
                    this.tabUrlToInfo[anchor.url] = {
                        name: anchor.name,
                        url: anchor.url,
                        navigationBuilder: builder.getNavigationBuilder({
                            tabId: anchor.url,
                            tabConfig: { slug: anchor.url, displayName: anchor.name }
                        })
                    };
                }
            }
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
                relativePathToOpenAPI: RelativeFilePath.of(stripLeadingSlash(mint.openapi)),
                absolutePathToOpenAPI
            });
        } else if (mint.openapi != null) {
            for (const openapi of mint.openapi) {
                const absolutePathToOpenAPI = join(
                    dirname(args.absolutePathToMintJson),
                    RelativeFilePath.of(stripLeadingSlash(openapi))
                );
                builder.addOpenAPI({
                    relativePathToOpenAPI: RelativeFilePath.of(stripLeadingSlash(openapi)),
                    absolutePathToOpenAPI
                });
            }
        } else if (mint.anchors != null) {
            for (const anchor of mint.anchors) {
                if ("openapi" in anchor && anchor.openapi != null) {
                    const absolutePathToOpenAPI = join(
                        dirname(args.absolutePathToMintJson),
                        RelativeFilePath.of(stripLeadingSlash(anchor.openapi))
                    );
                    builder.addOpenAPI({
                        relativePathToOpenAPI: RelativeFilePath.of(stripLeadingSlash(anchor.openapi)),
                        absolutePathToOpenAPI
                    });
                }
            }
        }
        this.context.logger.debug("Imported OpenAPI specs");

        const instanceUrl = builder.setInstance({
            companyName: convertInstanceName(mint.name)
        });
        this.context.logger.debug(`Added instance ${instanceUrl} to docs.yml`);
    }

    private parseMintJson({
        content,
        absolutePathToMintJson
    }: {
        content: string;
        absolutePathToMintJson: AbsoluteFilePath;
    }): MintJsonSchema {
        let mintJson: unknown;
        try {
            mintJson = JSON.parse(content) as unknown;
        } catch (error) {
            return this.context.failAndThrow(`Failed to parse ${absolutePathToMintJson}.`, error, {
                code: CliError.Code.ParseError
            });
        }

        if (!isRecord(mintJson) || !Array.isArray(mintJson.navigation)) {
            return this.context.failAndThrow("Expected navigation in mint.json to be an array.", undefined, {
                code: CliError.Code.ConfigError
            });
        }

        if (!isMintJsonSchema(mintJson)) {
            return this.context.failAndThrow(
                "Expected mint.json to include name, favicon, colors.primary, and valid navigation settings.",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }

        return mintJson;
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
                return this.context.failAndThrow(
                    `Failed to assign navigation item to a tab group: ${mintItem.group}`,
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
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
