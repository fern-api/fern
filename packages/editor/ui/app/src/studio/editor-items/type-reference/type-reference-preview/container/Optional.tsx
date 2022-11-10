import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { ParameterizedType } from "./parameterized-type/ParameterizedType";

export declare namespace Optional {
    export interface Props {
        itemType: FernApiEditor.TypeReference;
    }
}

export const Optional: React.FC<Optional.Props> = ({ itemType }) => {
    const typeParameters = useMemo((): FernApiEditor.TypeReference[] => [itemType], [itemType]);
    return <ParameterizedType typeName="optional" typeParameters={typeParameters} />;
};
