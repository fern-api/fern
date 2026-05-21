import { CliError } from "@fern-api/task-context";

/**
 * Registry of well-known CLI errors.
 *
 * Each entry is a tiny factory that returns a {@link CliError} with a fixed
 * code, a templated message, an actionable hint, and (when appropriate) a
 * docs link. This is the cli-v2 equivalent of `MdxErrorCode` for the rest of
 * the CLI surface: adding a new well-known failure is a 5-line PR here
 * (template + test + call-site swap), and every consumer of that template
 * gets identical UX automatically.
 *
 * Conventions:
 *
 * - Keep messages **declarative and single-sentence** ("X not found.", not
 *   "Could not find X."). The renderer adds the `error[CODE]:` prefix.
 * - Keep hints **imperative and copy-pasteable** ("Run `fern init`.", not
 *   "Try running fern init"). The renderer adds the `hint:` prefix.
 * - Only set `docsLink` when the corresponding learn page exists today.
 *   Shipping a 404 is worse than no link at all.
 * - One template per distinct failure mode. If two templates collapse into
 *   the same message + hint, merge them.
 */
export const FernCliErrors = {
    /**
     * The user invoked a command that requires authentication, but no token
     * is available. Use this for the "you must log in" path, NOT for "your
     * token was rejected by the server" — that's {@link Unauthorized}.
     *
     * `message` is optional so call sites can phrase the failure naturally
     * for their context (e.g. `whoami` wants "You are not logged in.", but
     * the hint and docs link stay consistent across the CLI).
     */
    AuthRequired({ message }: { message?: string } = {}): CliError {
        return new CliError({
            message: message ?? "Authentication required.",
            code: CliError.Code.AuthError,
            hint: "Run `fern auth login`, or set the FERN_TOKEN environment variable.",
            docsLink: "https://buildwithfern.com/learn/cli/auth"
        });
    },

    /**
     * The user is logged in but their token was rejected (expired or revoked).
     */
    Unauthorized(): CliError {
        return new CliError({
            message: "Your Fern token was rejected.",
            code: CliError.Code.AuthError,
            hint: "Run `fern auth login` to refresh, or set FERN_TOKEN to a valid token.",
            docsLink: "https://buildwithfern.com/learn/cli/auth"
        });
    },

    /**
     * The command requires a `fern.yml` in (or above) the current directory
     * and there isn't one.
     */
    FernYmlNotFound({ cwd }: { cwd: string }): CliError {
        return new CliError({
            message: `No fern.yml found in ${cwd} or any parent directory.`,
            code: CliError.Code.ConfigError,
            hint: "Run `fern init` to initialize a project here."
        });
    },

    /**
     * Two flags were passed that cannot be used together (mutually exclusive).
     * Example: `--group` and `--target` on `sdk generate`.
     */
    FlagsMutex({ a, b }: { a: string; b: string }): CliError {
        return new CliError({
            message: `The ${a} and ${b} flags cannot be used together.`,
            code: CliError.Code.ConfigError,
            hint: `Pass either ${a} or ${b}, not both.`
        });
    },

    /**
     * A flag was passed that requires another flag to be set, and the other
     * flag was not provided. Example: `--container-engine` without `--local`.
     */
    FlagRequires({ flag, requires }: { flag: string; requires: string }): CliError {
        return new CliError({
            message: `The ${flag} flag can only be used with ${requires}.`,
            code: CliError.Code.ConfigError,
            hint: `Add ${requires} to your command, or remove ${flag}.`
        });
    },

    /**
     * A required flag was not provided. `missing` should be a one-line
     * description of the flag, e.g. `--target <language>    SDK language`.
     */
    MissingRequiredFlags({ missing }: { missing: readonly string[] }): CliError {
        const list = missing.map((line) => `  ${line}`).join("\n");
        return new CliError({
            message: `Missing required flags:\n\n${list}`,
            code: CliError.Code.ConfigError,
            hint: "See `--help` for the full list of options."
        });
    },

    /**
     * A path to a local file the user passed does not exist on disk.
     */
    FileNotFound({ path }: { path: string }): CliError {
        return new CliError({
            message: `File not found: ${path}`,
            code: CliError.Code.ConfigError,
            hint: "Check the path for typos and that the file exists relative to the current directory."
        });
    },

    /**
     * A value (a language, a spec type, a target name, etc.) was passed that
     * is not in the supported set.
     */
    UnsupportedValue({
        what,
        value,
        supported
    }: {
        what: string;
        value: string;
        supported: readonly string[];
    }): CliError {
        return new CliError({
            message: `"${value}" is not a supported ${what}.`,
            code: CliError.Code.ConfigError,
            hint: `Supported ${what}s: ${supported.join(", ")}.`
        });
    },

    /**
     * A remote HTTP fetch failed with a non-2xx status. Use this for
     * downloads, registry calls, and other "we tried to read a URL" failures.
     */
    HttpFetchFailed({ url, status, statusText }: { url: string; status: number; statusText: string }): CliError {
        return new CliError({
            message: `Failed to fetch "${url}": HTTP ${status} ${statusText}.`,
            code: CliError.Code.NetworkError,
            hint: "Check your network connection and verify the URL is correct."
        });
    },

    /**
     * `--input` was set to stdin (`-`) but no bytes were piped in.
     */
    EmptyStdin(): CliError {
        return new CliError({
            message: 'No input received on stdin (--api "-").',
            code: CliError.Code.ConfigError,
            hint: "Pipe a spec into the command, e.g. `cat openapi.yml | fern <cmd> --api -`."
        });
    },

    /**
     * A user-visible "validation failed" error with no extra message. The
     * detail body is expected to have been printed already by the caller's
     * violation printer. Used when the renderer would otherwise see an empty
     * CliError and fall back to the per-code title alone.
     */
    ValidationFailed(): CliError {
        return new CliError({
            code: CliError.Code.ValidationError,
            hint: "Fix the issues listed above and re-run."
        });
    },

    /**
     * Fern reached a state it never should have. Strongly signals a bug — the
     * `docsLink` points to the bug report flow.
     */
    InternalError({ details }: { details: string }): CliError {
        return new CliError({
            message: `Internal error: ${details}`,
            code: CliError.Code.InternalError,
            hint: "This is a Fern bug. Re-run with `--debug` and file an issue with the output.",
            docsLink: "https://github.com/fern-api/fern/issues/new"
        });
    }
} as const;
