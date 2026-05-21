//! Integration test for the SDK's TLS env var contract.
//!
//! Verifies that `<NAME>_CA_BUNDLE`, `<NAME>_INSECURE`, `SSL_CERT_FILE`,
//! etc. actually change the TLS trust outcome of the HTTP client built
//! by [`fern_cli_sdk::http::HttpConfig::build_client`].
//!
//! Approach: spin up a local HTTPS server with a brand-new self-signed cert
//! that is never trusted by the system, then exercise the client against it
//! under different env-var configurations. This isolates the test from
//! whatever's in the developer's keychain (live tests against real APIs
//! can't be trusted to verify env-var behavior in isolation).
//!
//! Requirements: `python3` and `openssl` on PATH (both standard on dev/CI
//! machines). The test will skip itself with a printed warning if either is
//! missing.

use std::process::{Child, Command, Stdio};
use std::time::Duration;

use fern_cli_sdk::http::HttpConfig;

const CLI_NAME: &str = "tls-test-cli";
const ENV_PREFIX: &str = "TLS_TEST_CLI"; // CLI_NAME uppercased, `-` → `_`

/// Server fixture: a self-signed HTTPS server on a random localhost port,
/// with paths to the cert and a different (unsigned) "bogus" cert for negative
/// tests. Drops the server process and tempdir on Drop.
struct Fixture {
    port: u16,
    cert_path: std::path::PathBuf,
    bogus_cert_path: std::path::PathBuf,
    _tmp: tempfile::TempDir,
    _child: ChildGuard,
}

struct ChildGuard(Child);
impl Drop for ChildGuard {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

fn deps_available() -> bool {
    fn has(cmd: &str) -> bool {
        Command::new(cmd)
            .arg("--version")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    }
    has("python3") && has("openssl")
}

fn unused_port() -> u16 {
    // Bind to :0, ask the kernel for a port, then immediately release it.
    // There's a tiny race window before the test server binds, but in
    // practice it's fine for an integration test.
    let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("bind");
    listener.local_addr().expect("local_addr").port()
}

fn make_fixture() -> Fixture {
    let tmp = tempfile::tempdir().expect("tmpdir");
    let p = |name: &str| tmp.path().join(name).to_str().unwrap().to_string();

    // We generate a proper CA → leaf chain rather than a single self-signed
    // CA-as-leaf cert. rustls (correctly) rejects the latter with
    // `CaUsedAsEndEntity`; native-tls / Secure Transport tolerates it. The
    // proper structure is what real-world fixtures (e.g. Proxyman) produce.

    // 1. Trust root (the "CA"). This is what we'll point _CA_BUNDLE at.
    let ca_pem = p("ca.pem");
    let ca_key = p("ca.key");
    run_openssl(&[
        "req", "-x509", "-newkey", "rsa:2048", "-nodes",
        "-subj", "/CN=test-ca",
        "-addext", "basicConstraints=critical,CA:TRUE",
        "-addext", "keyUsage=critical,keyCertSign,cRLSign",
        "-days", "1",
        "-keyout", &ca_key,
        "-out", &ca_pem,
    ]);

    // 2. Leaf cert for the test server, signed by the CA above.
    let leaf_pem = p("leaf.pem");
    let leaf_key = p("leaf.key");
    let leaf_csr = p("leaf.csr");
    let leaf_ext = p("leaf.ext");
    std::fs::write(
        &leaf_ext,
        "subjectAltName=IP:127.0.0.1\nextendedKeyUsage=serverAuth\n",
    )
    .unwrap();
    run_openssl(&[
        "req", "-newkey", "rsa:2048", "-nodes",
        "-subj", "/CN=127.0.0.1",
        "-keyout", &leaf_key,
        "-out", &leaf_csr,
    ]);
    run_openssl(&[
        "x509", "-req", "-in", &leaf_csr,
        "-CA", &ca_pem, "-CAkey", &ca_key, "-CAcreateserial",
        "-out", &leaf_pem,
        "-days", "1",
        "-extfile", &leaf_ext,
    ]);

    // 3. Bogus CA — a different self-signed CA whose private key never signs
    //    anything we'll encounter. Loading this in _CA_BUNDLE must NOT make
    //    the leaf trusted (proves the bundle isn't a "trust everything" knob).
    let bogus_pem = p("bogus.pem");
    let bogus_key = p("bogus.key");
    run_openssl(&[
        "req", "-x509", "-newkey", "rsa:2048", "-nodes",
        "-subj", "/CN=bogus-ca",
        "-addext", "basicConstraints=critical,CA:TRUE",
        "-addext", "keyUsage=critical,keyCertSign,cRLSign",
        "-days", "1",
        "-keyout", &bogus_key,
        "-out", &bogus_pem,
    ]);

    let port = unused_port();

    // The Python server needs the leaf cert + leaf key. Cert/key paths and
    // port are passed as argv to avoid mixing Rust's format! braces with
    // Python's literal dict braces.
    let server_script = r#"
import http.server, json, ssl, sys
cert, key, port = sys.argv[1], sys.argv[2], int(sys.argv[3])
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({"ok": True}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a, **kw):
        pass
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain(certfile=cert, keyfile=key)
srv = http.server.HTTPServer(("127.0.0.1", port), H)
srv.socket = ctx.wrap_socket(srv.socket, server_side=True)
srv.serve_forever()
"#;

    let child = Command::new("python3")
        .arg("-c")
        .arg(server_script)
        .arg(&leaf_pem)
        .arg(&leaf_key)
        .arg(port.to_string())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("python3 spawn");

    // Give the server a moment to bind before the first request.
    std::thread::sleep(Duration::from_millis(400));

    Fixture {
        port,
        cert_path: ca_pem.into(),
        bogus_cert_path: bogus_pem.into(),
        _tmp: tmp,
        _child: ChildGuard(child),
    }
}

/// Run `openssl <args>` and panic with stderr + the failing arg list if it
/// exits non-zero. Capturing stderr makes test failures self-explanatory
/// instead of "openssl exited with code 1, good luck."
fn run_openssl(args: &[&str]) {
    let output = Command::new("openssl")
        .args(args)
        .output()
        .unwrap_or_else(|e| panic!("failed to spawn openssl ({args:?}): {e}"));
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        panic!(
            "openssl failed (exit={:?}) for args {args:?}\nstderr:\n{stderr}",
            output.status.code()
        );
    }
}

