import { loggingExeca, runExeca } from "@fern-api/logging-execa";
import { CliError } from "@fern-api/task-context";

/**
 * Platform-specific keyring access via CLI subprocesses.
 *
 * Replaces the `keytar` native addon with calls to system CLI tools:
 *  - macOS: `security` (Keyring Services)
 *  - Linux: `secret-tool` (libsecret / GNOME Keyring)
 *  - Windows: PowerShell `cmdkey` / credential cmdlets
 *
 * NOTE: This is a temporary solution that works for both Node and single file executable
 *       bun builds. If we later commit to bun, we should migrate this to use bun's secrets
 *       module, which provides native support for the platform's keyring.
 *
 *       For details, see https://bun.com/docs/runtime/secrets
 */

export declare namespace PlatformKeyring {
    export interface Credential {
        account: string;
        password: string;
    }
}

export class PlatformKeyring {
    public async setPassword(service: string, account: string, password: string): Promise<void> {
        switch (process.platform) {
            case "darwin":
                await this.setPasswordDarwin(service, account, password);
                break;
            case "linux":
                await this.setPasswordLinux(service, account, password);
                break;
            case "win32":
                await this.setPasswordWindows(service, account, password);
                break;
            default:
                throw new CliError({
                    message: `Unsupported platform: ${process.platform}`,
                    code: CliError.Code.EnvironmentError
                });
        }
    }

    public async getPassword(service: string, account: string): Promise<string | null> {
        switch (process.platform) {
            case "darwin":
                return this.getPasswordDarwin(service, account);
            case "linux":
                return this.getPasswordLinux(service, account);
            case "win32":
                return this.getPasswordWindows(service, account);
            default:
                throw new CliError({
                    message: `Unsupported platform: ${process.platform}`,
                    code: CliError.Code.EnvironmentError
                });
        }
    }

    public async deletePassword(service: string, account: string): Promise<boolean> {
        switch (process.platform) {
            case "darwin":
                return this.deletePasswordDarwin(service, account);
            case "linux":
                return this.deletePasswordLinux(service, account);
            case "win32":
                return this.deletePasswordWindows(service, account);
            default:
                throw new CliError({
                    message: `Unsupported platform: ${process.platform}`,
                    code: CliError.Code.EnvironmentError
                });
        }
    }

    public async findCredentials(service: string): Promise<PlatformKeyring.Credential[]> {
        switch (process.platform) {
            case "darwin":
                return this.findCredentialsDarwin(service);
            case "linux":
                return this.findCredentialsLinux(service);
            case "win32":
                return this.findCredentialsWindows(service);
            default:
                throw new CliError({
                    message: `Unsupported platform: ${process.platform}`,
                    code: CliError.Code.EnvironmentError
                });
        }
    }

    private async setPasswordDarwin(service: string, account: string, password: string): Promise<void> {
        try {
            // Delete existing entry first (ignore errors if it doesn't exist).
            await this.runExeca("security", ["delete-generic-password", "-s", service, "-a", account]);
        } catch {
            // It's fine if the entry doesn't exist.
        }
        // -A allows any application to access this item without prompting.
        //
        // Without it, only the `security` binary itself would be trusted,
        // causing macOS to prompt on every access from other tools.
        await this.runExeca("security", ["add-generic-password", "-s", service, "-a", account, "-w", password, "-A"]);
    }

    private async getPasswordDarwin(service: string, account: string): Promise<string | null> {
        try {
            const result = await this.runExeca("security", [
                "find-generic-password",
                "-s",
                service,
                "-a",
                account,
                "-w"
            ]);
            return result.stdout.trim();
        } catch {
            return null;
        }
    }

    private async deletePasswordDarwin(service: string, account: string): Promise<boolean> {
        try {
            await this.runExeca("security", ["delete-generic-password", "-s", service, "-a", account]);
            return true;
        } catch {
            return false;
        }
    }

    private async findCredentialsDarwin(service: string): Promise<PlatformKeyring.Credential[]> {
        try {
            const result = await this.runExeca("security", ["dump-keychain"]);
            const output = result.stdout;

            const credentials: PlatformKeyring.Credential[] = [];
            const entries = output.split("keychain:");

            for (const entry of entries) {
                // Check if this entry matches our service.
                const serviceMatch = entry.match(/"svce"<blob>="([^"]*)"/);
                if (serviceMatch?.[1] !== service) {
                    continue;
                }

                const accountMatch = entry.match(/"acct"<blob>="([^"]*)"/);
                if (accountMatch?.[1] == null) {
                    continue;
                }

                const account = accountMatch[1];

                const password = await this.getPasswordDarwin(service, account);
                if (password != null) {
                    credentials.push({ account, password });
                }
            }

