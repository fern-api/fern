import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { PackageSidebarSection } from "./PackageSidebarSection";
import { TopLevelEndpointSidebarItem } from "./TopLevelEndpointSidebarItem";

export const DefinitionSidebarItems: React.FC = () => {
    const { api } = useApiDefinitionContext();

    return (
        <div className="flex flex-col overflow-y-auto px-3">
            {api.rootPackage.endpoints.map((endpoint) => (
                <TopLevelEndpointSidebarItem key={endpoint.id} endpoint={endpoint} />
            ))}
            {api.rootPackage.subpackages.map((subpackageId) => (
                <PackageSidebarSection key={subpackageId} subpackageId={subpackageId} />
            ))}
        </div>
    );
};
