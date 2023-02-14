import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { TypePreview } from "../TypePreview";
import styles from "./PropertyTitle.module.scss";

export declare namespace PropertyTitle {
    export interface Props {
        name: string;
        type: FernRegistry.Type;
    }
}

export const PropertyTitle: React.FC<PropertyTitle.Props> = ({ name, type }) => {
    return (
        <div className={styles.container}>
            <div className={styles.name}>
                <MonospaceText>{name}</MonospaceText>
            </div>
            <TypePreview className={styles.typePreview} type={type} includeContainerItems />
        </div>
    );
};
