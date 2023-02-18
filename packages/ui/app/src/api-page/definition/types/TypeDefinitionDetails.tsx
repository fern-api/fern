import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { DiscriminatedUnionDefinition } from "./discriminated-union/DiscriminatedUnionDefinition";
import { EnumDefinition } from "./enum/EnumDefinition";
import { ObjectDefinition } from "./object/ObjectDefinition";
import { CollapsibleTree } from "./tree/CollapsibleTree";
import { TypeDefinition } from "./TypeDefinition";
import { TypePreview } from "./TypePreview";
import { UnionDefinition } from "./union/UnionDefinition";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        typeDefinition: FernRegistry.Type;
        defaultIsCollapsed: boolean;
        className?: string;
        fallback?: JSX.Element;
    }
}

export const TypeDefinitionDetails: React.FC<TypeDefinitionDetails.Props> = ({
    typeDefinition,
    defaultIsCollapsed,
    className,
    fallback,
}) => {
    const { resolveType } = useApiDefinitionContext();

    const element = useMemo(() => {
        return typeDefinition._visit<JSX.Element | undefined>({
            reference: (typeId) =>
                doesTypeHaveDetailsRecursive(typeDefinition, resolveType) ? (
                    <TypeDefinitionDetails
                        typeDefinition={resolveType(typeId)}
                        defaultIsCollapsed={defaultIsCollapsed}
                        fallback={fallback}
                    />
                ) : undefined,
            object: (object) => (
                <CollapsibleTree title="properties" defaultIsCollapsed={defaultIsCollapsed}>
                    <ObjectDefinition object={object} />
                </CollapsibleTree>
            ),
            enum: (enum_) => (
                <CollapsibleTree title="one of" defaultIsCollapsed={defaultIsCollapsed}>
                    <EnumDefinition enum={enum_} />
                </CollapsibleTree>
            ),
            list: ({ itemType }) =>
                doesTypeHaveDetailsRecursive(typeDefinition, resolveType) ? (
                    <CollapsibleTree
                        title={<TypePreview type={typeDefinition} includeContainerItems={false} />}
                        // lists never start collapsed because they are shallow (depth=1)
                        defaultIsCollapsed={false}
                    >
                        <TypeDefinition typeDefinition={itemType} defaultIsCollapsed />
                    </CollapsibleTree>
                ) : undefined,
            set: ({ itemType }) =>
                doesTypeHaveDetailsRecursive(typeDefinition, resolveType) ? (
                    <CollapsibleTree
                        title={<TypePreview type={typeDefinition} includeContainerItems={false} />}
                        // sets never start collapsed because they are shallow (depth=1)
                        defaultIsCollapsed={false}
                    >
                        <TypeDefinition typeDefinition={itemType} defaultIsCollapsed />
                    </CollapsibleTree>
                ) : undefined,
            optional: ({ itemType }) =>
                doesTypeHaveDetailsRecursive(typeDefinition, resolveType) ? (
                    <CollapsibleTree
                        title={<TypePreview type={typeDefinition} includeContainerItems={false} />}
                        // optionals never start collapsed because they are shallow (depth=1)
                        defaultIsCollapsed={false}
                    >
                        <TypeDefinition typeDefinition={itemType} defaultIsCollapsed />
                    </CollapsibleTree>
                ) : undefined,
            map: () => {
                return <div>map</div>;
            },
            union: (union) => (
                <CollapsibleTree title="one of" defaultIsCollapsed={defaultIsCollapsed}>
                    <UnionDefinition union={union} />
                </CollapsibleTree>
            ),
            discriminatedUnion: (union) => (
                <CollapsibleTree title="one of" defaultIsCollapsed={defaultIsCollapsed}>
                    <DiscriminatedUnionDefinition union={union} />
                </CollapsibleTree>
            ),
            primitive: () => undefined,
            unknown: () => undefined,
            _other: () => undefined,
        });
    }, [defaultIsCollapsed, fallback, resolveType, typeDefinition]);

    if (element != null) {
        return <div className={className}>{element}</div>;
    }

    return fallback ?? null;
};

function doesTypeHaveDetailsRecursive(
    type: FernRegistry.Type,
    resolveType: (typeId: FernRegistry.TypeId) => FernRegistry.Type
): boolean {
    return type._visit<boolean>({
        reference: (typeId) => doesTypeHaveDetailsRecursive(resolveType(typeId), resolveType),
        object: () => true,
        enum: () => true,
        list: ({ itemType }) => doesTypeHaveDetailsRecursive(itemType, resolveType),
        set: ({ itemType }) => doesTypeHaveDetailsRecursive(itemType, resolveType),
        optional: ({ itemType }) => doesTypeHaveDetailsRecursive(itemType, resolveType),
        map: ({ keyType, valueType }) =>
            doesTypeHaveDetailsRecursive(keyType, resolveType) || doesTypeHaveDetailsRecursive(valueType, resolveType),
        union: () => true,
        discriminatedUnion: () => true,
        primitive: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
