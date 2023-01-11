import { FernVenusApiClient } from "@fern-fern/venus-api-sdk";

const VENUS_ORIGIN = process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com";

export function getVenusOrigin(): string {
    return VENUS_ORIGIN;
}

export function createVenusService({ token }: { token?: string } = {}): FernVenusApiClient {
    return new FernVenusApiClient({
        environment: VENUS_ORIGIN,
        token,
    });
}
