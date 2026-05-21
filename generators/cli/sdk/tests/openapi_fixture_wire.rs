/// Wire-style integration tests for the `openapi-fixture` CLI using hand-authored
/// wiremock stubs that cover the fixture spec's full operation surface.
///
/// Architecture:
///   - `mount_mappings` loads all stubs from a small JSON file into an
///     in-process MockServer — no Docker, full per-test isolation.
///   - Tier-1 tests: point the CLI at the stub server, run a command, assert
///     the response fields appear in stdout. Auth is validated implicitly:
///     a missing Authorization header won't match the stub → 404 → test fails.
///   - Tier-2 tests: explicit `expect(1)` mocks that also verify the outgoing
///     request shape (method, path, body, query params).
mod common;

use common::{mount_mappings, OpenApiFixtures};
use serde_json::json;
use std::io::Write;
use std::process::Command;
use wiremock::matchers::{
    body_json, header, header_regex, method, path, query_param, query_param_is_missing,
};
use wiremock::{Mock, MockServer, ResponseTemplate};

const FIXTURE_MAPPINGS: &str = include_str!("fixtures/openapi-fixture-mappings.json");

fn fixture_cmd() -> Command {
    Command::new(env!("CARGO_BIN_EXE_openapi-fixture"))
}

fn live_cmd(server: &MockServer) -> Command {
    let mut cmd = fixture_cmd();
    cmd.env("OPENAPI_FIXTURE_BASE_URL", server.uri())
        .env("OPENAPI_FIXTURE_API_KEY", OpenApiFixtures::TOKEN);
    cmd
}

async fn stubbed_server() -> MockServer {
    let server = MockServer::start().await;
    mount_mappings(&server, FIXTURE_MAPPINGS).await;
    server
}

// ---------------------------------------------------------------------------
// Tier 1 — GET operations: stub server validates auth + path, CLI parses response
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_get_file() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["files", "get", "--file-id", OpenApiFixtures::FILE_ID])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains(OpenApiFixtures::FILE_ID), "file id should appear in output: {stdout}");
    assert!(stdout.contains("sample.txt"), "file name from stub should appear: {stdout}");
}

#[tokio::test]
async fn test_get_folder() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["folders", "get", "--folder-id", OpenApiFixtures::FOLDER_ID])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains(OpenApiFixtures::FOLDER_ID));
}

#[tokio::test]
async fn test_get_current_user() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["users", "getCurrent"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("user"), "user type should appear in output");
}

#[tokio::test]
async fn test_get_user_by_id() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["users", "get", "--user-id", OpenApiFixtures::USER_ID])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("user"), "user type should appear in output");
}

#[tokio::test]
async fn test_list_users() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["users", "list"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_list_folder_items() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["folders", "listItems", "--folder-id", OpenApiFixtures::FOLDER_ID])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("sample.txt"), "file entry from stub should appear");
}

// ---------------------------------------------------------------------------
// Tier 2 — Request shape: explicit expect(1) mocks verify method+path+body
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_put_file_sends_body_and_path() {
    let server = MockServer::start().await;

    Mock::given(method("PUT"))
        .and(path(format!("/files/{}", OpenApiFixtures::FILE_ID)))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({"name": "renamed.txt"})))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "id": OpenApiFixtures::FILE_ID,
                "type": "file",
                "name": "renamed.txt"
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "files",
            "update",
            "--file-id",
            OpenApiFixtures::FILE_ID,
            "--json",
            r#"{"name":"renamed.txt"}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("renamed.txt"));
}

