import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItems } from "./SidebarItems";

export declare namespace SidebarDocsSection {
    export interface Props {
        section: FernRegistryDocsRead.DocsSection;
    }
}

export const SidebarDocsSection: React.FC<SidebarDocsSection.Props> = ({ section }) => {
    return (
        <SidebarGroup title={section.title} path={""} resolvedUrlPath={undefined!} isSelected={false}>
            <SidebarItems navigationItems={section.items} />
        </SidebarGroup>
    );
};
