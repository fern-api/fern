import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { joinUrlSlugs } from "./joinUrlSlugs";
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
        <div className="flex flex-col overflow-y-auto">
            {navigationItems.map((navigationItem) =>
                navigationItem._visit({
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
                        <ApiDefinitionContextProvider apiId={apiSection.api}>
                            <ApiSidebarSection
                                key={apiSection.urlSlug}
                                slug={joinUrlSlugs(slug, apiSection.urlSlug)}
                                apiSection={apiSection}
                            />
                        </ApiDefinitionContextProvider>
                    ),
                    _other: () => null,
                })
            )}
        </div>
    );
};
