import { Divider } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { generatePath, Link } from "react-router-dom";
import { DefinitionRoutes } from "../api-page/routes";
import { ApiCardLinkWrapper } from "./ApiCardLinkWrapper";
import { ApiEnvironmentsSummary } from "./ApiEnvironmentsSummary";
import { GithubRepoLink } from "./GithubRepoLink";
import { useApiCardLinkContext } from "./link-context/useApiCardLinkContext";

export declare namespace ApiRow {
    export interface Props {
        api: FernRegistry.LightweightApi;
    }
}

export const ApiRow: React.FC<ApiRow.Props> = ({ api }) => {
    const { isHoveringOverLink } = useApiCardLinkContext();

    return (
        <Link
            className={classNames(
                "flex flex-col bg-neutral-50 border border-gray-200 rounded py-2 cursor-pointer active:drop-shadow-none transition duration-150",
                {
                    "hover:drop-shadow-lg": !isHoveringOverLink,
                }
            )}
            to={generatePath(
                generatePath(DefinitionRoutes.API_DEFINITION.absolutePath, {
                    API_ID: api.id,
                })
            )}
        >
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-2">
                    <div className="flex justify-center items-center bg-neutral-200 border border-gray-300 rounded w-9 h-9 text-2xl">
                        👻
                    </div>
                    <div className="text-lg font-bold">{api.id}</div>
                </div>
                <ApiCardLinkWrapper>
                    <GithubRepoLink />
                </ApiCardLinkWrapper>
            </div>
            <Divider />
            <div className="flex px-4 pt-2">
                <ApiEnvironmentsSummary api={api} />
            </div>
        </Link>
    );
};
