import { FernRegistry } from "@fern-fern/registry";
import { PackagePath } from "../../../commons/PackagePath";
import { EndpointSidebarItem } from "./EndpointSidebarItem";
import { PackageSidebarSection } from "./PackageSidebarSection";

export declare namespace PackageSidebarSectionContents {
    export interface Props {
        package: FernRegistry.ApiDefinitionPackage;
        packagePath: PackagePath;
    }
}

export const PackageSidebarSectionContents: React.FC<PackageSidebarSectionContents.Props> = ({
    package: package_,
    packagePath,
}) => {
    return (
        <div className="flex flex-col">
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem key={endpointIndex} endpoint={endpoint} packagePath={packagePath} />
            ))}
            {package_.subpackages.map((subpackageId) => (
                <PackageSidebarSection key={subpackageId} subpackageId={subpackageId} packagePath={packagePath} />
            ))}
        </div>
    );
};
