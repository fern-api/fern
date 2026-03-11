import { docsYml } from "@fern-api/configuration";
import type { z } from "zod";

const S = docsYml.DocsYmlSchemas;

// Main schema
export { DocsSchema } from "./DocsSchema.js";

// Re-export all sub-schemas with backward-compatible names
export const DocsInstanceSchema = S.DocsInstance;
export type DocsInstanceSchema = z.infer<typeof S.DocsInstance>;

export const EditThisPageConfigSchema = S.EditThisPageConfig;
export type EditThisPageConfigSchema = z.infer<typeof S.EditThisPageConfig>;

// Navigation
export const NavigationConfigSchema = S.NavigationConfig;
export type NavigationConfigSchema = z.infer<typeof S.NavigationConfig>;

export const TabbedNavigationConfigSchema = S.TabbedNavigationConfig;
export type TabbedNavigationConfigSchema = z.infer<typeof S.TabbedNavigationConfig>;

export const UntabbedNavigationConfigSchema = S.UntabbedNavigationConfig;
export type UntabbedNavigationConfigSchema = z.infer<typeof S.UntabbedNavigationConfig>;

export const NavigationItem = S.NavigationItem;
export type NavigationItem = z.infer<typeof S.NavigationItem>;

export const PageConfigurationSchema = S.PageConfiguration;
export type PageConfigurationSchema = z.infer<typeof S.PageConfiguration>;

export const SectionConfigurationSchema = S.SectionConfiguration;
export type SectionConfigurationSchema = z.infer<typeof S.SectionConfiguration>;

export const ApiReferenceConfigurationSchema = S.ApiReferenceConfiguration;
export type ApiReferenceConfigurationSchema = z.infer<typeof S.ApiReferenceConfiguration>;

export const LinkConfigurationSchema = S.LinkConfiguration;
export type LinkConfigurationSchema = z.infer<typeof S.LinkConfiguration>;

export const ChangelogConfigurationSchema = S.ChangelogConfiguration;
export type ChangelogConfigurationSchema = z.infer<typeof S.ChangelogConfiguration>;

export const LibraryReferenceConfigurationSchema = S.LibraryReferenceConfiguration;
export type LibraryReferenceConfigurationSchema = z.infer<typeof S.LibraryReferenceConfiguration>;

export const FolderConfigurationSchema = S.FolderConfiguration;
export type FolderConfigurationSchema = z.infer<typeof S.FolderConfiguration>;

export const TabbedNavigationItemSchema = S.TabbedNavigationItem;
export type TabbedNavigationItemSchema = z.infer<typeof S.TabbedNavigationItem>;

export const TabVariantSchema = S.TabVariant;
export type TabVariantSchema = z.infer<typeof S.TabVariant>;

export const TabConfigSchema = S.TabConfig;
export type TabConfigSchema = z.infer<typeof S.TabConfig>;

export const VersionConfigSchema = S.VersionConfig;
export type VersionConfigSchema = z.infer<typeof S.VersionConfig>;

export const ProductConfigSchema = S.ProductConfig;
export type ProductConfigSchema = z.infer<typeof S.ProductConfig>;

export const SnippetsConfigurationSchema = S.SnippetsConfiguration;
export type SnippetsConfigurationSchema = z.infer<typeof S.SnippetsConfiguration>;

export const PlaygroundSettingsSchema = S.PlaygroundSettings;
export type PlaygroundSettingsSchema = z.infer<typeof S.PlaygroundSettings>;

// Branding
export const LogoConfigurationSchema = S.LogoConfiguration;
export type LogoConfigurationSchema = z.infer<typeof S.LogoConfiguration>;

export const BackgroundImageConfigurationSchema = S.BackgroundImageConfiguration;
export type BackgroundImageConfigurationSchema = z.infer<typeof S.BackgroundImageConfiguration>;

export const ColorsConfigurationSchema = S.ColorsConfiguration;
export type ColorsConfigurationSchema = z.infer<typeof S.ColorsConfiguration>;

