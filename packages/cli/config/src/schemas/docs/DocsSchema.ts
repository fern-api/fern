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
    landingPage: PageConfigurationSchema.optional(),
    navigation: NavigationConfigSchema.optional(),
    navbarLinks: z.array(NavbarLinkSchema).optional(),
    footerLinks: FooterLinksConfigSchema.optional(),
    pageActions: PageActionsConfigSchema.optional(),
    experimental: ExperimentalConfigSchema.optional(),
    defaultLanguage: z
        .enum(["typescript", "python", "java", "go", "ruby", "csharp", "php", "swift", "curl"])
        .optional(),
    languages: z.array(z.string()).optional(),
    aiChat: AiChatConfigSchema.optional(),
    aiSearch: AiChatConfigSchema.optional(),
    aiExamples: AiExamplesConfigSchema.optional(),
    metadata: MetadataConfigSchema.optional(),
    redirects: z.array(RedirectConfigSchema).optional(),
    logo: LogoConfigurationSchema.optional(),
    favicon: z.string().optional(),
    backgroundImage: BackgroundImageConfigurationSchema.optional(),
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
