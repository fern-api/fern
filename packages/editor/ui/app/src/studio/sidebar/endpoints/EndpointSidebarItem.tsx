import { Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { noop } from "@fern-api/core-utils";
import React from "react";
import { LightweightEndpoint } from "../../../mock-backend/MockBackend";
import { SidebarItemRow } from "../items/SidebarItemRow";

export declare namespace EndpointSidebarItem {
    export interface Props {
        lightweightEndpoint: LightweightEndpoint;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ lightweightEndpoint }) => {
    return (
        <SidebarItemRow
            itemId={lightweightEndpoint.endpointId}
            icon={<Tag minimal intent={Intent.PRIMARY} icon={IconNames.EXCHANGE} />}
            label={lightweightEndpoint.name}
            onDelete={noop}
            onRename={noop}
        />
    );
};
