import { z } from "zod";

// ===== Simple type aliases =====

const TabId = z.string();

const ChangelogFolderRelativePath = z.string();

const AudienceId = z.string();

const RoleId = z.string();

const LibraryName = z.string();

// ===== Enums =====

const ProgrammingLanguage = z.enum([
    "typescript",
    "javascript",
    "python",
    "java",
    "go",
    "ruby",
    "csharp",
    "php",
    "swift",
    "rust",
    "nodets",
    "nodejs",
    "dotnet",
    "curl",
    "jvm",
    "ts",
    "js"
]);

const Language = z.enum(["en", "es", "fr", "de", "it", "pt", "ja", "zh", "ko", "el", "no", "pl", "ru", "sv", "tr"]);

const PageActionOption = z.enum(["copy-page", "view-as-markdown", "ask-ai", "chatgpt", "claude", "cursor", "vscode"]);

const AIChatLocation = z.enum(["docs", "slack", "discord"]);

const AIChatModel = z.enum(["claude-3.7", "claude-4", "command-a"]);

const EditThisPageLaunch = z.enum(["github", "dashboard"]);

const Availability = z.enum(["stable", "generally-available", "in-development", "pre-release", "deprecated", "beta"]);

const VersionAvailability = z.enum(["deprecated", "ga", "stable", "beta"]);

const TitleSource = z.enum(["frontmatter", "filename"]);

const LibraryLanguage = z.enum(["python", "cpp"]);

const FontStyle = z.enum(["normal", "italic"]);

const FontDisplay = z.enum(["auto", "block", "swap", "fallback", "optional"]);

const SearchbarPlacement = z.enum(["header", "header-tabs", "sidebar"]);

const TabsPlacement = z.enum(["header", "sidebar"]);

const SwitcherPlacement = z.enum(["header", "sidebar"]);

const ContentAlignment = z.enum(["center", "left"]);

const HeaderPosition = z.enum(["fixed", "static"]);

const ProductSwitcherThemeConfig = z.enum(["default", "toggle"]);

const LanguageSwitcherThemeConfig = z.enum(["default", "minimal"]);

const FooterNavThemeConfig = z.enum(["default", "minimal"]);

const TabsThemeConfig = z.enum(["default", "bubble"]);

const BodyThemeConfig = z.enum(["default", "canvas"]);

const SidebarThemeConfig = z.enum(["default", "minimal"]);

const PageActionsThemeConfig = z.enum(["default", "toolbar"]);

const HttpSnippetLanguage = z.enum([
    "curl",
    "csharp",
    "go",
    "java",
    "javascript",
    "php",
    "python",
    "ruby",
    "swift",
    "typescript"
]);

const Target = z.enum(["_blank", "_self", "_parent", "_top"]);

const TwitterCardSetting = z.enum(["summary", "summary_large_image", "app", "player"]);

const JsScriptStrategy = z.enum(["beforeInteractive", "afterInteractive", "lazyOnload"]);

// ===== Simple undiscriminated unions =====

const FontWeight = z.union([z.string(), z.number().int()]);

const ColorThemedConfig = z.object({
    dark: z.string().optional(),
    light: z.string().optional()
});

const ColorConfig = z.union([z.string(), ColorThemedConfig]);

const Audience = z.union([AudienceId, z.array(AudienceId)]);

const Role = z.union([RoleId, z.array(RoleId)]);

const CustomDomain = z.union([z.string(), z.array(z.string())]);

const HttpSnippetsConfig = z.union([z.boolean(), z.array(HttpSnippetLanguage)]);

const BackgroundImageThemedConfig = z.object({
    dark: z.string().optional(),
    light: z.string().optional()
});

const BackgroundImageConfiguration = z.union([z.string(), BackgroundImageThemedConfig]);

const CssConfig = z.union([z.string(), z.array(z.string())]);

// ===== Base/mixin schemas =====

const WithPermissions = z.object({
    viewers: Role.optional(),
    orphaned: z.boolean().optional()
});

const FeatureFlag = z.object({
    flag: z.string(),
    "fallback-value": z.unknown().optional(),
    match: z.unknown().optional()
});

const FeatureFlagConfiguration = z.union([z.string(), FeatureFlag, z.array(FeatureFlag)]);

