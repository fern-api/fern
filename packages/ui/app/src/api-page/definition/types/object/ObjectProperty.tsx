import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { useTypeSummary } from "../useTypeSummary";
import styles from "./ObjectProperty.module.scss";

export declare namespace ObjectProperty {
    export interface Props {
        property: FernRegistry.ObjectProperty;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({ property }) => {
    const typeSummary = useTypeSummary(property.valueType);

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div className={styles.key}>
                    <MonospaceText>{property.key}</MonospaceText>
                </div>
                <div className={styles.typePreview}>{typeSummary}</div>
            </div>
            <div className={styles.decription}>
                An arbitrary string attached to the object. Often useful for displaying to users.
            </div>
        </div>
    );
};
