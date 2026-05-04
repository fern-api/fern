import { CliError } from "@fern-api/task-context";

/**
 * Error thrown when the system keyring is unavailable.
 */
export class KeyringUnavailableError extends CliError {
    public readonly platform: NodeJS.Platform;
    public override readonly cause?: Error;

    constructor(platform: NodeJS.Platform, cause?: Error) {
        super({
            message: getKeyringErrorMessage(platform),
            code: CliError.Code.AuthError
        });
        Object.setPrototypeOf(this, KeyringUnavailableError.prototype);
        this.platform = platform;
        this.cause = cause;
    }
}

/**
 * Gets platform-specific error message with instructions.
 */
function getKeyringErrorMessage(platform: NodeJS.Platform): string {
    switch (platform) {
        case "darwin":
            return `Cannot access macOS Keychain

Fern requires the system keyring to securely store access tokens.

To fix this:
  1. Open Keychain Access (Applications > Utilities > Keychain Access)
  2. Select "login" keychain in the sidebar
  3. Right-click and select "Unlock Keychain"
  4. Enter your macOS login password

If running in a headless environment, use FERN_TOKEN instead:
  export FERN_TOKEN=<your-token>`;

        case "linux":
            return `Cannot access GNOME Keyring

Fern requires the system keyring to securely store access tokens.

To fix this:
  1. Ensure gnome-keyring is installed:
     sudo apt install gnome-keyring libsecret-1-0

  2. Ensure the keyring daemon is running:
     eval $(gnome-keyring-daemon --start --components=secrets)

If running in a headless environment, use FERN_TOKEN instead:
  export FERN_TOKEN=<your-token>`;

        case "win32":
            return `Cannot access Windows Credential Manager

Fern requires the system keyring to securely store access tokens.

To fix this:
  1. Open Control Panel > User Accounts > Credential Manager
  2. Ensure Windows Credential Manager is functioning
  3. Try restarting the Credential Manager service

If running in a headless environment, use FERN_TOKEN instead:
  set FERN_TOKEN=<your-token>`;

        default:
            return `Cannot access system keyring

Fern requires the system keyring to securely store access tokens.

If running in a headless environment, use FERN_TOKEN instead:
  export FERN_TOKEN=<your-token>`;
    }
}