const WithFeatureFlags = z.object({
    "feature-flag": FeatureFlagConfiguration.optional()
});

const WithViewers = z.object({
    viewers: Role.optional()
});

// ===== Analytics schemas =====

const SegmentConfig = z.object({
    "write-key": z.string()
});

const FullStoryAnalyticsConfig = z.object({
    "org-id": z.string()
});

const IntercomConfig = z.object({
    "app-id": z.string(),
    "api-base": z.string().optional()
});

const PostHogConfig = z.object({
    "api-key": z.string(),
    endpoint: z.string().optional()
});

const GTMConfig = z.object({
    "container-id": z.string()
});

const GoogleAnalytics4Config = z.object({
    "measurement-id": z.string()
});

const AnalyticsConfig = z.object({
    segment: SegmentConfig.optional(),
    fullstory: FullStoryAnalyticsConfig.optional(),
    intercom: IntercomConfig.optional(),
    posthog: PostHogConfig.optional(),
    gtm: GTMConfig.optional(),
    ga4: GoogleAnalytics4Config.optional()
});

// ===== AI schemas =====

const AiExamplesConfig = z.object({
    enabled: z.boolean().optional(),
    style: z.string().optional()
});

const AIChatWebsiteDatasource = z.object({
    url: z.string(),
    title: z.string().optional()
});

const AIChatDatasource = AIChatWebsiteDatasource;

const AIChatConfig = z.object({
    model: AIChatModel.optional(),
    "system-prompt": z.string().optional(),
    location: z.array(AIChatLocation).optional(),
    datasources: z.array(AIChatDatasource).optional()
});

// ===== Font schemas =====

const FontConfigVariant = z.object({
    path: z.string(),
    weight: FontWeight.optional(),
    style: FontStyle.optional()
});

const FontConfigPath = z.union([z.string(), FontConfigVariant]);

const FontConfig = z.object({
    name: z.string().optional(),
    path: z.string().optional(),
    weight: FontWeight.optional(),
    style: FontStyle.optional(),
    paths: z.array(FontConfigPath).optional(),
    display: FontDisplay.optional(),
    fallback: z.array(z.string()).optional(),
    "font-variation-settings": z.string().optional()
});

// ===== Typography =====

const DocsTypographyConfig = z.object({
    headingsFont: FontConfig.optional(),
    bodyFont: FontConfig.optional(),
    codeFont: FontConfig.optional()
});

// ===== Theme schemas =====

const ThemeConfig = z.object({
    sidebar: SidebarThemeConfig.optional(),
    body: BodyThemeConfig.optional(),
    tabs: TabsThemeConfig.optional(),
    "page-actions": PageActionsThemeConfig.optional(),
    "footer-nav": FooterNavThemeConfig.optional(),
    "language-switcher": LanguageSwitcherThemeConfig.optional(),
    "product-switcher": ProductSwitcherThemeConfig.optional()
});

// ===== Layout schemas =====

const LayoutConfig = z.object({
    "page-width": z.string().optional(),
    "content-width": z.string().optional(),
    "sidebar-width": z.string().optional(),
    "header-height": z.string().optional(),
    "searchbar-placement": SearchbarPlacement.optional(),
    "tabs-placement": TabsPlacement.optional(),
    "switcher-placement": SwitcherPlacement.optional(),
    "content-alignment": ContentAlignment.optional(),
    "header-position": HeaderPosition.optional(),
    "disable-header": z.boolean().optional(),
    "hide-nav-links": z.boolean().optional(),
    "hide-feedback": z.boolean().optional()
});

// ===== Settings =====

const DocsSettingsConfig = z.object({
    "search-text": z.string().optional(),
    "disable-search": z.boolean().optional(),
    "dark-mode-code": z.boolean().optional(),
    "default-search-filters": z.boolean().optional(),
    "http-snippets": HttpSnippetsConfig.optional(),
    "hide-404-page": z.boolean().optional(),
    "use-javascript-as-typescript": z.boolean().optional(),
    "disable-explorer-proxy": z.boolean().optional(),
    "disable-analytics": z.boolean().optional(),
    language: Language.optional(),
    "folder-title-source": TitleSource.optional(),
    "substitute-env-vars": z.boolean().optional()
});

