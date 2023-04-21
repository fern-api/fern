import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { uniq } from "lodash-es";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { InternalTypeDefinition } from "./InternalTypeDefinition";

export declare namespace InternalAllReferencedTypes {
    export interface Props {
        type: FernRegistry.TypeReference;
        isCollapsible: boolean;
        className?: string;
    }
}

export const InternalAllReferencedTypes: React.FC<InternalAllReferencedTypes.Props> = ({
    type,
    isCollapsible,
    className,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const allReferencedTypes = useMemo(() => getAllReferencedTypes(type), [type]);

    if (allReferencedTypes.length === 0) {
        return null;
    }

    return (
        <div className={classNames("flex flex-col gap-5", className)}>
            {allReferencedTypes.map((typeId) => (
                <InternalTypeDefinition
                    key={typeId}
                    typeShape={resolveTypeById(typeId).shape}
                    isCollapsible={isCollapsible}
                />
            ))}
        </div>
    );
};

function getAllReferencedTypes(type: FernRegistry.TypeReference): FernRegistry.TypeId[] {
    return type._visit({
        id: (id) => [id],
        primitive: () => [],
        optional: ({ itemType }) => getAllReferencedTypes(itemType),
        list: ({ itemType }) => getAllReferencedTypes(itemType),
        set: ({ itemType }) => getAllReferencedTypes(itemType),
        map: ({ keyType, valueType }) => uniq([...getAllReferencedTypes(keyType), ...getAllReferencedTypes(valueType)]),
        unknown: () => [],
        _other: () => [],
    });
}
