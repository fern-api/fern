import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";

export declare namespace HttpMethodIcon {
    export interface Props {
        method: FernRegistryApiRead.HttpMethod;
    }
}

export const HttpMethodIcon: React.FC<HttpMethodIcon.Props> = ({ method }) => {
    return (
        <div
            className={classNames("rounded-sm h-2.5 w-2.5 shrink-0", {
                "bg-green-400": method === "GET",
                "bg-accentPrimary": method === "POST" || method === "PUT" || method === "PATCH",
                "bg-red-400": method === "DELETE",
            })}
        />
    );
};
