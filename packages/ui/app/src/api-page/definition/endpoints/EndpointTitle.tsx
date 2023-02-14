import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../commons/MonospaceText";
import styles from "./EndpointTitle.module.scss";

export declare namespace EndpointTitle {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        className?: string;
    }
}

export const EndpointTitle: React.FC<EndpointTitle.Props> = ({ endpoint, className }) => {
    if (endpoint.displayName != null) {
        return <span>{endpoint.displayName}</span>;
    }

    return (
        <MonospaceText className={className}>
            {endpoint.path.parts.map((part, index) => (
                <span key={index}>
                    {part._visit<JSX.Element | string>({
                        literal: (literal) => literal,
                        pathParameter: (pathParameterKey) => (
                            <span className={styles.pathParameter}>{`{${pathParameterKey}}`}</span>
                        ),
                        _other: () => "",
                    })}
                </span>
            ))}
        </MonospaceText>
    );
};
