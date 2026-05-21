import { assertNever } from "@fern-api/core-utils";
import { CliError, TaskAbortSignal } from "@fern-api/task-context";

/**
 * Process exit codes returned by the CLI on failure.
 *
 * Modeled on BSD `sysexits.h` (which is what most well-behaved Unix tools
 * follow) so callers — shell scripts, CI pipelines, parent processes — can
 * distinguish failure modes without parsing stderr.
 *
 * https://man.freebsd.org/cgi/man.cgi?query=sysexits
 *
 * Stability: these values are part of the CLI's public contract. Changing
 * one is a breaking change for downstream scripts.
 */
export const ExitCode = {
    Success: 0,
    /** Catch-all for anything we don't have a more specific code for. */
    Generic: 1,
    /** Usage error (bad flag, unknown command, missing required arg). */
    Usage: 2,
    /** Input data was syntactically invalid (validation, parse, IR). */
    DataErr: 65,
    /** A referenced input file or resource could not be found. */
    NoInput: 66,
    /** Unhandled internal error / unexpected exception. */
    Software: 70,
    /** Authentication or authorization failure. */
    NoPerm: 77,
    /** The CLI's configuration is invalid. */
    Config: 78,
    /** Command was interrupted by Ctrl-C (128 + SIGINT). */
    Sigint: 130,
    /** Command was terminated by SIGTERM (128 + SIGTERM). */
    Sigterm: 143
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

/**
 * Resolve the process exit code for a thrown error.
 *
 * - {@link TaskAbortSignal} → {@link ExitCode.Sigint} (treated as user
 *   cancellation; `setupSignalHandler` handles real SIGINT/SIGTERM
 *   separately).
 * - {@link CliError} → mapped from `error.code` via {@link exitCodeForCliErrorCode}.
 * - Anything else (`Error`, thrown strings, etc.) → {@link ExitCode.Software}
 *   so it's distinguishable from a real `CliError` whose code maps to 1.
 */
export function exitCodeForError(error: unknown): ExitCode {
    if (error instanceof TaskAbortSignal) {
        return ExitCode.Sigint;
    }
    if (error instanceof CliError) {
        return exitCodeForCliErrorCode(error.code);
    }
    return ExitCode.Software;
}

/**
 * Map a {@link CliError.Code} to its process exit code.
 *
 * Every {@link CliError.Code} variant must be handled — `assertNever` at the
 * end of the switch guarantees a compile error if a new variant is added
 * without picking an exit code, so we never silently fall through to a
 * generic 1.
 */
export function exitCodeForCliErrorCode(code: CliError.Code): ExitCode {
    switch (code) {
        case CliError.Code.UserError:
            return ExitCode.Usage;
        case CliError.Code.ValidationError:
        case CliError.Code.ParseError:
        case CliError.Code.IrConversionError:
        case CliError.Code.ReferenceError:
            return ExitCode.DataErr;
        case CliError.Code.ResolutionError:
            return ExitCode.NoInput;
        case CliError.Code.AuthError:
            return ExitCode.NoPerm;
        case CliError.Code.ConfigError:
        case CliError.Code.VersionError:
            return ExitCode.Config;
        case CliError.Code.NetworkError:
        case CliError.Code.ContainerError:
        case CliError.Code.EnvironmentError:
            return ExitCode.Generic;
        case CliError.Code.InternalError:
            return ExitCode.Software;
        default:
            assertNever(code);
    }
}
