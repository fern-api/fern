import { FernRegistry } from "@fern-fern/registry";
import { Markdown } from "../markdown/Markdown";
import styles from "./EndpointParameter.module.scss";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description?: string;
        type: FernRegistry.TypeReference;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({ name, description }) => {
    return (
        <div className={styles.container}>
            <div>{name}</div>
            {description != null && <Markdown>{description}</Markdown>}
        </div>
    );
};
