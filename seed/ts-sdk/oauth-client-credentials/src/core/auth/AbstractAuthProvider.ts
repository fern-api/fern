import { AuthRequest } from "./AuthRequest";

export abstract class AbstractAuthProvider {
    public abstract getAuthRequest(): Promise<AuthRequest>;
}
