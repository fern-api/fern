import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiArtifactsSidebarItem } from "./ApiArtifactsSidebarItem";
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
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <ApiArtifactsSidebarItem slug={joinUrlSlugs(slug, "client-libraries")} />
            )}
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
