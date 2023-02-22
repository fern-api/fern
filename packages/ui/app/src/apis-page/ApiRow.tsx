import { Divider, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { LinkButton } from "@fern-api/routing-utils";
import { FernRegistry } from "@fern-fern/registry";
import { generatePath } from "react-router-dom";
import { DefinitionRoutes } from "../api-page/routes";
import { ApiEnvironmentsSummary } from "./ApiEnvironmentsSummary";
import { GithubRepoLink } from "./GithubRepoLink";

export declare namespace ApiRow {
    export interface Props {
        apiMetadata: FernRegistry.ApiMetadata;
    }
}

export const ApiRow: React.FC<ApiRow.Props> = ({ apiMetadata }) => {
    return (
        <div className="flex flex-col bg-neutral-50 border border-gray-200 rounded py-3">
            <div className="flex justify-between items-center px-4 mb-1">
                <div className="flex-1 flex items-center gap-2">
                    <div className="flex justify-center items-center bg-neutral-200 border border-gray-300 rounded w-9 h-9 text-2xl select-none">
                        👻
                    </div>
                    <div className="text-lg font-bold">{apiMetadata.id}</div>
                </div>
                <div className="flex-1 flex justify-end gap-3">
                    <GithubRepoLink />
                    <LinkButton
                        to={generatePath(DefinitionRoutes.API_DEFINITION.absolutePath, {
                            API_ID: apiMetadata.id,
                        })}
                        minimal
                        intent={Intent.PRIMARY}
                        text="Documentation"
                        rightIcon={IconNames.ARROW_RIGHT}
                    />
                </div>
            </div>
            <Divider />
            <div className="flex flex-col px-4 mt-3">
                <ApiEnvironmentsSummary apiMetadata={apiMetadata} />
            </div>
        </div>
    );
};
