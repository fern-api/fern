import { useApiContext } from "../context/useApiContext";
import { PackageRoutes } from "./PackageRoutes";

export const ApiDefinition: React.FC = () => {
    const { api } = useApiContext();
    if (api.type !== "loaded") {
        return null;
    }

    return <PackageRoutes api={api.value} parent={api.value.rootPackage} />;
};
