import type { EndpointMetadata } from "../fetcher/EndpointMetadata.mjs";
import type { AuthRequest } from "./AuthRequest.mjs";
export interface AuthProvider {
    /**
     * @param arg.forceRefresh When true, bypasses any cached credentials and fetches fresh ones.
     */
    getAuthRequest(arg?: {
        endpointMetadata?: EndpointMetadata;
        forceRefresh?: boolean;
    }): Promise<AuthRequest>;
}
export declare function isAuthProvider(value: unknown): value is AuthProvider;
