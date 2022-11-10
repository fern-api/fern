import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { List } from "./List";
import { Literal } from "./Literal";
import { Map } from "./Map";
import { Optional } from "./Optional";
import { Set } from "./Set";

export declare namespace Container {
    export interface Props {
        container: FernApiEditor.ContainerType;
    }
}

export const Container: React.FC<Container.Props> = ({ container }) => {
    return container._visit({
        list: (itemType) => <List itemType={itemType} />,
        set: (itemType) => <Set itemType={itemType} />,
        optional: (itemType) => <Optional itemType={itemType} />,
        map: ({ keyType, valueType }) => <Map keyType={keyType} valueType={valueType} />,
        literal: (literal) => <Literal literal={literal} />,
        _other: ({ type }) => {
            throw new Error("Unknown Container type: " + type);
        },
    });
};
