import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../commons/MonospaceText";
import styles from "./EndpointTitle.module.scss";

export declare namespace EndpointTitle {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const EndpointTitle: React.FC<EndpointTitle.Props> = ({ endpoint }) => {
    if (endpoint.displayName != null) {
        return <span>{endpoint.displayName}</span>;
    }

    return (
        <MonospaceText>
            {endpoint.path.parts.map((part, index) => (
                <span key={index}>
                    {part._visit<JSX.Element | string>({
                        literal: (literal) => literal,
                        pathParameter: (pathParameter) => (
                            <span className={styles.pathParameter}>{`{${pathParameter.name}}`}</span>
                        ),
                        _other: () => "",
                    })}
                </span>
            ))}
        </MonospaceText>
    );
};
