import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { PackageRoutes } from "./PackageRoutes";

export const ApiDefinition: React.FC = () => {
    const { api } = useApiDefinitionContext();
    if (api.type !== "loaded") {
        return null;
    }

    return <PackageRoutes api={api.value} parent={api.value.rootPackage} />;
};
