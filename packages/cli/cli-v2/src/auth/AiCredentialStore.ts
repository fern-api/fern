import type { schemas } from "@fern-api/config";
import { CredentialStore } from "./CredentialStore.js";

type FernRcAiProvider = schemas.FernRcAiProvider;

/**
 * Keyring account names used to store AI provider API keys.
 * Namespaced with "ai:" to avoid collisions with Fern auth tokens.
 */
const KEYRING_ACCOUNT: Record<FernRcAiProvider, string | undefined> = {
    anthropic: "ai:anthropic",
    openai: "ai:openai",
    bedrock: undefined // Bedrock uses AWS credentials chain, no API key stored here.
};

/**
 * Securely stores and retrieves AI provider API keys via the OS keyring
 * (macOS Keychain / Linux libsecret / Windows Credential Manager).
 *
 * Keys are stored under the "fern" service with an account name of
 * "ai:<provider>" so they live alongside Fern auth tokens but don't collide.
 */
export class AiCredentialStore {
    private readonly store: CredentialStore;

    constructor() {
        this.store = new CredentialStore();
    }

    /**
     * Store an API key for the given provider in the OS keyring.
     */
    public async setKey(provider: FernRcAiProvider, key: string): Promise<void> {
        const account = KEYRING_ACCOUNT[provider];
        if (account == null) {
            throw new Error(`Provider '${provider}' does not use a stored API key.`);
        }
        await this.store.store(account, key);
    }

    /**
     * Retrieve the stored API key for the given provider.
     * Returns undefined if not set.
     */
    public async getKey(provider: FernRcAiProvider): Promise<string | undefined> {
        const account = KEYRING_ACCOUNT[provider];
        if (account == null) {
            return undefined;
        }
        return this.store.get(account);
    }

    /**
     * Remove the stored API key for the given provider.
     */
    public async removeKey(provider: FernRcAiProvider): Promise<void> {
        const account = KEYRING_ACCOUNT[provider];
        if (account == null) {
            return;
        }
        await this.store.remove(account);
    }

    /**
     * Check whether the OS keyring is accessible on this machine.
     */
    public async isAvailable(): Promise<boolean> {
        return this.store.isAvailable();
    }
}
