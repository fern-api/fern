import { z } from "zod";
import { AnnouncementConfigSchema } from "./AnnouncementConfigSchema.js";
import { AiChatConfigSchema } from "./ai/AiChatConfigSchema.js";
import { AiExamplesConfigSchema } from "./ai/AiExamplesConfigSchema.js";
import { BackgroundImageConfigurationSchema } from "./branding/BackgroundImageConfigurationSchema.js";
import { ColorsConfigurationSchema } from "./branding/ColorsConfigurationSchema.js";
import { LogoConfigurationSchema } from "./branding/LogoConfigurationSchema.js";
import { TypographyConfigSchema } from "./branding/TypographyConfigSchema.js";
import { CssConfigSchema } from "./custom/CssConfigSchema.js";
import { JsConfigSchema } from "./custom/JsConfigSchema.js";
import { DocsInstanceSchema } from "./DocsInstanceSchema.js";
import { ExperimentalConfigSchema } from "./ExperimentalConfigSchema.js";
import { IntegrationsConfigSchema } from "./IntegrationsConfigSchema.js";
import { LibraryConfigurationSchema } from "./LibraryConfigurationSchema.js";
import { DocsSettingsConfigSchema } from "./layout/DocsSettingsConfigSchema.js";
import { LayoutConfigSchema } from "./layout/LayoutConfigSchema.js";
import { ThemeConfigSchema } from "./layout/ThemeConfigSchema.js";
import { FooterLinksConfigSchema } from "./links/FooterLinksConfigSchema.js";
import { NavbarLinkSchema } from "./links/NavbarLinkSchema.js";
import { PageActionsConfigSchema } from "./links/PageActionsConfigSchema.js";
import { NavigationConfigSchema } from "./navigation/NavigationConfigSchema.js";
import { PageConfigurationSchema } from "./navigation/PageConfigurationSchema.js";
import { ProductConfigSchema } from "./navigation/ProductConfigSchema.js";
import { TabConfigSchema } from "./navigation/TabConfigSchema.js";
import { VersionConfigSchema } from "./navigation/VersionConfigSchema.js";
import { AnalyticsConfigSchema } from "./seo/AnalyticsConfigSchema.js";
import { MetadataConfigSchema } from "./seo/MetadataConfigSchema.js";
import { RedirectConfigSchema } from "./seo/RedirectConfigSchema.js";

/**
 * Type alias for programming language values.
 *
 * Uses z.string() so that the underlying docs.yml shape (defined in
 * @fern-api/configuration) can evolve without these schemas drifting.
 */
export const ProgrammingLanguageSchema = z.string();

export type ProgrammingLanguageSchema = z.infer<typeof ProgrammingLanguageSchema>;

/**
 * Type alias for i18n language values.
 *
 * Uses z.string() so that the underlying docs.yml shape (defined in
 * @fern-api/configuration) can evolve without these schemas drifting.
 */
export const LanguageSchema = z.string();

export type LanguageSchema = z.infer<typeof LanguageSchema>;

export const DocsSchema = z.object({
    instances: z.array(DocsInstanceSchema),
    title: z.string().optional(),
    libraries: z.record(z.string(), LibraryConfigurationSchema).optional(),
    analytics: AnalyticsConfigSchema.optional(),
    announcement: AnnouncementConfigSchema.optional(),
    roles: z.array(z.string()).optional(),
    tabs: z.record(z.string(), TabConfigSchema).optional(),
    versions: z.array(VersionConfigSchema).optional(),
    products: z.array(ProductConfigSchema).optional(),
    "landing-page": PageConfigurationSchema.optional(),
    navigation: NavigationConfigSchema.optional(),
    "navbar-links": z.array(NavbarLinkSchema).optional(),
    "footer-links": FooterLinksConfigSchema.optional(),
    "page-actions": PageActionsConfigSchema.optional(),
    experimental: ExperimentalConfigSchema.optional(),
    "default-language": ProgrammingLanguageSchema.optional(),
    languages: z.array(LanguageSchema).optional(),
    "ai-chat": AiChatConfigSchema.optional(),
    "ai-search": AiChatConfigSchema.optional(),
    "ai-examples": AiExamplesConfigSchema.optional(),
    metadata: MetadataConfigSchema.optional(),
    redirects: z.array(RedirectConfigSchema).optional(),
    logo: LogoConfigurationSchema.optional(),
    favicon: z.string().optional(),
    "background-image": BackgroundImageConfigurationSchema.optional(),
    colors: ColorsConfigurationSchema.optional(),
    typography: TypographyConfigSchema.optional(),
    layout: LayoutConfigSchema.optional(),
    settings: DocsSettingsConfigSchema.optional(),
    theme: ThemeConfigSchema.optional(),
    integrations: IntegrationsConfigSchema.optional(),
    css: CssConfigSchema.optional(),
    js: JsConfigSchema.optional(),
    header: z.string().optional(),
    footer: z.string().optional()
});

export type DocsSchema = z.infer<typeof DocsSchema>;
