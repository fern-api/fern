import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { ClickableSidebarItem } from "./ClickableSidebarItem";
import { ApiDefinitionSidebarContext, ApiDefinitionSidebarContextValue } from "./context/ApiDefinitionSidebarContext";
import { PackageSidebarSection } from "./PackageSidebarSection";
import { SidebarItemLayout } from "./SidebarItemLayout";
import { TopLevelEndpointSidebarItem } from "./TopLevelEndpointSidebarItem";

const CONTEXT_VALUE: ApiDefinitionSidebarContextValue = { depth: 1 };

export const DefinitionSidebarItems: React.FC = () => {
    const { api } = useApiDefinitionContext();

    return (
        <div className="flex flex-col overflow-y-auto">
            <ClickableSidebarItem path="" isSelected={false} title="Introduction" />
            <ClickableSidebarItem path="" isSelected={false} title="Getting started" />
            <ClickableSidebarItem path="" isSelected={false} title="Authentication" />
            <SidebarItemLayout title={<div className="uppercase font-bold text-white">API Reference</div>} />
            <ApiDefinitionSidebarContext.Provider value={CONTEXT_VALUE}>
                {api.rootPackage.endpoints.map((endpoint) => (
                    <TopLevelEndpointSidebarItem key={endpoint.id} endpoint={endpoint} />
                ))}
                {api.rootPackage.subpackages.map((subpackageId) => (
                    <PackageSidebarSection key={subpackageId} subpackageId={subpackageId} />
                ))}
            </ApiDefinitionSidebarContext.Provider>
        </div>
    );
};
