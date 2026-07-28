import { hideBin } from "yargs/helpers";

// Commands exempt from org-level version redirection. `org` manages the very
// policy that drives redirection, so it must run on the locally-invoked CLI:
// otherwise an org whose floor points at a version predating `org` could not be
// changed back (redirection would re-exec a CLI that lacks the command).
export const VERSION_REDIRECTION_EXEMPT_COMMANDS = new Set(["org"]);

export function isVersionRedirectionExempt(argv: string[]): boolean {
    const command = getInvokedCommandName(argv);
    return command != null && VERSION_REDIRECTION_EXEMPT_COMMANDS.has(command);
}

/**
 * Returns the first positional argument (the top-level command), skipping global
 * options and the value consumed by `--log-level`.
 */
export function getInvokedCommandName(argv: string[]): string | undefined {
    const args = hideBin(argv);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg == null) {
            continue;
        }
        if (arg.startsWith("-")) {
            if (arg === "--log-level") {
                i++;
            }
            continue;
        }
        return arg;
    }
    return undefined;
}
