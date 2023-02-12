import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../../commons/MonospaceText";
import styles from "./ObjectProperty.module.scss";

export declare namespace ObjectProperty {
    export interface Props {
        property: FernRegistry.ObjectProperty;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = () => {
    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div className={styles.key}>
                    <MonospaceText>foo</MonospaceText>
                </div>
                <div className={styles.typePreview}>list of objects</div>
            </div>
            <div className={styles.decription}>
                An arbitrary string attached to the object. Often useful for displaying to users.
            </div>
        </div>
    );
};
