import type { schemas } from "@fern-api/config";
import type { Navigation, NavigationItem } from "./Navigation.js";
import type { Product } from "./Product.js";
import type { SnippetLanguage } from "./SnippetLanguage.js";
import type { Version } from "./Version.js";

/**
 * Rich docs configuration derived from fern.yml.
 *
 * Pass-through fields use schema types (`schemas.X`) directly from
 * @fern-api/config. Custom interfaces are only defined for shapes
 * that have post-validation transformations (e.g., discriminated unions).
 */
export interface DocsConfig {
    instances: schemas.DocsInstanceSchema[];
    title?: string;

    navigation?: Navigation;
    landingPage?: NavigationItem.Page;

    tabs?: Record<string, schemas.TabConfigSchema>;
    versions?: Version[];
    products?: Product[];

    logo?: schemas.LogoConfigurationSchema;
    favicon?: string;
    backgroundImage?: schemas.BackgroundImageConfigurationSchema;
    colors?: schemas.ColorsConfigurationSchema;
    typography?: schemas.TypographyConfigSchema;

    layout?: schemas.LayoutConfigSchema;
    settings?: schemas.DocsSettingsConfigSchema;
    theme?: schemas.ThemeConfigSchema;

    navbarLinks: schemas.NavbarLinkSchema[];
    footerLinks?: schemas.FooterLinksConfigSchema;
    pageActions?: schemas.PageActionsConfigSchema;

    metadata?: schemas.MetadataConfigSchema;
    redirects: schemas.RedirectConfigSchema[];
    analytics?: schemas.AnalyticsConfigSchema;

    announcement?: schemas.AnnouncementConfigSchema;
    roles?: string[];
    libraries?: Record<string, schemas.LibraryConfigurationSchema>;

    defaultLanguage?: SnippetLanguage;
    languages?: string[];

    css?: schemas.CssConfigSchema;
    js?: schemas.JsConfigSchema;

    aiChat?: schemas.AiChatConfigSchema;
    aiSearch?: schemas.AiChatConfigSchema;
    aiExamples?: schemas.AiExamplesConfigSchema;

    integrations?: schemas.IntegrationsConfigSchema;
    experimental?: Record<string, unknown>;

    header?: string;
    footer?: string;

    /**
     * @internal Validated raw schema retained for the legacy adapter bridge.
     */
    _rawSchema: schemas.DocsSchema;
}
