import * as core from "..";

export abstract class AbstractAuthProvider {
    public abstract getHeaders(): Record<string, core.Supplier<string>>;
}