#[tokio::test]
async fn test_delete_file_sends_correct_method_and_path() {
    let server = MockServer::start().await;

    Mock::given(method("DELETE"))
        .and(path(format!("/files/{}", OpenApiFixtures::FILE_ID)))
        .and(header_regex("Authorization", "Bearer .+"))
        .respond_with(ResponseTemplate::new(204))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["files", "delete", "--file-id", OpenApiFixtures::FILE_ID])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_create_folder_with_nested_body() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/folders"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({
            "name": "my-folder",
            "parent": {"id": "0"}
        })))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({
                "id": "folder-999",
                "type": "folder",
                "name": "my-folder"
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "folders",
            "create",
            "--json",
            r#"{"name":"my-folder","parent":{"id":"0"}}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("folder-999"));
    assert!(stdout.contains("my-folder"));
}

#[tokio::test]
async fn test_copy_file_post_with_nested_parent() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path(format!("/files/{}/copy", OpenApiFixtures::FILE_ID)))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({"parent": {"id": "0"}})))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({
                "id": "file-copy-1",
                "type": "file",
                "name": "sample (copy).txt"
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "files",
            "copy",
            "--file-id",
            OpenApiFixtures::FILE_ID,
            "--json",
            r#"{"parent":{"id":"0"}}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("file-copy-1"));
}

#[tokio::test]
async fn test_list_users_forwards_query_params() {
    // Regression: `filter_term` is exposed on the CLI as `--search-query`
    // via `x-fern-parameter-name: searchQuery` in the fixture spec, but
    // the wire name (`filter_term`) must still be used in the query
    // string. This test pins that contract end-to-end: invoke with the
    // alias, then assert the mock saw the wire name.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(query_param("filter_term", "alice"))
        .and(query_param("user_type", "managed"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 1,
                "entries": [{"id": OpenApiFixtures::USER_ID, "type": "user", "name": "Alice"}]
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "users",
            "list",
            "--search-query",
            "alice",
            "--user-type",
            "managed",
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("Alice"));
}

/// `x-fern-enum` Tier-2: when the user passes the display alias
/// (`--user-type Managed`, capital M) the executor must still send the
/// canonical **wire** value (`managed`) on the outgoing query string.
///
/// The mock is configured with `query_param("user_type", "managed")`
/// and `expect(1)`, so:
///   - If the CLI forwarded `Managed` (the alias) instead of resolving,
///     the mock would not match → 404 → CLI exits non-zero → test fails.
///   - If the CLI didn't forward the param at all, the `expect(1)` drop
///     guard would fail at test teardown.
#[tokio::test]
async fn test_list_users_fern_enum_display_name_resolves_to_wire_value() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(query_param("user_type", "managed"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 1,
                "entries": [
                    {"id": OpenApiFixtures::USER_ID, "type": "user", "name": "Alice"}
                ]
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list", "--user-type", "Managed"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "CLI should accept the display alias and resolve it to the wire value; stderr: {}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Alice"),
        "expected stub response to be parsed; stdout: {stdout}",
    );
}

#[tokio::test]
async fn test_list_users_sends_x_fern_default_but_not_schema_default() {
    // Tier-2 wire test for the split between `x-fern-default` (client
    // default, sent on the wire) and the OpenAPI standard `default:`
    // (server-side doc hint, NOT sent on the wire).
    //
    // The fixture sets `x-fern-default: all` on `user_type` and a
    // schema `default: 25` on `limit`. Omitting both flags must:
    //   * send `user_type=all` (x-fern-default is the client default)
    //   * NOT send `limit` at all (server applies its own default)
    //
    // `query_param_is_missing` enforces the negative case so a future
    // regression that re-wires schema.default into clap is caught.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(query_param("user_type", "all"))
        .and(query_param_is_missing("limit"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 1,
                "entries": [{"id": OpenApiFixtures::USER_ID, "type": "user", "name": "Alice"}]
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_list_users_user_supplied_flag_overrides_x_fern_default() {
    // When the user provides `--user-type external`, the caller's value
    // must win over the `x-fern-default: all` configured in the spec.
    // clap's `value_source` is `CommandLine` for user-supplied flags and
    // `DefaultValue` only when the user omitted the flag — the executor
    // passes through the user value verbatim.
    //
    // `limit` stays unset on the wire because its only default is the
    // OpenAPI standard `default:`, which is doc-only.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(query_param("user_type", "external"))
        .and(query_param_is_missing("limit"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 0,
                "entries": []
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list", "--user-type", "external"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_list_users_user_supplied_limit_is_still_sent() {
    // Sanity check on the negative-half of the split: even though the
    // schema `default:` does NOT auto-send `limit=25`, an explicit
    // `--limit 5` from the caller must still go through to the server.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(query_param("user_type", "all"))
        .and(query_param("limit", "5"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 0,
                "entries": []
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list", "--limit", "5"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_update_folder_put_with_body() {
    let server = MockServer::start().await;

    Mock::given(method("PUT"))
        .and(path(format!("/folders/{}", OpenApiFixtures::FOLDER_ID)))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({"name": "renamed-folder"})))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "id": OpenApiFixtures::FOLDER_ID,
                "type": "folder",
                "name": "renamed-folder"
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "folders",
            "update",
            "--folder-id",
            OpenApiFixtures::FOLDER_ID,
            "--json",
            r#"{"name":"renamed-folder"}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("renamed-folder"));
}

#[tokio::test]
async fn test_delete_folder_sends_correct_method_and_path() {
    let server = MockServer::start().await;

    Mock::given(method("DELETE"))
        .and(path(format!("/folders/{}", OpenApiFixtures::FOLDER_ID)))
        .and(header_regex("Authorization", "Bearer .+"))
        .respond_with(ResponseTemplate::new(204))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["folders", "delete", "--folder-id", OpenApiFixtures::FOLDER_ID])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_create_user_post_with_body() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({"name": "alice"})))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({
                "id": "user-new",
                "type": "user",
                "name": "alice"
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "create", "--json", r#"{"name":"alice"}"#])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("alice"));
}

// ---------------------------------------------------------------------------
// Tier 2 — deepObject query parameter serialization
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_deep_object_query_param() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/search"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(query_param("filter[status]", "active"))
        .and(query_param("filter[type]", "archived"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "results": []
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "search",
            "query",
            "--filter",
            r#"{"status":"active","type":"archived"}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_deep_object_query_param_nested() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/search"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(query_param("filter[meta][created_at]", "today"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "results": []
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "search",
            "query",
            "--filter",
            r#"{"meta":{"created_at":"today"}}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

// ---------------------------------------------------------------------------
// x-fern-ignore — operations and parameters marked with the extension must
// disappear from the CLI surface entirely.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_x_fern_ignore_operation_is_unreachable_via_clap() {
    // The fixture spec marks `DELETE /users/{user_id}` (method `hardDelete`)
    // with `x-fern-ignore: true`. Clap must reject the invocation as an
    // unrecognized subcommand — never reach the mock server.
    let server = MockServer::start().await;

    // Defensive guard: if the CLI ever did dispatch this, we'd notice. The
    // expect(0) is implicit (no mounted mock matches DELETE), so any HTTP
    // request would 404 and we'd still fail below — but we also assert on
    // the error text below to make the failure mode unambiguous.
    let output = live_cmd(&server)
        .args(["users", "hardDelete", "--user-id", OpenApiFixtures::USER_ID])
        .output()
        .unwrap();

    assert!(
        !output.status.success(),
        "ignored operation must not run; stdout={}, stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("unrecognized subcommand")
            || stderr.contains("invalid subcommand")
            || stderr.contains("error:"),
        "expected clap to reject the ignored op, got stderr: {stderr}"
    );
}

#[tokio::test]
async fn test_x_fern_ignore_non_ignored_sibling_still_works() {
    // The `users` group has both an ignored op (`hardDelete`) and several
    // non-ignored siblings (`list`, `create`, `get`, `getCurrent`). The
    // group itself must still resolve, and the non-ignored siblings must
    // still dispatch correctly.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 1,
                "entries": [{"id": OpenApiFixtures::USER_ID, "type": "user", "name": "Alice"}]
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "non-ignored sibling must still work; stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("Alice"), "sibling response should appear in stdout: {stdout}");
}

#[tokio::test]
async fn test_x_fern_ignore_parameter_is_unreachable_via_clap() {
    // The `users get` operation has a `legacy_flag` query parameter marked
    // `x-fern-ignore: true`. It must not be registered as a CLI flag, so
    // passing `--legacy-flag foo` must be rejected by clap.
    let server = MockServer::start().await;

    let output = live_cmd(&server)
        .args([
            "users",
            "get",
            "--user-id",
            OpenApiFixtures::USER_ID,
            "--legacy-flag",
            "anything",
        ])
        .output()
        .unwrap();

    assert!(
        !output.status.success(),
        "ignored parameter must not be a registered flag; stdout={}, stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("unexpected argument")
            || stderr.contains("unrecognized")
            || stderr.contains("error:"),
        "expected clap to reject the ignored param flag, got stderr: {stderr}"
    );
}

// ---------------------------------------------------------------------------
// x-fern-parameter-name — the alias renames the CLI flag, but the wire
// (query string / header name) must keep the original parameter name.
// This is the inverse of x-fern-ignore: x-fern-ignore drops the surface
// entirely, x-fern-parameter-name *renames* it but is invisible to the
// server. The two tests below pin both halves of that contract.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_x_fern_parameter_name_query_param_uses_wire_name() {
    // The fixture spec aliases `filter_term` (wire) to `searchQuery` on
    // the CLI surface. Invoking `--search-query alice` must produce a
    // request whose query string carries `filter_term=alice`, not
    // `search-query=alice` or `searchQuery=alice` — the alias is purely
    // a CLI-side rename.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        // Wire-name assertion: the renamed flag still serializes as
        // `filter_term` on the wire.
        .and(query_param("filter_term", "alice"))
        // Negative guard: ensure the alias is NOT being sent on the wire
        // under any of the obvious spellings.
        .and(query_param_is_missing("searchQuery"))
        .and(query_param_is_missing("search-query"))
        .and(query_param_is_missing("search_query"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 1,
                "entries": [{"id": OpenApiFixtures::USER_ID, "type": "user", "name": "Alice"}]
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list", "--search-query", "alice"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "wire request via aliased flag should succeed; stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("Alice"), "response should reach stdout: {stdout}");
}

#[tokio::test]
async fn test_x_fern_parameter_name_header_uses_wire_name() {
    // Mirrors the canonical FER-9864 example: the header parameter is
    // wired as `X-Fern-Version` but exposed on the CLI as
    // `--api-version` (kebab of the `apiVersion` alias). The outgoing
    // HTTP request must carry an `X-Fern-Version` header, not an
    // `apiVersion` header — the alias is invisible to the server.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .and(header_regex("Authorization", "Bearer .+"))
        // Wire-name assertion: the header keeps its original name.
        .and(header("X-Fern-Version", "2024-01-01"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 0,
                "entries": []
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list", "--api-version", "2024-01-01"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "aliased header flag should reach the server with the wire-name header; stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

// ---------------------------------------------------------------------------
// Binary-body uploads — wire-level transfer-encoding contract
//
// The CLI accepts `--file <PATH>`, `--file @<PATH>`, or `--file -` (stdin).
// Disk paths must send `Content-Length`; stdin must send `Transfer-Encoding:
// chunked` (no Content-Length). These tests inspect the captured request
// after the fact so absence of a header is a real assertion, not "any regex".
// `header()` (exact match) is used over `header_regex` so the assertion locks
// the wire shape exactly — a future reqwest that appended `; charset=foo`
// would surface here.
// ---------------------------------------------------------------------------

/// Run `files upload` and return the single captured request, asserting that
/// the response was 2xx. Shared by every binary-body test below.
async fn run_upload_and_capture<F>(
    server: &MockServer,
    configure: F,
) -> wiremock::Request
where
    F: FnOnce(Command) -> std::process::Output,
{
    Mock::given(method("POST"))
        .and(path("/files/upload"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(header("content-type", "application/octet-stream"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "upload-ok"})))
        .expect(1)
        .mount(server)
        .await;

    let mut cmd = live_cmd(server);
    cmd.args(["files", "upload"]);
    let output = configure(cmd);
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let mut reqs = server
        .received_requests()
        .await
        .expect("MockServer should record requests");
    assert_eq!(reqs.len(), 1);
    reqs.pop().unwrap()
}

/// Pipe `payload` through stdin to the upload command and wait for completion.
fn run_upload_from_stdin(mut cmd: Command, payload: &[u8]) -> std::process::Output {
    let mut child = cmd
        .args(["--file", "-"])
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .unwrap();
    child
        .stdin
        .as_mut()
        .expect("stdin pipe")
        .write_all(payload)
        .unwrap();
    drop(child.stdin.take()); // close so the CLI sees EOF
    child.wait_with_output().unwrap()
}

#[tokio::test]
async fn test_upload_from_file_sends_content_length_no_chunked() {
    let server = MockServer::start().await;
    let tmp = tempfile::NamedTempFile::new().unwrap();
    let payload = b"hello-world-binary-body";
    std::fs::write(tmp.path(), payload).unwrap();

    let req = run_upload_and_capture(&server, |mut cmd| {
        cmd.arg("--file").arg(tmp.path()).output().unwrap()
    })
    .await;

    let content_length = req
        .headers
        .get("content-length")
        .map(|v| v.to_str().unwrap_or("").to_string());
    assert_eq!(
        content_length.as_deref(),
        Some(payload.len().to_string().as_str()),
        "file uploads must send a Content-Length matching the file size"
    );
    assert!(
        req.headers.get("transfer-encoding").is_none(),
        "file uploads must NOT use chunked transfer encoding"
    );
    assert_eq!(req.body, payload, "body must equal file contents");
}

#[tokio::test]
async fn test_upload_from_at_path_matches_plain_path_wire_shape() {
    // `@<PATH>` is curl-style sugar. It must produce the exact same wire
    // shape as plain `<PATH>` — Content-Length set, no chunked, body = file.
    let server = MockServer::start().await;
    let tmp = tempfile::NamedTempFile::new().unwrap();
    let payload = b"curl-prefixed-path-body";
    std::fs::write(tmp.path(), payload).unwrap();

    let req = run_upload_and_capture(&server, |mut cmd| {
        let arg = format!("@{}", tmp.path().display());
        cmd.args(["--file", &arg]).output().unwrap()
    })
    .await;

    let content_length = req
        .headers
        .get("content-length")
        .map(|v| v.to_str().unwrap_or("").to_string());
    assert_eq!(
        content_length.as_deref(),
        Some(payload.len().to_string().as_str()),
        "@<PATH> uploads must send a Content-Length matching the file size"
    );
    assert!(
        req.headers.get("transfer-encoding").is_none(),
        "@<PATH> uploads must NOT use chunked transfer encoding"
    );
    assert_eq!(req.body, payload, "body must equal file contents");
}

#[tokio::test]
async fn test_upload_from_stdin_sends_chunked_no_content_length() {
    let server = MockServer::start().await;
    let payload = b"streamed-from-stdin-bytes";

    let req = run_upload_and_capture(&server, |cmd| run_upload_from_stdin(cmd, payload)).await;

    assert!(
        req.headers.get("content-length").is_none(),
        "stdin uploads must NOT send Content-Length"
    );
    let transfer_encoding = req
        .headers
        .get("transfer-encoding")
        .map(|v| v.to_str().unwrap_or("").to_string());
    assert_eq!(
        transfer_encoding.as_deref(),
        Some("chunked"),
        "stdin uploads must use Transfer-Encoding: chunked"
    );
    assert_eq!(req.body, payload, "body must equal piped stdin bytes");
}

#[tokio::test]
async fn test_upload_from_empty_stdin_still_uses_chunked() {
    // Zero-byte stdin must still flow through the chunked path — the choice
    // of transfer encoding is driven by "do we know the length up front",
    // not by "is the body non-empty". A regression that special-cased empty
    // stdin (e.g. fell back to Content-Length: 0) would surface here.
    let server = MockServer::start().await;

    let req = run_upload_and_capture(&server, |cmd| run_upload_from_stdin(cmd, b"")).await;

    assert!(
        req.headers.get("content-length").is_none(),
        "empty-stdin uploads must NOT send Content-Length"
    );
    let transfer_encoding = req
        .headers
        .get("transfer-encoding")
        .map(|v| v.to_str().unwrap_or("").to_string());
    assert_eq!(
        transfer_encoding.as_deref(),
        Some("chunked"),
        "empty-stdin uploads must still use Transfer-Encoding: chunked"
    );
    assert!(req.body.is_empty(), "body must be empty");
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_404_exits_nonzero_with_error_detail() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/files/does-not-exist"))
        .respond_with(ResponseTemplate::new(404).set_body_json(json!({
            "type": "error",
            "status": 404,
            "code": "not_found",
            "message": "The resource could not be found."
        })))
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["files", "get", "--file-id", "does-not-exist"])
        .output()
        .unwrap();

    assert!(!output.status.success(), "CLI should exit non-zero on 404");
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("not_found") || stdout.contains("404") || stdout.contains("not found"),
        "error detail should appear in output: {stdout}"
    );
}

#[tokio::test]
async fn test_500_exits_nonzero() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users/me"))
        .respond_with(ResponseTemplate::new(500).set_body_json(json!({
            "type": "error",
            "status": 500,
            "code": "internal_server_error",
            "message": "Internal Server Error"
        })))
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "getCurrent"])
        .output()
        .unwrap();

    assert!(!output.status.success(), "CLI should exit non-zero on 500");
}

#[tokio::test]
async fn test_401_exits_nonzero_with_auth_error() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users/me"))
        .respond_with(ResponseTemplate::new(401).set_body_json(json!({
            "type": "error",
            "status": 401,
            "code": "unauthorized",
            "message": "Authentication failed."
        })))
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "getCurrent"])
        .output()
        .unwrap();

    assert!(!output.status.success(), "CLI should exit non-zero on 401");
}

// ---------------------------------------------------------------------------
// Tier 2 — per-operation `x-fern-pagination`
//
// `/events` declares an explicit cursor-style block:
//   cursor:       $request.next_marker
//   next_cursor:  $response.next_marker
//   results:      $response.entries
//
// This test proves the CLI follows the per-op config rather than the
// document-level heuristic (which keys off `pageToken` / `nextPageToken`).
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_per_op_cursor_pagination_follows_next_marker() {
    let server = MockServer::start().await;

    // First page: served once. wiremock's `up_to_n_times(1)` retires the
    // mock after one match so the second request can't hit it (otherwise
    // the unscoped path matcher would swallow the next_marker request too).
    Mock::given(method("GET"))
        .and(path("/events"))
        .and(header_regex("Authorization", "Bearer .*"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "entries": [
                { "id": "evt-1", "name": "first" },
                { "id": "evt-2", "name": "second" }
            ],
            "next_marker": "marker-page-2"
        })))
        .up_to_n_times(1)
        .expect(1)
        .mount(&server)
        .await;

    // Second page: keyed on the per-op cursor parameter name (`next_marker`),
    // NOT the heuristic `pageToken`. Stub returns final entries and empty
    // next_marker to terminate the loop.
    Mock::given(method("GET"))
        .and(path("/events"))
        .and(query_param("next_marker", "marker-page-2"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "entries": [
                { "id": "evt-3", "name": "third" }
            ],
            "next_marker": ""
        })))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["events", "list", "--page-all"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("evt-1"), "first page should appear: {stdout}");
    assert!(stdout.contains("evt-2"), "first page should appear: {stdout}");
    assert!(
        stdout.contains("evt-3"),
        "second page driven by x-fern-pagination should appear: {stdout}"
    );
}

