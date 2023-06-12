import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { EndpointTitle } from "../api-page/endpoints/EndpointTitle";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ slug, endpoint }) => {
    return (
        <NavigatingSidebarItem
            slug={slug}
            title={<EndpointTitle endpoint={endpoint} />}
            leftElement={<div className="bg-accentPrimary h-2.5 w-2.5 shrink-0 rounded-sm" />}
        />
    );
};
