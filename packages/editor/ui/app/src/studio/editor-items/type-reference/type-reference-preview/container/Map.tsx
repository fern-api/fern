import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { ParameterizedType } from "./parameterized-type/ParameterizedType";

export declare namespace Map {
    export interface Props {
        keyType: FernApiEditor.TypeReference;
        valueType: FernApiEditor.TypeReference;
    }
}

export const Map: React.FC<Map.Props> = ({ keyType, valueType }) => {
    const typeParameters = useMemo((): FernApiEditor.TypeReference[] => [keyType, valueType], [keyType, valueType]);

    return <ParameterizedType typeName="map" typeParameters={typeParameters} />;
};