/// Wipe every env var that could leak into the test from the developer's
/// shell (Proxyman's auto-setup sets several of these). Must run *before*
/// HttpConfig::build_client() reads the environment.
fn clean_env() {
    for k in [
        "SSL_CERT_FILE",
        "SSL_CERT_DIR",
        "HTTPS_PROXY",
        "HTTP_PROXY",
        "https_proxy",
        "http_proxy",
        "NODE_EXTRA_CA_CERTS",
        "CURL_CA_BUNDLE",
        "REQUESTS_CA_BUNDLE",
        "TLS_TEST_CLI_CA_BUNDLE",
        "TLS_TEST_CLI_EXTRA_CA_CERTS",
        "TLS_TEST_CLI_INSECURE",
        "TLS_TEST_CLI_INSECURE_SKIP_VERIFY",
        "TLS_TEST_CLI_PROXY",
        "TLS_TEST_CLI_NO_PROXY",
    ] {
        std::env::remove_var(k);
    }
}

async fn fetch(client: &reqwest::Client, port: u16) -> Result<reqwest::StatusCode, reqwest::Error> {
    Ok(client
        .get(format!("https://127.0.0.1:{port}/probe"))
        .send()
        .await?
        .status())
}

/// Build a fresh client from the current env. Each test case mutates env
/// and then constructs a client to capture the new state — every test calls
/// this exactly once.
fn build_client() -> reqwest::Client {
    try_build_client().expect("client build")
}

/// Like [`build_client`] but doesn't unwrap the build error — useful for
/// cases that expect a malformed env var to surface as an error at
/// construction.
fn try_build_client() -> Result<reqwest::Client, fern_cli_sdk::error::CliError> {
    HttpConfig::new(CLI_NAME).unwrap().build_client()
}

