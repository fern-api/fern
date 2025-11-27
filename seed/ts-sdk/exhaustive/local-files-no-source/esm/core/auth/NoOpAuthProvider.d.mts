import type { AuthProvider } from "./AuthProvider.mjs";
import type { AuthRequest } from "./AuthRequest.mjs";
export declare class NoOpAuthProvider implements AuthProvider {
    getAuthRequest(): Promise<AuthRequest>;
}
