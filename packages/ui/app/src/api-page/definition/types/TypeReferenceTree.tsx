import { FernRegistry } from "@fern-fern/registry";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { ReferencedTypePreviewPart } from "./type-preview/ReferencedTypePreviewPart";

export declare namespace TypeReferenceTree {
    export interface Props {
        type: FernRegistry.TypeReference;
    }
}

export const TypeReferenceTree: React.FC<TypeReferenceTree.Props> = ({ type }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    return (
        <div className="flex">
            {type._visit({
                id: (typeId) => {
                    const typeDefinition = resolveTypeById(typeId);
                    return (
                        <div>
                            <ReferencedTypePreviewPart typeId={typeId} />
                            is
                            {typeDefinition.shape._visit({
                                alias: () => "an alias",
                                object: () => "an object",
                                undiscriminatedUnion: () => "a union",
                                discriminatedUnion: () => "a union",
                                enum: () => "an enum",
                                _other: () => "<unknown>",
                            })}
                        </div>
                    );
                },
                primitive: () => {
                    return <div />;
                },
                optional: () => {
                    return <div />;
                },
                list: () => {
                    return <div />;
                },
                set: () => {
                    return <div />;
                },
                map: () => {
                    return <div />;
                },
                unknown: () => {
                    return <div />;
                },
                _other: () => {
                    return <div />;
                },
            })}
        </div>
    );
};
