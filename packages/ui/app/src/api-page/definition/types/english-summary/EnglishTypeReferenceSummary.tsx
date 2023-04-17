import { FernRegistry } from "@fern-fern/registry";
import { PrimitivePreviewPart } from "./PrimitivePreviewPart";
import { TypeString } from "./TypeString";
import { ReferencedTypePreviewPart } from "../type-shorthand/ReferencedTypePreviewPart";

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
    const summary = (
        <>
            {type._visit<JSX.Element | string>({
                id: (typeId) => <ReferencedTypePreviewPart typeId={typeId} />,
                primitive: (primitive) => {
                    return <PrimitivePreviewPart primitive={primitive} shouldIncludeArticle plural={plural} />;
                },
                optional: ({ itemType }) => <EnglishTypeReferenceSummary type={itemType} />,
                list: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article={plural ? undefined : "a"}>{plural ? "lists" : "list"}</TypeString>
                            {" of "}
                            <EnglishTypeReferenceSummary type={itemType} plural />
                        </>
                    );
                },
                set: ({ itemType }) => {
                    return (
                        <>
                            <TypeString article={plural ? undefined : "a"}>{plural ? "sets" : "set"}</TypeString>
                            {" of "}
                            <EnglishTypeReferenceSummary type={itemType} plural />
                        </>
                    );
                },
                map: ({ keyType, valueType }) => {
                    return (
                        <>
                            <TypeString article={plural ? undefined : "a"}>
                                {plural ? "maps" : "map" + " of key-value pairs:"}
                            </TypeString>
                            <div className="flex flex-col gap-1 ml-2 mt-1">
                                <div>
                                    {"The "}
                                    <span className="font-bold">keys</span>
                                    {" are "}
                                    <EnglishTypeReferenceSummary type={keyType} plural isEndOfSentence />
                                </div>
                                <div>
                                    {"The "}
                                    <span className="font-bold">values</span>
                                    {" are "}
                                    <EnglishTypeReferenceSummary type={valueType} plural isEndOfSentence />
                                </div>
                            </div>
                        </>
                    );
                },
                unknown: () => "untyped (any JSON)",
                _other: () => "<unknown>",
            })}
        </>
    );

    if (
        !isEndOfSentence ||
        // maps are multiline so shouldn't have a trailing period
        type.type === "map"
    ) {
        return summary;
    }

    return <>{summary}.</>;
};
