import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { ApiPackageSidebarSection } from "./ApiPackageSidebarSection";
import { EndpointSidebarItem } from "./EndpointSidebarItem";

export declare namespace ApiPackageSidebarSectionContents {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        subpackageId: FernRegistryApiRead.SubpackageId;
        shouldShowEndpoints: boolean;
    }
}

export const ApiPackageSidebarSectionContents: React.FC<ApiPackageSidebarSectionContents.Props> = ({
    package: package_,
    subpackageId,
    shouldShowEndpoints,
}) => {
    return (
        <div className="flex flex-col">
            {shouldShowEndpoints &&
                package_.endpoints.map((endpoint, endpointIndex) => (
                    <EndpointSidebarItem key={endpointIndex} endpoint={endpoint} subpackageId={subpackageId} />
                ))}
            {package_.subpackages.map((subpackageId) => (
                <ApiPackageSidebarSection key={subpackageId} subpackageId={subpackageId} />
            ))}
        </div>
    );
};