/// Cases run sequentially in a single test. Reqwest constructs new clients
/// fresh from the env each call, so we just mutate env between cases and
/// verify each.
///
/// We use `serial_test::serial` so the env mutations don't race with other
/// tests in the binary.
#[tokio::test]
#[serial_test::serial]
async fn tls_env_vars_change_trust_outcome() {
    if !deps_available() {
        eprintln!("SKIP: tls_env_vars test needs python3 + openssl on PATH");
        return;
    }

    let fx = make_fixture();
    let port = fx.port;
    let cert = fx.cert_path.to_str().unwrap().to_string();
    let bogus = fx.bogus_cert_path.to_str().unwrap().to_string();

    // ---- A: no env vars → must fail ---------------------------------------
    clean_env();
    let client = build_client();
    let err = fetch(&client, port).await.expect_err("A: must fail TLS");
    assert!(
        err.is_connect() || err.to_string().to_lowercase().contains("certificate"),
        "A: expected TLS / connect error, got: {err}"
    );

    // ---- B: <PREFIX>_CA_BUNDLE → must succeed -----------------------------
    clean_env();
    std::env::set_var(format!("{ENV_PREFIX}_CA_BUNDLE"), &cert);
    let client = build_client();
    let status = fetch(&client, port).await.expect("B: must succeed");
    assert_eq!(status.as_u16(), 200, "B: expected 200");

    // ---- C: <PREFIX>_INSECURE=1 → must succeed ----------------------------
    clean_env();
    std::env::set_var(format!("{ENV_PREFIX}_INSECURE"), "1");
    let client = build_client();
    let status = fetch(&client, port).await.expect("C: must succeed");
    assert_eq!(status.as_u16(), 200, "C: expected 200");

    // ---- D: bogus _CA_BUNDLE → must fail ----------------------------------
    // Confirms the bundle isn't accidentally treated as "trust everything".
    clean_env();
    std::env::set_var(format!("{ENV_PREFIX}_CA_BUNDLE"), &bogus);
    let client = build_client();
    let err = fetch(&client, port).await.expect_err("D: must fail TLS");
    assert!(
        err.is_connect() || err.to_string().to_lowercase().contains("certificate"),
        "D: expected TLS error, got: {err}"
    );

    // ---- E: SSL_CERT_FILE fallback → must succeed -------------------------
    clean_env();
    std::env::set_var("SSL_CERT_FILE", &cert);
    let client = build_client();
    let status = fetch(&client, port).await.expect("E: must succeed");
    assert_eq!(status.as_u16(), 200, "E: expected 200 via SSL_CERT_FILE");

    // ---- F: alias _INSECURE_SKIP_VERIFY → must succeed --------------------
    clean_env();
    std::env::set_var(format!("{ENV_PREFIX}_INSECURE_SKIP_VERIFY"), "true");
    let client = build_client();
    let status = fetch(&client, port).await.expect("F: must succeed");
    assert_eq!(status.as_u16(), 200, "F: expected 200 via alias");

    // ---- G: missing _CA_BUNDLE path → must error at client build ---------
    clean_env();
    std::env::set_var(format!("{ENV_PREFIX}_CA_BUNDLE"), "/no/such/path.pem");
    let err = try_build_client().expect_err("G: must error");
    let msg = err.to_string();
    assert!(
        msg.contains("/no/such/path.pem"),
        "G: error should name the bad path; got: {msg}"
    );

    // ---- H: <PREFIX>_NO_PROXY must NOT mutate global NO_PROXY -------------
    // Earlier the implementation called std::env::set_var("NO_PROXY", ...)
    // as a side effect, leaking config to other code paths. Verify it doesn't.
    clean_env();
    let original_no_proxy = std::env::var("NO_PROXY").ok();
    std::env::set_var(format!("{ENV_PREFIX}_NO_PROXY"), "internal.example.com");
    let _ = build_client();
    let after_no_proxy = std::env::var("NO_PROXY").ok();
    assert_eq!(
        original_no_proxy, after_no_proxy,
        "H: <PREFIX>_NO_PROXY leaked into global NO_PROXY"
    );

    // ---- I: invalid <PREFIX>_PROXY URL → must error at client build ------
    clean_env();
    std::env::set_var(format!("{ENV_PREFIX}_PROXY"), "not a url");
    let err = try_build_client().expect_err("I: must error");
    let msg = err.to_string();
    assert!(
        msg.contains(&format!("{ENV_PREFIX}_PROXY")),
        "I: error should name the env var; got: {msg}"
    );

    clean_env();
}