// ===== Colors =====

const ColorsConfiguration = z.object({
    "accent-primary": ColorConfig.optional(),
    accentPrimary: ColorConfig.optional(),
    background: ColorConfig.optional(),
    border: ColorConfig.optional(),
    "sidebar-background": ColorConfig.optional(),
    "header-background": ColorConfig.optional(),
    "card-background": ColorConfig.optional(),
    "accent-1": ColorConfig.optional(),
    "accent-2": ColorConfig.optional(),
    "accent-3": ColorConfig.optional(),
    "accent-4": ColorConfig.optional(),
    "accent-5": ColorConfig.optional(),
    "accent-6": ColorConfig.optional(),
    "accent-7": ColorConfig.optional(),
    "accent-8": ColorConfig.optional(),
    "accent-9": ColorConfig.optional(),
    "accent-10": ColorConfig.optional(),
    "accent-11": ColorConfig.optional(),
    "accent-12": ColorConfig.optional()
});

// ===== Page actions =====

const CustomPageAction = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    url: z.string(),
    icon: z.string().optional(),
    default: z.boolean().optional()
});

const PageActionOptions = z.object({
    "copy-page": z.boolean().optional(),
    "view-as-markdown": z.boolean().optional(),
    "ask-ai": z.boolean().optional(),
    chatgpt: z.boolean().optional(),
    claude: z.boolean().optional(),
    cursor: z.boolean().optional(),
    vscode: z.boolean().optional(),
    custom: z.array(CustomPageAction).optional()
});

const PageActionsConfig = z.object({
    default: PageActionOption.optional(),
    options: PageActionOptions.optional()
});

// ===== Edit this page =====

const GithubEditThisPageConfig = z.object({
    host: z.string().optional(),
    owner: z.string(),
    repo: z.string(),
    branch: z.string().optional()
});

const EditThisPageConfig = z.object({
    github: GithubEditThisPageConfig.optional(),
    launch: EditThisPageLaunch.optional()
});

// ===== Docs Instance =====

const DocsInstance = z.object({
    url: z.string(),
    "custom-domain": CustomDomain.optional(),
    private: z.boolean().optional(),
    "edit-this-page": EditThisPageConfig.optional(),
    audiences: Audience.optional()
});

// ===== Logo =====

const LogoConfiguration = z.object({
    dark: z.string().optional(),
    light: z.string().optional(),
    height: z.number().optional(),
    href: z.string().optional(),
    "right-text": z.string().optional()
});

// ===== Link =====

const LinkConfiguration = z.object({
    link: z.string(),
    href: z.string(),
    icon: z.string().optional(),
    target: Target.optional()
});

// ===== Snippets =====

const VersionedSnippetLanguageConfiguration = z.object({
    version: z.string(),
    package: z.string()
});

const SnippetLanguageConfiguration = z.union([z.string(), VersionedSnippetLanguageConfiguration]);

const SnippetsConfiguration = z.object({
    python: SnippetLanguageConfiguration.optional(),
    typescript: SnippetLanguageConfiguration.optional(),
    go: SnippetLanguageConfiguration.optional(),
    java: SnippetLanguageConfiguration.optional(),
    ruby: SnippetLanguageConfiguration.optional(),
    csharp: SnippetLanguageConfiguration.optional(),
    php: SnippetLanguageConfiguration.optional(),
    swift: SnippetLanguageConfiguration.optional(),
    rust: SnippetLanguageConfiguration.optional()
});

// ===== Playground =====

const PlaygroundButtonSettings = z.object({
    href: z.string().optional()
});

const PlaygroundSettings = z.object({
    hidden: z.boolean().optional(),
    environments: z.array(z.string()).optional(),
    button: PlaygroundButtonSettings.optional(),
    oauth: z.boolean().optional(),
    "limit-websocket-messages-per-connection": z.number().int().optional()
});

// ===== Announcement =====

const AnnouncementConfig = z.object({
    message: z.string()
});

// ===== Navbar =====

const NavbarLinkConfig = WithViewers.merge(
    z.object({
        href: z.string().optional(),
        target: Target.optional(),
        url: z.string().optional(),
        text: z.string().optional(),
        icon: z.string().optional(),
        rightIcon: z.string().optional(),
        rounded: z.boolean().optional()
    })
);