#[tokio::test]
async fn test_per_op_pagination_respects_no_paginate_flag() {
    let server = MockServer::start().await;

    // First page is served; a second-page mock is registered but is asserted
    // to NEVER be called when `--page-all` is omitted, even though the per-op
    // config is in place and the response includes a next_marker.
    Mock::given(method("GET"))
        .and(path("/events"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "entries": [{ "id": "evt-only", "name": "single" }],
            "next_marker": "would-be-page-2"
        })))
        .expect(1)
        .mount(&server)
        .await;

    Mock::given(method("GET"))
        .and(path("/events"))
        .and(query_param("next_marker", "would-be-page-2"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "entries": [],
            "next_marker": ""
        })))
        .expect(0)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["events", "list"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("evt-only"));
}

// `/audit` declares an explicit offset-style block:
//   offset:  $request.offset
//   results: $response.entries
//   step:    $request.limit
//
// When `step` is wired, the executor gates the next page on whether a
// *full* page came back — matching upstream fern's `items.length >= step`
// check. The caller passes `--limit 10`; the server returns a short page
// of 3 rows. The wire test asserts the executor recognizes the short
// page and stops, issuing exactly one HTTP request (no offset=3 follow-up).
#[tokio::test]
async fn test_per_op_offset_pagination_step_stops_on_short_page() {
    let server = MockServer::start().await;

    // Single request expected. The caller asked for limit=10; the server
    // returns 3 rows. Because `step` is wired, the executor's full-page
    // gate (`3 < 10`) ends pagination — no second request.
    Mock::given(method("GET"))
        .and(path("/audit"))
        .and(query_param("limit", "10"))
        .and(query_param_is_missing("offset"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "entries": [
                { "id": "a-1" },
                { "id": "a-2" },
                { "id": "a-3" }
            ]
        })))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "audit",
            "list",
            "--page-all",
            "--params",
            r#"{"limit": 10}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

