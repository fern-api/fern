import { FernRegistry } from "@fern-fern/registry";
import { Markdown } from "../markdown/Markdown";
import { PropertyTitle } from "../types/object/PropertyTitle";
import styles from "./EndpointParameter.module.scss";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description?: string;
        type: FernRegistry.TypeReference;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({ name, description, type }) => {
    return (
        <div className={styles.container}>
            <PropertyTitle name={name} type={type} />
            {description != null && <Markdown>{description}</Markdown>}
        </div>
    );
};
