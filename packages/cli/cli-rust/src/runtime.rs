use std::env;
use std::fs;
use std::io::Write;
use std::path::PathBuf;

use anyhow::{anyhow, bail, Context, Result};
use sha2::{Digest, Sha256};

use crate::embed;

/// Locate the fern-ts binary that the dispatcher should delegate to.
///
/// Resolution order (first hit wins):
///   1. `$FERN_TS_BIN` — explicit absolute path, used by integration tests
///      and power users who want to point the dispatcher at a custom build.
///   2. A sibling executable named `fern-ts` (or `fern-ts.exe` on Windows)
///      in the same directory as the running `fern` binary. This is the
///      "side-by-side" layout used during development before the embed
///      feature is enabled.
///   3. An embedded payload baked in at compile time via the
///      `embed-fern-ts` feature. The bytes are self-extracted on first
///      run to `$XDG_CACHE_HOME/fern/runtime/<sha>/fern-ts` and that path
///      is returned. Subsequent runs short-circuit by checking that the
///      extracted file already exists with the right digest.
pub fn resolve_fern_ts() -> Result<PathBuf> {
    if let Some(p) = env::var_os("FERN_TS_BIN") {
        let p = PathBuf::from(p);
        if !p.is_file() {
            bail!(
                "FERN_TS_BIN is set but does not point at a file: {}",
                p.display()
            );
        }
        return Ok(p);
    }

    if let Some(p) = sibling_fern_ts()? {
        return Ok(p);
    }

    if let Some(bytes) = embed::payload() {
        return extract_embedded(bytes);
    }

    Err(anyhow!(
        "no fern-ts binary available. Set FERN_TS_BIN, drop a sibling `fern-ts` binary next to `fern`, \
         or build with `--features embed-fern-ts` after running `scripts/build-fern-ts.sh`."
    ))
}

fn sibling_fern_ts() -> Result<Option<PathBuf>> {
    let exe = env::current_exe().context("current_exe() unavailable")?;
    let dir = exe.parent().context("running binary has no parent dir")?;
    let candidate = dir.join(sibling_name());
    Ok(candidate.is_file().then_some(candidate))
}

#[cfg(windows)]
fn sibling_name() -> &'static str {
    "fern-ts.exe"
}

#[cfg(not(windows))]
fn sibling_name() -> &'static str {
    "fern-ts"
}

fn extract_embedded(bytes: &[u8]) -> Result<PathBuf> {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let digest = hex(&hasher.finalize());

    let cache_root = dirs::cache_dir()
        .or_else(|| {
            env::current_exe()
                .ok()
                .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        })
        .context("could not determine a cache directory")?;
    let dir = cache_root.join("fern").join("runtime").join(&digest);
    let dest = dir.join(extracted_name());

    if dest.is_file() {
        // Hot path: already extracted in a previous run.
        return Ok(dest);
    }

    fs::create_dir_all(&dir)
        .with_context(|| format!("could not create runtime cache dir {}", dir.display()))?;

    // Write to a tempfile in the same directory and rename, so concurrent
    // launches don't observe a half-written binary.
    let mut tmp = tempfile_in(&dir)?;
    tmp.file.write_all(bytes).with_context(|| {
        format!(
            "could not write extracted fern-ts to {}",
            tmp.path.display()
        )
    })?;
    tmp.file
        .flush()
        .with_context(|| format!("could not flush {}", tmp.path.display()))?;
    drop(tmp.file);

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&tmp.path)?.permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&tmp.path, perms)?;
    }

    fs::rename(&tmp.path, &dest).with_context(|| {
        format!(
            "could not move extracted payload into place at {}",
            dest.display()
        )
    })?;

    Ok(dest)
}

#[cfg(windows)]
fn extracted_name() -> &'static str {
    "fern-ts.exe"
}

#[cfg(not(windows))]
fn extracted_name() -> &'static str {
    "fern-ts"
}

fn hex(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        out.push(HEX[(b >> 4) as usize] as char);
        out.push(HEX[(b & 0x0f) as usize] as char);
    }
    out
}

struct TempFile {
    path: PathBuf,
    file: fs::File,
}

fn tempfile_in(dir: &std::path::Path) -> Result<TempFile> {
    let pid = std::process::id();
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let path = dir.join(format!(".fern-ts.{pid}.{nanos}.tmp"));
    let file = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)
        .with_context(|| format!("could not create temp file at {}", path.display()))?;
    Ok(TempFile { path, file })
}
