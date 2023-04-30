import { useBooleanState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import { useCallback, useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { DefinitionRoutes } from "../../routes";
import { useCurrentApiIdOrThrow } from "../../routes/useCurrentApiId";

export declare namespace useSubpackageScrolling {
    export interface Args {
        subpackageId: FernRegistry.SubpackageId;
        containerRef: HTMLElement | undefined;
    }

    export interface Return {
        setIsEndpointInView: (endpointId: string, isInView: boolean) => void;
    }
}

type EndpointId = string;

export function useSubpackageScrolling({
    subpackageId,
    containerRef,
}: useSubpackageScrolling.Args): useSubpackageScrolling.Return {
    const [endpointsInView, setEndpointsInView] = useState<EndpointId[]>([]);

    const setIsEndpointInView = useCallback((endpointId: string, isInView: boolean) => {
        setEndpointsInView((existing) => {
            const existingWithoutEndpoint = existing.filter((id) => id !== endpointId);
            if (isInView) {
                return [endpointId, ...existingWithoutEndpoint];
            } else {
                return existingWithoutEndpoint;
            }
        });
    }, []);

    const { value: isScrolling, setTrue: setIsScrolling, setFalse: setIsNotScrolling } = useBooleanState(false);
    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;
        const onScroll = () => {
            clearTimeout(timeout);
            setIsScrolling();
            timeout = setTimeout(setIsNotScrolling, 100);
        };

        containerRef?.addEventListener("scroll", onScroll);
        containerRef?.addEventListener("scrollend", setIsNotScrolling);
        return () => {
            containerRef?.removeEventListener("scroll", onScroll);
            containerRef?.removeEventListener("scrollend", setIsNotScrolling);
        };
    }, [setIsScrolling, setIsNotScrolling, containerRef]);

    const endpointInView = endpointsInView[0];
    const organizationId = useCurrentOrganizationIdOrThrow();
    const apiId = useCurrentApiIdOrThrow();
    const navigate = useNavigate();
    const { urlPathResolver } = useApiDefinitionContext();
    useEffect(() => {
        if (isScrolling && endpointInView != null) {
            navigate(
                generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
                    ENVIRONMENT_ID: "latest",
                    ORGANIZATION_ID: organizationId,
                    API_ID: apiId,
                    "*": urlPathResolver.getUrlPathForEndpoint(subpackageId, endpointInView),
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpointInView]);

    const { registerSidebarItemClickListener } = useApiDefinitionContext();

    useEffect(() => {
        const unsubscribe = registerSidebarItemClickListener(
            {
                type: "subpackage",
                subpackageId,
                endpointId: undefined,
            },
            () => {
                containerRef?.scrollTo({
                    top: 0,
                });
            }
        );
        return unsubscribe;
    }, [containerRef, registerSidebarItemClickListener, subpackageId]);

    return {
        setIsEndpointInView,
    };
}
