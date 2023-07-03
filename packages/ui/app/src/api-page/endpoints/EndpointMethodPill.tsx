import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";

export declare namespace EndpointMethodPill {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        small?: boolean;
    }
}

export const EndpointMethodPill: React.FC<EndpointMethodPill.Props> = ({ endpoint, small = false }) => {
    return (
        <div
            className={classNames("font-medium uppercase", small ? "px-1 py-px" : "px-2 py-1", {
                "text-[10px]": small,
                "text-green-400 bg-green-500/20": endpoint.method === "GET",
                "text-accentPrimary bg-accentHighlight":
                    endpoint.method === "POST" || endpoint.method === "PUT" || endpoint.method === "PATCH",
                "text-red-400 bg-red-500/20": endpoint.method === "DELETE",
            })}
        >
            {endpoint.method}
        </div>
    );
};
