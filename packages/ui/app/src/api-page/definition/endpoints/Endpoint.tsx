import { Button, H2, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { getAnchorForSidebarItem } from "../../anchor-links/getAnchorForSidebarItem";
import { EndpointId, PackagePath } from "../../context/ApiContext";
import { TypeDefinition } from "../types/TypeDefinition";
import { useTrackSidebarItemId } from "../useTrackSidebarItemId";
import styles from "./Endpoint.module.scss";
import { EndpointExample } from "./EndpointExample";
import { EndpointSection } from "./EndpointSection";
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
                <div className={styles.titleSection}>
                    <H2 id={getAnchorForSidebarItem(endpointId)} className={styles.title}>
                        <EndpointTitle endpoint={endpoint} />
                    </H2>
                    <Button minimal intent={Intent.SUCCESS} icon={IconNames.PLUS} text="New request" />
                </div>
                {endpoint.docs != null && <div className={styles.description}>{endpoint.docs}</div>}
                {endpoint.request != null && (
                    <EndpointSection title="Request" description="Here is some text about the request body.">
                        <TypeDefinition typeDefinition={endpoint.request} />
                    </EndpointSection>
                )}
                {endpoint.response != null && (
                    <EndpointSection title="Response" description="Here is some text about the success response.">
                        <TypeDefinition typeDefinition={endpoint.response} />
                    </EndpointSection>
                )}
            </div>
            <div className={styles.examples}>
                <EndpointExample request="" response="" />
            </div>
        </div>
    );
};
