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
                customDomain: inst.customDomain,
                audiences: inst.audiences,
                editThisPage: inst.editThisPage,
                private: inst.private
            })),
            title: raw.title,
            tabs: raw.tabs as Legacy["tabs"],
            versions: raw.versions as Legacy["versions"],
            products: raw.products as Legacy["products"],
            landingPage: raw.landingPage as Legacy["landingPage"],
            navigation: raw.navigation as Legacy["navigation"],
            navbarLinks: raw.navbarLinks as Legacy["navbarLinks"],
            footerLinks: raw.footerLinks as Legacy["footerLinks"],
            pageActions: raw.pageActions as Legacy["pageActions"],
            logo: raw.logo as Legacy["logo"],
            favicon: raw.favicon,
            backgroundImage: raw.backgroundImage as Legacy["backgroundImage"],
            colors: raw.colors as Legacy["colors"],
            typography: raw.typography as Legacy["typography"],
            layout: raw.layout as Legacy["layout"],
            settings: raw.settings,
            theme: raw.theme as Legacy["theme"],
            metadata: raw.metadata as Legacy["metadata"],
            redirects: raw.redirects as Legacy["redirects"],
            analytics: raw.analytics as Legacy["analytics"],
            announcement: raw.announcement as Legacy["announcement"],
            roles: raw.roles,
            libraries: raw.libraries as Legacy["libraries"],
            defaultLanguage: raw.defaultLanguage as Legacy["defaultLanguage"],
            languages: raw.languages as Legacy["languages"],
            css: raw.css,
            js: raw.js as Legacy["js"],
            aiChat: raw.aiChat as Legacy["aiChat"],
            aiSearch: raw.aiSearch as Legacy["aiSearch"],
            aiExamples: raw.aiExamples,
            integrations: raw.integrations as Legacy["integrations"],
            experimental: raw.experimental,
            header: raw.header,
            footer: raw.footer
        };
    }
}
