import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../commons/MonospaceText";
import styles from "./EndpointPath.module.scss";

export declare namespace EndpointPath {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        className?: string;
    }
}

export const EndpointPath: React.FC<EndpointPath.Props> = ({ endpoint, className }) => {
    return (
        <MonospaceText className={className}>
            <div className={styles.container}>
                <div className={styles.httpMethod}>GET</div>
                {endpoint.path.parts.map((part, index) => (
                    <span key={index}>
                        {part._visit({
                            literal: (literal) => literal,
                            pathParameter: (pathParameterKey) => `{${pathParameterKey}}`,
                            _other: () => "",
                        })}
                    </span>
                ))}
            </div>
        </MonospaceText>
    );
};
