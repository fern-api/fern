import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";

export const DefinitionSidebarItems: React.FC = () => {
    const { api } = useApiDefinitionContext();

    if (api.type !== "loaded") {
        return null;
    }

    return (
        <div className="flex flex-col overflow-auto">
            <PackageSidebarSectionContents package={api.value.rootPackage} packagePath={EMPTY_ARRAY} />
        </div>
    );
};
