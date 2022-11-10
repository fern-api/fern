import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Container } from "./container/Container";
import { NamedType } from "./named/NamedType";
import { Primitive } from "./primitive/Primitive";
import { Unknown } from "./unknown/Unknown";

export declare namespace TypeReferencePreview {
    export interface Props {
        typeReference: FernApiEditor.TypeReference;
    }
}

export const TypeReferencePreview: React.FC<TypeReferencePreview.Props> = ({ typeReference }) => {
    return typeReference._visit({
        container: (container) => <Container container={container} />,
        primitive: (primitive) => <Primitive primitive={primitive} />,
        named: (typeId) => <NamedType typeId={typeId} />,
        unknown: () => <Unknown />,
        _other: ({ type }) => {
            throw new Error("Unknown TypeReference type: " + type);
        },
    });
};
