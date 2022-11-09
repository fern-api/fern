import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { EditableTypeReferenceContent } from "../EditableTypeReferenceContent";

export declare namespace Primitive {
    export interface Props {
        primitive: FernApiEditor.PrimitiveType;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }
}

export const Primitive: React.FC<Primitive.Props> = ({ primitive, onChange }) => {
    const textContent = primitive.visit({
        string: () => "string",
        integer: () => "integer",
        double: () => "double",
        long: () => "long",
        dateTime: () => "dateTime",
        uuid: () => "uuid",
        boolean: () => "boolean",
        _other: (value) => {
            throw new Error("Unknown PrimitiveType: " + value);
        },
    });

    return (
        <EditableTypeReferenceContent onChange={onChange}>
            <>{textContent}</>
        </EditableTypeReferenceContent>
    );
};
