import React from "react";
import { LightweightPackage } from "../../../mock-backend/MockBackend";
import { EndpointSidebarItem } from "../endpoints/EndpointSidebarItem";
import { ErrorsSidebarGroup } from "../errors/ErrorsSidebarGroup";
import { TypesSidebarGroup } from "../types/TypesSidebarGroup";
import styles from "./PackageSidebarGroup.module.scss";
import { PackageSidebarItem } from "./PackageSidebarItem";

export declare namespace PackageSidebarGroup {
    export interface Props {
        lightweightPackage: LightweightPackage;
    }
}

export const PackageSidebarGroup: React.FC<PackageSidebarGroup.Props> = ({ lightweightPackage }) => {
    return (
        <div className={styles.container}>
            <PackageSidebarItem lightweightPackage={lightweightPackage}>
                {lightweightPackage.endpoints.map((lightweightEndpoint) => (
                    <EndpointSidebarItem
                        key={lightweightEndpoint.endpointId}
                        lightweightEndpoint={lightweightEndpoint}
                    />
                ))}
                <TypesSidebarGroup lightweightPackage={lightweightPackage} />
                <ErrorsSidebarGroup lightweightPackage={lightweightPackage} />
            </PackageSidebarItem>
        </div>
    );
};
