import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { ParameterizedType, TypeParameter } from "./parameterized-type/ParameterizedType";

export declare namespace Map {
    export interface Props {
        keyType: FernApiEditor.TypeReference;
        valueType: FernApiEditor.TypeReference;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }
}

export const Map: React.FC<Map.Props> = ({ keyType, valueType, onChange }) => {
    const typeParameters = useMemo(
        (): TypeParameter[] => [
            {
                shape: keyType,
                onChange: (newKeyType) => {
                    onChange(
                        FernApiEditor.TypeReference.container(
                            FernApiEditor.ContainerType.map({ keyType: newKeyType, valueType })
                        )
                    );
                },
            },
            {
                shape: valueType,
                onChange: (newValueType) => {
                    onChange(
                        FernApiEditor.TypeReference.container(
                            FernApiEditor.ContainerType.map({ keyType, valueType: newValueType })
                        )
                    );
                },
            },
        ],
        [keyType, onChange, valueType]
    );

    return <ParameterizedType typeName="map" typeParameters={typeParameters} />;
};
