import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { EndpointTitle } from "../api-page/definition/endpoints/EndpointTitle";
import { Anchor } from "../docs-context/DocsContext";
import { AnchorSidebarItem } from "./AnchorSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        parentSlug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ parentSlug, endpoint }) => {
    const anchor = useMemo(
        (): Anchor => ({ pathname: parentSlug, hash: endpoint.urlSlug }),
        [endpoint.urlSlug, parentSlug]
    );

    return <AnchorSidebarItem anchor={anchor} title={<EndpointTitle endpoint={endpoint} />} />;
};
