import { docsYml } from "@fern-api/configuration";
import { FernRegistry as CjsFdrSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

/**
 * A builder utility to help
 */
export abstract class FernDocsBuilder {
    public abstract addOpenAPI({
        relativePathToOpenAPI,
        absolutePathToOpenAPI
    }: {
        relativePathToOpenAPI: RelativeFilePath;
        absolutePathToOpenAPI: AbsoluteFilePath;
    }): void;

    public abstract addMarkdownPage({
        frontmatter,
        markdown,
        relativeFilePathFromDocsYml
    }: {
        frontmatter: CjsFdrSdk.docs.latest.Frontmatter;
        markdown: string;
        relativeFilePathFromDocsYml: RelativeFilePath;
    }): void;

    public abstract addAsset({
        absoluteFilePathToAsset,
        relativeFilePathFromDocsYml
    }: {
        absoluteFilePathToAsset: AbsoluteFilePath;
        relativeFilePathFromDocsYml: RelativeFilePath;
    }): void;

    public abstract addVersion({
        versionConfig,
        navigation
    }: {
        versionConfig: docsYml.RawSchemas.VersionConfig;
        navigation: docsYml.RawSchemas.VersionFileConfig;
    }): void;

    public abstract getNavigationBuilder(args?: {
        tabId: docsYml.RawSchemas.TabId;
        tabConfig: docsYml.RawSchemas.TabConfig;
    }): FernDocsNavigationBuilder;

    public abstract addNavbarLink({ link }: { link: docsYml.RawSchemas.NavbarLink }): void;

    public abstract setTitle({ title }: { title: string }): void;

    public abstract setFavicon({ favicon }: { favicon: RelativeFilePath }): void;

    public abstract setLogo({ logo }: { logo: docsYml.RawSchemas.LogoConfiguration }): void;

    public abstract setColors({ colors }: { colors: docsYml.RawSchemas.ColorsConfiguration }): void;

    public abstract setLayout({ layout }: { layout: docsYml.RawSchemas.LayoutConfig }): void;

    public abstract build({ outputDirectory }: { outputDirectory: AbsoluteFilePath }): void;

    public abstract setInstance({ companyName }: { companyName: string }): string;
}

export abstract class FernDocsNavigationBuilder {
    public abstract addItem({ item }: { item: docsYml.RawSchemas.NavigationItem }): void;
}
