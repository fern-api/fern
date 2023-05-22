import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiSubpackages } from "./ApiSubpackages";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { TopLevelEndpointSidebarItem } from "./TopLevelEndpointSidebarItem";

export declare namespace ApiSidebarSection {
    export interface Props {
        apiSection: FernRegistryDocsRead.ApiSection;
        slug: string;
    }
}

export const ApiSidebarSection: React.FC<ApiSidebarSection.Props> = ({ slug, apiSection }) => {
    const { docsDefinition } = useDocsContext();

    const api = docsDefinition.apis[apiSection.api];
    if (api == null) {
        throw new Error("API does not exist: " + apiSection.api);
    }

    return (
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={apiSection.title} />} includeTopMargin>
            {api.rootPackage.endpoints.map((endpoint) => (
                <TopLevelEndpointSidebarItem
                    key={endpoint.id}
                    api={apiSection}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                    endpoint={endpoint}
                />
            ))}
            <ApiSubpackages api={apiSection} package={api.rootPackage} slug={slug} />
        </SidebarGroup>
    );
};
