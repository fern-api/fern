import type { AuthProvider } from "./AuthProvider.js";
import type { AuthRequest } from "./AuthRequest.js";
export declare class NoOpAuthProvider implements AuthProvider {
    getAuthRequest(): Promise<AuthRequest>;
}
