/// Wire test for the spec-aware auth provider architecture.
///
/// Two security schemes (HTTP bearer + apiKey-in-header) registered on a
/// hand-built `RestDescription`, with three methods exercising distinct
/// requirement shapes:
///
///   - `things.list` requires only `bearerAuth` → `Authorization: Bearer ...`.
///   - `things.update` requires only `apiKey` → `X-Api-Key: ...`.
///   - `things.ping` declares no `security_requirements` → falls back to the
///     `AnyAuthProvider` default, which tries the bindings in registration
///     order; the bearer binding wins.
///
/// Each test mounts an `expect(1)` mock that *only* matches the expected
/// header. A wrong header on the wire would miss the mock, get a 404 from
/// the catch-all, and surface as a test failure — wiremock panics at drop
/// time on unfulfilled `expect(1)` mocks.
use std::collections::HashMap;

use fern_cli_sdk::auth::{
    build_provider_from_bindings, build_provider_from_doc, build_provider_with_strategy,
    finalize_bindings, AuthCredentialSource, AuthStrategy, DynAuthProvider, EndpointAuthMetadata,
    SchemeBinding,
};
use std::sync::Arc;
use fern_cli_sdk::formatter::OutputPipeline;
use fern_cli_sdk::http::HttpConfig;
use fern_cli_sdk::openapi::discovery::{
    RestDescription, RestMethod, RestResource, SecurityScheme,
};
use fern_cli_sdk::openapi::executor::{self, PaginationConfig};
use serde_json::json;
use wiremock::matchers::{header, method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

const BEARER_TOKEN: &str = "bearer-secret";
const API_KEY: &str = "apikey-secret";

/// Build a `RestDescription` with two declared security schemes and three
/// methods that exercise routing, anonymous, and fallback paths.
fn build_doc(server_url: &str) -> RestDescription {
    let mut doc = RestDescription {
        name: "auth-routing-fixture".to_string(),
        version: "1.0".to_string(),
        root_url: server_url.to_string(),
        ..Default::default()
    };
    doc.security_schemes
        .insert("bearerAuth".to_string(), SecurityScheme::HttpBearer);
    doc.security_schemes.insert(
        "apiKey".to_string(),
        SecurityScheme::ApiKeyHeader {
            name: "X-Api-Key".to_string(),
        },
    );

    let mut things = RestResource::default();

    // list — requires bearerAuth
    let mut list_req = HashMap::new();
    list_req.insert("bearerAuth".to_string(), Vec::<String>::new());
    things.methods.insert(
        "list".to_string(),
        RestMethod {
            id: Some("things.list".to_string()),
            http_method: "GET".to_string(),
            path: "/things".to_string(),
            root_url: server_url.to_string(),
            security_requirements: Some(vec![list_req]),
            ..Default::default()
        },
    );

    // update — requires apiKey only
    let mut update_req = HashMap::new();
    update_req.insert("apiKey".to_string(), Vec::<String>::new());
    things.methods.insert(
        "update".to_string(),
        RestMethod {
            id: Some("things.update".to_string()),
            http_method: "PUT".to_string(),
            path: "/things".to_string(),
            root_url: server_url.to_string(),
            security_requirements: Some(vec![update_req]),
            ..Default::default()
        },
    );

    // ping — no security requirements declared
    things.methods.insert(
        "ping".to_string(),
        RestMethod {
            id: Some("things.ping".to_string()),
            http_method: "GET".to_string(),
            path: "/ping".to_string(),
            root_url: server_url.to_string(),
            security_requirements: None,
            ..Default::default()
        },
    );

    // health — explicit anonymous (`security: []`). Distinct from `ping`
    // (which simply omits the security block): the empty array opts the
    // endpoint *out* of every scheme, even when a default is bound.
    things.methods.insert(
        "health".to_string(),
        RestMethod {
            id: Some("things.health".to_string()),
            http_method: "GET".to_string(),
            path: "/health".to_string(),
            root_url: server_url.to_string(),
            security_requirements: Some(Vec::new()),
            ..Default::default()
        },
    );

    doc.resources.insert("things".to_string(), things);
    doc
}

/// Bind both schemes, ordered bearer-first so the AnyAuth fallback prefers it.
fn bindings() -> Vec<(String, SchemeBinding)> {
    vec![
        (
            "bearerAuth".to_string(),
            SchemeBinding::Token(AuthCredentialSource::literal(BEARER_TOKEN)),
        ),
        (
            "apiKey".to_string(),
            SchemeBinding::Token(AuthCredentialSource::literal(API_KEY)),
        ),
    ]
}

fn http_config() -> HttpConfig {
    HttpConfig::new("auth-routing-fixture").unwrap()
}

fn pagination() -> PaginationConfig {
    PaginationConfig::default()
}

async fn run(
    doc: &RestDescription,
    method_name: &str,
    provider: &DynAuthProvider,
) -> Result<Option<serde_json::Value>, fern_cli_sdk::error::CliError> {
    let m = doc.resources["things"].methods[method_name].clone();
    executor::execute_method(
        doc,
        &m,
        None,
        None,
        provider,
        None,
        None,
        None,
        false,
        &pagination(),
        &OutputPipeline::default(),
        true, // capture_output (don't print to stdout)
        None,
        &http_config(),
        false, // no_extract
        false, // no_retry
        false, // no_stream
        &[],
    )
    .await
}

#[tokio::test]
async fn test_routing_endpoint_requires_bearer_only() {
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let provider = build_provider_from_doc(&doc, &bindings());

    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", format!("Bearer {BEARER_TOKEN}")))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    assert!(
        result.is_ok(),
        "list call failed: {:?}",
        result.err()
    );
}

