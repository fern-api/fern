import { FernRegistry } from "@fern-fern/registry";
import { useApiContext } from "../../context/useApiContext";
import { ObjectDefinition } from "./object/ObjectDefinition";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        typeDefinition: FernRegistry.Type;
    }
}

export const TypeDefinitionDetails: React.FC<TypeDefinitionDetails.Props> = ({ typeDefinition }) => {
    const { resolveType } = useApiContext();

    return typeDefinition._visit<JSX.Element | null>({
        reference: (typeId) => <TypeDefinitionDetails typeDefinition={resolveType(typeId)} />,
        object: (object) => <ObjectDefinition object={object} />,
        enum: () => <span>enum</span>,
        primitive: () => null,
        list: () => <span>list</span>,
        set: () => <span>set</span>,
        map: () => <span>map</span>,
        optional: () => <span>optional</span>,
        unknown: () => null,
        discriminatedUnion: () => <span>union</span>,
        _other: () => null,
    });
};
