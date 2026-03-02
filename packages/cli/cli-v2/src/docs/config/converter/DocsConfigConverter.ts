import type { schemas } from "@fern-api/config";
import { ValidationIssue } from "@fern-api/yaml-loader";
import type { FernYmlSchemaLoader } from "../../../config/fern-yml/FernYmlSchemaLoader.js";
import type { DocsConfig } from "../DocsConfig.js";
import type { Navigation, NavigationItem, TabbedNavigationItem, TabVariant } from "../Navigation.js";
import type { Product } from "../Product.js";
import type { Version } from "../Version.js";

export namespace DocsConfigConverter {
    export type Result = Success | Failure;

    export interface Success {
        success: true;
        config: DocsConfig;
    }

    export interface Failure {
        success: false;
        issues: ValidationIssue[];
    }
}

/**
 * Converts a fern.yml schema to the DocsConfig domain model.
 *
 * Performs:
 *  - Domain-specific validation (instances, navigation structure)
 *  - Navigation key-presence -> discriminated union conversion
 *  - Version/product structural conversion (contain Navigation)
 *
 * Pass-through fields (branding, layout, SEO, etc.) are assigned directly
 * from the schema without conversion.
 *
 * The raw schema is retained on the output for the legacy adapter bridge.
 */
export class DocsConfigConverter {
    private readonly issues: ValidationIssue[] = [];

