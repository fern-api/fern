import { useApiContext } from "../context/useApiContext";
import { PackagePage } from "./PackagePage";

export const ApiDefinition: React.FC = () => {
    const { api } = useApiContext();

    if (api.type !== "loaded" || !api.value.ok) {
        return null;
    }

    return <PackagePage api={api.value.body} parent={api.value.body.rootPackage} />;
};
