import { FernRegistry } from "@fern-fern/registry";
import { EndpointSidebarItem } from "./EndpointSidebarItem";
import { PackageSidebarSection } from "./PackageSidebarSection";

export declare namespace PackageSidebarSectionContents {
    export interface Props {
        package: FernRegistry.ApiDefinitionPackage;
        subpackageId: FernRegistry.SubpackageId;
        shouldShowEndpoints: boolean;
    }
}

export const PackageSidebarSectionContents: React.FC<PackageSidebarSectionContents.Props> = ({
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
                <PackageSidebarSection key={subpackageId} subpackageId={subpackageId} />
            ))}
        </div>
    );
};
