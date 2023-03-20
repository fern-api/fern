import { FernRegistry } from "@fern-fern/registry";
import indefinite from "indefinite";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { PrimitivePreviewPart } from "../type-preview/PrimitivePreviewPart";
import { ReferencedTypePreviewPart } from "../type-preview/ReferencedTypePreviewPart";
import { TypeString } from "../type-preview/TypeString";

export declare namespace EnglishTypeSummary {
    export interface Props {
        type: FernRegistry.Type;
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
                reference: (typeId) => {
                    const resolvedType = resolveTypeById(typeId);
                    return (
                        <>
                            {indefinite(resolvedType.name, { articleOnly: true })}
                            &nbsp;
                            <ReferencedTypePreviewPart typeId={typeId} />
                            {includeReferencedTypeSummary && (
                                <>
                                    , which is an&nbsp;
                                    {/* TODO figure out resolved type */}
                                    <TypeString>object</TypeString>
                                </>
                            )}
                        </>
                    );
                },
                enum: () => <TypeString article="an">enum</TypeString>,
                union: () => <TypeString article="a">union</TypeString>,
                discriminatedUnion: () => <TypeString article="a">discriminated union</TypeString>,
                object: () => <TypeString article="an">object</TypeString>,
                primitive: (primitive) => {
                    return <PrimitivePreviewPart primitive={primitive} shouldIncludeArticle plural={plural} />;
                },
                optional: ({ itemType }) => <EnglishTypeSummary type={itemType} />,
                list: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article="a">list</TypeString>
                            &nbsp;of&nbsp;
                            <EnglishTypeSummary type={itemType} plural />
                        </>
                    );
                },
                set: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article="a">set</TypeString>
                            &nbsp;of&nbsp;
                            <EnglishTypeSummary type={itemType} plural />
                        </>
                    );
                },
                map: ({ keyType, valueType }) => {
                    return (
                        <>
                            <TypeString article="a">map of key-value pairs</TypeString>, where&nbsp;
                            {
                                // references can't be pluralized
                                keyType.type === "reference" ? (
                                    <>
                                        each&nbsp;<TypeString>key</TypeString>&nbsp;is
                                    </>
                                ) : (
                                    <>
                                        the&nbsp;<TypeString>keys</TypeString>&nbsp;are
                                    </>
                                )
                            }
                            &nbsp;
                            <EnglishTypeSummary type={keyType} plural />
                            &nbsp;and&nbsp;
                            {
                                // references can't be pluralized
                                valueType.type === "reference" ? (
                                    <>
                                        each&nbsp;<TypeString>value</TypeString>&nbsp;is
                                    </>
                                ) : (
                                    <>
                                        the&nbsp;<TypeString>values</TypeString>&nbsp;are
                                    </>
                                )
                            }
                            &nbsp;
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
