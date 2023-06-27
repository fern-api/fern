import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { PageSidebarItem } from "./PageSidebarItem";
import { SidebarDocsSection } from "./SidebarDocsSection";

export declare namespace SidebarItems {
    export interface Props {
        slug: string;
        navigationItems: FernRegistryDocsRead.NavigationItem[];
    }
}

export const SidebarItems: React.FC<SidebarItems.Props> = ({ slug, navigationItems }) => {
    return (
        <div className="flex flex-col">
            {navigationItems.map((navigationItem) =>
                visitDiscriminatedUnion(navigationItem, "type")._visit({
                    page: (pageMetadata) => (
                        <PageSidebarItem
                            key={pageMetadata.urlSlug}
                            slug={joinUrlSlugs(slug, pageMetadata.urlSlug)}
                            pageMetadata={pageMetadata}
                        />
                    ),
                    section: (section) => (
                        <SidebarDocsSection
                            key={section.urlSlug}
                            slug={joinUrlSlugs(slug, section.urlSlug)}
                            section={section}
                        />
                    ),
                    api: (apiSection) => (
                        <ApiDefinitionContextProvider key={apiSection.urlSlug} apiSection={apiSection} apiSlug={slug}>
                            <ApiSidebarSection slug={joinUrlSlugs(slug, apiSection.urlSlug)} />
                        </ApiDefinitionContextProvider>
                    ),
                    _other: () => null,
                })
            )}
        </div>
    );
};
