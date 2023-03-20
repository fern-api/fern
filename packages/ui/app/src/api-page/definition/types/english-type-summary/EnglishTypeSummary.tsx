import { FernRegistry } from "@fern-fern/registry";
import indefinite from "indefinite";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { PrimitivePreviewPart } from "../type-preview/PrimitivePreviewPart";
import { ReferencedTypePreviewPart } from "../type-preview/ReferencedTypePreviewPart";
import { TypeString } from "../type-preview/TypeString";

export declare namespace EnglishTypeSummary {
    export interface Props {
        type: FernRegistry.TypeReference;
        isEndOfSentence?: boolean;
        plural?: boolean;
        includeReferencedTypeSummary?: boolean;
    }
}

export const EnglishTypeSummary: React.FC<EnglishTypeSummary.Props> = ({
    type,
    isEndOfSentence = false,
    plural = false,
    includeReferencedTypeSummary = false,
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
                            {includeReferencedTypeSummary && (
                                <>
                                    <span className="mr-1">, which is an</span>
                                    {/* TODO figure out resolved type */}
                                    <TypeString>object</TypeString>
                                </>
                            )}
                        </>
                    );
                },
                primitive: (primitive) => {
                    return <PrimitivePreviewPart primitive={primitive} shouldIncludeArticle plural={plural} />;
                },
                optional: ({ itemType }) => <EnglishTypeSummary type={itemType} />,
                list: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article="a" className="mr-1">
                                list
                            </TypeString>
                            <span className="mr-1">of</span>
                            <EnglishTypeSummary type={itemType} plural />
                        </>
                    );
                },
                set: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article="a" className="mr-1">
                                set
                            </TypeString>
                            <span className="mr-1">of</span>
                            <EnglishTypeSummary type={itemType} plural />
                        </>
                    );
                },
                map: ({ keyType, valueType }) => {
                    return (
                        <>
                            <TypeString article="a">map of key-value pairs</TypeString>
                            <span className="mr-1">. The</span>
                            <TypeString className="mr-1">keys</TypeString>
                            <span className="mr-1">are</span>
                            <EnglishTypeSummary type={keyType} plural />
                            <span className="mx-1">and</span>
                            <span className="mr-1">the</span>
                            <TypeString className="mr-1">values</TypeString>
                            <span className="mr-1">are</span>
                            <EnglishTypeSummary type={valueType} plural />
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
