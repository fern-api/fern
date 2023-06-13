import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { EndpointTitle } from "../api-page/endpoints/EndpointTitle";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition.Raw;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ slug, endpoint }) => {
    return (
        <NavigatingSidebarItem
            slug={slug}
            title={<EndpointTitle endpoint={endpoint} />}
            leftElement={
                <div
                    className={classNames("rounded-sm h-2.5 w-2.5 shrink-0", {
                        "bg-green-400": endpoint.method === "GET",
                        "bg-accentPrimary":
                            endpoint.method === "POST" || endpoint.method === "PUT" || endpoint.method === "PATCH",
                        "bg-red-400": endpoint.method === "DELETE",
                    })}
                />
            }
        />
    );
};
