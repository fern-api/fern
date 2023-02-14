import { H2 } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { getAnchorForSidebarItem } from "../../anchor-links/getAnchorForSidebarItem";
import { EndpointId, PackagePath } from "../../context/ApiContext";
import { useTrackSidebarItemId } from "../useTrackSidebarItemId";
import styles from "./Endpoint.module.scss";
import { EndpointExample } from "./EndpointExample";
import { EndpointTitle } from "./EndpointTitle";
import { EndpointTypeSection } from "./EndpointTypeSection";
import { QueryParametersSection } from "./QueryParametersSection";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        packagePath: PackagePath;
        indexInParent: number;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint, packagePath, indexInParent }) => {
    const endpointId = useMemo(
        (): EndpointId => ({
            type: "endpoint",
            packagePath,
            indexInParent,
        }),
        [indexInParent, packagePath]
    );

    const ref = useTrackSidebarItemId(endpointId);

    return (
        <div ref={ref} className={styles.container}>
            <div className={styles.titleSection}>
                <H2 id={getAnchorForSidebarItem(endpointId)} className={styles.title}>
                    <EndpointTitle endpoint={endpoint} />
                </H2>
            </div>
            <div className={styles.body}>
                <div className={styles.definition}>
                    {endpoint.docs != null && <div className={styles.docs}>{endpoint.docs}</div>}
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
