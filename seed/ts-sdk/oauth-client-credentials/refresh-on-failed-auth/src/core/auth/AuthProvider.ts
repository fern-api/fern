import type { EndpointMetadata } from "../fetcher/EndpointMetadata.js";
import type { AuthRequest } from "./AuthRequest.js";

export interface AuthProvider {
    /**
     * @param arg.forceRefresh When true, bypasses any cached credentials and fetches fresh ones.
     */
    getAuthRequest(arg?: { endpointMetadata?: EndpointMetadata; forceRefresh?: boolean }): Promise<AuthRequest>;
}

export function isAuthProvider(value: unknown): value is AuthProvider {
    return (
        typeof value === "object" &&
        value !== null &&
        "getAuthRequest" in value &&
        typeof value.getAuthRequest === "function"
    );
}
