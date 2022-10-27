import { Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { SidebarItem } from "./SidebarItem";

export declare namespace Endpoint {
    export interface Props {
        endpointName: string;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpointName }) => {
    return (
        <SidebarItem
            icon={<Tag minimal intent={Intent.PRIMARY} icon={IconNames.EXCHANGE} />}
            label={endpointName}
            indent={30}
            isCollapsed={undefined}
            onClickMore={() => {
                // TODO
            }}
        />
    );
};
