import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { EndpointTitle } from "../api-page/definition/endpoints/EndpointTitle";
import { AnchorSidebarItem } from "./AnchorSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        parentSlug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpoint }) => {
    return <AnchorSidebarItem anchor={endpoint.urlSlug} title={<EndpointTitle endpoint={endpoint} />} />;
};
