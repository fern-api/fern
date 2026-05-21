//! Wire test for the legacy v1 server-name alias `x-name`.
//!
//! Confirms that an OpenAPI spec using the legacy spelling alone (no
//! `x-fern-server-name` anywhere) parses end-to-end and the resulting
//! command tree dispatches a real request through the executor against
//! a wiremock server. Mirrors fern's behavior in
//! `packages/cli/api-importers/openapi/openapi-ir-parser/src/openapi/v3/converters/convertServer.ts:72-75`,
//! where `getExtension([SERVER_NAME_V1, SERVER_NAME_V2])` accepts either
//! key with v1-wins precedence on the rare spec that carries both.
//!
//! Pairs with the in-source unit tests covering the four shape
//! permutations (only v2 / only v1 / both / neither); this file pins
//! the end-to-end command-tree path so a future regression in the
//! parser → discovery → executor chain that drops legacy specs surfaces
//! as a wire failure rather than a silent miss.

use std::sync::Arc;

use fern_cli_sdk::auth::{AuthCredentialSource, BearerAuthProvider, DynAuthProvider};
use fern_cli_sdk::formatter::OutputPipeline;
use fern_cli_sdk::http::HttpConfig;
use fern_cli_sdk::openapi::executor::{self, PaginationConfig};
use fern_cli_sdk::openapi::load_openapi_spec;
use serde_json::json;
use wiremock::matchers::{header_regex, method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

const TOKEN: &str = "x-name-wire-token";

fn bearer_provider() -> DynAuthProvider {
    Arc::new(BearerAuthProvider::new(
        "bearerAuth",
        AuthCredentialSource::literal(TOKEN),
    ))
}

fn default_pagination() -> PaginationConfig {
    PaginationConfig::default()
}

fn default_http_config() -> HttpConfig {
    HttpConfig::new("x-name-server-alias-wire").unwrap()
}

/// Spec carrying only the legacy v1 alias `x-name`. No
/// `x-fern-server-name` anywhere — exercises the fallback read.
fn legacy_alias_spec(server_url: &str) -> String {
    format!(
        r#"
openapi: "3.0.0"
info:
  title: Legacy Alias Wire
  version: "1.0"
servers:
  - url: {server_url}
    x-name: LegacyProd
    description: Legacy v1-named production server.
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
security:
  - bearerAuth: []
paths:
  /things:
    get:
      x-fern-sdk-group-name: ["things"]
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#
    )
}

#[tokio::test]
async fn x_name_legacy_alias_drives_full_command_tree_dispatch() {
    let server = MockServer::start().await;
    Mock::given(method("GET"))
        .and(path("/things"))
        .and(header_regex(
            "Authorization",
            format!("^Bearer {TOKEN}$").as_str(),
        ))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "things": [{"id": "thing-1"}],
        })))
        .expect(1)
        .mount(&server)
        .await;

    let doc = load_openapi_spec(&legacy_alias_spec(&server.uri()), "x-name-wire").unwrap();

    // Pre-flight: the parser surfaced the legacy spelling as a resolved
    // server name (mirroring fern's importer) and exposes it via the
    // `named_servers` helper that drives the help surface.
    assert_eq!(doc.servers.len(), 1);
    assert_eq!(doc.servers[0].name.as_deref(), Some("LegacyProd"));
    assert_eq!(
        doc.servers[0].description.as_deref(),
        Some("Legacy v1-named production server."),
    );
    let named: Vec<_> = doc.named_servers().collect();
    assert_eq!(named.len(), 1);
    assert_eq!(named[0].0, "LegacyProd");

    // End-to-end wire: the executor dispatches against the spec's
    // server URL and the mock observes exactly one matching request.
    // If the parser had ignored `x-name`, the named-server data would
    // still be empty here — but the operation still dispatches against
    // the spec's `servers:` block, so the wire mock would still match.
    // The pre-flight assertions above are what lock the legacy alias.
    let method = doc.resources["things"].methods["list"].clone();
    let result = executor::execute_method(
        &doc,
        &method,
        None,
        None,
        &bearer_provider(),
        None,
        None,
        None,
        false,
        &default_pagination(),
        &OutputPipeline::default(),
        true,  // capture_output → return the response body
        None,  // no base-url override
        &default_http_config(),
        false, // no_extract
        false, // no_retry
        false, // no_stream
        &[],   // no x-fern-global-headers
    )
    .await
    .expect("execute_method must succeed against the wire mock");

    let body = result.expect("response body must be captured");
    assert_eq!(body["things"][0]["id"].as_str(), Some("thing-1"));
}