// Same `/audit` endpoint, but the server returns a *full* page (limit
// items). The executor advances the offset by `len(items)` (item-index
// semantics) and fetches the next page. Verifies that `step` only gates
// the "did we get a full page?" check — it is never used as the
// increment amount.
#[tokio::test]
async fn test_per_op_offset_pagination_step_continues_on_full_page() {
    let server = MockServer::start().await;

    // First page: 3 items returned for limit=3 → full page → continue.
    Mock::given(method("GET"))
        .and(path("/audit"))
        .and(query_param("limit", "3"))
        .and(query_param_is_missing("offset"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "entries": [
                { "id": "a-1" },
                { "id": "a-2" },
                { "id": "a-3" }
            ]
        })))
        .up_to_n_times(1)
        .expect(1)
        .mount(&server)
        .await;

    // Second page: offset=3 (advance by len(items), not by step), still
    // limit=3. Server returns a short page → stop.
    Mock::given(method("GET"))
        .and(path("/audit"))
        .and(query_param("limit", "3"))
        .and(query_param("offset", "3"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "entries": [
                { "id": "a-4" }
            ]
        })))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "audit",
            "list",
            "--page-all",
            "--params",
            r#"{"limit": 3}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}


// ---------------------------------------------------------------------------
// x-fern-idempotency-headers (FER-9864 P1) — the synthesized
// `--idempotency-key` flag must land as an HTTP `Idempotency-Key` header on
// idempotent ops only.
// ---------------------------------------------------------------------------

