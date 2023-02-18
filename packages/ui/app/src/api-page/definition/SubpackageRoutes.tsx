import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { PackageRoutes } from "./PackageRoutes";

const SUBPACKAGE_NAME_PARAM = "SUBPACKAGE_NAME";

export declare namespace SubpackageRoutes {
    export interface Props {
        api: FernRegistry.ApiDefinition;
        parent: FernRegistry.ApiDefinitionPackage;
    }
}

export const SubpackageRoutes: React.FC<SubpackageRoutes.Props> = ({ api, parent }) => {
    const { resolveSubpackage } = useApiDefinitionContext();
    const { [SUBPACKAGE_NAME_PARAM]: subpackageName } = useParams();

    const subpackage = useMemo(() => {
        if (subpackageName != null) {
            for (const subpackageId of parent.subpackages) {
                const maybeMatchingSubpackage = resolveSubpackage(subpackageId);
                if (maybeMatchingSubpackage.name === subpackageName) {
                    return maybeMatchingSubpackage;
                }
            }
        }
        return undefined;
    }, [parent, resolveSubpackage, subpackageName]);

    if (subpackage == null) {
        return <div>package does not exist</div>;
    }

    return <PackageRoutes api={api} parent={subpackage} />;
};
