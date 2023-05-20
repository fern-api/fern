import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItemLayout } from "./SidebarItemLayout";
import { SidebarItems } from "./SidebarItems";

export declare namespace SidebarDocsSection {
    export interface Props {
        slug: string;
        section: FernRegistryDocsRead.DocsSection;
    }
}

export const SidebarDocsSection: React.FC<SidebarDocsSection.Props> = ({ slug, section }) => {
    return (
        <SidebarGroup title={<SidebarItemLayout title={section.title} />}>
            <SidebarItems slug={slug} navigationItems={section.items} />
        </SidebarGroup>
    );
};
