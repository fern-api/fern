//! Auto-generated wire tests by @fern-api/cli-generator.
//!
//! Each test stands up an in-process `wiremock` server, points the
//! generated CLI at it via `--base-url`, drives one endpoint from an IR
//! example, and asserts the request the CLI *sent* — not just the response
//! it renders:
//!   - method + path, scalar query params, and auth headers;
//!   - the request body: opaque JSON bodies (`--json`) are matched
//!     field-by-field, and file/multipart uploads are driven with a real
//!     temp fixture file whose bytes must appear in the request body (so an
//!     upload the runtime sends as a text path, not a file part, is caught);
//!   - for the happy-path case, the rendered response body on stdout;
//!   - each case also has a negative twin: the mock serves a non-2xx with a
//!     JSON error body and the CLI is required to exit non-zero.
//!
//! No docker, no network — runs under a plain `cargo test`. Regenerated on
//! every `fern generate`; do not edit by hand.
#![allow(dead_code)]

use serde::Deserialize;
use std::collections::HashMap;
use wiremock::matchers::{
    body_partial_json as match_body_partial_json, body_string_contains as match_body_contains,
    header as match_header, header_regex as match_header_regex, method as match_method, path as match_path,
    query_param as match_query_param,
};
use wiremock::{Mock, MockServer, ResponseTemplate};

use fern_cli_sdk::openapi::discovery::{BodyEncoding, RestResource};
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
    #[serde(rename = "loginTokenSetup")]
    login_token_setup: Option<LoginTokenSetup>,
    cases: Vec<Case>,
}

#[derive(Deserialize)]
struct LoginTokenSetup {
    #[serde(rename = "schemeName")]
    scheme_name: String,
    token: String,
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
    #[serde(rename = "queryMatchers", default)]
    query_matchers: Vec<QueryMatcher>,
    #[serde(rename = "headerMatchers", default)]
    header_matchers: Vec<HeaderMatcher>,
    #[serde(rename = "multipartFields", default)]
    multipart_fields: Vec<MultipartFieldSpec>,
    #[serde(rename = "expectError", default)]
    expect_error: bool,
    #[serde(rename = "omitOptionalFiles", default)]
    omit_optional_files: bool,
    response: ExpectedResponse,
}

#[derive(Deserialize)]
struct MultipartFieldSpec {
    #[serde(rename = "wireName")]
    wire_name: String,
    #[serde(rename = "isFile")]
    is_file: bool,
    #[serde(rename = "isOptional", default)]
    is_optional: bool,
}

#[derive(Deserialize)]
struct QueryMatcher {
    name: String,
    value: String,
}

#[derive(Deserialize)]
struct HeaderMatcher {
    name: String,
    #[serde(rename = "equalTo")]
    equal_to: Option<String>,
    matches: Option<String>,
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

/// Canonicalize a path *template* for resolution: normalize it, then collapse
/// every `{param}` placeholder to a bare `{}` so two templates match
/// regardless of parameter *names*. The CLI can rename a path parameter (e.g.
/// to disambiguate it from a request-body field of the same name), so the
/// manifest's template (`…/{idTypePathParam}`) and the spec's template
/// (`…/{idType}`) describe the same route but differ only in placeholder name.
fn canonicalize_path_template(path: &str) -> String {
    let normalized = normalize_path(path);
    let mut out = String::with_capacity(normalized.len());
    let mut in_placeholder = false;
    for ch in normalized.chars() {
        match ch {
            '{' => {
                in_placeholder = true;
                out.push('{');
            }
            '}' => {
                in_placeholder = false;
                out.push('}');
            }
            _ if in_placeholder => {}
            _ => out.push(ch),
        }
    }
    out
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
    /// Flag name for the binary request-body file (`--<flag> <path>`), if any.
    binary_flag: Option<String>,
    /// multipart/form-data — per-field file/value flags, not `--json`.
    is_multipart: bool,
    /// The request body is `application/json` (vs
    /// `application/x-www-form-urlencoded`). Only JSON bodies are driven via
    /// `--json` and matched with a partial-JSON matcher; a form body wouldn't
    /// parse as JSON, so the harness skips those (see `run_case`). A JSON body
    /// the CLI *also* flattened into per-field flags is still driven here — the
    /// `--json` flag is registered alongside the per-field flags.
    body_is_json_encoded: bool,
    /// Streaming/SSE response — stdout is chunked, so a byte-exact comparison
    /// against the mock's single payload doesn't hold.
    is_streaming: bool,
}

/// Build a `CommandInfo` for a single method at the given command `chain`.
fn make_command(chain: Vec<String>, method: &fern_cli_sdk::openapi::discovery::RestMethod) -> CommandInfo {
    CommandInfo {
        chain,
        http_method: method.http_method.to_uppercase(),
        path: method.path.clone(),
        has_json_body: method.request.is_some(),
        is_binary: method.binary_request_body.is_some(),
        binary_flag: method.binary_request_body.as_ref().map(|b| b.flag_name.clone()),
        is_multipart: !method.multipart_fields.is_empty(),
        body_is_json_encoded: matches!(method.body_encoding, BodyEncoding::Json),
        is_streaming: method.streaming.is_some(),
    }
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
            out.push(make_command(full, method));
        }
        collect_commands(&resource.resources, &chain, out);
    }
}

