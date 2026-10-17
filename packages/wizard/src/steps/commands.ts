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

export function formatCommand(command: Command): string {
    return [command.executable, ...command.args].join(" ");
}
