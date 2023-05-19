import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { ApiSidebarSection } from "./ApiSidebarSection";
import { PageSidebarItem } from "./PageSidebarItem";
import { SidebarDocsSection } from "./SidebarDocsSection";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarItems {
    export interface Props {
        navigationItems: FernRegistryDocsRead.NavigationItem[];
    }
}

export const SidebarItems: React.FC<SidebarItems.Props> = ({ navigationItems }) => {
    return (
        <div className="flex flex-col overflow-y-auto">
            <SidebarItemLayout title={<div className="uppercase font-bold text-white">API Reference</div>} />
            {navigationItems.map((navigationItem) =>
                navigationItem._visit({
                    page: (pageMetadata) => <PageSidebarItem pageMetadata={pageMetadata} />,
                    section: (section) => <SidebarDocsSection section={section} />,
                    api: (apiSection) => <ApiSidebarSection apiSection={apiSection} />,
                    _other: () => null,
                })
            )}
        </div>
    );
};