/// Collect commands for one spec, replicating the SDK's namespace-mount
/// semantics (`merge_into_path` in `openapi/app.rs`).
///
/// A spec bound with `.spec_under("<namespace>", …)` nests under the
/// namespace, but the SDK performs *stutter elision*: if the spec's discovery
/// tree has a top-level resource whose name equals the (leaf) namespace
/// segment, that resource's methods and sub-resources are hoisted directly
/// into the namespace node — so `<ns> <ns> <op>` collapses to `<ns> <op>`.
/// This happens whenever a spec is untagged and Fern groups every operation
/// under a resource derived from the shared path prefix (e.g. `v1`) that
/// matches the version namespace. Mirror it here so the resolved command
/// chain matches the binary's actual command tree.
fn collect_spec_commands(
    resources: &HashMap<String, RestResource>,
    root_prefix: &[String],
    namespace: Option<&str>,
    out: &mut Vec<CommandInfo>,
) {
    let segments: Vec<String> = match namespace {
        Some(ns) => ns.split('/').filter(|s| !s.is_empty()).map(str::to_string).collect(),
        None => Vec::new(),
    };
    if segments.is_empty() {
        collect_commands(resources, root_prefix, out);
        return;
    }

    // Prefix up to and including the namespace node.
    let mut ns_prefix = root_prefix.to_vec();
    ns_prefix.extend(segments.iter().cloned());
    let leaf = segments.last().expect("segments non-empty");

    // Non-matching top-level resources are ordinary children of the namespace.
    let others: HashMap<String, RestResource> = resources
        .iter()
        .filter(|(name, _)| name.as_str() != leaf.as_str())
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
    collect_commands(&others, &ns_prefix, out);

    // A resource matching the namespace leaf is hoisted into the namespace node.
    if let Some(matching) = resources.get(leaf.as_str()) {
        for (method_name, method) in &matching.methods {
            let mut full = ns_prefix.clone();
            full.push(method_name.clone());
            out.push(make_command(full, method));
        }
        collect_commands(&matching.resources, &ns_prefix, out);
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
        let mut root_prefix: Vec<String> = Vec::new();
        if let Some(root_group) = &manifest.root_group {
            root_prefix.push(root_group.clone());
        }
        collect_spec_commands(&doc.resources, &root_prefix, spec.namespace.as_deref(), &mut commands);
    }

    let want_method = method.to_uppercase();
    let want_path = canonicalize_path_template(path);

    // Exact match on method + canonicalized path template.
    let mut hits: Vec<CommandInfo> = commands
        .iter()
        .filter(|c| c.http_method == want_method && canonicalize_path_template(&c.path) == want_path)
        .cloned()
        .collect();

    // Fallback: tolerate base-path prefixes by matching path suffixes.
    if hits.is_empty() {
        hits = commands
            .iter()
            .filter(|c| {
                let np = canonicalize_path_template(&c.path);
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

    // A non-JSON (form-url-encoded) body can't be sent via `--json` and there
    // is no form-body matcher here — skip those (the test passes) and log why,
    // rather than emit a guaranteed failure. JSON bodies are driven below via
    // `--json`, *including* ones the CLI also flattened into per-field flags
    // (the `--json` flag is registered alongside them). Binary and multipart
    // uploads are driven with a real fixture file and we assert the bytes land
    // in the request body — exactly what catches an upload the runtime
    // mis-serializes (e.g. sending a filename as a text part).
    if command.has_json_body && !command.body_is_json_encoded {
        eprintln!(
            "skipping wire test {id} ({} {}): non-JSON request body encoding is not driven by the harness",
            case.method, case.path
        );
        return;
    }
    if command.is_multipart && case.multipart_fields.is_empty() {
        eprintln!(
            "skipping wire test {id} ({} {}): multipart endpoint has no IR field metadata to drive",
            case.method, case.path
        );
        return;
    }

    let expected_path = substitute_path(&case.path, &case.params);

    // A per-case scratch dir for any fixture file(s) the request needs.
    // Distinct from the login-keyring HOME dir, and removed at the end.
    let fixtures_dir = std::env::temp_dir().join(format!("{}-wire-files-{id}", manifest.binary_name));
    let _ = std::fs::remove_dir_all(&fixtures_dir);

    // Plan how to drive the request body: extra CLI flags to append, plus
    // substrings that MUST appear in the received request body. For an upload,
    // each file field gets a temp file whose unique marker bytes must show up
    // in the multipart body — so a runtime that sends the file's *path* as a
    // text part (the optional-file bug) fails to match and the test fails.
    let mut body_flag_args: Vec<String> = Vec::new();
    let mut required_body_substrings: Vec<String> = Vec::new();

    if command.is_multipart {
        std::fs::create_dir_all(&fixtures_dir).expect("create multipart fixture dir");
        for field in &case.multipart_fields {
            // Exercise the valid "optional file omitted" shape: drop optional
            // file fields, send only what's required, and assert the request
            // still succeeds and carries no bogus part for the omitted field.
            if case.omit_optional_files && field.is_file && field.is_optional {
                continue;
            }
            let flag = fern_cli_sdk::to_kebab_flag(&field.wire_name);
            // Every part sent must name itself in its Content-Disposition, so a
            // dropped or misnamed part fails the match.
            required_body_substrings.push(format!("name=\"{}\"", field.wire_name));
            if field.is_file {
                let marker = format!("wire-fixture-{id}-{}-bytes", field.wire_name);
                let file_path = fixtures_dir.join(&field.wire_name);
                std::fs::write(&file_path, marker.as_bytes()).expect("write multipart fixture file");
                body_flag_args.push(format!("--{flag}"));
                body_flag_args.push(file_path.to_string_lossy().into_owned());
                // A file part carries `filename="..."` *and* the file's bytes.
                // The optional-file bug sends the path as a text part — no
                // filename attribute and none of the marker bytes — so both
                // checks fail and the test catches it.
                required_body_substrings.push("filename=\"".to_string());
                required_body_substrings.push(marker);
            } else {
                let value = case
                    .body
                    .get(&field.wire_name)
                    .and_then(|v| v.as_str())
                    .map(str::to_string)
                    .unwrap_or_else(|| format!("wire-fixture-{id}-{}", field.wire_name));
                body_flag_args.push(format!("--{flag}"));
                body_flag_args.push(value.clone());
                required_body_substrings.push(value);
            }
        }
    } else if command.is_binary {
        if let Some(flag) = &command.binary_flag {
            std::fs::create_dir_all(&fixtures_dir).expect("create binary fixture dir");
            let marker = format!("wire-fixture-{id}-body-bytes");
            let file_path = fixtures_dir.join("body");
            std::fs::write(&file_path, marker.as_bytes()).expect("write binary fixture file");
            body_flag_args.push(format!("--{flag}"));
            body_flag_args.push(file_path.to_string_lossy().into_owned());
            required_body_substrings.push(marker);
        }
    }

    // Public-client login flows (PKCE / device-code) authenticate from a keyring token that
    // `auth login` populates. We can't drive the interactive browser/device login headlessly, so
    // seed a token via the universal `--with-token` paste into an isolated, file-backed keyring
    // (`FERN_CLI_CREDENTIAL_STORE=file` + a temp `HOME` — no OS-keyring prompt, hermetic per test).
    // The request-time provider then injects it as `Authorization: Bearer <token>`, which the
    // business mock asserts below.
    let auth_home: Option<std::path::PathBuf> = if let Some(setup) = &manifest.login_token_setup {
        use tokio::io::AsyncWriteExt;
        let home = std::env::temp_dir().join(format!("{}-wire-{id}", manifest.binary_name));
        let _ = std::fs::remove_dir_all(&home);
        std::fs::create_dir_all(&home).expect("create isolated keyring HOME");
        let mut login = tokio::process::Command::new(env!("CARGO_BIN_EXE_api"));
        login
            .args(["auth", "login", "--with-token", "--scheme", setup.scheme_name.as_str()])
            .env("HOME", &home)
            .env("FERN_CLI_CREDENTIAL_STORE", "file")
            .env("NO_COLOR", "1")
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped());
        let mut child = login.spawn().expect("spawn auth login --with-token");
        {
            let mut stdin = child.stdin.take().expect("login stdin");
            stdin
                .write_all(setup.token.as_bytes())
                .await
                .expect("write token to auth login stdin");
        }
        let login_out = child.wait_with_output().await.expect("auth login --with-token output");
        assert!(
            login_out.status.success(),
            "auth login --with-token failed: {}",
            String::from_utf8_lossy(&login_out.stderr)
        );
        Some(home)
    } else {
        None
    };

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
    // Match on method + path AND the scalar query params + auth headers the
    // request must carry. A request that omits or mis-serializes any of them
    // won't match this mock — the CLI then gets no response and the test fails,
    // rather than passing on a path-only match. This gives the same
    // request-shape verification the SDK wire tests get from WireMock stub
    // matching, without a WireMock container.
    let mut mock = Mock::given(match_method(case.method.as_str())).and(match_path(expected_path.clone()));
    for q in &case.query_matchers {
        mock = mock.and(match_query_param(q.name.as_str(), q.value.as_str()));
    }
    for h in &case.header_matchers {
        if let Some(equal_to) = &h.equal_to {
            mock = mock.and(match_header(h.name.as_str(), equal_to.as_str()));
        } else if let Some(pattern) = &h.matches {
            mock = mock.and(match_header_regex(h.name.as_str(), pattern.as_str()));
        }
    }
    // For login-flow schemes, require the exact bearer we seeded — this is what verifies the
    // request-time keyring → `Authorization: Bearer <token>` injection end to end.
    if let Some(setup) = &manifest.login_token_setup {
        mock = mock.and(match_header("authorization", format!("Bearer {}", setup.token).as_str()));
    }
    // Assert the *request body* the CLI sends, not just its method/path. For an
    // opaque JSON body, require the example fields to be present with the right
    // values (partial match — tolerant of extra transport fields). For an
    // upload, require each part's marker/value to appear in the multipart body.
    // A request with a wrong, missing, or mis-serialized body won't match this
    // mock, so the CLI gets no response and the test fails.
    if command.is_multipart || command.is_binary {
        for substring in &required_body_substrings {
            mock = mock.and(match_body_contains(substring.clone()));
        }
    } else if command.has_json_body && !case.body.is_null() {
        mock = mock.and(match_body_partial_json(case.body.clone()));
    }
    mock.respond_with(template).expect(1).mount(&server).await;

    let mut args: Vec<String> = command.chain.clone();
    args.push("--base-url".to_string());
    args.push(server.uri());
    args.push("--no-pager".to_string());
    if !case.params.is_empty() {
        args.push("--params".to_string());
        args.push(serde_json::to_string(&case.params).expect("params serialize"));
    }
    // Feed the request body the way the endpoint expects it: per-field upload
    // flags for binary/multipart (planned above), else the opaque --json body.
    if command.is_multipart || command.is_binary {
        args.extend(body_flag_args.iter().cloned());
    } else if command.has_json_body && !case.body.is_null() {
        args.push("--json".to_string());
        args.push(serde_json::to_string(&case.body).expect("body serialize"));
    }

    let mut cmd = tokio::process::Command::new(env!("CARGO_BIN_EXE_api"));
    cmd.args(&args);
    // Dummy credentials so auth-gated endpoints don't bail on a missing secret.
    for var in &manifest.auth_env_vars {
        cmd.env(var, "test");
    }
    cmd.env("NO_COLOR", "1");
    // Same isolated file-backed keyring the token was seeded into, so the request-time provider
    // resolves the bearer we pasted.
    if let Some(home) = &auth_home {
        cmd.env("HOME", home);
        cmd.env("FERN_CLI_CREDENTIAL_STORE", "file");
    }

    let output = cmd
        .output()
        .await
        .unwrap_or_else(|e| panic!("failed to spawn generated CLI binary: {e}"));

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    // Best-effort cleanup of the per-case fixture dir (ignore errors — a leaked
    // temp dir must never fail a test).
    let _ = std::fs::remove_dir_all(&fixtures_dir);

    if case.expect_error {
        // Negative twin: the mock served a non-2xx with a non-empty JSON body,
        // and `Mock::expect(1)` still requires exactly one correctly-matched
        // request. The CLI must surface the error — a non-zero exit — rather
        // than deserialize the error body and report it as success (exit 0).
        assert!(
            !output.status.success(),
            "expected CLI to fail on a {} response, but it exited 0
  command: {} {}
  stdout: {stdout}
  stderr: {stderr}",
            case.response.status,
            manifest.binary_name,
            args.join(" ")
        );
        assert!(
            !stderr.trim().is_empty(),
            "expected an error message on stderr for {id} (a {} response), got empty stderr",
            case.response.status
        );
        return;
    }

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
async fn wire_uploadfile() {
    run_case("uploadfile").await;
}

#[tokio::test]
async fn wire_uploadfile_error() {
    run_case("uploadfile_error").await;
}

#[tokio::test]
async fn wire_uploadfile_optfileomitted() {
    run_case("uploadfile_optfileomitted").await;
}
