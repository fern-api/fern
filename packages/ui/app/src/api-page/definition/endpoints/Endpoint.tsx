import { H2, H4 } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { getAnchorForSidebarItem } from "../../anchor-links/getAnchorForSidebarItem";
import { EndpointId, PackagePath } from "../../context/ApiContext";
import { TypeReference } from "../types/TypeReference";
import { useTrackSidebarItemId } from "../useTrackSidebarItemId";
import styles from "./Endpoint.module.scss";
import { EndpointExample } from "./EndpointExample";
import { EndpointTitle } from "./EndpointTitle";

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
            <div className={styles.definition}>
                <H2 id={getAnchorForSidebarItem(endpointId)} className={styles.title}>
                    <EndpointTitle endpoint={endpoint} />
                </H2>
                {endpoint.docs != null && <div className={styles.description}>{endpoint.docs}</div>}
                <H4>Request</H4>
                {endpoint.request != null ? (
                    <TypeReference typeReference={endpoint.request} />
                ) : (
                    <div>This endpoint has no request</div>
                )}
            </div>
            <div className={styles.examples}>
                <EndpointExample request="" response="" />
            </div>
        </div>
    );
};