const NavbarGithubConfigWithOptions = WithViewers.merge(
    z.object({
        url: z.string(),
        target: Target.optional()
    })
);

const NavbarGithubConfig = z.union([z.string(), NavbarGithubConfigWithOptions]);

const NavbarDropdownConfig = WithViewers.merge(
    z.object({
        links: z.array(NavbarLinkConfig),
        text: z.string().optional(),
        icon: z.string().optional(),
        rightIcon: z.string().optional(),
        rounded: z.boolean().optional()
    })
);

const NavbarLink = z.union([
    NavbarLinkConfig.merge(z.object({ type: z.literal("filled") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("outlined") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("minimal") })),
    z.object({ type: z.literal("github"), value: NavbarGithubConfig }),
    NavbarDropdownConfig.merge(z.object({ type: z.literal("dropdown") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("primary") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("secondary") }))
]);

// ===== Footer links =====

const FooterLinksConfig = z.object({
    github: z.string().optional(),
    twitter: z.string().optional(),
    x: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    discord: z.string().optional(),
    slack: z.string().optional(),
    hackernews: z.string().optional(),
    medium: z.string().optional(),
    website: z.string().optional()
});

// ===== JS Config =====

const JsFileConfigSettings = z.object({
    path: z.string(),
    strategy: JsScriptStrategy.optional()
});

const JsFileConfig = z.union([z.string(), JsFileConfigSettings]);

const JsRemoteConfig = z.object({
    url: z.string(),
    strategy: JsScriptStrategy.optional()
});

const JsConfigOptions = z.union([JsRemoteConfig, JsFileConfig]);

const JsConfig = z.union([JsConfigOptions, z.array(JsConfigOptions)]);

// ===== Metadata =====

const MetadataConfig = z.object({
    "og:site_name": z.string().optional(),
    "og:title": z.string().optional(),
    "og:description": z.string().optional(),
    "og:url": z.string().optional(),
    "og:image": z.string().optional(),
    "og:image:width": z.number().optional(),
    "og:image:height": z.number().optional(),
    "og:locale": z.string().optional(),
    "og:logo": z.string().optional(),
    "twitter:title": z.string().optional(),
    "twitter:description": z.string().optional(),
    "twitter:handle": z.string().optional(),
    "twitter:image": z.string().optional(),
    "twitter:site": z.string().optional(),
    "twitter:url": z.string().optional(),
    "twitter:card": TwitterCardSetting.optional(),
    "canonical-host": z.string().optional()
});

// ===== Redirects =====

const RedirectConfig = z.object({
    source: z.string(),
    destination: z.string(),
    permanent: z.boolean().optional()
});

// ===== Integrations =====

const IntegrationsConfig = z.object({
    intercom: z.string().optional()
});

// ===== Experimental =====

const ExperimentalConfig = z.object({
    "mdx-components": z.array(z.string()).optional(),
    "disable-stream-toggle": z.boolean().optional(),
    "openapi-parser-v2": z.boolean().optional(),
    "openapi-parser-v3": z.boolean().optional(),
    "dynamic-snippets": z.boolean().optional(),
    "ai-examples": z.boolean().optional(),
    "ai-example-style-instructions": z.string().optional(),
    "exclude-apis": z.boolean().optional(),
    "basepath-aware": z.boolean().optional()
});

// ===== Library schemas =====

const GitLibraryInputSchema = z.object({
    git: z.string(),
    subpath: z.string().optional()
});

const PathLibraryInputSchema = z.object({
    path: z.string()
});

const LibraryInputConfiguration = z.union([GitLibraryInputSchema, PathLibraryInputSchema]);

const LibraryOutputConfiguration = z.object({
    path: z.string()
});

const LibraryConfiguration = z.object({
    input: LibraryInputConfiguration,
    output: LibraryOutputConfiguration,
    lang: LibraryLanguage
});

// ===== Page Configuration =====

const PageConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        page: z.string(),
        path: z.string(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        noindex: z.boolean().optional(),
        availability: Availability.optional()
    })
);

// ===== Changelog Configuration =====

const ChangelogConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        changelog: ChangelogFolderRelativePath,
        title: z.string().optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional()
    })
);

