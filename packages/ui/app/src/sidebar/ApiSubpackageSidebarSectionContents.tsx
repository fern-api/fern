import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { ApiSubpackages } from "./ApiSubpackages";
import { EndpointSidebarItem } from "./EndpointSidebarItem";

export declare namespace ApiSubpackageSidebarSectionContents {
    export interface Props {
        apiId: FernRegistry.ApiDefinitionId;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
    }
}

export const ApiSubpackageSidebarSectionContents: React.FC<ApiSubpackageSidebarSectionContents.Props> = ({
    apiId,
    subpackage,
    slug,
}) => {
    return (
        <div className="flex flex-col">
            {subpackage.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem key={endpointIndex} endpoint={endpoint} parentSlug={slug} />
            ))}
            <ApiSubpackages apiId={apiId} package={subpackage} slug={slug} />
        </div>
    );
};
