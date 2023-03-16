import { Classes } from "@blueprintjs/core";
import { LoadableElement, SkeletonText } from "@fern-api/common-components";
import { Loadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useMemo } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { DefinitionRoutes } from "../../../api-page/routes";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { ApiEmoji } from "./ApiEmoji";
import { ApiEnvironmentsSummary } from "./ApiEnvironmentsSummary";
import { GithubRepoPreview } from "./GithubRepoPreview";

export declare namespace ApiCard {
    export interface Props {
        apiMetadata: Loadable<FernRegistry.ApiMetadata>;
    }
}

export const ApiCard: React.FC<ApiCard.Props> = ({ apiMetadata }) => {
    const organizationId = useCurrentOrganizationIdOrThrow();

    const navigate = useNavigate();
    const onClick = useMemo(() => {
        if (apiMetadata.type !== "loaded") {
            return undefined;
        }
        return () => {
            navigate(
                generatePath(DefinitionRoutes.API_DEFINITION.absolutePath, {
                    ORGANIZATION_ID: organizationId,
                    API_ID: apiMetadata.value.id,
                })
            );
        };
    }, [apiMetadata, navigate, organizationId]);

    return (
        <div
            className={classNames("flex-1 flex bg-neutral-100 border border-gray-300 rounded overflow-hidden", {
                "shadow-none hover:shadow-[0_0_6px_rgba(0,130,0,0.5)] transition-shadow cursor-pointer":
                    onClick != null,
            })}
            onClick={onClick}
        >
            <div className="flex flex-col bg-neutral-50 rounded-r shadow-[0_0_6px_rgba(17,20,24,0.4)] w-2/5">
                <div className="flex-1 flex items-center gap-2 mt-5 mx-5">
                    <ApiEmoji
                        emoji={
                            apiMetadata.type === "loaded" && apiMetadata.value.image?.type === "emoji"
                                ? apiMetadata.value.image.value
                                : undefined
                        }
                    />
                    <div
                        className={classNames("text-lg font-bold", {
                            [Classes.SKELETON]: apiMetadata.type !== "loaded",
                        })}
                    >
                        {apiMetadata.type === "loaded" ? apiMetadata.value.id : "XXXXXXXXXX"}
                    </div>
                </div>
                <div className="mt-2 mx-5">
                    <LoadableElement value={apiMetadata} fallback={<SkeletonText />}>
                        {({ description }) =>
                            description != null && description.length > 0 ? (
                                <div className="text-gray-500">{description}</div>
                            ) : null
                        }
                    </LoadableElement>
                </div>
                <GithubRepoPreview className="px-5 mt-6" />
            </div>
            {apiMetadata.type === "loaded" && (
                <div className="flex flex-1">
                    <ApiEnvironmentsSummary apiMetadata={apiMetadata.value} />
                </div>
            )}
        </div>
    );
};
