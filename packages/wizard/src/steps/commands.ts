import type { ChildProcess } from "child_process";
import { spawn } from "child_process";

export interface Command {
    executable: string;
    args: string[];
}

export async function runCommand(command: Command, cwd: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        const child: ChildProcess = spawn(command.executable, command.args, {
            cwd,
            stdio: "inherit",
            shell: false
        });
        child.once("error", reject);
        child.once("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command.executable} exited with code ${code ?? "unknown"}`));
            }
        });
    });
}

/**
 * Runs a command without streaming its output, so the wizard can show a one-line summary instead.
 * If the command fails, the end of its output is included in the error.
 */
/** A command that exited unsuccessfully, with everything it printed. */
export class CommandFailedError extends Error {
    constructor(
        message: string,
        public readonly output: string
    ) {
        super(message);
    }
}

export async function runCommandQuietly(command: Command, cwd: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const child: ChildProcess = spawn(command.executable, command.args, {
            cwd,
            stdio: ["ignore", "pipe", "pipe"],
            shell: false
        });
        let output = "";
        child.stdout?.on("data", (chunk: Buffer) => {
            output += chunk.toString();
        });
        child.stderr?.on("data", (chunk: Buffer) => {
            output += chunk.toString();
        });
        child.once("error", reject);
        child.once("exit", (code) => {
            if (code === 0) {
                resolve(output);
                return;
            }
            const tail = output.trim().split("\n").slice(-15).join("\n");
            reject(
                new CommandFailedError(
                    `${formatCommand(command)} exited with code ${code ?? "unknown"}${tail ? `\n${tail}` : ""}`,
                    output
                )
            );
        });
    });
}

export function formatCommand(command: Command): string {
    return [command.executable, ...command.args].join(" ");
}

/** Opens a link in the default browser. Returns false when it can't, so the caller can show the link instead. */
export async function openInBrowser(url: string): Promise<boolean> {
    const command: Command =
        process.platform === "darwin"
            ? { executable: "open", args: [url] }
            : process.platform === "win32"
              ? { executable: "cmd", args: ["/c", "start", "", url] }
              : { executable: "xdg-open", args: [url] };
    try {
        await runCommandQuietly(command, process.cwd());
        return true;
    } catch {
        // No browser available, e.g. over SSH.
        return false;
    }
}
