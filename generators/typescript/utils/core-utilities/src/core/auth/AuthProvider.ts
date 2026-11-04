import type { EndpointMetadata } from "../fetcher/EndpointMetadata";
import type { AuthRequest } from "./AuthRequest";

export interface AuthProvider {
    getAuthRequest(arg?: {
        endpointMetadata?: EndpointMetadata;
        /** When true, bypass any cached credentials and resolve auth again. */
        forceRefresh?: boolean;
        /**
         * The auth headers the failed request was sent with. With `forceRefresh`, cached credentials are
         * only dropped if they still match these; otherwise another request already refreshed them.
         */
        failedAuthHeaders?: Record<string, string>;
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
