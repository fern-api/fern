import type { docsYml } from "@fern-api/configuration-loader";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { DocsWorkspace } from "@fern-api/workspace-loader";
import type { DocsConfig } from "../config/DocsConfig.js";

// Type alias for indexed access into the legacy configuration type.
type Legacy = docsYml.RawSchemas.DocsConfiguration;

/**
 * Adapts the DocsConfig to the legacy DocsWorkspace interface.
 */
export class LegacyDocsWorkspaceAdapter {
    public adapt({
        docsConfig,
        absoluteFilePath
    }: {
        docsConfig: DocsConfig;
        absoluteFilePath: AbsoluteFilePath;
    }): DocsWorkspace {
        return {
            type: "docs",
            workspaceName: undefined,
            absoluteFilePath: absoluteFilePath,
            absoluteFilepathToDocsConfig: absoluteFilePath,
            config: this.toLegacyRawConfig(docsConfig)
        };
    }

    /**
     * Constructs the legacy DocsConfiguration from the validated raw schema
     * retained on DocsConfig._rawSchema.
     *
     * Each field is explicitly listed so the mapping is transparent.
     *  - Fields that are structurally identical pass through directly.
     *  - The Zod-inferred type and the legacy Fern-generated type have minor
     *    representational differences (enum literal sets, nested shape variants)
     *    are bridged via the Legacy type alias.
     */
    private toLegacyRawConfig(config: DocsConfig): docsYml.RawSchemas.DocsConfiguration {
        const raw = config._rawSchema;

        return {
            instances: raw.instances.map((inst) => ({
                url: inst.url,
                "custom-domain": inst.customDomain,
                audiences: inst.audiences,
                "edit-this-page": inst.editThisPage as Legacy["instances"][number]["edit-this-page"],
                private: inst.private
            })),
            title: raw.title,
            tabs: raw.tabs as Legacy["tabs"],
            versions: raw.versions as Legacy["versions"],
            products: raw.products as Legacy["products"],
            "landing-page": raw.landingPage as Legacy["landing-page"],
            navigation: raw.navigation as Legacy["navigation"],
            "navbar-links": raw.navbarLinks as Legacy["navbar-links"],
            "footer-links": raw.footerLinks as Legacy["footer-links"],
            "page-actions": raw.pageActions as Legacy["page-actions"],
            logo: raw.logo as Legacy["logo"],
            favicon: raw.favicon,
            "background-image": raw.backgroundImage as Legacy["background-image"],
            colors: raw.colors as Legacy["colors"],
            typography: raw.typography as Legacy["typography"],
            layout: raw.layout as Legacy["layout"],
            settings: raw.settings as Legacy["settings"],
            theme: raw.theme as Legacy["theme"],
            metadata: raw.metadata as Legacy["metadata"],
            redirects: raw.redirects as Legacy["redirects"],
            analytics: raw.analytics as Legacy["analytics"],
            announcement: raw.announcement as Legacy["announcement"],
            roles: raw.roles,
            libraries: raw.libraries as Legacy["libraries"],
            "default-language": raw.defaultLanguage as Legacy["default-language"],
            languages: raw.languages as Legacy["languages"],
            css: raw.css,
            js: raw.js as Legacy["js"],
            "ai-chat": raw.aiChat as Legacy["ai-chat"],
            "ai-search": raw.aiSearch as Legacy["ai-search"],
            "ai-examples": raw.aiExamples as Legacy["ai-examples"],
            integrations: raw.integrations as Legacy["integrations"],
            experimental: raw.experimental,
            header: raw.header,
            footer: raw.footer
        };
    }
}
