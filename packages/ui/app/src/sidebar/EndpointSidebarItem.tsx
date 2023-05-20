import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { EndpointTitle } from "../api-page/definition/endpoints/EndpointTitle";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        parentSlug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpoint, parentSlug }) => {
    return (
        <ClickableSidebarItem
            path={`${parentSlug}#${endpoint.urlSlug}`}
            title={<EndpointTitle endpoint={endpoint} />}
        />
    );
};
