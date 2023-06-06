import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { ReferencedTypePreviewPart } from "./ReferencedTypePreviewPart";

export declare namespace TypeShorthand {
    export interface Props {
        type: FernRegistryApiRead.TypeReference;
        plural: boolean;
        withArticle?: boolean;
        emphasizeIfRequired?: boolean;
    }
}

export const TypeShorthand: React.FC<TypeShorthand.Props> = ({
    type,
    plural,
    withArticle = false,
    emphasizeIfRequired = false,
}) => {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;

    const element = type._visit<JSX.Element | string>({
        id: (typeId) => <ReferencedTypePreviewPart typeId={typeId} plural={plural} withArticle={withArticle} />,
        primitive: (primitive) => {
            return primitive._visit({
                string: () => (plural ? "strings" : maybeWithArticle("a", "string")),
                integer: () => (plural ? "integers" : maybeWithArticle("an", "integer")),
                double: () => (plural ? "doubles" : maybeWithArticle("a", "double")),
                long: () => (plural ? "longs" : maybeWithArticle("a", "long")),
                boolean: () => (plural ? "booleans" : maybeWithArticle("a", "boolean")),
                datetime: () => (plural ? "datetimes" : maybeWithArticle("a", "datetime")),
                uuid: () => (plural ? "UUIDs" : maybeWithArticle("a", "UUID")),
                base64: () => (plural ? "Base64 strings" : maybeWithArticle("a", "Base64 string")),
                date: () => (plural ? "dates" : maybeWithArticle("a", "date")),
                _other: () => "<unknown>",
            });
        },
        optional: ({ itemType }) => (
            <>
                {maybeWithArticle("an", "optional")} <TypeShorthand type={itemType} plural={plural} />
            </>
        ),
        list: ({ itemType }) => {
            return (
                <>
                    {plural ? "lists of" : maybeWithArticle("a", "list of")} <TypeShorthand type={itemType} plural />
                </>
            );
        },
        set: ({ itemType }) => {
            return (
                <>
                    {plural ? "sets of" : maybeWithArticle("a", "set of")} <TypeShorthand type={itemType} plural />
                </>
            );
        },
        map: ({ keyType, valueType }) => {
            return (
                <>
                    {plural ? "maps from " : maybeWithArticle("a", "map from ")}
                    <TypeShorthand type={keyType} plural />
                    {" to "}
                    <TypeShorthand type={valueType} plural />
                </>
            );
        },
        literal: (literal) =>
            literal._visit({
                stringLiteral: (value) => `"${value}"`,
                _other: () => "<unknown>",
            }),
        unknown: () => "any",
        _other: () => "<unknown>",
    });

    if (emphasizeIfRequired && type.type !== "optional") {
        return (
            <>
                <span className="mr-1.5 font-medium uppercase text-red-500">required</span>
                {element}
            </>
        );
    } else {
        return <>{element}</>;
    }
};
