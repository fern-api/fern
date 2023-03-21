import { FernRegistry } from "@fern-fern/registry";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";

export declare namespace TypeShorthand {
    export interface Props {
        type: FernRegistry.TypeReference;
    }
}

export const TypeShorthand: React.FC<TypeShorthand.Props> = ({ type }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    return (
        <>
            {type._visit<JSX.Element | string>({
                id: (typeId) => {
                    return resolveTypeById(typeId).name;
                },
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
                optional: ({ itemType }) => (
                    <>
                        {"optional<"}
                        <TypeShorthand type={itemType} />
                        {">"}
                    </>
                ),
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
