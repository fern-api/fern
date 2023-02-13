import { H2, H4 } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { getAnchorForSidebarItem } from "../../anchor-links/getAnchorForSidebarItem";
import { EndpointId, PackagePath } from "../../context/ApiContext";
import { TypeDefinition } from "../types/TypeDefinition";
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
                {endpoint.request != null && (
                    <div className={styles.request}>
                        <H4>Request body</H4>
                        <div className={styles.requestDescription}>Here is some text about the request.</div>
                        <div className={styles.requestType}>
                            <TypeDefinition typeDefinition={endpoint.request} />
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.examples}>
                <EndpointExample request="" response="" />
            </div>
        </div>
    );
};
