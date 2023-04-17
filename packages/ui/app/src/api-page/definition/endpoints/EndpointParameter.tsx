import { FernRegistry } from "@fern-fern/registry";
import { Markdown } from "../markdown/Markdown";
import styles from "./EndpointParameter.module.scss";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description?: string;
        type: FernRegistry.TypeReference;
        renderName?: (name: string) => JSX.Element;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({
    name,
    description,
    renderName = (name) => <>{name}</>,
}) => {
    return (
        <div className={styles.container}>
            <div>{renderName(name)}</div>
            {description != null && <Markdown>{description}</Markdown>}
        </div>
    );
};
