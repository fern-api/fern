import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { ParameterizedType, TypeParameter } from "./parameterized-type/ParameterizedType";

export declare namespace List {
    export interface Props {
        itemType: FernApiEditor.TypeReference;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }
}

export const List: React.FC<List.Props> = ({ itemType, onChange }) => {
    const typeParameters = useMemo(
        (): TypeParameter[] => [
            {
                shape: itemType,
                onChange: (newItemType) => {
                    onChange(FernApiEditor.TypeReference.container(FernApiEditor.ContainerType.list(newItemType)));
                },
            },
        ],
        [itemType, onChange]
    );

    return <ParameterizedType typeName="list" typeParameters={typeParameters} />;
};
