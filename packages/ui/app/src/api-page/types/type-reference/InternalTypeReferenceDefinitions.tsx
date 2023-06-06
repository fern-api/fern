import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
    export interface Props {
        type: FernRegistryApiRead.TypeReference;
        isCollapsible: boolean;
        className?: string;
        emphasizeRequiredProperties?: boolean;
    }
}

export const InternalTypeReferenceDefinitions: React.FC<InternalTypeReferenceDefinitions.Props> = ({
    type,
    isCollapsible,
    className,
    emphasizeRequiredProperties,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    return type._visit<JSX.Element | null>({
        id: (typeId) => (
            <InternalTypeDefinition
                key={typeId}
                typeShape={resolveTypeById(typeId).shape}
                isCollapsible={isCollapsible}
                emphasizeRequiredProperties={emphasizeRequiredProperties}
            />
        ),
        primitive: () => null,
        list: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions type={itemType} isCollapsible={isCollapsible} className={className} />
            </ListTypeContextProvider>
        ),
        set: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions type={itemType} isCollapsible={isCollapsible} className={className} />
            </ListTypeContextProvider>
        ),
        optional: ({ itemType }) => (
            <InternalTypeReferenceDefinitions type={itemType} isCollapsible={isCollapsible} className={className} />
        ),
        map: ({ keyType, valueType }) => (
            <MapTypeContextProvider>
                <InternalTypeReferenceDefinitions type={keyType} isCollapsible={isCollapsible} className={className} />
                <InternalTypeReferenceDefinitions
                    type={valueType}
                    isCollapsible={isCollapsible}
                    className={className}
                />
            </MapTypeContextProvider>
        ),
        literal: () => null,
        unknown: () => null,
        _other: () => null,
    });
};
