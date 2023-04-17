import { FernRegistry } from "@fern-fern/registry";
import { ReferencedTypePreviewPart } from "./ReferencedTypePreviewPart";

export declare namespace TypeShorthand {
    export interface Props {
        type: FernRegistry.TypeReference;
    }
}

export const TypeShorthand: React.FC<TypeShorthand.Props> = ({ type }) => {
    return (
        <>
            {type._visit<JSX.Element | string>({
                id: (typeId) => <ReferencedTypePreviewPart typeId={typeId} />,
                primitive: (primitive) => {
                    return primitive._visit({
                        string: () => "string",
                        integer: () => "integer",
                        double: () => "double",
                        long: () => "long",
                        boolean: () => "boolean",
                        datetime: () => "datetime",
                        uuid: () => "UUID",
                        _other: () => "<unknown>",
                    });
                },
                optional: ({ itemType }) => <TypeShorthand type={itemType} />,
                list: ({ itemType }) => {
                    return (
                        <>
                            {"list<"}
                            <TypeShorthand type={itemType} />
                            {">"}
                        </>
                    );
                },
                set: ({ itemType }) => {
                    return (
                        <>
                            {"set<"}
                            <TypeShorthand type={itemType} />
                            {">"}
                        </>
                    );
                },
                map: ({ keyType, valueType }) => {
                    return (
                        <>
                            {"map<"}
                            <TypeShorthand type={keyType} />
                            ,&nbsp;
                            <TypeShorthand type={valueType} />
                            {">"}
                        </>
                    );
                },
                unknown: () => "unknown",
                _other: () => "<unknown>",
            })}
        </>
    );
};
