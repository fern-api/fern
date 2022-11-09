import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TypeReference } from "../TypeReference";
import { List } from "./List";
import { Literal } from "./Literal";
import { Map } from "./Map";

export declare namespace Container {
    export interface Props {
        container: FernApiEditor.ContainerType;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }
}

export const Container: React.FC<Container.Props> = ({ container, onChange }) => {
    return container._visit({
        list: (itemType) => <List itemType={itemType} onChange={onChange} />,
        set: (itemType) => <TypeReference typeReference={itemType} onChange={onChange} />,
        optional: (itemType) => <TypeReference typeReference={itemType} onChange={onChange} />,
        map: ({ keyType, valueType }) => <Map keyType={keyType} valueType={valueType} onChange={onChange} />,
        literal: (literal) => <Literal literal={literal} />,
        _other: ({ type }) => {
            throw new Error("Unknown Container type: " + type);
        },
    });
};
