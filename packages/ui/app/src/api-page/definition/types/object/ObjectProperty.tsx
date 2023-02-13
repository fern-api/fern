import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { InlinedTypeDetailsHeader } from "../InlinedTypeDetailsHeader";
import { SmallMutedText } from "../SmallMutedText";
import { TypeDefinitionDetailsWithTitle } from "../TypeDefinitionDetailsWithTitle";
import { TypePreview } from "../TypePreview";
import styles from "./ObjectProperty.module.scss";

export declare namespace ObjectProperty {
    export interface Props {
        property: FernRegistry.ObjectProperty;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({ property }) => {
    return (
        <div className={styles.container}>
            <div className={styles.leftLine} />
            <div className={styles.topRow} />
            <div className={styles.dash}>
                <div className={styles.dashInner} />
            </div>
            <div className={styles.title}>
                <div className={styles.key}>
                    <MonospaceText>{property.key}</MonospaceText>
                </div>
                <SmallMutedText>
                    <TypePreview type={property.valueType} />
                </SmallMutedText>
            </div>
            <div className={styles.docs}>
                An arbitrary string attached to the object. Often useful for displaying to users.
            </div>
            <div className={styles.children}>
                <TypeDefinitionDetailsWithTitle
                    title={<InlinedTypeDetailsHeader typeDefinition={property.valueType} />}
                    typeDefinition={property.valueType}
                    defaultIsCollapsed={true}
                />
            </div>
        </div>
    );
};
