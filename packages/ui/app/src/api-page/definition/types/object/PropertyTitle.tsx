import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { TypePreview } from "../type-preview/TypePreview";
import styles from "./PropertyTitle.module.scss";

export declare namespace PropertyTitle {
    export interface Props {
        name: string;
        type: FernRegistry.TypeReference;
    }
}

export const PropertyTitle: React.FC<PropertyTitle.Props> = ({ name, type }) => {
    return (
        <div className={styles.container}>
            <div className={styles.name}>
                <MonospaceText>{name}</MonospaceText>
            </div>
            <div className={styles.typePreview}>
                <TypePreview type={type} includeContainerItems />
            </div>
        </div>
    );
};
