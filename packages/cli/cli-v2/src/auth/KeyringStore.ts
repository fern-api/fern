import type * as keytar from "keytar";
import { KeyringUnavailableError } from "./errors/KeyringUnavailableError.js";

/**
 * Service name used for storing Fern tokens in the system keyring.
 */
const SERVICE_NAME = "fern";

export declare namespace KeyringStore {
    /**
     * A stored credential from the keyring.
     */
    export interface Credential {
        account: string;
        token: string;
    }
}

/**
 * Service for securely storing and retrieving tokens using the system keyring.
 *
 * Uses the platform's native credential storage:
 *  - macOS: Keychain
 *  - Linux: GNOME Keyring / libsecret
 *  - Windows: Credential Manager
 */
export class KeyringStore {
    private keytarModule: typeof keytar | null = null;
    private keytarLoadError: Error | null = null;

    /**
     * Stores a token in the system keyring for the given account.
     */
    public async store(account: string, token: string): Promise<void> {
        const kt = await this.getKeytar();
        try {
            await kt.setPassword(SERVICE_NAME, account, token);
        } catch (error) {
            throw new KeyringUnavailableError(process.platform, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Retrieves a token from the system keyring for the given account.
     * Returns undefined if not found.
     */
    public async get(account: string): Promise<string | undefined> {
        const kt = await this.getKeytar();
        try {
            const token = await kt.getPassword(SERVICE_NAME, account);
            return token ?? undefined;
        } catch (error) {
            throw new KeyringUnavailableError(process.platform, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Removes a token from the system keyring for the given account.
     * Returns true if a token was removed, false if not found.
     */
    public async remove(account: string): Promise<boolean> {
        const kt = await this.getKeytar();
        try {
            return await kt.deletePassword(SERVICE_NAME, account);
        } catch (error) {
            throw new KeyringUnavailableError(process.platform, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Retrieves all account/token pairs from the keyring.
     */
    public async getAll(): Promise<KeyringStore.Credential[]> {
        const kt = await this.getKeytar();
        try {
            const credentials = await kt.findCredentials(SERVICE_NAME);
            return credentials.map((cred) => ({
                account: cred.account,
                token: cred.password
            }));
        } catch (error) {
            throw new KeyringUnavailableError(process.platform, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Checks if the keyring is available on this system.
     * Useful for early detection of keyring issues.
     */
    public async isAvailable(): Promise<boolean> {
        try {
            await this.getKeytar();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Lazily loads the keytar module to avoid issues if the native module fails to load.
     */
    private async getKeytar(): Promise<typeof keytar> {
        if (this.keytarLoadError != null) {
            throw new KeyringUnavailableError(process.platform, this.keytarLoadError);
        }
        if (this.keytarModule == null) {
            try {
                this.keytarModule = await import("keytar");
            } catch (error) {
                this.keytarLoadError = error instanceof Error ? error : new Error(String(error));
                throw new KeyringUnavailableError(process.platform, this.keytarLoadError);
            }
        }
        return this.keytarModule;
    }
}
