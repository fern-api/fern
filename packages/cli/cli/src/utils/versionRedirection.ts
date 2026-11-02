import { hideBin } from "yargs/helpers";

// Commands exempt from org-level version redirection. `org` manages the very
// policy that drives redirection, so it must run on the locally-invoked CLI:
// otherwise an org whose floor points at a version predating `org` could not be
// changed back (redirection would re-exec a CLI that lacks the command).
// `claim` and `whoami` act on the repo's guest session and only talk to Venus;
// they must work even when fern.config.json pins a CLI predating them.
export const VERSION_REDIRECTION_EXEMPT_COMMANDS = new Set(["org", "claim", "whoami"]);

export function isVersionRedirectionExempt(argv: string[]): boolean {
    const command = getInvokedCommandName(argv);
    if (command === "init") {
        // A bare `fern init` starts the setup wizard, which should be the CLI the user ran even in a
        // repository that pins an older one. `fern init` with flags keeps following the pin.
        return isBareInit(argv);
    }
    return command != null && VERSION_REDIRECTION_EXEMPT_COMMANDS.has(command);
}

/** Whether `fern init` was run with nothing but global options, which starts the setup wizard. */
export function isBareInit(argv: string[]): boolean {
    const rest: string[] = [];
    const args = hideBin(argv);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--log-level") {
            i++;
        } else if (arg != null && !arg.startsWith("--log-level=")) {
            rest.push(arg);
        }
    }
    return rest.length === 1 && rest[0] === "init";
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