export const TypographyConfigSchema = S.DocsTypographyConfig;
export type TypographyConfigSchema = z.infer<typeof S.DocsTypographyConfig>;

// Layout
export const LayoutConfigSchema = S.LayoutConfig;
export type LayoutConfigSchema = z.infer<typeof S.LayoutConfig>;

export const DocsSettingsConfigSchema = S.DocsSettingsConfig;
export type DocsSettingsConfigSchema = z.infer<typeof S.DocsSettingsConfig>;

export const ThemeConfigSchema = S.ThemeConfig;
export type ThemeConfigSchema = z.infer<typeof S.ThemeConfig>;

// Links
export const NavbarLinkSchema = S.NavbarLink;
export type NavbarLinkSchema = z.infer<typeof S.NavbarLink>;

export const FooterLinksConfigSchema = S.FooterLinksConfig;
export type FooterLinksConfigSchema = z.infer<typeof S.FooterLinksConfig>;

export const PageActionsConfigSchema = S.PageActionsConfig;
export type PageActionsConfigSchema = z.infer<typeof S.PageActionsConfig>;

// SEO
export const AnalyticsConfigSchema = S.AnalyticsConfig;
export type AnalyticsConfigSchema = z.infer<typeof S.AnalyticsConfig>;

export const MetadataConfigSchema = S.MetadataConfig;
export type MetadataConfigSchema = z.infer<typeof S.MetadataConfig>;

export const RedirectConfigSchema = S.RedirectConfig;
export type RedirectConfigSchema = z.infer<typeof S.RedirectConfig>;

// AI
export const AiChatConfigSchema = S.AIChatConfig;
export type AiChatConfigSchema = z.infer<typeof S.AIChatConfig>;

export const AiExamplesConfigSchema = S.AiExamplesConfig;
export type AiExamplesConfigSchema = z.infer<typeof S.AiExamplesConfig>;

// Misc
export const AnnouncementConfigSchema = S.AnnouncementConfig;
export type AnnouncementConfigSchema = z.infer<typeof S.AnnouncementConfig>;

export const IntegrationsConfigSchema = S.IntegrationsConfig;
export type IntegrationsConfigSchema = z.infer<typeof S.IntegrationsConfig>;

export const IntercomConfigSchema = S.IntercomConfig;
export type IntercomConfigSchema = z.infer<typeof S.IntercomConfig>;

export const LibraryConfigurationSchema = S.LibraryConfiguration;
export type LibraryConfigurationSchema = z.infer<typeof S.LibraryConfiguration>;

export const LibraryInputConfigurationSchema = S.LibraryInputConfiguration;
export type LibraryInputConfigurationSchema = z.infer<typeof S.LibraryInputConfiguration>;

export const LibraryOutputConfigurationSchema = S.LibraryOutputConfiguration;
export type LibraryOutputConfigurationSchema = z.infer<typeof S.LibraryOutputConfiguration>;

export const CssConfigSchema = S.CssConfig;
export type CssConfigSchema = z.infer<typeof S.CssConfig>;

export const JsConfigSchema = S.JsConfig;
export type JsConfigSchema = z.infer<typeof S.JsConfig>;

export const ExperimentalConfigSchema = S.ExperimentalConfig;
export type ExperimentalConfigSchema = z.infer<typeof S.ExperimentalConfig>;

export const FeatureFlagSchema = S.FeatureFlag;
export type FeatureFlagSchema = z.infer<typeof S.FeatureFlag>;

export const FeatureFlagConfigurationSchema = S.FeatureFlagConfiguration;
export type FeatureFlagConfigurationSchema = z.infer<typeof S.FeatureFlagConfiguration>;

export const AvailabilitySchema = S.Availability;
export type AvailabilitySchema = z.infer<typeof S.Availability>;

export const RoleSchema = S.Role;
export type RoleSchema = z.infer<typeof S.Role>;
