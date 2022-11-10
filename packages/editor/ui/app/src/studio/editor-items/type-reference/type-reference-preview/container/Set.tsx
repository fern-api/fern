import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { ParameterizedType } from "./parameterized-type/ParameterizedType";

export declare namespace Set {
    export interface Props {
        itemType: FernApiEditor.TypeReference;
    }
}

export const Set: React.FC<Set.Props> = ({ itemType }) => {
    const typeParameters = useMemo((): FernApiEditor.TypeReference[] => [itemType], [itemType]);
    return <ParameterizedType typeName="set" typeParameters={typeParameters} />;
};
