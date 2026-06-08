use std::env;

use anyhow::Result;
use clap::{ArgMatches, Command};

use crate::runtime;

/// Subcommand name. Centralised here so `dispatch.rs` and `cli.rs` can both
/// reference it without string duplication.
pub const NAME: &str = "doctor";

pub fn command() -> Command {
    Command::new(NAME)
        .about(
            "Run health checks on the local Fern install and report what would happen on dispatch.",
        )
        .long_about(
            "Reports which fern-ts binary the dispatcher would use, where it would be sourced \
             from, and a snapshot of the environment that affects routing. Useful for triaging \
             `fern: command not found` style issues in the wrapper.",
        )
}

pub fn run(_matches: &ArgMatches) -> Result<()> {
    let dispatcher_version = crate::VERSION;
    println!("fern (Rust dispatcher) v{dispatcher_version}");
    println!();

    println!("Environment:");
    println!(
        "  os/arch       : {}/{}",
        env::consts::OS,
        env::consts::ARCH
    );
    println!(
        "  current_exe   : {}",
        display(env::current_exe().ok().as_deref())
    );
    println!(
        "  FERN_TS_BIN   : {}",
        display_os(env::var_os("FERN_TS_BIN").as_deref())
    );
    println!(
        "  cache_dir     : {}",
        display(dirs::cache_dir().as_deref())
    );

    println!();
    println!("Resolution:");
    match runtime::resolve_fern_ts() {
        Ok(path) => println!("  fern-ts found at: {}", path.display()),
        Err(err) => println!("  fern-ts NOT found: {err:#}"),
    }

    Ok(())
}

fn display(p: Option<&std::path::Path>) -> String {
    match p {
        Some(p) => p.display().to_string(),
        None => "<none>".to_string(),
    }
}

fn display_os(s: Option<&std::ffi::OsStr>) -> String {
    match s {
        Some(s) => s.to_string_lossy().into_owned(),
        None => "<unset>".to_string(),
    }
}
