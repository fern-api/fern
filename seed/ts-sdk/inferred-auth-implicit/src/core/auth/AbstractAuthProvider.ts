import { AuthRequest } from "./AuthRequest.js";

export abstract class AbstractAuthProvider {
    public abstract getAuthRequest(): Promise<AuthRequest>;
}
