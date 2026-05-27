//! Stand-in for the bun-compiled cli-v2 binary, used by the dispatcher's
//! integration tests. It does two things:
//!
//!   1. Echoes its argv on stdout, one entry per line, so tests can assert
//!      that the dispatcher forwarded the user's arguments unchanged.
//!   2. Honors a magic `__exit_with__ N` invocation so we can verify that
//!      the parent dispatcher propagates the child's exit code.
//!
//! Lives as a real Rust binary (rather than a `.sh` script) so the tests
//! work on every platform our CI matrix covers, including Windows.

use std::env;
use std::process::ExitCode;

fn main() -> ExitCode {
    let args: Vec<String> = env::args().collect();
    for (i, a) in args.iter().enumerate() {
        println!("argv[{i}]={a}");
    }
    if args.get(1).map(String::as_str) == Some("__exit_with__") {
        let code: u8 = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
        return ExitCode::from(code);
    }
    if args.get(1).map(String::as_str) == Some("__explode__") {
        eprintln!("EXPLODED: fern-ts was invoked by mistake");
        println!("EXPLODED");
        return ExitCode::from(99);
    }
    ExitCode::SUCCESS
}
