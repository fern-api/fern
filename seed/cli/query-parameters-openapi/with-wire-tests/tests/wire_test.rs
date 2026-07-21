//! Auto-generated wire tests by @fern-api/cli-generator.
//!
//! Each test stands up an in-process `wiremock` server, points the
//! generated CLI at it via `--base-url`, drives one endpoint from an IR
//! example (`--params` / `--json`), and asserts the CLI (a) hit the mock
//! exactly once with the right method + path and (b) rendered the mocked
//! response body to stdout.
//!
//! No docker, no network — runs under a plain `cargo test`. Regenerated on
//! every `fern generate`; do not edit by hand.
#![allow(dead_code)]

use serde::Deserialize;
use std::collections::HashMap;
use wiremock::matchers::{method as match_method, path as match_path};
use wiremock::{Mock, MockServer, ResponseTemplate};

use fern_cli_sdk::openapi::discovery::RestResource;
use fern_cli_sdk::openapi::load_openapi_spec;

const MANIFEST: &str = include_str!("../wiremock/wire-test-cases.json");

#[derive(Deserialize)]
struct Manifest {
    #[serde(rename = "binaryName")]
    binary_name: String,
    #[serde(rename = "rootGroup")]
    root_group: Option<String>,
    specs: Vec<SpecEntry>,
    #[serde(rename = "authEnvVars")]
    auth_env_vars: Vec<String>,
    #[serde(rename = "authMock")]
    auth_mock: Option<AuthMock>,
    cases: Vec<Case>,
}

#[derive(Deserialize)]
struct SpecEntry {
    file: String,
    namespace: Option<String>,
}

#[derive(Deserialize)]
struct AuthMock {
    method: String,
    path: String,
    #[serde(rename = "responseBody")]
    response_body: String,
}

#[derive(Deserialize)]
struct Case {
    id: String,
    method: String,
    path: String,
    params: serde_json::Map<String, serde_json::Value>,
    #[serde(default)]
    body: serde_json::Value,
    response: ExpectedResponse,
}

#[derive(Deserialize)]
struct ExpectedResponse {
    status: u16,
    body: String,
}

fn load_manifest() -> Manifest {
    serde_json::from_str(MANIFEST).expect("wire-test-cases.json is valid JSON")
}

/// Normalize a URL path for comparison: ensure a leading slash and drop any
/// trailing slash.
fn normalize_path(path: &str) -> String {
    let trimmed = path.trim_end_matches('/');
    if trimmed.starts_with('/') {
        trimmed.to_string()
    } else {
        format!("/{trimmed}")
    }
}

/// A resolved command plus the body-input modality read straight off the
/// `RestMethod` the CLI itself uses — so the harness drives each endpoint the
/// same way the CLI expects, and can tell when it can't drive one at all.
#[derive(Clone)]
struct CommandInfo {
    chain: Vec<String>,
    http_method: String,
    path: String,
    /// Endpoint registers `--json` (an opaque JSON request body).
    has_json_body: bool,
    /// Binary request body — the CLI wants a real file via a typed flag.
    is_binary: bool,
    /// multipart/form-data — per-field file/value flags, not `--json`.
    is_multipart: bool,
    /// Body was flattened into per-field flags (params carry location "body").
    /// Such endpoints reject a whole-body `--json`, so the generic
    /// `--params`/`--json` driver can't feed them.
    has_body_field_flags: bool,
    /// Streaming/SSE response — stdout is chunked, so a byte-exact comparison
    /// against the mock's single payload doesn't hold.
    is_streaming: bool,
}

/// Recursively collect one `CommandInfo` per method from a resource tree,
/// prefixing every chain with `prefix` (root group + spec namespace).
fn collect_commands(resources: &HashMap<String, RestResource>, prefix: &[String], out: &mut Vec<CommandInfo>) {
    for (name, resource) in resources {
        let mut chain = prefix.to_vec();
        chain.push(name.clone());
        for (method_name, method) in &resource.methods {
            let mut full = chain.clone();
            full.push(method_name.clone());
            out.push(CommandInfo {
                chain: full,
                http_method: method.http_method.to_uppercase(),
                path: method.path.clone(),
                has_json_body: method.request.is_some(),
                is_binary: method.binary_request_body.is_some(),
                is_multipart: !method.multipart_fields.is_empty(),
                has_body_field_flags: method
                    .parameters
                    .values()
                    .any(|p| p.location.as_deref() == Some("body")),
                is_streaming: method.streaming.is_some(),
            });
        }
        collect_commands(&resource.resources, &chain, out);
    }
}

