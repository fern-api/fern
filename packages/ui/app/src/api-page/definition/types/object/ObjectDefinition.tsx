import { FernRegistry } from "@fern-fern/registry";
import styles from "./ObjectDefinition.module.scss";
import { ObjectProperty } from "./ObjectProperty";

export declare namespace ObjectDefinition {
    export interface Props {
        object: FernRegistry.ObjectType;
    }
}

export const ObjectDefinition: React.FC<ObjectDefinition.Props> = ({ object }) => {
    return (
        <div className={styles.container}>
            {object.properties.map((property) => (
                <ObjectProperty key={property.key} property={property} />
            ))}
        </div>
    );
};
