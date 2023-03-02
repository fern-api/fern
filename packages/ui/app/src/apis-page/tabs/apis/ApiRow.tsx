import { Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Loadable } from "@fern-api/loadable";
import { LinkButton } from "@fern-api/routing-utils";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { generatePath } from "react-router-dom";
import { DefinitionRoutes } from "../../../api-page/routes";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { ApiEnvironmentsSummary } from "./ApiEnvironmentsSummary";

export declare namespace ApiRow {
    export interface Props {
        apiMetadata: Loadable<FernRegistry.ApiMetadata>;
    }
}

export const ApiRow: React.FC<ApiRow.Props> = ({ apiMetadata }) => {
    const organizationId = useCurrentOrganizationIdOrThrow();

    return (
        <div className="flex-1 flex bg-neutral-100 border border-gray-200 rounded overflow-hidden">
            <div className="flex flex-col bg-neutral-50 rounded-r shadow-[0_8px_24px_rgba(17,20,24,0.2)] p-5 gap-4 w-2/5">
                <div className="flex-1 flex items-center gap-2">
                    <div className="flex justify-center items-center bg-neutral-200 border border-gray-300 rounded w-9 h-9 text-2xl select-none">
                        🎥
                    </div>
                    <div
                        className={classNames("text-lg font-bold", {
                            [Classes.SKELETON]: apiMetadata.type !== "loaded",
                        })}
                    >
                        {apiMetadata.type === "loaded" ? apiMetadata.value.id : "XXXXXXXXXX"}
                    </div>
                </div>
                <div className="text-gray-500 text-xs">
                    {"This is some information about this microservice. I'm a text blob! yada yada yada"}
                </div>
                <div className="flex-1 flex justify-center">
                    <LinkButton
                        to={
                            apiMetadata.type === "loaded"
                                ? generatePath(DefinitionRoutes.API_DEFINITION.absolutePath, {
                                      ORGANIZATION_ID: organizationId,
                                      API_ID: apiMetadata.value.id,
                                  })
                                : "DUMMY_LINK"
                        }
                        disabled={apiMetadata.type !== "loaded"}
                        minimal
                        text="Documentation"
                        rightIcon={IconNames.ARROW_RIGHT}
                    />
                </div>
            </div>
            {apiMetadata.type === "loaded" && (
                <div className="flex flex-1">
                    <ApiEnvironmentsSummary apiMetadata={apiMetadata.value} />
                </div>
            )}
        </div>
    );
};
