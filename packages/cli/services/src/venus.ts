import { FernVenusApiClient } from "@fern-api/venus-api-sdk";

const VENUS_ORIGIN = process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com";

export function createVenusService({ token }: { token?: string } = {}): FernVenusApiClient {
    return new FernVenusApiClient({
        environment: VENUS_ORIGIN,
        token,
    });
}
