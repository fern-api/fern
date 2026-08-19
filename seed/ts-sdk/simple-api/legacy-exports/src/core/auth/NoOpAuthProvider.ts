import type { AuthProvider } from "./AuthProvider";
import type { AuthRequest } from "./AuthRequest";

export class NoOpAuthProvider implements AuthProvider {
    public getAuthRequest(): Promise<AuthRequest> {
        return Promise.resolve({ headers: {} });
    }
}