// ===== Library Reference Configuration =====

const LibraryReferenceConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        library: LibraryName,
        title: z.string().optional(),
        slug: z.string().optional()
    })
);

// ===== Folder Configuration =====

const FolderConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        folder: z.string(),
        title: z.string().optional(),
        "title-source": TitleSource.optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        "skip-slug": z.boolean().optional(),
        collapsed: z.boolean().optional(),
        collapsible: z.boolean().optional(),
        "collapsed-by-default": z.boolean().optional(),
        availability: Availability.optional()
    })
);

// ===== Recursive types: ApiReferenceLayoutItem =====

const ApiReferenceEndpointConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        endpoint: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        availability: Availability.optional(),
        playground: PlaygroundSettings.optional()
    })
);

const ApiReferenceOperationConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        operation: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        hidden: z.boolean().optional(),
        availability: Availability.optional()
    })
);

// Use z.lazy for recursive ApiReferenceLayoutItem
const ApiReferenceLayoutItem: z.ZodType<unknown> = z.lazy(() =>
    z.union([
        z.string(),
        z.record(z.string(), ApiReferencePackageConfiguration),
        ApiReferenceSectionConfiguration,
        ApiReferenceEndpointConfiguration,
        ApiReferenceOperationConfiguration,
        PageConfiguration,
        LinkConfiguration
    ])
);

const ApiReferenceSectionConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        section: z.string(),
        "referenced-packages": z.array(z.string()).optional(),
        summary: z.string().optional(),
        contents: z.array(ApiReferenceLayoutItem).optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        "skip-slug": z.boolean().optional(),
        collapsible: z.boolean().optional(),
        "collapsed-by-default": z.boolean().optional(),
        availability: Availability.optional(),
        playground: PlaygroundSettings.optional()
    })
);

const ApiReferencePackageConfigurationWithOptions = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        title: z.string().optional(),
        summary: z.string().optional(),
        contents: z.array(ApiReferenceLayoutItem).optional(),
        availability: Availability.optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        "skip-slug": z.boolean().optional(),
        playground: PlaygroundSettings.optional()
    })
);

const ApiReferencePackageConfiguration: z.ZodType<unknown> = z.lazy(() =>
    z.union([z.array(ApiReferenceLayoutItem), ApiReferencePackageConfigurationWithOptions])
);

// ===== API Reference Configuration =====

const ApiReferenceConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        api: z.string(),
        "api-name": z.string().optional(),
        openrpc: z.string().optional(),
        audiences: Audience.optional(),
        "display-errors": z.boolean().optional(),
        "tag-description-pages": z.boolean().optional(),
        snippets: SnippetsConfiguration.optional(),
        postman: z.string().optional(),
        summary: z.string().optional(),
        layout: z.array(ApiReferenceLayoutItem).optional(),
        collapsed: z.boolean().optional(),
        icon: z.string().optional(),
        slug: z.string().optional(),
        hidden: z.boolean().optional(),
        availability: Availability.optional(),
        "skip-slug": z.boolean().optional(),
        alphabetized: z.boolean().optional(),
        flattened: z.boolean().optional(),
        paginated: z.boolean().optional(),
        playground: PlaygroundSettings.optional()
    })
);

// ===== Recursive types: NavigationItem =====

// Use z.lazy for recursive NavigationItem
const NavigationItem: z.ZodType<unknown> = z.lazy(() =>
    z.union([
        PageConfiguration,
        SectionConfiguration,
        ApiReferenceConfiguration,
        LibraryReferenceConfiguration,
        LinkConfiguration,
        ChangelogConfiguration,
        FolderConfiguration
    ])
);

const SectionConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        section: z.string(),
        path: z.string().optional(),
        contents: z.array(NavigationItem),
        collapsed: z.boolean().optional(),
        collapsible: z.boolean().optional(),
        "collapsed-by-default": z.boolean().optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        "skip-slug": z.boolean().optional(),
        availability: Availability.optional()
    })
);

// ===== Navigation schemas =====

const UntabbedNavigationConfig = z.array(NavigationItem);

