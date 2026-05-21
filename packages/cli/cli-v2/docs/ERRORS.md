# Fern CLI error reference

This page documents how the Fern CLI surfaces errors and lists every error code
it can emit. The format is stable: scripts, CI pipelines, and editors can rely
on the `error[CODE]:` prefix, the `--json` envelope, and the process exit code.

## What an error looks like

```
error[AUTH_ERROR]: You are not logged in to Fern.
hint: Run `fern auth login`, or set the FERN_TOKEN environment variable.
see:  https://buildwithfern.com/learn/cli/auth

Logs written to:
~/.fern/v1/logs/2026-05-20T18-58-00.log
```

| Field        | Meaning                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------- |
| `error[X]:`  | The error code (see [the table below](#error-codes)) followed by a short title and message.  |
| `hint:`      | An imperative, copy-pasteable next step. May be absent if no actionable hint applies.        |
| `see:`       | A documentation link with more detail. May be absent.                                        |
| Log path     | Absolute path to a per-invocation debug log. Always present when something was logged.       |

All of this goes to **stderr**. Stdout is reserved for the command's normal
output (e.g. `auth whoami` prints your email to stdout, `sdk list --json`
prints a JSON array to stdout). You can safely pipe stdout into another tool
without scraping error output.

## Debug mode

Pass `--debug` (or set `FERN_DEBUG=1` in the environment) to also render the
full stack trace and any `error.cause` chain below the envelope:

```
$ fern --debug check
error[INTERNAL_ERROR]: Something exploded
hint: This is a Fern bug. Re-run with `--debug` and file an issue with the output.
see:  https://github.com/fern-api/fern/issues/new

caused by: TypeError: Cannot read properties of undefined (reading 'foo')
    at ...

Stack trace:
CliError: Something exploded
    at ...
```

`--debug` also raises the CLI's log level to `debug`, so the log file linked
at the bottom of the output contains the full diagnostic trail.

## Machine-readable mode (`--json`)

For CI pipelines, agents, and anything that wants to parse failures
programmatically, pass `--json` to render errors as a structured JSON
envelope on stderr:

```jsonc
{
  "ok": false,
  "code": "AUTH_ERROR",
  "message": "You are not logged in to Fern.",
  "hint": "Run `fern auth login`, or set the FERN_TOKEN environment variable.",
  "docsLink": "https://buildwithfern.com/learn/cli/auth",
  "violations": [
    // populated for validation errors only
    { "severity": "error", "message": "org is required", "file": "fern.yml", "line": 7, "column": 13 }
  ],
  "logFile": "/Users/you/.fern/v1/logs/2026-05-20T18-58-00.log",
  "debug": {
    // only present when --debug is also on
    "stack": "...",
    "causes": ["Error: ...", "..."]
  }
}
```

Guarantees:

- `ok` is always `false`. A successful command does not write a JSON envelope.
- `code` is `null` for non-`CliError` failures (plain `Error`, unknown
  throwables). Use the [`code` field](#error-codes) for branching logic.
- `violations` is only present when the failure is a validation error. Each
  entry has `severity` (`"error"`), `message`, and — when the failure came
  from a YAML source — `file`, `line`, and `column`.
- `logFile` is only present when there's something written to the per-run
  debug log. CI/agents should grab this path on failure so they can attach
  the full log to a report.
- `debug` is only present when `--debug` (or `FERN_DEBUG=1`) is also on.
- The envelope contains no ANSI escape sequences.

Commands that produce structured **success** output (`auth whoami --json`,
`sdk list --json`) print their success JSON on stdout. The global `--json`
flag guarantees the *error* path is JSON-parseable regardless of which
command failed — even usage errors from yargs that happen before the command
runs.

Ctrl+C (`TaskAbortSignal`) is a clean shutdown and emits **no envelope**;
the CLI exits with code `130` (`128 + SIGINT`) without writing to stderr.

## Exit codes

The CLI follows BSD `sysexits.h` conventions so shell scripts can branch on
failure type without parsing stderr. These values are part of the CLI's
public contract.

| Exit code | Name       | Meaning                                                                  |
| --------- | ---------- | ------------------------------------------------------------------------ |
| `0`       | success    | The command succeeded.                                                   |
| `1`       | generic    | Catch-all for everything without a more specific code (network, container, environment). |
| `2`       | usage      | Bad flag, unknown command, missing required argument.                     |
| `65`      | data error | Input data was syntactically invalid (validation, parse, IR conversion, reference resolution). |
| `66`      | no input   | A referenced input file or resource could not be found.                   |
| `70`      | software   | Unhandled internal error / unexpected exception. Indicates a Fern bug.   |
| `77`      | no perm    | Authentication or authorization failure.                                  |
| `78`      | config     | The CLI's configuration (e.g. `fern.yml`) is invalid or its required version mismatches. |
| `130`     | SIGINT     | Ctrl+C — clean cancellation, not a failure. No error is written.         |
| `143`     | SIGTERM    | Process was terminated by SIGTERM.                                       |

Example: only retry on transient failures (`1`, network/container/environment)
in CI:

```bash
fern check || case $? in
  1) echo "transient — retrying"; fern check ;;
  2|65|66|77|78) echo "user error — not retrying"; exit $? ;;
  *) echo "fatal" ; exit $? ;;
esac
```

## Error codes

Every error code below maps 1:1 to a value of `CliError.Code` in the CLI
source. The mapping is part of the public contract — code values do not
change between minor versions.

| Code                  | Title                | Exit | Typical cause                                                                                  |
| --------------------- | -------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `USER_ERROR`          | Invalid usage        | 2    | Unknown command, unknown flag, missing required flag, or a yargs `.fail` error.               |
| `CONFIG_ERROR`        | Configuration error  | 78   | Invalid `fern.yml`, missing project, conflicting flags, unsupported value.                    |
| `VERSION_ERROR`       | Version mismatch     | 78   | The CLI version pinned in `fern.config.json` does not match the installed CLI.                |
| `VALIDATION_ERROR`    | Validation failed    | 65   | One or more `fern.yml` / spec violations were emitted. Detail is printed above the envelope.  |
| `PARSE_ERROR`         | Parse error          | 65   | A YAML/JSON file failed to parse.                                                              |
| `REFERENCE_ERROR`     | Reference error      | 65   | A `$ref` or type reference points at something that does not exist.                            |
| `IR_CONVERSION_ERROR` | IR conversion failed | 65   | The IR migration step failed (e.g. an unsupported IR feature for the requested generator).    |
| `RESOLUTION_ERROR`    | Resolution failed    | 66   | A required file or resource could not be located.                                              |
| `AUTH_ERROR`          | Authentication failed| 77   | No `FERN_TOKEN` set, token rejected, or the active account is missing.                         |
| `NETWORK_ERROR`       | Network error        | 1    | An HTTP request to a remote service failed.                                                    |
| `CONTAINER_ERROR`     | Container error      | 1    | Docker / a generator container failed to start, pull, or run.                                  |
| `ENVIRONMENT_ERROR`   | Environment error    | 1    | The host environment is missing something (e.g. Node version, file permissions).               |
| `INTERNAL_ERROR`      | Internal error       | 70   | The CLI hit an unreachable state. **This is a Fern bug.** File an issue.                       |

Anything that isn't a `CliError` (a plain `Error`, a thrown string, etc.)
exits with code `70` (software) and renders with `code: null` in `--json`
mode, so it's distinguishable from a `CliError` whose code maps to `1`.

## Common failures and what to do

### `error[AUTH_ERROR]: …`
You are not logged in, or your token was rejected. Run `fern auth login`, or
set `FERN_TOKEN` in the environment. If you set `FERN_TOKEN` and still see
this, verify the token is valid for the right account.

### `error[CONFIG_ERROR]: No fern.yml found …`
The command needs a `fern.yml` and there isn't one in (or above) the current
directory. Run `fern init` to bootstrap a project here.

### `error[CONFIG_ERROR]: The --X and --Y flags cannot be used together.`
Pass one or the other, not both. See `--help` on the offending command for
which combinations are valid.

### `error[VALIDATION_ERROR]: …`
One or more files failed validation. The detailed list of violations is
printed above the envelope (and in the `violations[]` array under `--json`).
Each violation includes the file, line, column, and the rule that fired —
fix them and re-run.

### `error[NETWORK_ERROR]: Failed to fetch "<url>" …`
The CLI couldn't reach a remote service. Check your network, verify the URL,
and re-run. If it keeps failing, check the Fern status page and the log file
linked at the bottom of the error.

### `error[INTERNAL_ERROR]: …`
Something the CLI considers impossible happened. **This is a Fern bug.**
Please re-run with `--debug` and file an issue at
<https://github.com/fern-api/fern/issues/new> with the full stderr output
and the log file. The CLI exits with code `70` so CI can distinguish this
from a normal failure.

## Reporting a new error code

If you're adding a new well-known failure mode to the CLI, the right place
to define it is the well-known error registry at
[`packages/cli/cli-v2/src/errors/wellKnown/CliErrors.ts`](../src/errors/wellKnown/CliErrors.ts).
Each entry is a tiny factory returning a `CliError` with a fixed code, a
templated message, an actionable hint, and (where appropriate) a docs link —
following the same pattern as `MdxErrorCode`.

To add a new template:

1. Pick the right `CliError.Code` from the table above (or add a new code in
   `packages/cli/task-context/src/CliError.ts` if no existing code fits).
2. Add a factory to `FernCliErrors` with a JSDoc explaining when to use it.
3. Add it to this reference if it's a user-facing failure with a distinct
   "what does this mean" answer.
4. Add a unit test in `packages/cli/cli-v2/src/__test__/wellKnownErrors.test.ts`.
