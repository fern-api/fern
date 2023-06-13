import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v1/resources/read";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItems } from "./SidebarItems";

export declare namespace SidebarDocsSection {
    export interface Props {
        slug: string;
        section: FernRegistryDocsRead.DocsSection.Raw;
    }
}

export const SidebarDocsSection: React.FC<SidebarDocsSection.Props> = ({ slug, section }) => {
    return (
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={section.title} />} includeTopMargin>
            <SidebarItems slug={slug} navigationItems={section.items} />
        </SidebarGroup>
    );
};
