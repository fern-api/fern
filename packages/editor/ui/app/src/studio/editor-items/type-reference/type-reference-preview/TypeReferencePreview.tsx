import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { NamedTypePreview } from "../named-type/NamedTypePreview";
import { Container } from "./container/Container";
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
        named: (typeId) => <NamedTypePreview typeId={typeId} />,
        unknown: () => <Unknown />,
        _other: ({ type }) => {
            throw new Error("Unknown TypeReference type: " + type);
        },
    });
};
