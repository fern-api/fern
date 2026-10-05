import type { EndpointMetadata } from "../fetcher/EndpointMetadata";
import type { AuthRequest } from "./AuthRequest";

export interface AuthProvider {
    getAuthRequest(arg?: {
        endpointMetadata?: EndpointMetadata;
        /** When true, bypass any cached credentials and resolve auth again. */
        forceRefresh?: boolean;
    }): Promise<AuthRequest>;
}

export function isAuthProvider(value: unknown): value is AuthProvider {
    return (
        typeof value === "object" &&
        value !== null &&
        "getAuthRequest" in value &&
        typeof value.getAuthRequest === "function"
    );
}
