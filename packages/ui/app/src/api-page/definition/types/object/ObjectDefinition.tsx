import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";
import { TypeDefinitionDetails } from "../TypeDefinitionDetails";
import styles from "./ObjectDefinition.module.scss";
import { PropertyTitle } from "./PropertyTitle";

export declare namespace ObjectDefinition {
    export interface Props {
        object: FernRegistry.ObjectType;
    }
}

export const ObjectDefinition: React.FC<ObjectDefinition.Props> = ({ object }) => {
    const nodes = useMemo(
        (): TreeNode.Props[] =>
            object.properties.map((property) => ({
                title: <PropertyTitle name={property.key} type={property.valueType} />,
                body: "An arbitrary string attached to the object. Often useful for displaying to users.",
                children: (
                    <TypeDefinitionDetails
                        className={styles.propertyValueType}
                        typeDefinition={property.valueType}
                        defaultIsCollapsed
                    />
                ),
            })),
        [object.properties]
    );

    return <TreeNodes nodes={nodes} fallback="No properties." />;
};
