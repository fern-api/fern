import { Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { AsyncEditableText } from "@fern-api/common-components";
import { noop } from "@fern-api/core-utils";
import { Loadable, mapLoadable } from "@fern-api/loadable";
import { LinkButton } from "@fern-api/routing-utils";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useMemo } from "react";
import { generatePath } from "react-router-dom";
import { DefinitionRoutes } from "../../../api-page/routes";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { ApiEmoji } from "./ApiEmoji";
import { ApiEmojiChooser } from "./ApiEmojiChooser";
import { ApiEnvironmentsSummary } from "./ApiEnvironmentsSummary";

export declare namespace ApiRow {
    export interface Props {
        apiMetadata: Loadable<FernRegistry.ApiMetadata>;
    }
}

export const ApiRow: React.FC<ApiRow.Props> = ({ apiMetadata }) => {
    const organizationId = useCurrentOrganizationIdOrThrow();

    const description = useMemo(
        () => mapLoadable(apiMetadata, (loadedApiMetadata) => loadedApiMetadata.description ?? ""),
        [apiMetadata]
    );

    return (
        <div className="flex-1 flex bg-neutral-100 border border-gray-200 rounded overflow-hidden">
            <div className="flex flex-col justify-between bg-neutral-50 rounded-r shadow-[0_8px_24px_rgba(17,20,24,0.2)] p-5 gap-4 w-2/5">
                <div className="flex flex-col">
                    <div className="flex-1 flex items-center gap-2">
                        {apiMetadata.type === "loaded" ? (
                            <ApiEmojiChooser apiMetadata={apiMetadata.value} />
                        ) : (
                            <ApiEmoji emoji={undefined} />
                        )}
                        <div
                            className={classNames("text-lg font-bold", {
                                [Classes.SKELETON]: apiMetadata.type !== "loaded",
                            })}
                        >
                            {apiMetadata.type === "loaded" ? apiMetadata.value.id : "XXXXXXXXXX"}
                        </div>
                    </div>
                    <AsyncEditableText
                        className={classNames("text-gray-500 text-xs mt-2", {
                            [Classes.SKELETON]: apiMetadata.type !== "loaded",
                        })}
                        placeholder="Add description..."
                        value={description}
                        onConfirm={noop}
                        multiline
                    />
                </div>
                <div className="flex justify-center">
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
