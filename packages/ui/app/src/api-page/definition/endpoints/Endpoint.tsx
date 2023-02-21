import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { DefinitionItemPage } from "../DefinitionItemPage";
import { Examples } from "../examples/Examples";
import { EndpointExample } from "./endpoint-example/EndpointExample";
import styles from "./Endpoint.module.scss";
import { EndpointTitle } from "./EndpointTitle";
import { EndpointTypeSection } from "./EndpointTypeSection";
import { getEndpointPathAsString } from "./getEndpointTitleAsString";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint }) => {
    const renderExample = useCallback(
        (example: FernRegistry.ExampleEndpointCall) => {
            return <EndpointExample endpoint={endpoint} example={example} />;
        },
        [endpoint]
    );

    return (
        <DefinitionItemPage
            title={<EndpointTitle endpoint={endpoint} />}
            subtitle={endpoint.displayName != null ? getEndpointPathAsString(endpoint) : undefined}
            docs={endpoint.docs}
            leftContent={
                <div className={styles.leftContent}>
                    {endpoint.path.pathParameters.length > 0 && (
                        <PathParametersSection pathParameters={endpoint.path.pathParameters} />
                    )}
                    {endpoint.queryParameters.length > 0 && (
                        <QueryParametersSection queryParameters={endpoint.queryParameters} />
                    )}
                    {endpoint.request != null && <EndpointTypeSection title="Request" type={endpoint.request} />}
                    {endpoint.response != null && <EndpointTypeSection title="Response" type={endpoint.response} />}
                </div>
            }
            rightContent={
                endpoint.examples.length > 0 ? (
                    <Examples examples={endpoint.examples} renderExample={renderExample} />
                ) : undefined
            }
        />
    );
};