/// On `POST /payments` (`x-fern-idempotent: true`), the value passed via
/// `--idempotency-key` is sent as the `Idempotency-Key` HTTP header.
#[tokio::test]
async fn test_idempotent_op_sends_idempotency_header() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/payments"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(header("idempotency-key", "test-idem-key-001"))
        .and(body_json(json!({"amount": 1000, "currency": "USD"})))
        .respond_with(
            ResponseTemplate::new(201)
                .set_body_json(json!({"id": "pay-1", "amount": 1000, "currency": "USD"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "payments",
            "create",
            "--idempotency-key",
            "test-idem-key-001",
            "--json",
            r#"{"amount":1000,"currency":"USD"}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    // Defensive assertion on the captured request — the mock's
    // `header(...)` already matches on `Idempotency-Key`, but reading the
    // header back from the captured request locks the wire shape so a
    // future change that, e.g., started sending it lowercased shows up
    // here unambiguously.
    let reqs = server
        .received_requests()
        .await
        .expect("MockServer should record requests");
    assert_eq!(reqs.len(), 1);
    let sent = reqs[0]
        .headers
        .get("idempotency-key")
        .map(|v| v.to_str().unwrap_or("").to_string());
    assert_eq!(sent.as_deref(), Some("test-idem-key-001"));
}

/// Twin assertion: on the non-idempotent sibling `GET /payments`, the
/// `Idempotency-Key` flag is not surfaced by clap and the header is not
/// sent on the wire even if the user tried to bypass clap. We assert
/// clap rejects the flag with an "unrecognized" error AND that the
/// happy-path invocation produces no `Idempotency-Key` header.
#[tokio::test]
async fn test_non_idempotent_sibling_rejects_flag_and_omits_header() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/payments"))
        .and(header_regex("Authorization", "Bearer .+"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({
                "total_count": 0,
                "entries": []
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    // (1) Clap rejects the flag on the non-idempotent op.
    let reject = live_cmd(&server)
        .args([
            "payments",
            "list",
            "--idempotency-key",
            "should-not-be-accepted",
        ])
        .output()
        .unwrap();
    assert!(
        !reject.status.success(),
        "non-idempotent op must reject --idempotency-key; stdout={} stderr={}",
        String::from_utf8_lossy(&reject.stdout),
        String::from_utf8_lossy(&reject.stderr)
    );
    let reject_err = String::from_utf8_lossy(&reject.stderr);
    assert!(
        reject_err.contains("unexpected argument")
            || reject_err.contains("unrecognized argument")
            || reject_err.contains("unknown argument")
            || reject_err.contains("error:"),
        "expected clap to reject the flag, got: {reject_err}"
    );

    // (2) Happy path: same op without the flag works AND no
    // `Idempotency-Key` header is on the wire.
    let output = live_cmd(&server)
        .args(["payments", "list"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let reqs = server
        .received_requests()
        .await
        .expect("MockServer should record requests");
    assert_eq!(reqs.len(), 1, "exactly one GET /payments");
    assert!(
        reqs[0].headers.get("idempotency-key").is_none(),
        "non-idempotent op must not send Idempotency-Key on the wire",
    );
}

/// `IdempotencyHeader { header: X-Trace-Id, name: trace_id }`
/// materializes as `--trace-id` on the idempotent op, not
/// `--x-trace-id`. The flag value is sent as the `X-Trace-Id` HTTP
/// header on the wire. Exercises the `flag_name_override` path that
/// matches the upstream Fern OpenAPI importer's SDK parameter naming.
#[tokio::test]
async fn test_idempotency_header_name_drives_flag_x_trace_id_is_sent() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/payments"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(header("x-trace-id", "trace-abc-123"))
        .and(body_json(json!({"amount": 500, "currency": "EUR"})))
        .respond_with(
            ResponseTemplate::new(201)
                .set_body_json(json!({"id": "pay-2", "amount": 500, "currency": "EUR"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "payments",
            "create",
            "--trace-id",
            "trace-abc-123",
            "--json",
            r#"{"amount":500,"currency":"EUR"}"#,
        ])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stdout: {} stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    // Sanity check: `--x-trace-id` (the buggy pre-override flag name)
    // is NOT exposed. clap must reject it.
    let reject = live_cmd(&server)
        .args([
            "payments",
            "create",
            "--x-trace-id",
            "trace-abc-123",
            "--json",
            r#"{"amount":500,"currency":"EUR"}"#,
        ])
        .output()
        .unwrap();
    assert!(
        !reject.status.success(),
        "the legacy `--x-trace-id` form must NOT be exposed",
    );
}

// ---------------------------------------------------------------------------
// x-fern-sdk-return-value — operation-level response extraction
//
// The fixture stubs `/reports` to return a `{ data: [...], meta: {...} }`
// envelope. The operation declares `x-fern-sdk-return-value: data`, so by
// default the CLI must print only the `data` array. `--no-extract` is the
// documented escape hatch and must print the full body.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_return_value_extracts_top_level_data_by_default() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["reports", "list"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    // `data` itself isn't a key in the printed JSON anymore — only its
    // contents. The envelope's `meta` block must not leak through.
    assert!(stdout.contains("rpt-1"), "extracted data should appear: {stdout}");
    assert!(stdout.contains("rpt-2"), "extracted data should appear: {stdout}");
    assert!(
        !stdout.contains("\"meta\""),
        "envelope's `meta` must not be printed when return_value extracts `data`: {stdout}",
    );
    assert!(
        !stdout.contains("\"data\""),
        "the `data` key itself must be stripped (only its contents are surfaced): {stdout}",
    );
}

#[tokio::test]
async fn test_return_value_no_extract_prints_full_envelope() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["reports", "list", "--no-extract"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    // Full envelope: both `data` and `meta` must be present.
    assert!(
        stdout.contains("\"data\""),
        "--no-extract should surface the full envelope including `data`: {stdout}",
    );
    assert!(
        stdout.contains("\"meta\""),
        "--no-extract should surface the full envelope including `meta`: {stdout}",
    );
    assert!(stdout.contains("rpt-1"), "items should still be visible: {stdout}");
}

#[tokio::test]
async fn test_return_value_extracts_nested_dot_path() {
    let server = stubbed_server().await;
    let output = live_cmd(&server)
        .args(["reports", "getStats"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("\"value\"") && stdout.contains("42"),
        "nested `result.value` extraction should surface the inner object: {stdout}",
    );
    assert!(
        stdout.contains("\"unit\"") && stdout.contains("reports"),
        "sibling fields of the extracted subobject are preserved: {stdout}",
    );
    assert!(
        !stdout.contains("\"server_time\""),
        "`meta.server_time` lives outside `result` and must not appear: {stdout}",
    );
    assert!(
        !stdout.contains("\"result\""),
        "the `result` wrapper key itself must be stripped: {stdout}",
    );
}

#[tokio::test]
async fn test_return_value_paginated_emits_subvalue_per_page() {
    // Composes `x-fern-sdk-return-value: data` with cursor pagination
    // where `next_cursor: $response.next` lives *outside* the extracted
    // `data` subvalue. Each `--page-all` page must surface only the
    // extracted array, while the continuation cursor is still read from
    // the full envelope. The fixture op declares both extensions.
    let server = MockServer::start().await;

    // Page 1: no cursor on request, returns `next: "page-2"`.
    Mock::given(method("GET"))
        .and(path("/reports/paged"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(wiremock::matchers::query_param_is_missing("cursor"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "data": [
                { "id": "rpt-1", "name": "Q1" },
                { "id": "rpt-2", "name": "Q2" }
            ],
            "next": "page-2"
        })))
        .expect(1)
        .mount(&server)
        .await;

    // Page 2: cursor=page-2 on request, returns no `next` → loop stops.
    Mock::given(method("GET"))
        .and(path("/reports/paged"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(wiremock::matchers::query_param("cursor", "page-2"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "data": [
                { "id": "rpt-3", "name": "Q3" }
            ]
        })))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["reports", "listPaged", "--page-all"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);

    // All three records came through across the two pages.
    assert!(stdout.contains("rpt-1"), "page 1 item missing: {stdout}");
    assert!(stdout.contains("rpt-2"), "page 1 item missing: {stdout}");
    assert!(stdout.contains("rpt-3"), "page 2 item missing: {stdout}");

    // The envelope-level cursor field `next` itself must not be printed
    // — extraction stripped it before emit. If it leaks here, the
    // pagination path was reading the extracted subvalue (broken).
    assert!(
        !stdout.contains("\"next\""),
        "envelope `next` cursor field must not appear in extracted output: {stdout}",
    );
    // And the `data` wrapper key is also stripped per page.
    assert!(
        !stdout.contains("\"data\""),
        "`data` wrapper key must not appear in extracted output: {stdout}",
    );
}

#[tokio::test]
async fn test_return_value_unresolved_path_errors() {
    // Configure the server to return a body that does NOT contain the
    // promised `data` field. The CLI must fail loudly rather than
    // silently printing `null` or the full body.
    let server = MockServer::start().await;
    Mock::given(method("GET"))
        .and(path("/reports"))
        .and(header_regex("Authorization", "Bearer .+"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "unexpected": "shape",
            "meta": {"total": 0}
        })))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["reports", "list"])
        .output()
        .unwrap();
    assert!(
        !output.status.success(),
        "command should fail when return_value path can't be resolved; stdout: {} / stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("'data'"),
        "error should name the missing path: {stderr}",
    );
    // The operationId is set on the fixture op (`reports_list`), so it
    // must appear by name in the error message.
    assert!(
        stderr.contains("reports_list"),
        "error should name the operation id: {stderr}",
    );
    assert!(
        stderr.contains("--no-extract"),
        "error should point users at the --no-extract escape hatch: {stderr}",
    );
}

// ---------------------------------------------------------------------------
// Tier-2 — `x-fern-sdk-variables` substitution on the wire
//
// These tests prove the runtime contract: a value resolved from the global
// `--garden-id` flag (or its `$GARDEN_ID` env-var fallback) must reach the
// outgoing HTTP request as the substituted path segment, with no `{gardenId}`
// placeholder leaking through. Each test mounts an `expect(1)` mock with an
// exact `path()` match — if substitution is wrong, no request matches the
// mock and the assertion drop-time check fails.
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_sdk_variable_cli_flag_substitutes_outgoing_path() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/gardens/my-garden/zones"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!([])))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .env_remove("GARDEN_ID")
        .args(["--garden-id", "my-garden", "zones", "list"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    // `expect(1)` verified on Mock drop.
}

#[tokio::test]
async fn test_sdk_variable_env_var_substitutes_outgoing_path() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/gardens/fromenv/zones"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!([])))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .env("GARDEN_ID", "fromenv")
        .args(["zones", "list"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_sdk_variable_cli_flag_overrides_env_var_outgoing_path() {
    // Resolution order: CLI flag > env var. The wire must see the flag's value
    // (`fromflag`), not the env var's (`fromenv`).
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/gardens/fromflag/zones"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!([])))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .env("GARDEN_ID", "fromenv")
        .args(["--garden-id", "fromflag", "zones", "list"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

#[tokio::test]
async fn test_sdk_variable_missing_aborts_before_request() {
    // No flag, no env var — the CLI must short-circuit with a validation
    // error before any HTTP traffic. `expect(0)` proves nothing hit the wire.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/gardens/{gardenId}/zones"))
        .respond_with(ResponseTemplate::new(200))
        .expect(0)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .env_remove("GARDEN_ID")
        .args(["zones", "list"])
        .output()
        .unwrap();
    assert!(
        !output.status.success(),
        "expected CLI failure when variable is unset; stdout: {} stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("--garden-id") && combined.contains("GARDEN_ID"),
        "error should name both --garden-id and GARDEN_ID: {combined}"
    );
}

// ---------------------------------------------------------------------------
// Tier 2 — x-fern-retries (FER-9864 P2)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_retries_get_recovers_after_transient_5xx() {
    // `users_list` is annotated `x-fern-retries` in the fixture spec.
    // First stub returns 503 once; second stub returns 200. The CLI
    // must transparently retry the GET and surface the 200 response.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .respond_with(ResponseTemplate::new(503))
        .up_to_n_times(1)
        .expect(1)
        .mount(&server)
        .await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!([
            {"id": "user-1", "name": "Ada"}
        ])))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "expected CLI to retry the 503 and surface the 200; stderr: {}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("Ada"), "200 body should appear: {stdout}");
}

#[tokio::test]
async fn test_retries_get_respects_retry_after_numeric_header() {
    // Wire-level check that the executor honors `Retry-After: <secs>`.
    // We can't observe the wall-clock delay deterministically across
    // CI nodes, but the *retry happens* — `expect(1)` then `expect(1)`
    // verifies the CLI did two sends total and consumed the 200.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .respond_with(
            ResponseTemplate::new(429).insert_header("retry-after", "0"),
        )
        .up_to_n_times(1)
        .expect(1)
        .mount(&server)
        .await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!([])))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list"])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "expected CLI to honor Retry-After and surface the 200; stderr: {}",
        String::from_utf8_lossy(&output.stderr),
    );
}

#[tokio::test]
async fn test_retries_post_without_idempotent_does_not_retry() {
    // `users_create` declares `x-fern-retries` but is a POST without
    // `x-fern-idempotent`. Per the FER-9864 P2 per-method policy, the
    // executor must NOT retry — the server may have processed the
    // request and a retry would double-post. We assert `expect(1)`
    // so any retry would fail the test.
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/users"))
        .respond_with(ResponseTemplate::new(503))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "create", "--json", r#"{"name":"Ada"}"#])
        .output()
        .unwrap();

    assert!(
        !output.status.success(),
        "expected POST to surface the 503 without retrying; stdout: {} stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
}

#[tokio::test]
async fn test_retries_no_retry_flag_short_circuits_get_retries() {
    // `--no-retry` is the debug-only opt-out. With it set, even a
    // GET on an op with `x-fern-retries` must NOT retry — the CLI
    // surfaces the first failure for the user to inspect.
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users"))
        .respond_with(ResponseTemplate::new(503))
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args(["users", "list", "--no-retry"])
        .output()
        .unwrap();

    assert!(
        !output.status.success(),
        "expected --no-retry to surface the 503 immediately; stdout: {} stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
}

// ---------------------------------------------------------------------------
// x-fern-global-headers (FER-9864 P2). The fixture spec declares:
//
//   x-fern-global-headers:
//     - header: X-API-Stage
//       name: apiStage
//       env: FIXTURE_API_STAGE
//       default: "production"
//     - header: X-Tenant-Id
//       optional: true
//
// These tests exercise the resolution chain (CLI > env > default), the
// stamping behavior across distinct operations (a global header is by
// definition not tied to one route), and the optional case where the
// header is omitted when no source supplies a value.
// ---------------------------------------------------------------------------

/// Spec-level default ("production") is sent verbatim on `GET /users/me`
/// when neither a flag nor `$FIXTURE_API_STAGE` is provided. Pins the
/// "default wins when nothing else is set" leg of the resolution chain
/// against a real outgoing request.
#[tokio::test]
async fn test_global_header_default_is_sent_on_outgoing_request() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users/me"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(header("X-API-Stage", "production"))
        .respond_with(
            ResponseTemplate::new(200).set_body_json(json!({"id": "me", "name": "Alice"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .env_remove("FIXTURE_API_STAGE")
        .args(["users", "getCurrent"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

/// The CLI flag `--api-stage` wins over the env var, and the env var
/// wins over the spec-level default. Drives the three cases against one
/// mock server to pin precedence end-to-end.
#[tokio::test]
async fn test_global_header_resolution_order_cli_over_env_over_default() {
    let server = MockServer::start().await;

    // Case 1: only the spec default applies → "production" on the wire.
    Mock::given(method("GET"))
        .and(path("/users/me"))
        .and(header("X-API-Stage", "production"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "me"})))
        .expect(1)
        .mount(&server)
        .await;
    let out = live_cmd(&server)
        .env_remove("FIXTURE_API_STAGE")
        .args(["users", "getCurrent"])
        .output()
        .unwrap();
    assert!(out.status.success(), "default case: stderr={}", String::from_utf8_lossy(&out.stderr));

    // Case 2: env wins over default → "staging" on the wire.
    Mock::given(method("GET"))
        .and(path("/users/me"))
        .and(header("X-API-Stage", "staging"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "me"})))
        .expect(1)
        .mount(&server)
        .await;
    let out = live_cmd(&server)
        .env("FIXTURE_API_STAGE", "staging")
        .args(["users", "getCurrent"])
        .output()
        .unwrap();
    assert!(out.status.success(), "env case: stderr={}", String::from_utf8_lossy(&out.stderr));

    // Case 3: CLI flag wins over both env and default → "canary".
    Mock::given(method("GET"))
        .and(path("/users/me"))
        .and(header("X-API-Stage", "canary"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "me"})))
        .expect(1)
        .mount(&server)
        .await;
    let out = live_cmd(&server)
        .env("FIXTURE_API_STAGE", "staging")
        .args(["users", "getCurrent", "--api-stage", "canary"])
        .output()
        .unwrap();
    assert!(out.status.success(), "cli case: stderr={}", String::from_utf8_lossy(&out.stderr));
}

/// "Global" means stamped on every operation, not just one. Issue two
/// different operations in a single test run (a GET on `users` and a
/// POST on `payments`) and verify both carry the same global header.
/// Without the global-header registration, the second mock would 404
/// because no `X-API-Stage` matcher would hit.
#[tokio::test]
async fn test_global_header_is_stamped_on_multiple_operations() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users/me"))
        .and(header("X-API-Stage", "canary"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "me"})))
        .expect(1)
        .mount(&server)
        .await;
    Mock::given(method("POST"))
        .and(path("/payments"))
        .and(header("X-API-Stage", "canary"))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({"id": "pay-1", "amount": 1, "currency": "USD"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let get_out = live_cmd(&server)
        .args(["users", "getCurrent", "--api-stage", "canary"])
        .output()
        .unwrap();
    assert!(
        get_out.status.success(),
        "users.getCurrent stderr: {}",
        String::from_utf8_lossy(&get_out.stderr)
    );
    let post_out = live_cmd(&server)
        .args([
            "payments",
            "create",
            "--api-stage",
            "canary",
            "--idempotency-key",
            "k-1",
            "--json",
            r#"{"amount":1,"currency":"USD"}"#,
        ])
        .output()
        .unwrap();
    assert!(
        post_out.status.success(),
        "payments.create stderr: {}",
        String::from_utf8_lossy(&post_out.stderr)
    );
}

/// An optional global header with no env, no default, and no flag is
/// not stamped on the outgoing request. Verifies the negative case: the
/// stub does not match on `X-Tenant-Id` and the absence of the header
/// is pinned via the captured request after the mock has fired.
#[tokio::test]
async fn test_optional_global_header_omitted_when_not_supplied() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users/me"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "me"})))
        .expect(1)
        .mount(&server)
        .await;

    let out = live_cmd(&server)
        .env_remove("FIXTURE_API_STAGE")
        .args(["users", "getCurrent"])
        .output()
        .unwrap();
    assert!(out.status.success(), "stderr: {}", String::from_utf8_lossy(&out.stderr));

    let reqs = server.received_requests().await.expect("requests recorded");
    assert_eq!(reqs.len(), 1, "exactly one outgoing request");
    assert!(
        reqs[0].headers.get("X-Tenant-Id").is_none(),
        "optional global header with no source must NOT be sent on the wire"
    );
}

/// When the user supplies `--tenant-id` (derived from `name: tenantId`
/// on the optional `X-Tenant-Id` entry), the header lands on the wire
/// under its original wire-name. Companion to the omitted-when-not-supplied
/// test above; pins the `name:` → kebab-cased flag mapping.
#[tokio::test]
async fn test_optional_global_header_sent_when_flag_supplied() {
    let server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/users/me"))
        .and(header("X-Tenant-Id", "tenant-42"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({"id": "me"})))
        .expect(1)
        .mount(&server)
        .await;

    let out = live_cmd(&server)
        .args(["users", "getCurrent", "--tenant-id", "tenant-42"])
        .output()
        .unwrap();
    assert!(out.status.success(), "stderr: {}", String::from_utf8_lossy(&out.stderr));
}

/// Passing `--api-stage ""` (empty/whitespace-only) must NOT silently
/// stamp `X-API-Stage:` on the wire — `resolve_global_header_value`
/// trims and treats empty values as "no value supplied", which then
/// triggers the required-header validation error. Pins the fix for
/// the self-review finding noted in PR #45.
#[tokio::test]
async fn test_empty_flag_value_errors_for_required_global_header() {
    let server = MockServer::start().await;
    // No mock registered — the request should never reach the wire.

    let out = live_cmd(&server)
        .env_remove("FIXTURE_API_STAGE")
        .args(["users", "getCurrent", "--api-stage", "   "])
        .output()
        .unwrap();
    assert!(
        !out.status.success(),
        "empty `--api-stage` must error, got success: {}",
        String::from_utf8_lossy(&out.stdout)
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("Missing required global header 'X-API-Stage'"),
        "expected required-header error, got: {stderr}"
    );
}

// ---------------------------------------------------------------------------
// Per-field body flags — proves the parser exposes inline-schema body fields
// as individual flags AND that the executor type-coerces and routes them to
// the JSON body (not the query string).
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_create_thing_with_per_field_body_flags() {
    let server = MockServer::start().await;

    // Mock asserts the EXACT outgoing body shape: scalars are typed (integer,
    // boolean), array fields use repeated flags, nested object is decoded from
    // its JSON-string flag value.
    Mock::given(method("POST"))
        .and(path("/things"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({
            "name": "widget",
            "count": 7,
            "is_active": true,
            "tags": ["red", "blue"],
            "metadata": { "owner": "alice" }
        })))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({
                "id": "thing-1",
                "name": "widget"
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "things",
            "create",
            "--name",
            "widget",
            "--count",
            "7",
            "--is-active",
            "true",
            "--tags",
            "red",
            "--tags",
            "blue",
            "--metadata",
            r#"{"owner":"alice"}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("thing-1"));
}

#[tokio::test]
async fn test_json_flag_overrides_per_field_body_flags() {
    // When both per-field flags and `--json` are provided, the `--json` keys
    // win on overlap — mirrors how `--params` overrides individual flags.
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/things"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(
            json!({ "name": "from-json-wins", "count": 99 }),
        ))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({
                "id": "thing-2",
                "name": "from-json-wins"
            })),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "things",
            "create",
            "--name",
            "from-flag-loses",
            "--count",
            "99",
            "--json",
            r#"{"name":"from-json-wins"}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("thing-2"));
}

// ---------------------------------------------------------------------------
// FER-10435: nested body props as dot-notation flags + repeated array flags
// ---------------------------------------------------------------------------

/// Tier-2: dot-notation flags reconstruct nested JSON.
/// --name.first Abraham --name.last Lincoln → {"name":{"first":"Abraham","last":"Lincoln"}}
#[tokio::test]
async fn test_nested_body_flags_reconstruct_nested_json() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/persons"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({
            "name": {"first": "Abraham", "last": "Lincoln"},
            "role": "president"
        })))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({"id": "person-1"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "persons",
            "create",
            "--name.first",
            "Abraham",
            "--name.last",
            "Lincoln",
            "--role",
            "president",
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("person-1"));
}

