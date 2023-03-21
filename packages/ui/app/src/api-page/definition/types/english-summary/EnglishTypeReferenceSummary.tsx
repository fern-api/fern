import { FernRegistry } from "@fern-fern/registry";
import indefinite from "indefinite";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { PrimitivePreviewPart } from "../type-preview/PrimitivePreviewPart";
import { ReferencedTypePreviewPart } from "../type-preview/ReferencedTypePreviewPart";
import { TypeString } from "../type-preview/TypeString";

export declare namespace EnglishTypeReferenceSummary {
    export interface Props {
        type: FernRegistry.TypeReference;
        isEndOfSentence?: boolean;
        plural?: boolean;
    }
}

export const EnglishTypeReferenceSummary: React.FC<EnglishTypeReferenceSummary.Props> = ({
    type,
    isEndOfSentence = false,
    plural = false,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const summary = (
        <>
            {type._visit<JSX.Element | string>({
                id: (typeId) => {
                    const resolvedType = resolveTypeById(typeId);
                    return (
                        <>
                            {plural || (
                                <span className="mr-1">{indefinite(resolvedType.name, { articleOnly: true })}</span>
                            )}
                            <ReferencedTypePreviewPart typeId={typeId} />
                        </>
                    );
                },
                primitive: (primitive) => {
                    return <PrimitivePreviewPart primitive={primitive} shouldIncludeArticle plural={plural} />;
                },
                optional: ({ itemType }) => <EnglishTypeReferenceSummary type={itemType} />,
                list: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article={plural ? undefined : "a"} className="mr-1">
                                {plural ? "lists" : "list"}
                            </TypeString>
                            <span className="mr-1">of</span>
                            <EnglishTypeReferenceSummary type={itemType} plural />
                        </>
                    );
                },
                set: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article={plural ? undefined : "a"} className="mr-1">
                                {plural ? "sets" : "set"}
                            </TypeString>
                            <span className="mr-1">of</span>
                            <EnglishTypeReferenceSummary type={itemType} plural />
                        </>
                    );
                },
                map: ({ keyType, valueType }) => {
                    return (
                        <>
                            <TypeString article={plural ? undefined : "a"}>
                                {plural ? "maps" : "map" + " of key-value pairs"}
                            </TypeString>
                            <span className="mr-1">. The</span>
                            <TypeString className="mr-1">keys</TypeString>
                            <span className="mr-1">are</span>
                            <EnglishTypeReferenceSummary type={keyType} plural />
                            <span className="mx-1">and</span>
                            <span className="mr-1">the</span>
                            <TypeString className="mr-1">values</TypeString>
                            <span className="mr-1">are</span>
                            <EnglishTypeReferenceSummary type={valueType} plural />
                        </>
                    );
                },
                unknown: () => "unknown",
                _other: () => "<unknown>",
            })}
        </>
    );

    if (!isEndOfSentence) {
        return summary;
    }

    return <>{summary}.</>;
};
