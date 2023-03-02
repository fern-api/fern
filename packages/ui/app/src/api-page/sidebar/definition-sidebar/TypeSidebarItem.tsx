import { FernRegistry } from "@fern-fern/registry";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
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

    return <SidebarItem path={path} title={type.name} />;
};
