import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContextProvider } from "../context/TypeDefinitionContextProvider";
import { InternalTypeDefinition } from "./InternalTypeDefinition";

export declare namespace TypeDefinition {
    export interface Props {
        typeShape: FernRegistryApiRead.TypeShape;
        isCollapsible: boolean;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        getPropertyAnchor?: (property: FernRegistryApiRead.ObjectProperty) => string;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({
    typeShape,
    isCollapsible,
    onHoverProperty,
    getPropertyAnchor,
}) => {
    return (
        <TypeDefinitionContextProvider onHoverProperty={onHoverProperty}>
            <InternalTypeDefinition
                typeShape={typeShape}
                isCollapsible={isCollapsible}
                getPropertyAnchor={getPropertyAnchor}
            />
        </TypeDefinitionContextProvider>
    );
};