#[tokio::test]
async fn test_routing_endpoint_requires_apikey_only() {
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let provider = build_provider_from_doc(&doc, &bindings());

    Mock::given(method("PUT"))
        .and(path("/things"))
        .and(header("X-Api-Key", API_KEY))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "update", &provider).await;
    assert!(result.is_ok(), "update call failed: {:?}", result.err());

    // wiremock's header matchers only see headers that exist — they can't
    // assert a header is *absent*. Inspect the actual recorded request to
    // pin down that no Authorization leaked into the apiKey-only endpoint.
    let recorded = server.received_requests().await.expect("requests recorded");
    assert_eq!(recorded.len(), 1, "exactly one request expected");
    let req = &recorded[0];
    assert_eq!(
        req.headers
            .get("X-Api-Key")
            .and_then(|v| v.to_str().ok()),
        Some(API_KEY),
        "apiKey header value should match",
    );
    assert!(
        req.headers.get("Authorization").is_none(),
        "Authorization header must NOT be present on apiKey-only endpoint, got: {:?}",
        req.headers.get("Authorization"),
    );
}

#[tokio::test]
async fn test_routing_anonymous_endpoint_uses_any_auth_fallback() {
    // `ping` has no security requirements. The RoutingAuthProvider should
    // fall through to its `default` (AnyAuthProvider), which tries the
    // bindings in registration order — bearer first → Authorization wins.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let provider = build_provider_from_doc(&doc, &bindings());

    Mock::given(method("GET"))
        .and(path("/ping"))
        .and(header("Authorization", format!("Bearer {BEARER_TOKEN}")))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"pong": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "ping", &provider).await;
    assert!(result.is_ok(), "ping failed: {:?}", result.err());
}

