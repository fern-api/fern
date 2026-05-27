use std::process::ExitCode;

use cli_rust::dispatch;

fn main() -> ExitCode {
    match dispatch::run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(err) => {
            // anyhow renders the error chain in human-friendly form.
            eprintln!("fern: {err:#}");
            ExitCode::from(1)
        }
    }
}
