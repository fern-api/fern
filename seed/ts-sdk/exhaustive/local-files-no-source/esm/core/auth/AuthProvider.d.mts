import type { EndpointMetadata } from "../fetcher/EndpointMetadata.mjs";
import type { AuthRequest } from "./AuthRequest.mjs";
export interface AuthProvider {
    getAuthRequest(arg?: {
        endpointMetadata?: EndpointMetadata;
    }): Promise<AuthRequest>;
}
export declare function isAuthProvider(value: unknown): value is AuthProvider;
