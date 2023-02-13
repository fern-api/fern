import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../../commons/MonospaceText";
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
    const detailsTitle = property.valueType._visit<JSX.Element | null>({
        reference: () => <span>reference</span>,
        object: () => <span>properties</span>,
        enum: () => <span>options</span>,
        primitive: () => null,
        list: () => <span>list</span>,
        set: () => <span>set</span>,
        map: () => <span>map</span>,
        optional: () => <span>optional</span>,
        unknown: () => null,
        discriminatedUnion: () => <span>one of</span>,
        _other: () => null,
    });

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <div className={styles.dash} />
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
            {detailsTitle != null && (
                <div className={styles.children}>
                    <TypeDefinitionDetailsWithTitle
                        title={detailsTitle}
                        typeDefinition={property.valueType}
                        defaultIsCollapsed={true}
                    />
                </div>
            )}
        </div>
    );
};
