use std::path::PathBuf;
use std::process::Command;

use assert_cmd::cargo::CommandCargoExt;

/// End-to-end smoke test for the dispatcher: build the `fern` binary,
/// point it at a fake "fern-ts" binary via `FERN_TS_BIN`, invoke an
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
    let fake_ts = fixture_bin("fake-fern-ts");

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
    let fake_ts = fixture_bin("fake-fern-ts");

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
    let blocked_ts = fixture_bin("explode");

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
    let fake_ts = fixture_bin("fake-fern-ts");

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
    // Regression: `--ts` is a dispatcher-only flag. yargs runs the TS CLI
    // with `.strict()` and will reject unknown flags, so the dispatcher
    // must strip `--ts` before delegating.
    assert!(
        !stdout.contains("--ts"),
        "--ts flag must be stripped before delegating to fern-ts; got:\n{stdout}"
    );
}

#[test]
fn global_flag_with_value_does_not_confuse_dispatcher() {
    // Regression: `fern --log-level debug doctor` must route to the Rust
    // doctor command. A naive first-positional scan would treat `debug`
    // as the subcommand name, miss the registry, and delegate to fern-ts.
    let blocked_ts = fixture_bin("explode");

    let output = Command::cargo_bin("fern")
        .expect("cargo bin fern")
        .env("FERN_TS_BIN", &blocked_ts)
        .arg("--log-level")
        .arg("debug")
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
        "value-bearing flag must not divert routing away from Rust; got:\n{stdout}"
    );
    assert!(
        !stdout.contains("EXPLODED"),
        "value-bearing flag must not divert routing to fern-ts; got:\n{stdout}"
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

/// Resolve the path to a fixture binary built from `tests/fixtures/bin/`.
/// Uses `assert_cmd`'s cargo metadata lookup so this works whether tests
/// are run via `cargo test`, `cargo nextest`, or `cargo test --release`.
fn fixture_bin(name: &str) -> PathBuf {
    Command::cargo_bin(name)
        .unwrap_or_else(|_| panic!("fixture binary {name} not built; check Cargo.toml [[bin]]"))
        .get_program()
        .into()
}
