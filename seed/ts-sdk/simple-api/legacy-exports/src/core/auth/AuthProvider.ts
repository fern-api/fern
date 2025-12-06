import type { EndpointMetadata } from "../fetcher/EndpointMetadata";
import type { AuthRequest } from "./AuthRequest";

export interface AuthProvider {
    getAuthRequest(arg?: { endpointMetadata?: EndpointMetadata }): Promise<AuthRequest>;
}
