import { FernRegistry } from "@fern-fern/registry";
import { useApiContext } from "../../context/useApiContext";

export declare namespace InlinedTypeDetailsHeader {
    export interface Props {
        typeDefinition: FernRegistry.Type;
    }
}

export const InlinedTypeDetailsHeader: React.FC<InlinedTypeDetailsHeader.Props> = ({ typeDefinition }) => {
    const { resolveType } = useApiContext();

    return typeDefinition._visit<JSX.Element | null>({
        reference: (typeId) => <InlinedTypeDetailsHeader typeDefinition={resolveType(typeId)} />,
        object: () => <span>properties</span>,
        enum: () => <span>options</span>,
        primitive: () => null,
        list: () => <span>list</span>,
        set: () => <span>set</span>,
        map: () => <span>map</span>,
        optional: () => <span>optional</span>,
        unknown: () => null,
        discriminatedUnion: () => <span>items</span>,
        _other: () => null,
    });
};
