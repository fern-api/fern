import { AuthRequest } from "./AuthRequest.mjs";
export interface AuthProvider {
    getAuthRequest(): Promise<AuthRequest>;
}
