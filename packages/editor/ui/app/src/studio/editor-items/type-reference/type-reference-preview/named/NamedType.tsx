import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useApiEditorContext } from "../../../../../api-editor-context/ApiEditorContext";

export declare namespace NamedType {
    export interface Props {
        typeId: FernApiEditor.TypeId;
    }
}

export const NamedType: React.FC<NamedType.Props> = ({ typeId }) => {
    const { definition } = useApiEditorContext();
    const type = definition.types[typeId];
    if (type == null) {
        throw new Error("Type does not exist: " + typeId);
    }
    return <>{type.typeName}</>;
};