    public convert({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): DocsConfigConverter.Result {
        const docs = fernYml.data.docs;
        if (docs == null) {
            return {
                success: false,
                issues: []
            };
        }

        this.validateInstances({ docs, fernYml });

        if (this.issues.length > 0) {
            return {
                success: false,
                issues: this.issues
            };
        }

        return {
            success: true,
            config: {
                instances: docs.instances,
                title: docs.title,

                navigation: docs.navigation != null ? this.convertNavigation(docs.navigation) : undefined,
                landingPage: docs.landingPage != null ? this.convertPage(docs.landingPage) : undefined,

                tabs: docs.tabs,
                versions: docs.versions != null ? this.convertVersions(docs.versions) : undefined,
                products: docs.products != null ? this.convertProducts(docs.products) : undefined,

                logo: docs.logo,
                favicon: docs.favicon,
                backgroundImage: docs.backgroundImage,
                colors: docs.colors,
                typography: docs.typography,

                layout: docs.layout,
                settings: docs.settings,
                theme: docs.theme,

                navbarLinks: docs.navbarLinks ?? [],
                footerLinks: docs.footerLinks,
                pageActions: docs.pageActions,

                metadata: docs.metadata,
                redirects: docs.redirects ?? [],
                analytics: docs.analytics,

                announcement: docs.announcement,
                roles: docs.roles,
                libraries: docs.libraries,

                defaultLanguage: docs.defaultLanguage,
                languages: docs.languages,

                css: docs.css,
                js: docs.js,

                aiChat: docs.aiChat,
                aiSearch: docs.aiSearch,
                aiExamples: docs.aiExamples,

                integrations: docs.integrations,
                experimental: docs.experimental,

                header: docs.header,
                footer: docs.footer,

                _rawSchema: docs
            }
        };
    }

    private validateInstances({
        docs,
        fernYml
    }: {
        docs: schemas.DocsSchema;
        fernYml: FernYmlSchemaLoader.Success;
    }): void {
        if (docs.instances.length === 0) {
            this.issues.push(
                new ValidationIssue({
                    message: "You must specify at least one docs instance",
                    location: fernYml.sourced.$loc
                })
            );
        }
    }

    private convertNavigation(raw: schemas.NavigationConfigSchema): Navigation {
        if (raw.length === 0) {
            return { type: "untabbed", items: [] };
        }
        const first = raw[0];
        if (first != null && "tab" in first) {
            return {
                type: "tabbed",
                items: (raw as schemas.TabbedNavigationConfigSchema).map((item) =>
                    this.convertTabbedNavigationItem(item)
                )
            };
        }
        return {
            type: "untabbed",
            items: (raw as schemas.UntabbedNavigationConfigSchema).map((item) => this.convertNavigationItem(item))
        };
    }

    private convertNavigationItem(raw: schemas.NavigationItem): NavigationItem {
        if ("page" in raw) {
            return this.convertPage(raw as schemas.PageConfigurationSchema);
        }
        if ("section" in raw) {
            return this.convertSection(raw as schemas.SectionConfigurationSchema);
        }
        if ("api" in raw) {
            return this.convertApiReference(raw as schemas.ApiReferenceConfigurationSchema);
        }
        if ("link" in raw) {
            return this.convertLink(raw as schemas.LinkConfigurationSchema);
        }
        if ("changelog" in raw) {
            return this.convertChangelog(raw as schemas.ChangelogConfigurationSchema);
        }
        if ("library" in raw) {
            return this.convertLibrary(raw as schemas.LibraryReferenceConfigurationSchema);
        }
        if ("folder" in raw) {
            return this.convertFolder(raw as schemas.FolderConfigurationSchema);
        }
        throw new Error(`Unknown navigation item type: ${JSON.stringify(raw)}`);
    }

    private convertPage(raw: schemas.PageConfigurationSchema): NavigationItem.Page {
        return {
            type: "page",
            path: raw.path ?? raw.page,
            title: raw.path != null ? raw.page : undefined,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden,
            noindex: raw.noindex
        };
    }

    private convertSection(raw: schemas.SectionConfigurationSchema): NavigationItem.Section {
        return {
            type: "section",
            title: raw.section,
            contents: (raw.contents as schemas.NavigationItem[]).map((item) => this.convertNavigationItem(item)),
            collapsed: raw.collapsed,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden,
            skipSlug: raw.skipSlug,
            overview: raw.path
        };
    }

    private convertApiReference(raw: schemas.ApiReferenceConfigurationSchema): NavigationItem.ApiReference {
        return {
            type: "apiReference",
            title: raw.title,
            api: raw.api,
            apiName: raw.apiName,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden,
            audiences: raw.audiences,
            showErrors: raw.showErrors,
            snippets: raw.snippets,
            playground: raw.playground,
            alphabetized: raw.alphabetized,
            flattened: raw.flattened,
            paginated: raw.paginated
        };
    }

    private convertLink(raw: schemas.LinkConfigurationSchema): NavigationItem.Link {
        return {
            type: "link",
            text: raw.link,
            href: raw.href,
            icon: raw.icon
        };
    }

    private convertChangelog(raw: schemas.ChangelogConfigurationSchema): NavigationItem.Changelog {
        return {
            type: "changelog",
            path: raw.changelog,
            title: raw.title,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden
        };
    }

    private convertLibrary(raw: schemas.LibraryReferenceConfigurationSchema): NavigationItem.Library {
        return {
            type: "library",
            name: raw.library,
            title: raw.title,
            slug: raw.slug
        };
    }

    private convertFolder(raw: schemas.FolderConfigurationSchema): NavigationItem.Folder {
        return {
            type: "folder",
            title: raw.folder,
            contents: [],
            collapsed: raw.collapsed,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden
        };
    }

    private convertTabbedNavigationItem(raw: schemas.TabbedNavigationItemSchema): TabbedNavigationItem {
        return {
            tab: raw.tab,
            layout:
                raw.layout != null
                    ? (raw.layout as schemas.NavigationItem[]).map((item) => this.convertNavigationItem(item))
                    : undefined,
            variants: raw.variants != null ? raw.variants.map((v) => this.convertTabVariant(v)) : undefined
        };
    }

    private convertTabVariant(raw: schemas.TabVariantSchema): TabVariant {
        return {
            title: raw.title,
            subtitle: raw.subtitle,
            icon: raw.icon,
            layout: (raw.layout as schemas.NavigationItem[]).map((item) => this.convertNavigationItem(item)),
            slug: raw.slug,
            default: raw.default
        };
    }

    // ================================================================
    // Versions & Products
    // ================================================================

    private convertVersions(raw: schemas.VersionConfigSchema[]): Version[] {
        return raw.map((version) => this.convertVersion(version));
    }

    private convertVersion(raw: schemas.VersionConfigSchema): Version {
        return {
            displayName: raw.displayName,
            path: raw.path,
            slug: raw.slug,
            availability: raw.availability,
            navigation: this.convertNavigation(raw.navigation)
        };
    }

    private convertProducts(raw: schemas.ProductConfigSchema[]): Product[] {
        return raw.map((product) => this.convertProduct(product));
    }

    private convertProduct(raw: schemas.ProductConfigSchema): Product {
        if ("href" in raw) {
            return {
                type: "external",
                displayName: raw.displayName,
                href: raw.href as string,
                icon: raw.icon
            };
        }
        return {
            type: "internal",
            displayName: raw.displayName,
            path: raw.path,
            icon: raw.icon,
            slug: raw.slug,
            default: raw.default,
            navigation: raw.navigation != null ? this.convertNavigation(raw.navigation) : undefined,
            versions: raw.versions != null ? this.convertVersions(raw.versions) : undefined
        };
    }
}
