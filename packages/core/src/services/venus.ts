import { FernVenusApiClient } from "@fern-api/venus-api-sdk";

import { getCodingAgentHeaders } from "../codingAgent.js";

// The generated BearerAuthProvider skips the header when its supplier yields nothing.
const NO_TOKEN = (): string => undefined as unknown as string;

export function createVenusService({
    environment = process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com",
    token,
    headers
}: {
    environment?: string;
    /** Omit for the few unauthenticated routes (guest-session issuance); no Authorization header is sent then. */
    token: string | undefined;
    headers?: Record<string, string>;
}): FernVenusApiClient {
    return new FernVenusApiClient({
        environment,
        token: token ?? NO_TOKEN,
        headers: { ...getCodingAgentHeaders(), ...headers }
    });
}
