import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { TypePreview } from "./type-preview/TypePreview";
import styles from "./TypeDefinition.module.scss";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";

export declare namespace TypeDefinition {
    export interface Props {
        typeDefinition: FernRegistry.Type;
        defaultIsCollapsed: boolean;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeDefinition, defaultIsCollapsed }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    const isContainer = useMemo(
        () => isContainerRecursive(typeDefinition, resolveTypeById),
        [resolveTypeById, typeDefinition]
    );

    return (
        <div className={styles.container}>
            {isContainer || <TypePreview type={typeDefinition} />}
            <TypeDefinitionDetails typeDefinition={typeDefinition} defaultIsCollapsed={defaultIsCollapsed} />
        </div>
    );
};

function isContainerRecursive(
    type: FernRegistry.Type,
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition
): boolean {
    return type._visit({
        optional: () => true,
        list: () => true,
        set: () => true,
        map: () => true,
        reference: (typeId) => isContainerRecursive(resolveTypeById(typeId).shape, resolveTypeById),
        enum: () => false,
        union: () => false,
        discriminatedUnion: () => false,
        object: () => false,
        primitive: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
