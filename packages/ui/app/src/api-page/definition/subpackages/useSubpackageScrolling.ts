import { useBooleanState } from "@fern-api/react-commons";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDocsContext } from "../../../docs-context/useDocsContext";

export declare namespace useSubpackageScrolling {
    export interface Args {
        subpackageId: FernRegistryApiRead.SubpackageId;
        containerRef: HTMLElement | undefined;
    }

    export interface Return {
        setIsEndpointInView: (endpoint: FernRegistryApiRead.EndpointDefinition, isInView: boolean) => void;
        setIsEndpointInVerticalCenter: (
            endpoint: FernRegistryApiRead.EndpointDefinition,
            isInVerticalCenter: boolean
        ) => void;
    }
}

export function useSubpackageScrolling({
    subpackageId,
    containerRef,
}: useSubpackageScrolling.Args): useSubpackageScrolling.Return {
    const [endpointInVerticalCenter, setEndpointInVerticalCenter] = useState<FernRegistryApiRead.EndpointDefinition>();
    const [endpointsInView, setEndpointsInView] = useState<FernRegistryApiRead.EndpointDefinition[]>([]);

    const setIsEndpointInView = useCallback((endpoint: FernRegistryApiRead.EndpointDefinition, isInView: boolean) => {
        setEndpointsInView((existing) => {
            const existingWithoutEndpoint = existing.filter((other) => other.id !== endpoint.id);
            if (isInView) {
                return [endpoint, ...existingWithoutEndpoint];
            } else {
                return existingWithoutEndpoint;
            }
        });
    }, []);

    const setIsEndpointInVerticalCenter = useCallback(
        (endpoint: FernRegistryApiRead.EndpointDefinition, isInVerticalCenter: boolean) => {
            return setEndpointInVerticalCenter((existing) => {
                if (isInVerticalCenter) {
                    return endpoint;
                } else if (endpoint.id === existing?.id) {
                    return undefined;
                } else {
                    return existing;
                }
            });
        },
        []
    );

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

    const endpointInView = endpointsInView[0] ?? endpointInVerticalCenter;
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (isScrolling && endpointInView != null) {
            navigate(`${location.pathname}#${endpointInView.urlSlug}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpointInView]);

    const { registerSidebarItemClickListener } = useDocsContext();

    useEffect(() => {
        const unsubscribe = registerSidebarItemClickListener(location.pathname, () => {
            containerRef?.scrollTo({
                top: 0,
            });
        });
        return unsubscribe;
    }, [containerRef, location.pathname, registerSidebarItemClickListener, subpackageId]);

    return {
        setIsEndpointInView,
        setIsEndpointInVerticalCenter,
    };
}
