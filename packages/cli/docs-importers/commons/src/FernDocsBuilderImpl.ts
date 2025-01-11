import { cp, mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { DOCS_CONFIGURATION_FILENAME, FERN_DIRECTORY, docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath, dirname, join } from "@fern-api/fs-utils";

import { FernRegistry as CjsFdrSdk } from "@fern-fern/fdr-cjs-sdk";

import { FernDocsBuilder, FernDocsNavigationBuilder } from "./FernDocsBuilder";

interface MarkdownPage {
    frontmatter: CjsFdrSdk.docs.latest.Frontmatter;
    markdown: string;
}

interface Asset {
    absoluteFilePathToAsset: AbsoluteFilePath;
}

export class FernDocsBuilderImpl extends FernDocsBuilder {
    private absolutePathsToOpenAPI: AbsoluteFilePath[] = [];
    private nonTabbedNavigation: NonTabbedNavigationBuilderImpl = new NonTabbedNavigationBuilderImpl();
    private tabbedNavigation: Record<docsYml.RawSchemas.TabId, TabbedNavigationBuilderImpl> = {};
    private markdownPages: Record<RelativeFilePath, MarkdownPage> = {};
    private assets: Record<RelativeFilePath, Asset> = {};
    private docsYml: docsYml.RawSchemas.DocsConfiguration = {
        instances: []
    };

    public addOpenAPI({ absolutePathToOpenAPI }: { absolutePathToOpenAPI: AbsoluteFilePath }): void {
        this.absolutePathsToOpenAPI.push(absolutePathToOpenAPI);
    }

    public addMarkdownPage({
        frontmatter,
        markdown,
        relativeFilePathFromDocsYml
    }: {
        frontmatter: CjsFdrSdk.docs.latest.Frontmatter;
        markdown: string;
        relativeFilePathFromDocsYml: RelativeFilePath;
    }): void {
        this.markdownPages[relativeFilePathFromDocsYml] = { markdown, frontmatter };
    }

    public addAsset({
        absoluteFilePathToAsset,
        relativeFilePathFromDocsYml
    }: {
        absoluteFilePathToAsset: AbsoluteFilePath;
        relativeFilePathFromDocsYml: RelativeFilePath;
    }): void {
        this.assets[relativeFilePathFromDocsYml] = { absoluteFilePathToAsset };
    }

    public getNavigationBuilder(args?: {
        tabId: string;
        tabConfig: docsYml.RawSchemas.TabConfig;
    }): FernDocsNavigationBuilder {
        if (args != null) {
            let navigationBuilder = this.tabbedNavigation[args.tabId];
            if (navigationBuilder == null) {
                navigationBuilder = new TabbedNavigationBuilderImpl(args.tabId, args.tabConfig);
                this.tabbedNavigation[args.tabId] = navigationBuilder;
            }
            return navigationBuilder;
        }
        return this.nonTabbedNavigation;
    }

    public addVersion({
        versionConfig,
        navigation
    }: {
        versionConfig: docsYml.RawSchemas.VersionConfig;
        navigation: docsYml.RawSchemas.VersionFileConfig;
    }): void {
        throw new Error("Method not implemented.");
    }

    public addNavbarLink({ link }: { link: docsYml.RawSchemas.NavbarLink }): void {
        if (this.docsYml.navbarLinks == null) {
            this.docsYml.navbarLinks = [link];
        }
        this.docsYml.navbarLinks.push(link);
    }

    public setTitle({ title }: { title: string }): void {
        this.docsYml.title = title;
    }

    public setFavicon({ favicon }: { favicon: RelativeFilePath }): void {
        this.docsYml.favicon = favicon;
    }

    public setLogo({ logo }: { logo: docsYml.RawSchemas.LogoConfiguration }): void {
        this.docsYml.logo = logo;
    }

    public setColors({ colors }: { colors: docsYml.RawSchemas.ColorsConfiguration }): void {
        this.docsYml.colors = colors;
    }

    public setLayout({ layout }: { layout: docsYml.RawSchemas.LayoutConfig }): void {
        this.docsYml.layout = layout;
    }

    public async build({ outputDirectory }: { outputDirectory: AbsoluteFilePath }): Promise<void> {
        const absolutePathToFernDirectory = join(outputDirectory, RelativeFilePath.of(FERN_DIRECTORY));
        await mkdir(absolutePathToFernDirectory, { recursive: true });

        if (Object.keys(this.tabbedNavigation).length > 0) {
            this.docsYml.tabs = Object.fromEntries(
                Object.entries(this.tabbedNavigation).map(([key, value]) => {
                    return [value.tabId, value.tabConfig];
                })
            );
            const tabbedNavigationItems: docsYml.RawSchemas.TabbedNavigationItem[] = [];
            Object.entries(this.tabbedNavigation).forEach(([_, value]) => {
                const tabbedItem: docsYml.RawSchemas.TabbedNavigationItem = {
                    tab: value.tabId,
                    layout: value.items
                };
                tabbedNavigationItems.push(tabbedItem);
            });
            this.docsYml.navigation = tabbedNavigationItems;
        } else if (this.nonTabbedNavigation != null) {
            this.docsYml.navigation = this.nonTabbedNavigation.items;
        }

        const absoluteFilePathToDocsYml = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
        );
        await writeFile(absoluteFilePathToDocsYml, yaml.dump(this.docsYml));

        await Promise.all(
            Object.entries(this.markdownPages).map(async ([filepath, page]) => {
                const absoluteFilepathToMarkdownPage = join(absolutePathToFernDirectory, RelativeFilePath.of(filepath));
                await mkdir(dirname(absoluteFilepathToMarkdownPage), { recursive: true });
                const frontmatter =
                    Object.keys(page.frontmatter).length > 0
                        ? `---\n${yaml.dump(JSON.parse(JSON.stringify(page.frontmatter)))}---\n\n`
                        : "";
                await writeFile(absoluteFilepathToMarkdownPage, `${frontmatter}${page.markdown}`);
            })
        );

        await Promise.all(
            Object.entries(this.assets).map(async ([filepath, asset]) => {
                const absolutePathToAsset = join(absolutePathToFernDirectory, RelativeFilePath.of(filepath));
                await mkdir(dirname(absolutePathToAsset), { recursive: true });
                await cp(asset.absoluteFilePathToAsset, absolutePathToAsset);
            })
        );
    }

    public setInstance({ companyName }: { companyName: string }): string {
        // We may append a suffix to the company name string to make it harder for
        // other companies to build migrators for our docs. For now, we're not doing
        // so but we can add that easily in the future.
        const formattedCompanyString = companyName.toLowerCase().replace(" ", "-");

        const fernDocsUrl = `https://${formattedCompanyString}.docs.buildwithfern.com`;

        this.docsYml.instances.push({
            url: fernDocsUrl
        });

        return fernDocsUrl;
    }
}

export class TabbedNavigationBuilderImpl implements FernDocsNavigationBuilder {
    public items: docsYml.RawSchemas.NavigationItem[] = [];

    public constructor(
        public readonly tabId: docsYml.RawSchemas.TabId,
        public readonly tabConfig: docsYml.RawSchemas.TabConfig
    ) {}

    public addItem({ item }: { item: docsYml.RawSchemas.NavigationItem }): void {
        this.items.push(item);
    }
}

export class NonTabbedNavigationBuilderImpl implements FernDocsNavigationBuilder {
    public items: docsYml.RawSchemas.NavigationItem[] = [];

    public addItem({ item }: { item: docsYml.RawSchemas.NavigationItem }): void {
        this.items.push(item);
    }
}
