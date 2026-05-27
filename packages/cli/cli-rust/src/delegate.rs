use std::ffi::OsString;
use std::path::Path;
use std::process::Command;

use anyhow::{anyhow, Context, Result};

use crate::runtime;

/// Replace this process with the bundled fern-ts binary, forwarding argv,
/// stdio, and the exit code unchanged. On Unix we use `execvp` so the
/// kernel actually replaces the process image — this means signal handling
/// and `argv[0]` introspection inside the TS CLI behave identically to
/// invoking fern-ts directly. On Windows we spawn-and-wait because there's
/// no equivalent to execvp; the user-visible effect is the same.
pub fn exec_fern_ts(program: &OsString, args: &[OsString]) -> Result<()> {
    let fern_ts =
        runtime::resolve_fern_ts().context("failed to resolve the bundled fern-ts binary")?;

    // Preserve argv[0] so the TS CLI's banner / telemetry still report
    // `fern`. The actual file we exec is fern_ts; argv[0] is what the
    // child sees as its own name.
    let argv0 = derive_argv0(program, &fern_ts);

    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        let err = Command::new(&fern_ts).arg0(argv0).args(args).exec();
        Err(anyhow!("exec failed for {}: {err}", fern_ts.display()))
    }

    #[cfg(windows)]
    {
        let _ = argv0; // Windows CreateProcess doesn't expose argv[0].
        let status = Command::new(&fern_ts)
            .args(args)
            .status()
            .with_context(|| format!("failed to spawn {}", fern_ts.display()))?;
        let code = status.code().unwrap_or(1);
        std::process::exit(code);
    }
}

fn derive_argv0(program: &OsString, fern_ts: &Path) -> OsString {
    // If the user invoked the Rust binary as `fern`, keep that. Otherwise
    // fall back to the file name of the actual TS binary.
    let prog_str = Path::new(program)
        .file_name()
        .map(|s| s.to_owned())
        .unwrap_or_else(|| program.clone());
    if prog_str.is_empty() {
        fern_ts
            .file_name()
            .map(|s| s.to_owned())
            .unwrap_or_else(|| OsString::from("fern"))
    } else {
        prog_str
    }
}

/// Build a `Command` configured to launch fern-ts. Exposed for tests that
/// need to assert on argument construction without actually `exec`-ing.
#[cfg(test)]
pub fn build_command(fern_ts: std::path::PathBuf, args: &[OsString]) -> Command {
    let mut cmd = Command::new(fern_ts);
    cmd.args(args);
    cmd
}
