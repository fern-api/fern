import { FernRegistry } from "@fern-fern/registry";
import styles from "./TypeDefinition.module.scss";

export declare namespace TypeDefinition {
    export interface Props {
        typeDefinition: FernRegistry.TypeDefinition;
        defaultIsCollapsed: boolean;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = () => {
    return <div className={styles.container}>TODO</div>;
};
