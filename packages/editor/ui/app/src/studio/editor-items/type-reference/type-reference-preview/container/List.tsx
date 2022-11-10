import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { ParameterizedType } from "./parameterized-type/ParameterizedType";

export declare namespace List {
    export interface Props {
        itemType: FernApiEditor.TypeReference;
    }
}

export const List: React.FC<List.Props> = ({ itemType }) => {
    const typeParameters = useMemo((): FernApiEditor.TypeReference[] => [itemType], [itemType]);
    return <ParameterizedType typeName="list" typeParameters={typeParameters} />;
};
