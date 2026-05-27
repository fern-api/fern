use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

use assert_cmd::cargo::CommandCargoExt;

/// End-to-end smoke test for the dispatcher: build the `fern` binary,
/// point it at a fake "fern-ts" script via `FERN_TS_BIN`, invoke an
/// unknown subcommand, and assert that:
///   * stdout from the child is forwarded
///   * argv is forwarded unchanged
///   * the parent exits with the child's exit code
///
/// This is the most important integration test in the POC because it
/// proves that *every* legacy cli-v2 command keeps working as soon as
/// fern-ts is built — even before any of them are ported to Rust.
#[test]
fn unknown_subcommand_is_forwarded_to_fern_ts() {
    let fake_ts = fixture_path("fake-fern-ts.sh");
    assert!(fake_ts.is_file(), "fixture missing: {}", fake_ts.display());

    let output = Command::cargo_bin("fern")
        .expect("cargo bin fern")
        .env("FERN_TS_BIN", &fake_ts)
        .arg("check")
        .arg("--api")
        .arg("foo")
        .output()
        .expect("dispatcher invocation");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(
        output.status.success(),
        "fern check failed:\nstdout: {stdout}\nstderr: {stderr}",
    );

    // The fake fern-ts echoes its argv on stdout, one per line. Verify
    // the dispatcher forwarded the unknown subcommand and its flags
    // unchanged.
    assert!(
        stdout.contains("argv[1]=check"),
        "expected fern-ts to receive `check` as argv[1]; got:\n{stdout}"
    );
    assert!(
        stdout.contains("argv[2]=--api"),
        "expected fern-ts to receive `--api` as argv[2]; got:\n{stdout}"
    );
    assert!(
        stdout.contains("argv[3]=foo"),
        "expected fern-ts to receive `foo` as argv[3]; got:\n{stdout}"
    );
}

#[test]
fn exit_code_is_forwarded_from_fern_ts() {
    let fake_ts = fixture_path("fake-fern-ts.sh");

    let status = Command::cargo_bin("fern")
        .expect("cargo bin fern")
        .env("FERN_TS_BIN", &fake_ts)
        .arg("__exit_with__")
        .arg("42")
        .status()
        .expect("dispatcher invocation");

    assert_eq!(status.code(), Some(42), "exit code was not forwarded");
}

#[test]
fn rust_native_doctor_does_not_invoke_fern_ts() {
    let blocked_ts = fixture_path("explode.sh");

    let output = Command::cargo_bin("fern")
        .expect("cargo bin fern")
        // If the dispatcher accidentally falls through to fern-ts, this
        // fixture will exit non-zero with a loud message.
        .env("FERN_TS_BIN", &blocked_ts)
        .arg("doctor")
        .output()
        .expect("dispatcher invocation");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(
        output.status.success(),
        "doctor failed:\nstdout: {stdout}\nstderr: {stderr}",
    );
    assert!(
        stdout.contains("Rust dispatcher"),
        "doctor should print the Rust dispatcher banner; got:\n{stdout}"
    );
    assert!(
        !stdout.contains("EXPLODED"),
        "doctor should not have invoked fern-ts; got:\n{stdout}"
    );
}

#[test]
fn force_ts_flag_routes_doctor_to_fern_ts() {
    let fake_ts = fixture_path("fake-fern-ts.sh");

    let output = Command::cargo_bin("fern")
        .expect("cargo bin fern")
        .env("FERN_TS_BIN", &fake_ts)
        .arg("doctor")
        .arg("--ts")
        .output()
        .expect("dispatcher invocation");

    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("argv[1]=doctor"),
        "--ts must force routing to fern-ts; got:\n{stdout}"
    );
}

#[test]
fn missing_fern_ts_produces_a_clear_error() {
    let bogus = PathBuf::from("/does/not/exist/fern-ts");

    let output = Command::cargo_bin("fern")
        .expect("cargo bin fern")
        .env("FERN_TS_BIN", &bogus)
        .arg("check")
        .output()
        .expect("dispatcher invocation");

    assert!(!output.status.success(), "expected non-zero exit");
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("FERN_TS_BIN"),
        "error should mention FERN_TS_BIN; got:\n{stderr}"
    );
}

fn fixture_path(name: &str) -> PathBuf {
    // Resolve `<crate>/tests/fixtures/<name>`. On Windows the .sh
    // fixtures still work as long as `bash` (Git Bash) is on PATH; for
    // platforms without bash these tests are skipped automatically by
    // the OS rejecting the script — that's an acceptable tradeoff for
    // a POC.
    let manifest = env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
    let path = PathBuf::from(manifest)
        .join("tests")
        .join("fixtures")
        .join(name);
    // Make sure the fixture is executable. Git on some platforms drops
    // the mode bit on checkout; reapplying it on demand keeps the test
    // robust without forcing every developer to chmod by hand.
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(meta) = fs::metadata(&path) {
            let mut perms = meta.permissions();
            if perms.mode() & 0o111 == 0 {
                perms.set_mode(perms.mode() | 0o755);
                let _ = fs::set_permissions(&path, perms);
            }
        }
    }
    path
}