#[tokio::test]
async fn test_routing_explicit_anonymous_endpoint_sends_no_auth_headers() {
    // `health` declares `security: []` — the operation explicitly opts out
    // of every scheme. Both bindings are present and have credentials, but
    // neither header may land on the wire. The unit test at
    // `compose.rs:399` pins the same behavior in isolation; this is the
    // end-to-end version covering the executor + RoutingAuthProvider path.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let provider = build_provider_from_doc(&doc, &bindings());

    Mock::given(method("GET"))
        .and(path("/health"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "health", &provider).await;
    assert!(result.is_ok(), "health call failed: {:?}", result.err());

    let recorded = server.received_requests().await.expect("requests recorded");
    assert_eq!(recorded.len(), 1);
    let req = &recorded[0];
    assert!(
        req.headers.get("Authorization").is_none(),
        "Authorization header must NOT leak onto explicit-anonymous endpoint, got: {:?}",
        req.headers.get("Authorization"),
    );
    assert!(
        req.headers.get("X-Api-Key").is_none(),
        "X-Api-Key must NOT leak onto explicit-anonymous endpoint, got: {:?}",
        req.headers.get("X-Api-Key"),
    );
}

#[tokio::test]
async fn test_bearer_required_endpoint_unauthorized_when_no_bearer_binding() {
    // Only the apiKey scheme is bound. The bearer-required `list` endpoint
    // can't satisfy any requirement → request goes out unauthed → server
    // returns 401 → executor surfaces the friendly "no creds" Auth error,
    // because `RoutingAuthProvider::has_credentials_for(endpoint)`
    // recognizes that this specific endpoint's bearer requirement isn't
    // satisfied (even though apiKey *is* bound elsewhere).
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let only_apikey = vec![(
        "apiKey".to_string(),
        SchemeBinding::Token(AuthCredentialSource::literal(API_KEY)),
    )];
    let provider = build_provider_from_doc(&doc, &only_apikey);

    Mock::given(method("GET"))
        .and(path("/things"))
        .respond_with(ResponseTemplate::new(401).set_body_string("Unauthorized"))
        .expect(1)
        .mount(&server)
        .await;

    let err = run(&doc, "list", &provider).await.unwrap_err();
    match err {
        fern_cli_sdk::error::CliError::Auth(msg) => {
            assert!(
                msg.contains("Access denied"),
                "expected friendly 'Access denied' message, got: {msg}",
            );
        }
        other => panic!("expected friendly CliError::Auth, got: {other:?}"),
    }

    // Critical security guard: even though no requirement was satisfiable,
    // the apiKey we have must NOT have been opportunistically attached.
    let recorded = server.received_requests().await.expect("requests recorded");
    assert_eq!(recorded.len(), 1);
    let req = &recorded[0];
    assert!(req.headers.get("Authorization").is_none());
    assert!(req.headers.get("X-Api-Key").is_none());
}

// -------- AuthStrategy::All (Phase 9) --------

#[tokio::test]
async fn test_strategy_all_attaches_every_scheme_to_every_request() {
    // Generator-driven scenario: API requires bearer + apiKey on every
    // request, regardless of what the spec says about per-endpoint
    // security. `auth_strategy(All)` is how the generator expresses this.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let bindings = vec![
        (
            "bearerAuth".to_string(),
            SchemeBinding::Token(AuthCredentialSource::literal(BEARER_TOKEN)),
        ),
        (
            "apiKey".to_string(),
            SchemeBinding::Token(AuthCredentialSource::literal(API_KEY)),
        ),
    ];
    let provider = build_provider_with_strategy(
        &bindings,
        &doc.security_schemes,
        AuthStrategy::All,
        true, // doc has per-endpoint security; All overrides anyway
    );
    assert_eq!(provider.name(), "all");

    // Even though `things.list` declares only bearerAuth in its
    // security_requirements, the All strategy ignores that and attaches
    // both schemes — that's the whole point.
    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", &format!("Bearer {BEARER_TOKEN}")[..]))
        .and(header("X-Api-Key", API_KEY))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    assert!(result.is_ok(), "list call failed: {:?}", result.err());
}

#[tokio::test]
async fn test_strategy_all_friendly_error_when_any_scheme_missing() {
    // All-auth means one missing scheme = no auth attempted. The friendly
    // error should fire because we couldn't fully satisfy the requirement.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let bindings = vec![
        (
            "bearerAuth".to_string(),
            SchemeBinding::Token(AuthCredentialSource::literal(BEARER_TOKEN)),
        ),
        (
            "apiKey".to_string(),
            // Missing — so all-auth can't be satisfied.
            SchemeBinding::Token(AuthCredentialSource::Missing),
        ),
    ];
    let provider = build_provider_with_strategy(
        &bindings,
        &doc.security_schemes,
        AuthStrategy::All,
        true,
    );
    assert!(!provider.has_credentials());

    Mock::given(method("GET"))
        .and(path("/things"))
        .respond_with(ResponseTemplate::new(401).set_body_string("Unauthorized"))
        .expect(1)
        .mount(&server)
        .await;

    let err = run(&doc, "list", &provider).await.unwrap_err();
    match err {
        fern_cli_sdk::error::CliError::Auth(msg) => {
            assert!(msg.contains("Access denied"), "got: {msg}");
        }
        other => panic!("expected friendly Auth error, got: {other:?}"),
    }

    // No auth must have been attached — partial all-auth would leak
    // whichever scheme *is* bound (here the bearer token) without
    // satisfying the API's actual requirement. `AllAuthProvider::apply`
    // short-circuits when `has_credentials_for(endpoint)` is false so
    // nothing reaches the wire.
    let recorded = server.received_requests().await.expect("requests recorded");
    assert_eq!(recorded.len(), 1);
    let req = &recorded[0];
    assert!(
        req.headers.get("Authorization").is_none(),
        "bearer token must NOT leak when all-auth can't be fully satisfied, got: {:?}",
        req.headers.get("Authorization"),
    );
    assert!(
        req.headers.get("X-Api-Key").is_none(),
        "X-Api-Key must NOT be present (apiKey binding is missing), got: {:?}",
        req.headers.get("X-Api-Key"),
    );
}

// -------- Compositional credential sources (Phase 7) --------

