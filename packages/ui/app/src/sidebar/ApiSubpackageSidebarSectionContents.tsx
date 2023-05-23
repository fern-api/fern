import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { EndpointSidebarItem } from "./EndpointSidebarItem";

export declare namespace ApiSubpackageSidebarSectionContents {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
    }
}

export const ApiSubpackageSidebarSectionContents: React.FC<ApiSubpackageSidebarSectionContents.Props> = ({
    subpackage,
    slug,
}) => {
    return (
        <div className="flex flex-col">
            {subpackage.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem
                    key={endpointIndex}
                    endpoint={endpoint}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                />
            ))}
            <ApiSubpackages package={subpackage} slug={slug} />
        </div>
    );
};
