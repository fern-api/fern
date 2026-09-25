import type { EndpointMetadata } from "../fetcher/EndpointMetadata";
import type { AuthRequest } from "./AuthRequest";

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
