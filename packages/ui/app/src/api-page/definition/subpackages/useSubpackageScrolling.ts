import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useCallback, useEffect, useState } from "react";
import { useDocsContext } from "../../../docs-context/useDocsContext";

export declare namespace useSubpackageScrolling {
    export interface Args {
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

export function useSubpackageScrolling({ containerRef }: useSubpackageScrolling.Args): useSubpackageScrolling.Return {
    const { registerScrollToTopListener, setAnchorInView } = useDocsContext();

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

    const endpointInView = endpointsInView[0] ?? endpointInVerticalCenter;
    useEffect(() => {
        if (endpointInView?.urlSlug != null) {
            setAnchorInView(endpointInView.urlSlug);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpointInView?.urlSlug]);

    useEffect(() => {
        const unsubscribe = registerScrollToTopListener(() => {
            containerRef?.scrollTo({
                top: 0,
            });
        });
        return unsubscribe;
    }, [containerRef, registerScrollToTopListener]);

    return {
        setIsEndpointInView,
        setIsEndpointInVerticalCenter,
    };
}
