//! Used by the dispatcher tests as a "this should never be invoked" guard.
//! If a Rust-native command accidentally falls through to fern-ts, this
//! fixture trips the test loudly.

use std::process::ExitCode;

fn main() -> ExitCode {
    eprintln!("EXPLODED: fern-ts was invoked by mistake");
    println!("EXPLODED");
    ExitCode::from(99)
}
