import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { TopLevelEndpointSidebarItem } from "./TopLevelEndpointSidebarItem";

export declare namespace ApiSidebarSection {
    export interface Props {
        slug: string;
    }
}

export const ApiSidebarSection: React.FC<ApiSidebarSection.Props> = ({ slug }) => {
    const { apiSection, apiDefinition } = useApiDefinitionContext();

    return (
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={apiSection.title} />} includeTopMargin>
            {apiDefinition.rootPackage.endpoints.map((endpoint) => (
                <TopLevelEndpointSidebarItem
                    key={endpoint.id}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                    endpoint={endpoint}
                />
            ))}
            <ApiSubpackages package={apiDefinition.rootPackage} slug={slug} />
        </SidebarGroup>
    );
};
