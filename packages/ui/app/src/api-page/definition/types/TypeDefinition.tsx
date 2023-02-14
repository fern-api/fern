import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiContext } from "../../context/useApiContext";
import styles from "./TypeDefinition.module.scss";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";
import { TypePreview } from "./TypePreview";

export declare namespace TypeDefinition {
    export interface Props {
        typeDefinition: FernRegistry.Type;
        defaultIsCollapsed: boolean;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeDefinition, defaultIsCollapsed }) => {
    const { resolveType } = useApiContext();
    const isContainer = useMemo(() => isContainerRecursive(typeDefinition, resolveType), [resolveType, typeDefinition]);

    return (
        <div className={styles.container}>
            {isContainer || <TypePreview type={typeDefinition} />}
            <TypeDefinitionDetails typeDefinition={typeDefinition} defaultIsCollapsed={defaultIsCollapsed} />
        </div>
    );
};

function isContainerRecursive(
    type: FernRegistry.Type,
    resolveType: (typeId: FernRegistry.TypeId) => FernRegistry.Type
): boolean {
    return type._visit({
        optional: () => true,
        list: () => true,
        set: () => true,
        map: () => true,
        reference: (typeId) => isContainerRecursive(resolveType(typeId), resolveType),
        enum: () => false,
        union: () => false,
        discriminatedUnion: () => false,
        object: () => false,
        primitive: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
