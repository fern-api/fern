import { KeyringUnavailableError } from "./errors/KeyringUnavailableError.js";
import { PlatformKeyring } from "./PlatformKeyring.js";

/**
 * Service name used for storing Fern tokens in the system keyring.
 */
const SERVICE_NAME = "fern";

export declare namespace CredentialStore {
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
 * Uses platform CLI tools for native credential storage:
 *  - macOS: `security` (Keychain)
 *  - Linux: `secret-tool` (libsecret)
 *  - Windows: `cmdkey` / PowerShell (Credential Manager)
 */
export class CredentialStore {
    private readonly keyring: PlatformKeyring;

    constructor() {
        this.keyring = new PlatformKeyring();
    }

    /**
     * Stores a token in the system keyring for the given account.
     */
    public async store(account: string, token: string): Promise<void> {
        try {
            await this.keyring.setPassword(SERVICE_NAME, account, token);
        } catch (error) {
            throw new KeyringUnavailableError(process.platform, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Retrieves a token from the system keyring for the given account.
     */
    public async get(account: string): Promise<string | undefined> {
        try {
            const token = await this.keyring.getPassword(SERVICE_NAME, account);
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
        try {
            return await this.keyring.deletePassword(SERVICE_NAME, account);
        } catch (error) {
            throw new KeyringUnavailableError(process.platform, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Retrieves all account/token pairs from the keyring.
     */
    public async getAll(): Promise<CredentialStore.Credential[]> {
        try {
            const credentials = await this.keyring.findCredentials(SERVICE_NAME);
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
     */
    public async isAvailable(): Promise<boolean> {
        try {
            // Try a harmless read to verify the keyring is accessible.
            await this.keyring.getPassword(SERVICE_NAME, "__fern_keyring_test__");
            return true;
        } catch {
            return false;
        }
    }
}
