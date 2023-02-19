import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { useTypePath } from "../../../routes/definition/useTypePath";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { useApiTabsContext } from "../../api-tabs/context/useApiTabsContext";
import { useApiDefinitionSidebarContext } from "./context/useApiDefinitionSidebarContext";

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

    const { openTab } = useApiTabsContext();
    const onClick = useCallback(() => {
        openTab(path);
    }, [openTab, path]);

    return <div onClick={onClick}>{type.name}</div>;
};
