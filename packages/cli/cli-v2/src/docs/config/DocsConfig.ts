import type { schemas } from "@fern-api/config";
import type { Navigation, NavigationItem } from "./Navigation.js";
import type { Product } from "./Product.js";
import type { Version } from "./Version.js";

/**
 * Rich docs configuration derived from fern.yml.
 *
 * The schema now matches the original docs.yml shape (kebab-case keys).
 * Pass-through fields use schema types (`schemas.X`) directly from
 * @fern-api/config. Custom interfaces are only defined for shapes
 * that have post-validation transformations (e.g., discriminated unions).
 */
export interface DocsConfig {
    instances: schemas.DocsInstanceSchema[];
    title?: string;

    navigation?: Navigation;
    "landing-page"?: NavigationItem.Page;

    tabs?: Record<string, schemas.TabConfigSchema>;
    versions?: Version[];
    products?: Product[];

    logo?: schemas.LogoConfigurationSchema;
    favicon?: string;
    "background-image"?: schemas.BackgroundImageConfigurationSchema;
    colors?: schemas.ColorsConfigurationSchema;
    typography?: schemas.TypographyConfigSchema;

    layout?: schemas.LayoutConfigSchema;
    settings?: schemas.DocsSettingsConfigSchema;
    theme?: schemas.ThemeConfigSchema;

    "navbar-links": schemas.NavbarLinkSchema[];
    "footer-links"?: schemas.FooterLinksConfigSchema;
    "page-actions"?: schemas.PageActionsConfigSchema;

    metadata?: schemas.MetadataConfigSchema;
    redirects: schemas.RedirectConfigSchema[];
    analytics?: schemas.AnalyticsConfigSchema;

    announcement?: schemas.AnnouncementConfigSchema;
    roles?: string[];
    libraries?: Record<string, schemas.LibraryConfigurationSchema>;

    "default-language"?: schemas.ProgrammingLanguageSchema;
    languages?: schemas.LanguageSchema[];

    css?: schemas.CssConfigSchema;
    js?: schemas.JsConfigSchema;

    "ai-chat"?: schemas.AiChatConfigSchema;
    "ai-search"?: schemas.AiChatConfigSchema;
    "ai-examples"?: schemas.AiExamplesConfigSchema;

    integrations?: schemas.IntegrationsConfigSchema;
    experimental?: Record<string, unknown>;

    header?: string;
    footer?: string;

    /**
     * @internal Validated raw schema retained for the legacy adapter bridge.
     */
    _rawSchema: schemas.DocsSchema;
}
