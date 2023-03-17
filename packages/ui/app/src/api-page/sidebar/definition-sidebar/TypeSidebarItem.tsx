import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { TypeIcon } from "../../definition/types/TypeIcon";
import { useTypePath } from "../../routes/useTypePath";
import { useApiDefinitionSidebarContext } from "./context/useApiDefinitionSidebarContext";
import { SidebarItem } from "./SidebarItem";

export declare namespace TypeSidebarItem {
    export interface Props {
        typeId: FernRegistry.TypeId;
    }
}

export const TypeSidebarItem: React.FC<TypeSidebarItem.Props> = ({ typeId }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    const type = resolveTypeById(typeId);

    const { environmentId } = useApiDefinitionSidebarContext();
    const path = useTypePath({ environmentId, typeId });

    const renderIcon = useCallback(({ isSelected }: { isSelected: boolean }) => {
        return <TypeIcon color={isSelected ? "green" : "#666"} />;
    }, []);

    return <SidebarItem path={path} title={type.name} icon={renderIcon} />;
};
