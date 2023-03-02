import { FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { useMemo } from "react";
import { useGetToken } from "../auth/useGetToken";

const VENUS_ORIGIN = import.meta.env.VITE_VENUS_ORIGIN ?? "https://venus.buildwithfern.com";

export const VENUS_AUDIENCE = import.meta.env.VITE_VENUS_AUDIENCE ?? "venus-prod";

export function useVenus(): FernVenusApiClient {
    const getToken = useGetToken({ audience: VENUS_AUDIENCE });

    return useMemo(() => {
        return new FernVenusApiClient({
            environment: VENUS_ORIGIN,
            token: getToken,
        });
    }, [getToken]);
}