/// Tier-2: repeated array flags accumulate into a JSON array.
/// --tag admin --tag reviewer → {"tag":["admin","reviewer"]}
#[tokio::test]
async fn test_repeated_array_flags_accumulate() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/articles"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({
            "title": "Hello World",
            "tag": ["admin", "reviewer"]
        })))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({"id": "article-1"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "articles",
            "create",
            "--title",
            "Hello World",
            "--tag",
            "admin",
            "--tag",
            "reviewer",
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("article-1"));
}

/// Tier-2: $ref request body is resolved from components/schemas and its
/// properties are flattened as per-field flags.
/// --label Sprocket --priority 5 → {"label":"Sprocket","priority":5}
#[tokio::test]
async fn test_ref_body_properties_flattened_as_flags() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/widgets"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({
            "label": "Sprocket",
            "priority": 5
        })))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({"id": "widget-1"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "widgets",
            "create",
            "--label",
            "Sprocket",
            "--priority",
            "5",
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("widget-1"));
}

/// Tier-2: $ref property within an inline body schema is resolved and its fields
/// surface as dot-notation flags.
/// --address.city SF --address.zip 94105 → {"address":{"city":"SF","zip":"94105"}}
#[tokio::test]
async fn test_ref_property_within_inline_schema_flattened_as_dot_notation_flags() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/orders"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({
            "note": "rush",
            "address": {"city": "SF", "zip": "94105"}
        })))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({"id": "order-1"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    let output = live_cmd(&server)
        .args([
            "orders",
            "create",
            "--note",
            "rush",
            "--address.city",
            "SF",
            "--address.zip",
            "94105",
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("order-1"));
}

/// Tier-2: --json overrides per-field flags when keys overlap on a nested-body endpoint.
/// --name.first flag value is overridden by --json that provides a different name object.
#[tokio::test]
async fn test_json_overrides_nested_body_flags() {
    let server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/persons"))
        .and(header_regex("Authorization", "Bearer .+"))
        .and(body_json(json!({
            "name": {"first": "George", "last": "Washington"},
            "role": "general"
        })))
        .respond_with(
            ResponseTemplate::new(201).set_body_json(json!({"id": "person-2"})),
        )
        .expect(1)
        .mount(&server)
        .await;

    // --name.first "Abraham" is overridden by --json which provides the whole name object
    let output = live_cmd(&server)
        .args([
            "persons",
            "create",
            "--name.first",
            "Abraham",
            "--role",
            "general",
            "--json",
            r#"{"name":{"first":"George","last":"Washington"}}"#,
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("person-2"));
}
