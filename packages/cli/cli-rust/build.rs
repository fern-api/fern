use std::env;
use std::path::PathBuf;

/// build.rs verifies that, when the `embed-fern-ts` feature is enabled, the
/// caller has actually pointed us at a bun-compiled cli-v2 binary via the
/// `FERN_TS_EMBED_PATH` environment variable.
///
/// We do NOT try to invoke `pnpm dist:bin` from here — that would be slow and
/// surprising for anyone running a plain `cargo build`. The pnpm pipeline is
/// owned by the existing `packages/cli/cli-v2/build.compile.mjs` script and
/// our `scripts/build-fern-ts.sh` wrapper simply forwards to it.
fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-env-changed=FERN_TS_EMBED_PATH");
    println!("cargo:rerun-if-env-changed=CARGO_FEATURE_EMBED_FERN_TS");

    let embed_enabled = env::var_os("CARGO_FEATURE_EMBED_FERN_TS").is_some();
    if !embed_enabled {
        // The default build mode. Nothing to bake in.
        return;
    }

    let payload = env::var_os("FERN_TS_EMBED_PATH").map(PathBuf::from);
    match payload {
        Some(path) if path.is_file() => {
            // Emit the absolute path back so `src/embed/mod.rs` can use it
            // inside an `include_bytes!`.
            println!("cargo:rustc-env=FERN_TS_EMBED_PATH={}", path.display());
            println!("cargo:rerun-if-changed={}", path.display());
        }
        Some(path) => {
            panic!(
                "embed-fern-ts feature is enabled but FERN_TS_EMBED_PATH does not point at a file: {}",
                path.display()
            );
        }
        None => {
            panic!(
                "embed-fern-ts feature is enabled but FERN_TS_EMBED_PATH is not set. \
                Run `scripts/build-fern-ts.sh` first, then build with \
                `FERN_TS_EMBED_PATH=$PWD/src/embed/payload/fern-ts cargo build --features embed-fern-ts`."
            );
        }
    }
}
