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
 * The schema now matches the original docs.yml shape, so most fields
 * are a direct passthrough. The converter still performs:
 *  - Domain-specific validation (instances)
 *  - Navigation key-presence -> discriminated union conversion
 *  - Version/product structural conversion (contain Navigation)
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
                // Passthrough fields directly from schema
                instances: docs.instances,
                title: docs.title,
                tabs: docs.tabs,
                logo: docs.logo,
                favicon: docs.favicon,
                "background-image": docs["background-image"],
                colors: docs.colors,
                typography: docs.typography,
                layout: docs.layout,
                settings: docs.settings,
                theme: docs.theme,
                "navbar-links": docs["navbar-links"] ?? [],
                "footer-links": docs["footer-links"],
                "page-actions": docs["page-actions"],
                metadata: docs.metadata,
                redirects: docs.redirects ?? [],
                analytics: docs.analytics,
                announcement: docs.announcement,
                roles: docs.roles,
                libraries: docs.libraries,
                "default-language": docs["default-language"],
                languages: docs.languages,
                css: docs.css,
                js: docs.js,
                "ai-chat": docs["ai-chat"],
                "ai-search": docs["ai-search"],
                "ai-examples": docs["ai-examples"],
                integrations: docs.integrations,
                experimental: docs.experimental,
                header: docs.header,
                footer: docs.footer,

                // Converted fields (navigation requires discriminated union conversion)
                navigation: docs.navigation != null ? this.convertNavigation(docs.navigation) : undefined,
                "landing-page":
                    docs["landing-page"] != null ? this.convertPage(docs["landing-page"]) : undefined,
                versions: docs.versions != null ? this.convertVersions(docs.versions) : undefined,
                products: docs.products != null ? this.convertProducts(docs.products) : undefined,

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

    // ================================================================
    // Navigation conversion (key-presence -> discriminated union)
    // ================================================================

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
            page: raw.page,
            path: raw.path,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden,
            noindex: raw.noindex
        };
    }

    private convertSection(raw: schemas.SectionConfigurationSchema): NavigationItem.Section {
        return {
            type: "section",
            section: raw.section,
            path: raw.path,
            contents: (raw.contents as schemas.NavigationItem[]).map((item) => this.convertNavigationItem(item)),
            collapsed: raw.collapsed,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden,
            "skip-slug": raw["skip-slug"]
        };
    }

    private convertApiReference(raw: schemas.ApiReferenceConfigurationSchema): NavigationItem.ApiReference {
        return {
            type: "apiReference",
            api: raw.api,
            "api-name": raw["api-name"],
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden,
            audiences: raw.audiences,
            "display-errors": raw["display-errors"],
            snippets: raw.snippets,
            playground: raw.playground,
            collapsed: raw.collapsed,
            alphabetized: raw.alphabetized,
            flattened: raw.flattened,
            paginated: raw.paginated
        };
    }

    private convertLink(raw: schemas.LinkConfigurationSchema): NavigationItem.Link {
        return {
            type: "link",
            link: raw.link,
            href: raw.href,
            icon: raw.icon
        };
    }

    private convertChangelog(raw: schemas.ChangelogConfigurationSchema): NavigationItem.Changelog {
        return {
            type: "changelog",
            changelog: raw.changelog,
            title: raw.title,
            slug: raw.slug,
            icon: raw.icon,
            hidden: raw.hidden
        };
    }

    private convertLibrary(raw: schemas.LibraryReferenceConfigurationSchema): NavigationItem.Library {
        return {
            type: "library",
            library: raw.library,
            title: raw.title,
            slug: raw.slug
        };
    }

    private convertFolder(raw: schemas.FolderConfigurationSchema): NavigationItem.Folder {
        return {
            type: "folder",
            folder: raw.folder,
            title: raw.title,
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
            "display-name": raw["display-name"],
            path: raw.path,
            slug: raw.slug,
            availability: raw.availability
        };
    }

    private convertProducts(raw: schemas.ProductConfigSchema[]): Product[] {
        return raw.map((product) => this.convertProduct(product));
    }

    private convertProduct(raw: schemas.ProductConfigSchema): Product {
        if ("href" in raw) {
            return {
                type: "external",
                "display-name": raw["display-name"],
                href: raw.href as string,
                icon: raw.icon
            };
        }
        return {
            type: "internal",
            "display-name": raw["display-name"],
            path: (raw as schemas.InternalProductConfigSchema).path,
            icon: raw.icon,
            slug: (raw as schemas.InternalProductConfigSchema).slug,
            versions: raw.versions != null ? this.convertVersions(raw.versions) : undefined
        };
    }
}
