export interface CommandInfo {
    /** The command that was executed (e.g. `sdk generate`). */
    command: string;
    /** The flags that were passed to the command (e.g. `--local`, `--target`, `--group`). */
    flags: string[];
}

export function parseCommandInfo(argv: string[]): CommandInfo {
    return {
        command: parseCommandPath(argv),
        flags: parseFlags(argv)
    };
}

function parseCommandPath(argv: string[]): string {
    const parts: string[] = [];
    for (const arg of argv.slice(2)) {
        if (arg.startsWith("-")) {
            break;
        }
        parts.push(arg);
    }
    return parts.join(" ");
}

function parseFlags(argv: string[]): string[] {
    return argv
        .slice(2)
        .filter((arg) => arg.startsWith("--"))
        .map((arg) => {
            const without = arg.slice(2);
            const eq = without.indexOf("=");
            return eq >= 0 ? without.slice(0, eq) : without;
        })
        .filter((flag) => flag.length > 0)
        .sort();
}