const TabVariant = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        icon: z.string().optional(),
        layout: z.array(NavigationItem),
        slug: z.string().optional(),
        "skip-slug": z.boolean().optional(),
        hidden: z.boolean().optional(),
        default: z.boolean().optional()
    })
);

const TabbedNavigationItemWithLayout = z.object({
    tab: TabId,
    layout: z.array(NavigationItem).optional()
});

const TabbedNavigationItemWithVariants = z.object({
    tab: TabId,
    variants: z.array(TabVariant)
});

const TabbedNavigationItem = z.union([TabbedNavigationItemWithLayout, TabbedNavigationItemWithVariants]);

const TabbedNavigationConfig = z.array(TabbedNavigationItem);

const NavigationConfig = z.union([UntabbedNavigationConfig, TabbedNavigationConfig]);

// ===== Tab Config =====

const TabConfig = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        "display-name": z.string(),
        icon: z.string().optional(),
        slug: z.string().optional(),
        "skip-slug": z.boolean().optional(),
        hidden: z.boolean().optional(),
        href: z.string().optional(),
        target: Target.optional(),
        changelog: ChangelogFolderRelativePath.optional()
    })
);

// ===== Version Config =====

const VersionConfig = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        "display-name": z.string(),
        path: z.string(),
        slug: z.string().optional(),
        availability: VersionAvailability.optional(),
        audiences: Audience.optional(),
        hidden: z.boolean().optional(),
        announcement: AnnouncementConfig.optional()
    })
);

const VersionFileConfig = z.object({
    tabs: z.record(TabId, TabConfig).optional(),
    "landing-page": PageConfiguration.optional(),
    navigation: NavigationConfig
});

// ===== Product schemas =====

const ProductConfigBase = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        "display-name": z.string(),
        subtitle: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        versions: z.array(VersionConfig).optional(),
        audiences: Audience.optional()
    })
);

const InternalProduct = ProductConfigBase.merge(
    z.object({
        path: z.string(),
        slug: z.string().optional(),
        announcement: AnnouncementConfig.optional()
    })
);

const ExternalProduct = ProductConfigBase.merge(
    z.object({
        href: z.string(),
        target: Target.optional()
    })
);

const ProductConfig = z.union([InternalProduct, ExternalProduct]);

const RelativeProductPath = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        "display-name": z.string(),
        path: z.string(),
        slug: z.string().optional()
    })
);

const AbsoluteProductPath = z.object({
    href: z.string()
});

const ProductPath = z.union([RelativeProductPath, AbsoluteProductPath]);

const ProductFileConfig = z.object({
    tabs: z.record(TabId, TabConfig).optional(),
    "landing-page": PageConfiguration.optional(),
    navigation: NavigationConfig
});

// ===== Main DocsConfiguration =====

const DocsConfiguration = z.object({
    instances: z.array(DocsInstance),
    title: z.string().optional(),
    libraries: z.record(LibraryName, LibraryConfiguration).optional(),
    analytics: AnalyticsConfig.optional(),
    announcement: AnnouncementConfig.optional(),
    roles: z.array(RoleId).optional(),
    tabs: z.record(TabId, TabConfig).optional(),
    versions: z.array(VersionConfig).optional(),
    products: z.array(ProductConfig).optional(),
    "landing-page": PageConfiguration.optional(),
    navigation: NavigationConfig.optional(),
    "navbar-links": z.array(NavbarLink).optional(),
    "footer-links": FooterLinksConfig.optional(),
    "page-actions": PageActionsConfig.optional(),
    experimental: ExperimentalConfig.optional(),
    "default-language": ProgrammingLanguage.optional(),
    languages: z.array(Language).optional(),
    "ai-chat": AIChatConfig.optional(),
    "ai-search": AIChatConfig.optional(),
    "ai-examples": AiExamplesConfig.optional(),
    metadata: MetadataConfig.optional(),
    redirects: z.array(RedirectConfig).optional(),
    logo: LogoConfiguration.optional(),
    favicon: z.string().optional(),
    "background-image": BackgroundImageConfiguration.optional(),
    colors: ColorsConfiguration.optional(),
    typography: DocsTypographyConfig.optional(),
    layout: LayoutConfig.optional(),
    settings: DocsSettingsConfig.optional(),
    theme: ThemeConfig.optional(),
    integrations: IntegrationsConfig.optional(),
    css: CssConfig.optional(),
    js: JsConfig.optional(),
    header: z.string().optional(),
    footer: z.string().optional()
});

