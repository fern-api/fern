import { z } from "zod";

// ===== Simple type aliases =====

export const TabId = z.string();

export const ChangelogFolderRelativePath = z.string();

export const AudienceId = z.string();

export const RoleId = z.string();

export const LibraryName = z.string();

// ===== Enums =====

export const ProgrammingLanguage = z.enum([
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

export const Language = z.enum([
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ja",
    "zh",
    "ko",
    "el",
    "no",
    "pl",
    "ru",
    "sv",
    "tr"
]);

export const PageActionOption = z.enum([
    "copy-page",
    "view-as-markdown",
    "ask-ai",
    "chatgpt",
    "claude",
    "cursor",
    "vscode"
]);

export const AIChatLocation = z.enum(["docs", "slack", "discord"]);

export const AIChatModel = z.enum(["claude-3.7", "claude-4", "command-a"]);

export const EditThisPageLaunch = z.enum(["github", "dashboard"]);

export const Availability = z.enum([
    "stable",
    "generally-available",
    "in-development",
    "pre-release",
    "deprecated",
    "beta"
]);

export const VersionAvailability = z.enum(["deprecated", "ga", "stable", "beta"]);

export const TitleSource = z.enum(["frontmatter", "filename"]);

export const LibraryLanguage = z.enum(["python", "cpp"]);

export const FontStyle = z.enum(["normal", "italic"]);

export const FontDisplay = z.enum(["auto", "block", "swap", "fallback", "optional"]);

export const SearchbarPlacement = z.enum(["header", "header-tabs", "sidebar"]);

export const TabsPlacement = z.enum(["header", "sidebar"]);

export const SwitcherPlacement = z.enum(["header", "sidebar"]);

export const ContentAlignment = z.enum(["center", "left"]);

export const HeaderPosition = z.enum(["fixed", "static"]);

export const ProductSwitcherThemeConfig = z.enum(["default", "toggle", "tabs"]);

export const LanguageSwitcherThemeConfig = z.enum(["default", "minimal"]);

export const FooterNavThemeConfig = z.enum(["default", "minimal"]);

export const TabsThemeConfig = z.enum(["default", "bubble"]);

export const BodyThemeConfig = z.enum(["default", "canvas"]);

export const SidebarThemeConfig = z.enum(["default", "minimal"]);

export const PageActionsThemeConfig = z.enum(["default", "toolbar"]);

export const HttpSnippetLanguage = z.enum([
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

export const Target = z.enum(["_blank", "_self", "_parent", "_top"]);

export const TwitterCardSetting = z.enum(["summary", "summary_large_image", "app", "player"]);

export const JsScriptStrategy = z.enum(["beforeInteractive", "afterInteractive", "lazyOnload"]);

// ===== Simple undiscriminated unions =====

export const FontWeight = z.union([z.string(), z.number().int()]);

export const ColorThemedConfig = z.object({
    dark: z.string().optional(),
    light: z.string().optional()
});

export const ColorConfig = z.union([z.string(), ColorThemedConfig]);

export const Audience = z.union([AudienceId, z.array(AudienceId)]);

export const Role = z.union([RoleId, z.array(RoleId)]);

export const CustomDomain = z.union([z.string(), z.array(z.string())]);

export const HttpSnippetsConfig = z.union([z.boolean(), z.array(HttpSnippetLanguage)]);

export const BackgroundImageThemedConfig = z.object({
    dark: z.string().optional(),
    light: z.string().optional()
});

export const BackgroundImageConfiguration = z.union([z.string(), BackgroundImageThemedConfig]);

export const CssConfig = z.union([z.string(), z.array(z.string())]);

export const CollapsedStringValue = z.enum(["open-by-default"]);

export const CollapsedValue = z.union([z.boolean(), CollapsedStringValue]);

// ===== Base/mixin schemas =====

export const WithPermissions = z.object({
    viewers: Role.optional(),
    orphaned: z.boolean().optional()
});

export const FeatureFlag = z.object({
    flag: z.string(),
    "fallback-value": z.unknown().optional(),
    match: z.unknown().optional()
});

export const FeatureFlagConfiguration = z.union([z.string(), FeatureFlag, z.array(FeatureFlag)]);

export const WithFeatureFlags = z.object({
    "feature-flag": FeatureFlagConfiguration.optional()
});

export const WithViewers = z.object({
    viewers: Role.optional()
});

// ===== Analytics schemas =====

export const SegmentConfig = z.object({
    "write-key": z.string()
});

export const FullStoryAnalyticsConfig = z.object({
    "org-id": z.string()
});

export const IntercomConfig = z.object({
    "app-id": z.string(),
    "api-base": z.string().optional()
});

export const PostHogConfig = z.object({
    "api-key": z.string(),
    endpoint: z.string().optional()
});

export const GTMConfig = z.object({
    "container-id": z.string()
});

export const GoogleAnalytics4Config = z.object({
    "measurement-id": z.string()
});

export const AnalyticsConfig = z.object({
    segment: SegmentConfig.optional(),
    fullstory: FullStoryAnalyticsConfig.optional(),
    intercom: IntercomConfig.optional(),
    posthog: PostHogConfig.optional(),
    gtm: GTMConfig.optional(),
    ga4: GoogleAnalytics4Config.optional()
});

// ===== AI schemas =====

export const AiExamplesConfig = z.object({
    enabled: z.boolean().optional(),
    style: z.string().optional()
});

export const AIChatWebsiteDatasource = z.object({
    url: z.string(),
    title: z.string().optional()
});

export const AIChatDatasource = AIChatWebsiteDatasource;

export const PageDescriptionSource = z.enum(["description", "subtitle"]);

export const AgentsConfig = z.object({
    "page-directive": z.string().optional(),
    "page-description-source": PageDescriptionSource.optional(),
    "llms-txt": z.string().optional(),
    "llms-full-txt": z.string().optional()
});

export const AIChatConfig = z.object({
    model: AIChatModel.optional(),
    "system-prompt": z.string().optional(),
    location: z.array(AIChatLocation).optional(),
    datasources: z.array(AIChatDatasource).optional()
});

// ===== Font schemas =====

export const FontConfigVariant = z.object({
    path: z.string(),
    weight: FontWeight.optional(),
    style: FontStyle.optional()
});

export const FontConfigPath = z.union([z.string(), FontConfigVariant]);

export const FontConfig = z.object({
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

export const DocsTypographyConfig = z.object({
    headingsFont: FontConfig.optional(),
    bodyFont: FontConfig.optional(),
    codeFont: FontConfig.optional()
});

// ===== Theme schemas =====

export const ThemeConfig = z.object({
    sidebar: SidebarThemeConfig.optional(),
    body: BodyThemeConfig.optional(),
    tabs: TabsThemeConfig.optional(),
    "page-actions": PageActionsThemeConfig.optional(),
    "footer-nav": FooterNavThemeConfig.optional(),
    "language-switcher": LanguageSwitcherThemeConfig.optional(),
    "product-switcher": ProductSwitcherThemeConfig.optional()
});

// ===== Layout schemas =====

export const LayoutConfig = z.object({
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
    "hide-feedback": z.boolean().optional(),
    "mobile-toc": z.boolean().optional()
});

// ===== Settings =====

export const DocsSettingsConfig = z.object({
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

export const ColorsConfiguration = z.object({
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

export const CustomPageAction = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    url: z.string(),
    icon: z.string().optional(),
    default: z.boolean().optional()
});

export const PageActionOptions = z.object({
    "copy-page": z.boolean().optional(),
    "view-as-markdown": z.boolean().optional(),
    "ask-ai": z.boolean().optional(),
    chatgpt: z.boolean().optional(),
    claude: z.boolean().optional(),
    cursor: z.boolean().optional(),
    vscode: z.boolean().optional(),
    custom: z.array(CustomPageAction).optional()
});

export const PageActionsConfig = z.object({
    default: PageActionOption.optional(),
    options: PageActionOptions.optional()
});

// ===== Edit this page =====

export const GithubEditThisPageConfig = z.object({
    host: z.string().optional(),
    owner: z.string(),
    repo: z.string(),
    branch: z.string().optional()
});

export const EditThisPageConfig = z.object({
    github: GithubEditThisPageConfig.optional(),
    launch: EditThisPageLaunch.optional()
});

// ===== Docs Instance =====

export const DocsInstance = z.object({
    url: z.string(),
    "custom-domain": CustomDomain.optional(),
    "edit-this-page": EditThisPageConfig.optional(),
    audiences: Audience.optional()
});

// ===== Logo =====

export const LogoConfiguration = z.object({
    dark: z.string().optional(),
    light: z.string().optional(),
    height: z.number().optional(),
    href: z.string().optional(),
    "right-text": z.string().optional()
});

// ===== Link =====

export const LinkConfiguration = z.object({
    link: z.string(),
    href: z.string(),
    icon: z.string().optional(),
    target: Target.optional()
});

// ===== Snippets =====

export const VersionedSnippetLanguageConfiguration = z.object({
    version: z.string(),
    package: z.string()
});

export const SnippetLanguageConfiguration = z.union([z.string(), VersionedSnippetLanguageConfiguration]);

export const SnippetsConfiguration = z.object({
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

export const PlaygroundButtonSettings = z.object({
    href: z.string().optional()
});

export const PlaygroundSettings = z.object({
    hidden: z.boolean().optional(),
    environments: z.array(z.string()).optional(),
    button: PlaygroundButtonSettings.optional(),
    oauth: z.boolean().optional(),
    "limit-websocket-messages-per-connection": z.number().int().optional()
});

// ===== Announcement =====

export const AnnouncementConfig = z.object({
    message: z.string()
});

// ===== Navbar =====

export const NavbarLinkConfig = WithViewers.merge(
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

export const NavbarGithubConfigWithOptions = WithViewers.merge(
    z.object({
        url: z.string(),
        target: Target.optional()
    })
);

export const NavbarGithubConfig = z.union([z.string(), NavbarGithubConfigWithOptions]);

export const NavbarDropdownConfig = WithViewers.merge(
    z.object({
        links: z.array(NavbarLinkConfig),
        text: z.string().optional(),
        icon: z.string().optional(),
        rightIcon: z.string().optional(),
        rounded: z.boolean().optional()
    })
);

export const NavbarLink = z.union([
    NavbarLinkConfig.merge(z.object({ type: z.literal("filled") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("outlined") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("minimal") })),
    z.object({ type: z.literal("github"), value: NavbarGithubConfig }),
    NavbarDropdownConfig.merge(z.object({ type: z.literal("dropdown") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("primary") })),
    NavbarLinkConfig.merge(z.object({ type: z.literal("secondary") }))
]);

// ===== Footer links =====

export const FooterLinksConfig = z.object({
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

export const JsFileConfigSettings = z.object({
    path: z.string(),
    strategy: JsScriptStrategy.optional()
});

export const JsFileConfig = z.union([z.string(), JsFileConfigSettings]);

export const JsRemoteConfig = z.object({
    url: z.string(),
    strategy: JsScriptStrategy.optional()
});

export const JsConfigOptions = z.union([JsRemoteConfig, JsFileConfig]);

export const JsConfig = z.union([JsConfigOptions, z.array(JsConfigOptions)]);

// ===== Metadata =====

export const MetadataConfig = z.object({
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
    "og:dynamic": z.boolean().optional(),
    "og:background-image": z.string().optional(),
    "og:dynamic:text-color": z.string().optional(),
    "og:dynamic:background-color": z.string().optional(),
    "og:dynamic:logo-color": z.enum(["dark", "light"]).optional(),
    "og:dynamic:show-logo": z.boolean().optional(),
    "og:dynamic:show-section": z.boolean().optional(),
    "og:dynamic:show-description": z.boolean().optional(),
    "og:dynamic:show-url": z.boolean().optional(),
    "og:dynamic:show-gradient": z.boolean().optional(),
    "canonical-host": z.string().optional()
});

// ===== Redirects =====

export const RedirectConfig = z.object({
    source: z.string(),
    destination: z.string(),
    permanent: z.boolean().optional()
});

// ===== Check =====

export const CheckRuleSeverity = z.enum(["warn", "error"]);

export const CheckRulesConfig = z.object({
    "example-validation": CheckRuleSeverity.optional(),
    "broken-links": CheckRuleSeverity.optional(),
    "no-non-component-refs": CheckRuleSeverity.optional(),
    "valid-local-references": CheckRuleSeverity.optional(),
    "no-circular-redirects": CheckRuleSeverity.optional(),
    "valid-docs-endpoints": CheckRuleSeverity.optional(),
    "missing-redirects": CheckRuleSeverity.optional()
});

export const CheckConfig = z.object({
    rules: CheckRulesConfig.optional()
});

// ===== Integrations =====

export const IntegrationsConfig = z.object({
    intercom: z.string().optional(),
    context7: z.string().optional()
});

// ===== Experimental =====

export const ExperimentalConfig = z.object({
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

export const GitLibraryInputSchema = z.object({
    git: z.string(),
    subpath: z.string().optional()
});

export const PathLibraryInputSchema = z.object({
    path: z.string()
});

export const LibraryInputConfiguration = z.union([GitLibraryInputSchema, PathLibraryInputSchema]);

export const LibraryOutputConfiguration = z.object({
    path: z.string()
});

export const LibraryConfiguration = z.object({
    input: LibraryInputConfiguration,
    output: LibraryOutputConfiguration,
    lang: LibraryLanguage
});

// ===== Page Configuration =====

export const PageConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
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

export const ChangelogConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        changelog: ChangelogFolderRelativePath,
        title: z.string().optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional()
    })
);

// ===== Library Reference Configuration =====

export const LibraryReferenceConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        library: LibraryName,
        title: z.string().optional(),
        slug: z.string().optional()
    })
);

// ===== Folder Configuration =====

export const FolderConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        folder: z.string(),
        title: z.string().optional(),
        "title-source": TitleSource.optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        "skip-slug": z.boolean().optional(),
        collapsed: CollapsedValue.optional(),
        collapsible: z.boolean().optional(),
        "collapsed-by-default": z.boolean().optional(),
        availability: Availability.optional()
    })
);

// ===== Recursive types: ApiReferenceLayoutItem =====

export const ApiReferenceEndpointConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
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

export const ApiReferenceOperationConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        operation: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        hidden: z.boolean().optional(),
        availability: Availability.optional()
    })
);

// Use z.lazy for recursive ApiReferenceLayoutItem
export const ApiReferenceLayoutItem: z.ZodType<unknown> = z.lazy(() =>
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

export const ApiReferenceSectionConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        section: z.string(),
        "referenced-packages": z.array(z.string()).optional(),
        summary: z.string().optional(),
        contents: z.array(ApiReferenceLayoutItem).optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        "skip-slug": z.boolean().optional(),
        collapsed: CollapsedValue.optional(),
        collapsible: z.boolean().optional(),
        "collapsed-by-default": z.boolean().optional(),
        availability: Availability.optional(),
        playground: PlaygroundSettings.optional()
    })
);

export const ApiReferencePackageConfigurationWithOptions = WithPermissions.merge(WithFeatureFlags).merge(
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

export const ApiReferencePackageConfiguration: z.ZodType<unknown> = z.lazy(() =>
    z.union([z.array(ApiReferenceLayoutItem), ApiReferencePackageConfigurationWithOptions])
);

// ===== API Reference Configuration =====

export const ApiReferenceConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
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
        collapsed: CollapsedValue.optional(),
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
export const NavigationItem: z.ZodType<unknown> = z.lazy(() =>
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

export const SectionConfiguration = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        section: z.string(),
        path: z.string().optional(),
        contents: z.array(NavigationItem),
        collapsed: CollapsedValue.optional(),
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

export const UntabbedNavigationConfig = z.array(NavigationItem);

export const TabVariant = WithPermissions.merge(WithFeatureFlags).merge(
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

export const TabbedNavigationItemWithLayout = z.object({
    tab: TabId,
    layout: z.array(NavigationItem).optional()
});

export const TabbedNavigationItemWithVariants = z.object({
    tab: TabId,
    variants: z.array(TabVariant)
});

export const TabbedNavigationItem = z.union([TabbedNavigationItemWithLayout, TabbedNavigationItemWithVariants]);

export const TabbedNavigationConfig = z.array(TabbedNavigationItem);

export const NavigationConfig = z.union([UntabbedNavigationConfig, TabbedNavigationConfig]);

// ===== Tab Config =====

export const TabConfig = WithPermissions.merge(WithFeatureFlags).merge(
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

export const VersionConfig = WithPermissions.merge(WithFeatureFlags).merge(
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

export const VersionFileConfig = z.object({
    tabs: z.record(TabId, TabConfig).optional(),
    "landing-page": PageConfiguration.optional(),
    navigation: NavigationConfig
});

// ===== Product schemas =====

export const ProductConfigBase = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        "display-name": z.string(),
        subtitle: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        versions: z.array(VersionConfig).optional(),
        audiences: Audience.optional()
    })
);

export const InternalProduct = ProductConfigBase.merge(
    z.object({
        path: z.string(),
        slug: z.string().optional(),
        announcement: AnnouncementConfig.optional()
    })
);

export const ExternalProduct = ProductConfigBase.merge(
    z.object({
        href: z.string(),
        target: Target.optional()
    })
);

export const ProductConfig = z.union([InternalProduct, ExternalProduct]);

export const RelativeProductPath = WithPermissions.merge(WithFeatureFlags).merge(
    z.object({
        "display-name": z.string(),
        path: z.string(),
        slug: z.string().optional()
    })
);

export const AbsoluteProductPath = z.object({
    href: z.string()
});

export const ProductPath = z.union([RelativeProductPath, AbsoluteProductPath]);

export const ProductFileConfig = z.object({
    tabs: z.record(TabId, TabConfig).optional(),
    "landing-page": PageConfiguration.optional(),
    navigation: NavigationConfig
});

// ===== Main DocsConfiguration =====

export const DocsConfiguration = z.object({
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
    agents: AgentsConfig.optional(),
    metadata: MetadataConfig.optional(),
    redirects: z.array(RedirectConfig).optional(),
    check: CheckConfig.optional(),
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
