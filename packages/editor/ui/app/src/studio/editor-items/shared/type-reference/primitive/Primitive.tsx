import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export declare namespace Primitive {
    export interface Props {
        primitive: FernApiEditor.PrimitiveType;
    }
}

export const Primitive: React.FC<Primitive.Props> = ({ primitive }) => {
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

    return <>{textContent}</>;
};
