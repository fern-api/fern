import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { uniq } from "lodash-es";
import { useMemo } from "react";
import { TypeDefinition } from "./TypeDefinition";

export declare namespace AllReferencedTypes {
    export interface Props {
        type: FernRegistry.TypeReference;
        isCollapsible: boolean;
        className?: string;
    }
}

export const AllReferencedTypes: React.FC<AllReferencedTypes.Props> = ({ type, isCollapsible, className }) => {
    const allReferencedTypes = useMemo(() => getAllReferencedTypes(type), [type]);

    if (allReferencedTypes.length === 0) {
        return null;
    }

    return (
        <div className={classNames("flex flex-col gap-5", className)}>
            {allReferencedTypes.map((typeId) => (
                <TypeDefinition key={typeId} typeId={typeId} isCollapsible={isCollapsible} />
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
