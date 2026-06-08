//! Optional baked-in payload of the bun-compiled cli-v2 binary.
//!
//! See `Cargo.toml` and `build.rs` for the `embed-fern-ts` feature gate.

/// Returns the embedded fern-ts bytes, if any.
///
/// In the default build profile this is always `None` and the dispatcher
/// falls back to `$FERN_TS_BIN` or a sibling `fern-ts` binary. In a
/// `--features embed-fern-ts` build the bytes come from
/// `include_bytes!(env!("FERN_TS_EMBED_PATH"))`.
pub fn payload() -> Option<&'static [u8]> {
    #[cfg(feature = "embed-fern-ts")]
    {
        Some(EMBEDDED)
    }
    #[cfg(not(feature = "embed-fern-ts"))]
    {
        None
    }
}

#[cfg(feature = "embed-fern-ts")]
static EMBEDDED: &[u8] = include_bytes!(env!("FERN_TS_EMBED_PATH"));