/// Simulate `clap` parsing `--api-token <value>` and produce the matches
/// the SDK would normally hand to `finalize_bindings`. Test-only helper.
fn matches_with_arg(arg_name: &'static str, value: Option<&str>) -> Arc<clap::ArgMatches> {
    let cmd = clap::Command::new("auth-routing-test").arg(
        clap::Arg::new(arg_name)
            .long(arg_name)
            .num_args(1),
    );
    let argv: Vec<String> = match value {
        Some(v) => vec![
            "auth-routing-test".to_string(),
            format!("--{arg_name}"),
            v.to_string(),
        ],
        None => vec!["auth-routing-test".to_string()],
    };
    Arc::new(cmd.try_get_matches_from(argv).unwrap())
}

#[tokio::test]
async fn test_credential_source_cli_finalizes_and_routes() {
    // Bind bearer to a CLI flag, simulate the user passing
    // `--api-token cli-supplied`, and confirm the value lands on the wire.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let bindings = vec![(
        "bearerAuth".to_string(),
        SchemeBinding::Token(AuthCredentialSource::cli("api-token")),
    )];
    let matches = matches_with_arg("api-token", Some("cli-supplied"));
    let finalized = finalize_bindings(bindings, &matches);
    let provider = build_provider_from_doc(&doc, &finalized);

    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", "Bearer cli-supplied"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    assert!(result.is_ok(), "list call failed: {:?}", result.err());
}

#[tokio::test]
async fn test_credential_source_chain_falls_back_through_sources() {
    // Chain: --api-token (not supplied) → env var (set). The env var should
    // win because the CLI source resolves to None when the flag wasn't
    // passed, and Chain takes the first non-empty.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let env_key = "FERN_CLI_AUTH_WIRE_TEST_FALLBACK";
    std::env::set_var(env_key, "from-env-fallback");
    let bindings = vec![(
        "bearerAuth".to_string(),
        SchemeBinding::Token(AuthCredentialSource::any([
            AuthCredentialSource::cli("api-token"),
            AuthCredentialSource::from_env(env_key),
        ])),
    )];
    let matches = matches_with_arg("api-token", None);
    let finalized = finalize_bindings(bindings, &matches);
    let provider = build_provider_from_doc(&doc, &finalized);

    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", "Bearer from-env-fallback"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    std::env::remove_var(env_key);
    assert!(result.is_ok(), "list call failed: {:?}", result.err());
}

#[tokio::test]
async fn test_credential_source_chain_cli_wins_over_env() {
    // Both CLI and env are set. CLI is registered first in the chain → CLI
    // value wins. The standard "command-line overrides environment"
    // precedence pattern.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let env_key = "FERN_CLI_AUTH_WIRE_TEST_PRECEDENCE";
    std::env::set_var(env_key, "loser-from-env");
    let bindings = vec![(
        "bearerAuth".to_string(),
        SchemeBinding::Token(AuthCredentialSource::any([
            AuthCredentialSource::cli("api-token"),
            AuthCredentialSource::from_env(env_key),
        ])),
    )];
    let matches = matches_with_arg("api-token", Some("winner-from-cli"));
    let finalized = finalize_bindings(bindings, &matches);
    let provider = build_provider_from_doc(&doc, &finalized);

    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", "Bearer winner-from-cli"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    std::env::remove_var(env_key);
    assert!(result.is_ok(), "list call failed: {:?}", result.err());
}

#[tokio::test]
async fn test_credential_source_file_reads_from_disk() {
    // Write a credential to a temp file, bind the bearer scheme to it,
    // confirm the trimmed file contents land on the wire.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let dir = tempfile::tempdir().unwrap();
    let token_path = dir.path().join("api-token");
    std::fs::write(&token_path, "  file-secret  \n").unwrap();
    let bindings = vec![(
        "bearerAuth".to_string(),
        SchemeBinding::Token(AuthCredentialSource::file(&token_path)),
    )];
    // No CLI args needed; finalize is a no-op for File.
    let matches = matches_with_arg("ignored", None);
    let finalized = finalize_bindings(bindings, &matches);
    let provider = build_provider_from_doc(&doc, &finalized);

    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", "Bearer file-secret"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    assert!(result.is_ok(), "list call failed: {:?}", result.err());
}

