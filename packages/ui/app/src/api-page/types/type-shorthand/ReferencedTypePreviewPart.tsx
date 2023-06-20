import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { visitDiscriminatedUnion } from "../../../utils/visitDiscriminatedUnion";
import { TypeShorthand } from "./TypeShorthand";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: FernRegistryApiRead.TypeId;
        plural: boolean;
        withArticle?: boolean;
    }
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({
    typeId,
    plural,
    withArticle = false,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const shape = resolveTypeById(typeId).shape;

    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;

    return (
        <>
            {visitDiscriminatedUnion(shape, "type")._visit<JSX.Element | string>({
                alias: (typeReference) => <TypeShorthand type={typeReference.value} plural={plural} />,
                object: () => (plural ? "objects" : maybeWithArticle("an", "object")),
                undiscriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
                discriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
                enum: () => (plural ? "enums" : maybeWithArticle("an", "enum")),
                _other: () => "<unknown>",
            })}
        </>
    );
};
