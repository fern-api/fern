import { H2 } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { useParams } from "react-router-dom";
import styles from "./Endpoint.module.scss";
import { EndpointExample } from "./EndpointExample";
import { EndpointPath } from "./EndpointPath";
import { EndpointTitle } from "./EndpointTitle";
import { EndpointTypeSection } from "./EndpointTypeSection";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

export declare namespace Endpoint {
    export interface Props {
        package: FernRegistry.ApiDefinitionPackage;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ package: package_ }) => {
    const { endpointId } = useParams();
    if (endpointId == null) {
        return null;
    }

    const endpoint = package_.endpoints.find((endpoint) => endpoint.id === endpointId);
    if (endpoint == null) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <H2 className={styles.title}>
                    <EndpointTitle endpoint={endpoint} />
                </H2>
                {endpoint.displayName != null && <EndpointPath className={styles.endpointPath} endpoint={endpoint} />}
            </div>
            <div className={styles.body}>
                <div className={styles.definition}>
                    {endpoint.docs != null && <div className={styles.docs}>{endpoint.docs}</div>}
                    {endpoint.path.pathParameters.length > 0 && (
                        <PathParametersSection pathParameters={endpoint.path.pathParameters} />
                    )}
                    {endpoint.queryParameters.length > 0 && (
                        <QueryParametersSection queryParameters={endpoint.queryParameters} />
                    )}
                    {endpoint.request != null && <EndpointTypeSection title="Request" type={endpoint.request} />}
                    {endpoint.response != null && <EndpointTypeSection title="Response" type={endpoint.response} />}
                </div>
                <div className={styles.examples}>
                    <EndpointExample request="" response="" />
                </div>
            </div>
        </div>
    );
};
