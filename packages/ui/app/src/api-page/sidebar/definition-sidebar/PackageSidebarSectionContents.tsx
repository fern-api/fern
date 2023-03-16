import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useCallback } from "react";
import { PackagePath } from "../../../commons/PackagePath";
import { CollapsibleSidebarSection } from "./CollapsibleSidebarSection";
import { EndpointSidebarItem } from "./EndpointSidebarItem";
import { PackageSidebarSection } from "./PackageSidebarSection";
import { TypeSidebarItem } from "./TypeSidebarItem";

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
    const renderTypesTitle = useCallback(({ isHovering }: { isHovering: boolean }) => {
        return (
            <div
                className={classNames(
                    "uppercase font-bold text-xs tracking-wide",
                    isHovering ? "black" : "text-gray-500"
                )}
            >
                Types
            </div>
        );
    }, []);

    return (
        <div className="flex flex-col">
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem key={endpointIndex} endpoint={endpoint} packagePath={packagePath} />
            ))}
            {package_.subpackages.map((subpackageId) => (
                <PackageSidebarSection key={subpackageId} subpackageId={subpackageId} packagePath={packagePath} />
            ))}
            {package_.types.length > 0 && (
                <CollapsibleSidebarSection title={renderTypesTitle}>
                    {package_.types.map((typeId) => (
                        <TypeSidebarItem key={typeId} typeId={typeId} />
                    ))}
                </CollapsibleSidebarSection>
            )}
        </div>
    );
};
