import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { EndpointTitle } from "../api-page/definition/endpoints/EndpointTitle";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace TopLevelEndpointSidebarItem {
    export interface Props {
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const TopLevelEndpointSidebarItem: React.FC<TopLevelEndpointSidebarItem.Props> = ({ slug, endpoint }) => {
    return <ClickableSidebarItem path={slug} title={<EndpointTitle endpoint={endpoint} />} />;
};