/// Resolve the CLI command for a `(method, path)` by loading the baked specs
/// the binary runs on and matching against the SDK's discovery tree.
fn resolve_command(manifest: &Manifest, method: &str, path: &str) -> CommandInfo {
    let mut commands: Vec<CommandInfo> = Vec::new();
    for spec in &manifest.specs {
        let spec_path = format!("{}/{}", env!("CARGO_MANIFEST_DIR"), spec.file);
        let contents = std::fs::read_to_string(&spec_path)
            .unwrap_or_else(|e| panic!("failed to read baked spec {spec_path}: {e}"));
        let doc = load_openapi_spec(&contents, &manifest.binary_name)
            .unwrap_or_else(|e| panic!("failed to parse baked spec {spec_path}: {e:?}"));
        let mut prefix: Vec<String> = Vec::new();
        if let Some(root_group) = &manifest.root_group {
            prefix.push(root_group.clone());
        }
        if let Some(namespace) = &spec.namespace {
            prefix.push(namespace.clone());
        }
        collect_commands(&doc.resources, &prefix, &mut commands);
    }

    let want_method = method.to_uppercase();
    let want_path = normalize_path(path);

    // Exact match on method + normalized path.
    let mut hits: Vec<CommandInfo> = commands
        .iter()
        .filter(|c| c.http_method == want_method && normalize_path(&c.path) == want_path)
        .cloned()
        .collect();

    // Fallback: tolerate base-path prefixes by matching path suffixes.
    if hits.is_empty() {
        hits = commands
            .iter()
            .filter(|c| {
                let np = normalize_path(&c.path);
                c.http_method == want_method && (np.ends_with(&want_path) || want_path.ends_with(&np))
            })
            .cloned()
            .collect();
    }

    match hits.len() {
        1 => hits.pop().unwrap(),
        0 => {
            let available: Vec<String> = commands
                .iter()
                .map(|c| {
                    format!("{} {} ({} {})", manifest.binary_name, c.chain.join(" "), c.http_method, c.path)
                })
                .collect();
            panic!(
                "no CLI command found for {method} {path}.
available commands:
  {}",
                available.join("
  ")
            )
        }
        // Ambiguous (multi-spec with the same method+path). Take the first
        // deterministically; multi-spec disambiguation is best-effort.
        _ => hits.remove(0),
    }
}

/// Whether two JSON values share the same top-level kind (both objects, both
/// arrays, …). Used to gate the exact body comparison: when the CLI re-shapes
/// output (streaming/NDJSON collected into an array) it diverges in kind from
/// the mock's single payload, and an exact match would be meaningless.
fn same_json_kind(a: &serde_json::Value, b: &serde_json::Value) -> bool {
    use serde_json::Value::{Array, Bool, Null, Number, Object, String as JsonString};
    matches!(
        (a, b),
        (Object(_), Object(_))
            | (Array(_), Array(_))
            | (JsonString(_), JsonString(_))
            | (Number(_), Number(_))
            | (Bool(_), Bool(_))
            | (Null, Null)
    )
}

/// Substitute `{param}` placeholders in a path template with values from the
/// case params, so we can assert the request landed on the resolved path.
fn substitute_path(template: &str, params: &serde_json::Map<String, serde_json::Value>) -> String {
    let mut path = template.to_string();
    for (key, value) in params {
        let placeholder = format!("{{{key}}}");
        if path.contains(&placeholder) {
            let rendered = match value {
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            path = path.replace(&placeholder, &rendered);
        }
    }
    path
}

async fn run_case(id: &str) {
    let manifest = load_manifest();
    let case = manifest
        .cases
        .iter()
        .find(|c| c.id == id)
        .unwrap_or_else(|| panic!("wire-test case {id} not found in manifest"));

    let command = resolve_command(&manifest, &case.method, &case.path);

    // Some endpoints can't be driven by the generic --params / --json
    // mechanism: file & multipart uploads need a real file, and bodies the CLI
    // flattened into per-field flags reject a whole-body --json. Skip those
    // (the test passes) and log why, rather than emit a guaranteed failure —
    // mirrors the SDK wire-test generator, which skips endpoints it can't
    // synthesize a call for.
    if command.is_binary || command.is_multipart || command.has_body_field_flags {
        let reason = if command.is_binary {
            "binary/file-upload request body"
        } else if command.is_multipart {
            "multipart/form-data request body"
        } else {
            "request body is exposed as per-field flags, not --json"
        };
        eprintln!("skipping wire test {id} ({} {}): {reason}", case.method, case.path);
        return;
    }

    let expected_path = substitute_path(&case.path, &case.params);

    let server = MockServer::start().await;

    // OAuth client-credentials CLIs perform a token exchange before every
    // authenticated request, and the token URL honors the --base-url override
    // — so the exchange lands on this mock. Mount a canned token stub (unless
    // the token endpoint IS the case under test) so the exchange succeeds and
    // the request reaches the endpoint we're actually testing. No count
    // assertion: the token may be fetched zero or more times depending on
    // caching.
    if let Some(auth_mock) = &manifest.auth_mock {
        let is_token_case = auth_mock.method.eq_ignore_ascii_case(&case.method)
            && normalize_path(&auth_mock.path) == normalize_path(&case.path);
        if !is_token_case {
            Mock::given(match_method(auth_mock.method.as_str()))
                .and(match_path(normalize_path(&auth_mock.path)))
                .respond_with(
                    ResponseTemplate::new(200)
                        .set_body_raw(auth_mock.response_body.clone().into_bytes(), "application/json"),
                )
                .mount(&server)
                .await;
        }
    }

    let mut template = ResponseTemplate::new(case.response.status);
    if !case.response.body.is_empty() {
        template = template.set_body_raw(case.response.body.clone().into_bytes(), "application/json");
    }
    Mock::given(match_method(case.method.as_str()))
        .and(match_path(expected_path.clone()))
        .respond_with(template)
        .expect(1)
        .mount(&server)
        .await;

    let mut args: Vec<String> = command.chain.clone();
    args.push("--base-url".to_string());
    args.push(server.uri());
    args.push("--no-pager".to_string());
    if !case.params.is_empty() {
        args.push("--params".to_string());
        args.push(serde_json::to_string(&case.params).expect("params serialize"));
    }
    // Feed --json only when the endpoint actually registers it (opaque JSON
    // body). Endpoints without it were filtered out by the skip above.
    if command.has_json_body && !case.body.is_null() {
        args.push("--json".to_string());
        args.push(serde_json::to_string(&case.body).expect("body serialize"));
    }

    let mut cmd = tokio::process::Command::new(env!("CARGO_BIN_EXE_query-parameters-api"));
    cmd.args(&args);
    // Dummy credentials so auth-gated endpoints don't bail on a missing secret.
    for var in &manifest.auth_env_vars {
        cmd.env(var, "test");
    }
    cmd.env("NO_COLOR", "1");

    let output = cmd
        .output()
        .await
        .unwrap_or_else(|e| panic!("failed to spawn generated CLI binary: {e}"));

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    // Primary assertion (mirrors the SDK wire tests: the call succeeds, and
    // `Mock::expect(1)` verifies exactly one matching request on server drop).
    assert!(
        output.status.success(),
        "CLI exited with {:?}
  command: {} {}
  stdout: {stdout}
  stderr: {stderr}",
        output.status.code(),
        manifest.binary_name,
        args.join(" ")
    );

    // Rendering check. For a non-streaming endpoint whose stdout parses to the
    // same JSON kind as the mocked body, require a byte-exact render — the
    // strongest signal, and what the common case exercises. Streaming/NDJSON
    // responses re-shape the payload (chunks collected into an array), so there
    // we fall back to asserting the call produced output.
    if case.response.body.trim().is_empty() {
        assert!(stdout.trim().is_empty(), "expected empty output for {id}, got: {stdout}");
    } else if let Ok(expected) = serde_json::from_str::<serde_json::Value>(&case.response.body) {
        match serde_json::from_str::<serde_json::Value>(stdout.trim()) {
            Ok(actual) if !command.is_streaming && same_json_kind(&actual, &expected) => {
                assert_eq!(actual, expected, "rendered response body mismatch for {id}");
            }
            _ => {
                assert!(!stdout.trim().is_empty(), "expected rendered output for {id}, got empty stdout");
            }
        }
    }
}

#[tokio::test]
async fn wire_search() {
    run_case("search").await;
}
