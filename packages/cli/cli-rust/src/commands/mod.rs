//! Rust-native subcommands. New entries should be small and self-contained;
//! anything that needs to talk to the workspace loader or IR generator
//! belongs in the bundled fern-ts until it has been ported.

pub mod doctor;