#[tokio::test]
async fn test_credential_source_full_chain_cli_env_file() {
    // Canonical "CLI > env > file" pattern. Only the file has a value,
    // so the chain should resolve to the file's contents.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let dir = tempfile::tempdir().unwrap();
    let token_path = dir.path().join("token");
    std::fs::write(&token_path, "deepest-fallback").unwrap();
    let bindings = vec![(
        "bearerAuth".to_string(),
        SchemeBinding::Token(AuthCredentialSource::any([
            AuthCredentialSource::cli("api-token"),
            AuthCredentialSource::from_env("FERN_CLI_AUTH_WIRE_FULL_CHAIN_DEFINITELY_UNSET"),
            AuthCredentialSource::file(&token_path),
        ])),
    )];
    let matches = matches_with_arg("api-token", None);
    let finalized = finalize_bindings(bindings, &matches);
    let provider = build_provider_from_doc(&doc, &finalized);

    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", "Bearer deepest-fallback"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    assert!(result.is_ok(), "list call failed: {:?}", result.err());
}

#[tokio::test]
async fn test_basic_auth_with_per_field_chains() {
    // HTTP basic with chains on each field — username from CLI, password
    // from a file. Closes the loop on the "decoupled sources" pitch.
    let server = MockServer::start().await;
    let mut doc = fern_cli_sdk::openapi::discovery::RestDescription::default();
    doc.security_schemes.insert(
        "basic".to_string(),
        fern_cli_sdk::openapi::discovery::SecurityScheme::HttpBasic,
    );
    let mut things = fern_cli_sdk::openapi::discovery::RestResource::default();
    let mut req_map = HashMap::new();
    req_map.insert("basic".to_string(), Vec::<String>::new());
    things.methods.insert(
        "list".to_string(),
        fern_cli_sdk::openapi::discovery::RestMethod {
            http_method: "GET".to_string(),
            path: "/things".to_string(),
            root_url: server.uri(),
            security_requirements: Some(vec![req_map]),
            ..Default::default()
        },
    );
    doc.resources.insert("things".to_string(), things);

    let dir = tempfile::tempdir().unwrap();
    let pass_path = dir.path().join("pw");
    std::fs::write(&pass_path, "hunter2").unwrap();

    let bindings = vec![(
        "basic".to_string(),
        SchemeBinding::Basic {
            username: AuthCredentialSource::cli("user"),
            password: AuthCredentialSource::file(&pass_path),
        },
    )];

    let cmd = clap::Command::new("test").arg(
        clap::Arg::new("user")
            .long("user")
            .num_args(1),
    );
    let matches = Arc::new(
        cmd.try_get_matches_from(["test", "--user", "alice"])
            .unwrap(),
    );
    let finalized = finalize_bindings(bindings, &matches);
    // Doc has per-endpoint security so the wrapper is RoutingAuthProvider.
    let provider = build_provider_from_bindings(
        &finalized,
        &doc.security_schemes,
        true,
    );

    // base64("alice:hunter2") = YWxpY2U6aHVudGVyMg==
    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", "Basic YWxpY2U6aHVudGVyMg=="))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let m = doc.resources["things"].methods["list"].clone();
    let result = executor::execute_method(
        &doc,
        &m,
        None,
        None,
        &provider,
        None,
        None,
        None,
        false,
        &PaginationConfig::default(),
        &fern_cli_sdk::formatter::OutputPipeline::default(),
        true,
        None,
        &fern_cli_sdk::http::HttpConfig::new("auth-routing-fixture").unwrap(),
        false, // no_extract
        false, // no_retry
        false, // no_stream
        &[],
    )
    .await;
    assert!(result.is_ok(), "basic auth call failed: {:?}", result.err());

    // Pin that the unused EndpointAuthMetadata import compiles.
    let _ = EndpointAuthMetadata::unspecified();
}

#[tokio::test]
async fn test_bearer_only_endpoint_does_not_leak_apikey_header() {
    // Symmetric guard for the bearer-only endpoint: even though the apiKey
    // scheme is bound and has credentials, the operation's
    // `security_requirements` pin bearer alone — X-Api-Key must not appear.
    let server = MockServer::start().await;
    let doc = build_doc(&server.uri());
    let provider = build_provider_from_doc(&doc, &bindings());

    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header("Authorization", format!("Bearer {BEARER_TOKEN}")))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"ok": true})))
        .expect(1)
        .mount(&server)
        .await;

    let result = run(&doc, "list", &provider).await;
    assert!(result.is_ok(), "list call failed: {:?}", result.err());

    let recorded = server.received_requests().await.expect("requests recorded");
    assert_eq!(recorded.len(), 1);
    let req = &recorded[0];
    assert!(
        req.headers.get("X-Api-Key").is_none(),
        "X-Api-Key must NOT be present on bearer-only endpoint, got: {:?}",
        req.headers.get("X-Api-Key"),
    );
}
