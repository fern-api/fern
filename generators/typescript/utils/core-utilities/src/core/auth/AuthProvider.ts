import { AuthRequest } from "./AuthRequest";

export interface AuthProvider {
    getAuthRequest(): Promise<AuthRequest>;
}
