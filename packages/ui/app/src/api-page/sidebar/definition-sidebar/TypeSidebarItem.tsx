import { FernRegistry } from "@fern-fern/registry";
import { RiAlbumFill } from "react-icons/ri";
import { useTypePath } from "../../../routes/definition/useTypePath";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
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

    return <SidebarItem path={path} icon={<RiAlbumFill />} title={type.name} />;
};
