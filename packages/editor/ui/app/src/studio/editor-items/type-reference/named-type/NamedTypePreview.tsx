import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useApiEditorContext } from "../../../../api-editor-context/ApiEditorContext";
import { TYPE_NAME_PLACEHOLDER } from "../../types/type/placeholder";

export declare namespace NamedTypePreview {
    export interface Props {
        typeId: FernApiEditor.TypeId;
    }
}

export const NamedTypePreview: React.FC<NamedTypePreview.Props> = ({ typeId }) => {
    const { definition } = useApiEditorContext();
    const type = definition.types[typeId];
    if (type == null) {
        throw new Error("Type does not exist: " + typeId);
    }
    return <>{type.typeName.length > 0 ? type.typeName : <i>{TYPE_NAME_PLACEHOLDER}</i>}</>;
};