            return credentials;
        } catch {
            return [];
        }
    }

    private async setPasswordLinux(service: string, account: string, password: string): Promise<void> {
        await this.runExeca(
            "secret-tool",
            ["store", "--label", `${service}/${account}`, "service", service, "account", account],
            { input: password }
        );
    }

    private async getPasswordLinux(service: string, account: string): Promise<string | null> {
        try {
            const result = await this.runExeca("secret-tool", ["lookup", "service", service, "account", account]);
            const trimmed = result.stdout.trim();
            return trimmed.length > 0 ? trimmed : null;
        } catch {
            return null;
        }
    }

    private async deletePasswordLinux(service: string, account: string): Promise<boolean> {
        try {
            await this.runExeca("secret-tool", ["clear", "service", service, "account", account]);
            return true;
        } catch {
            return false;
        }
    }

    private async findCredentialsLinux(service: string): Promise<PlatformKeyring.Credential[]> {
        try {
            const result = await this.runExeca("secret-tool", ["search", "service", service]);
            const output = result.stdout;

            const credentials: PlatformKeyring.Credential[] = [];
            const entries = output.split("[/org/freedesktop/secrets");

            for (const entry of entries) {
                const accountMatch = entry.match(/attribute\.account\s*=\s*(.+)/);
                const secretMatch = entry.match(/secret\s*=\s*(.+)/);

                if (accountMatch?.[1] != null && secretMatch?.[1] != null) {
                    credentials.push({
                        account: accountMatch[1].trim(),
                        password: secretMatch[1].trim()
                    });
                }
            }

            return credentials;
        } catch {
            return [];
        }
    }

    private async setPasswordWindows(service: string, account: string, password: string): Promise<void> {
        // NOTE: cmdkey requires the password to be passed via /pass.
        // This exposes the secret in the process command line briefly.
        // There is no stdin or interactive alternative for cmdkey.
        //
        // TODO: Fix this with powershell or use Bun's secrets module.
        await this.runExeca("cmdkey", [
            `/generic:${this.getTargetName(service, account)}`,
            `/user:${account}`,
            `/pass:${password}`
        ]);
    }

    private async getPasswordWindows(service: string, account: string): Promise<string | null> {
        try {
            // PowerShell to read credential — cmdkey /list doesn't expose passwords
            const script = `
                $cred = Get-StoredCredential -Target '${this.getTargetName(service, account).replace(/'/g, "''")}'
                if ($cred) {
                    $cred.GetNetworkCredential().Password
                }
            `;
            const result = await this.runExeca("powershell", ["-NoProfile", "-Command", script]);
            const trimmed = result.stdout.trim();
            return trimmed.length > 0 ? trimmed : null;
        } catch {
            // Fall back to CredentialManager module approach.
            try {
                const script = `
                    Add-Type -AssemblyName System.Web
                    $target = '${this.getTargetName(service, account).replace(/'/g, "''")}'
                    $sig = @'
[DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
public static extern bool CredRead(string target, int type, int flags, out IntPtr credential);
[DllImport("advapi32.dll")]
public static extern void CredFree(IntPtr credential);
'@
                    $Advapi32 = Add-Type -MemberDefinition $sig -Namespace 'Win32' -Name 'Advapi32' -PassThru
                    $ptr = [IntPtr]::Zero
                    if ($Advapi32::CredRead($target, 1, 0, [ref]$ptr)) {
                        $cred = [System.Runtime.InteropServices.Marshal]::PtrToStructure($ptr, [Type][System.Management.Automation.PSCredential])
                        $Advapi32::CredFree($ptr)
                    }
                `;
                const result2 = await this.runExeca("powershell", ["-NoProfile", "-Command", script]);
                const trimmed2 = result2.stdout.trim();
                return trimmed2.length > 0 ? trimmed2 : null;
            } catch {
                return null;
            }
        }
    }

    private async deletePasswordWindows(service: string, account: string): Promise<boolean> {
        try {
            await this.runExeca("cmdkey", [`/delete:${this.getTargetName(service, account)}`]);
            return true;
        } catch {
            return false;
        }
    }

    private async findCredentialsWindows(service: string): Promise<PlatformKeyring.Credential[]> {
        try {
            const result = await this.runExeca("cmdkey", ["/list"]);
            const output = result.stdout;

            const credentials: PlatformKeyring.Credential[] = [];
            const prefix = `${service}/`;
            const lines = output.split("\n");

            for (const line of lines) {
                const targetMatch = line.match(/Target:\s*(.+)/i);
                if (targetMatch?.[1] == null) {
                    continue;
                }
                const target = targetMatch[1].trim();
                if (!target.startsWith(prefix)) {
                    continue;
                }
                const account = target.slice(prefix.length);
                const password = await this.getPasswordWindows(service, account);
                if (password != null) {
                    credentials.push({ account, password });
                }
            }

            return credentials;
        } catch {
            return [];
        }
    }

    private getTargetName(service: string, account: string): string {
        return `${service}/${account}`;
    }

    private runExeca(
        executable: string,
        args: string[],
        options?: loggingExeca.Options
    ): Promise<loggingExeca.ReturnValue> {
        return runExeca(
            undefined, // We don't want to log anything for these internal calls.
            executable,
            args,
            { doNotPipeOutput: true, ...options }
        );
    }
}