// Suppress unused variable warnings. These schemas are not exported intentionally.
// They will be exported in a future PR to replace the existing SDK-generated schemas.
void TabId;
void ChangelogFolderRelativePath;
void AudienceId;
void RoleId;
void LibraryName;
void ProgrammingLanguage;
void Language;
void PageActionOption;
void AIChatLocation;
void AIChatModel;
void EditThisPageLaunch;
void Availability;
void VersionAvailability;
void TitleSource;
void LibraryLanguage;
void FontStyle;
void FontDisplay;
void SearchbarPlacement;
void TabsPlacement;
void SwitcherPlacement;
void ContentAlignment;
void HeaderPosition;
void ProductSwitcherThemeConfig;
void LanguageSwitcherThemeConfig;
void FooterNavThemeConfig;
void TabsThemeConfig;
void BodyThemeConfig;
void SidebarThemeConfig;
void PageActionsThemeConfig;
void HttpSnippetLanguage;
void Target;
void TwitterCardSetting;
void JsScriptStrategy;
void FontWeight;
void ColorThemedConfig;
void ColorConfig;
void Audience;
void Role;
void CustomDomain;
void HttpSnippetsConfig;
void BackgroundImageThemedConfig;
void BackgroundImageConfiguration;
void CssConfig;
void WithPermissions;
void FeatureFlag;
void FeatureFlagConfiguration;
void WithFeatureFlags;
void WithViewers;
void SegmentConfig;
void FullStoryAnalyticsConfig;
void IntercomConfig;
void PostHogConfig;
void GTMConfig;
void GoogleAnalytics4Config;
void AnalyticsConfig;
void AiExamplesConfig;
void AIChatWebsiteDatasource;
void AIChatDatasource;
void AIChatConfig;
void FontConfigVariant;
void FontConfigPath;
void FontConfig;
void DocsTypographyConfig;
void ThemeConfig;
void LayoutConfig;
void DocsSettingsConfig;
void ColorsConfiguration;
void CustomPageAction;
void PageActionOptions;
void PageActionsConfig;
void GithubEditThisPageConfig;
void EditThisPageConfig;
void DocsInstance;
void LogoConfiguration;
void LinkConfiguration;
void VersionedSnippetLanguageConfiguration;
void SnippetLanguageConfiguration;
void SnippetsConfiguration;
void PlaygroundButtonSettings;
void PlaygroundSettings;
void AnnouncementConfig;
void NavbarLinkConfig;
void NavbarGithubConfigWithOptions;
void NavbarGithubConfig;
void NavbarDropdownConfig;
void NavbarLink;
void FooterLinksConfig;
void JsFileConfigSettings;
void JsFileConfig;
void JsRemoteConfig;
void JsConfigOptions;
void JsConfig;
void MetadataConfig;
void RedirectConfig;
void IntegrationsConfig;
void ExperimentalConfig;
void GitLibraryInputSchema;
void PathLibraryInputSchema;
void LibraryInputConfiguration;
void LibraryOutputConfiguration;
void LibraryConfiguration;
void PageConfiguration;
void ChangelogConfiguration;
void LibraryReferenceConfiguration;
void FolderConfiguration;
void ApiReferenceEndpointConfiguration;
void ApiReferenceOperationConfiguration;
void ApiReferenceLayoutItem;
void ApiReferenceSectionConfiguration;
void ApiReferencePackageConfigurationWithOptions;
void ApiReferencePackageConfiguration;
void ApiReferenceConfiguration;
void NavigationItem;
void SectionConfiguration;
void UntabbedNavigationConfig;
void TabVariant;
void TabbedNavigationItemWithLayout;
void TabbedNavigationItemWithVariants;
void TabbedNavigationItem;
void TabbedNavigationConfig;
void NavigationConfig;
void TabConfig;
void VersionConfig;
void VersionFileConfig;
void ProductConfigBase;
void InternalProduct;
void ExternalProduct;
void ProductConfig;
void RelativeProductPath;
void AbsoluteProductPath;
void ProductPath;
void ProductFileConfig;
void DocsConfiguration;
