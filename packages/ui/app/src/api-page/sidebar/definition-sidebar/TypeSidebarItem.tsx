import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import { FernRoutes } from "../../../routes";

export declare namespace TypeSidebarItem {
    export interface Props {
        typeId: FernRegistry.TypeId;
        ancestorPackageNames: readonly string[];
    }
}

export const TypeSidebarItem: React.FC<TypeSidebarItem.Props> = ({ typeId, ancestorPackageNames }) => {
    const {
        [FernRoutes.API_DEFINITION.parameters.API_ID]: apiId,
        [FernRoutes.API_DEFINITION.parameters.ENVIRONMENT]: environmentId,
    } = useParams();

    // const { resolveType } = useApiContext();
    // const type = resolveType(typeId);

    const navigate = useNavigate();
    const onClick = useCallback(() => {
        if (apiId == null || environmentId == null) {
            return;
        }
        navigate(
            [
                generatePath(FernRoutes.API_DEFINITION.absolutePath, {
                    API_ID: apiId,
                    ENVIRONMENT: environmentId,
                }),
                ...ancestorPackageNames.map((name) => `/${name}`),
                generatePath(FernRoutes.RELATIVE_TYPE.absolutePath, {
                    TYPE_ID: typeId,
                }),
            ].join("")
        );
    }, [ancestorPackageNames, apiId, environmentId, navigate, typeId]);

    return <div onClick={onClick}>{"<Type>"}</div>;
};
