use std::process::Command;

fn fixture_cmd() -> Command {
    Command::new(env!("CARGO_BIN_EXE_openapi-fixture"))
}

// ---------------------------------------------------------------------------
// Wire-style integration tests (wiremock)
//
// Each test spins up an ephemeral mock HTTP server, points the CLI at it via
// OPENAPI_FIXTURE_BASE_URL, and verifies both the outgoing request shape and how the
// CLI handles the response.
// ---------------------------------------------------------------------------

#[cfg(test)]
mod wire {
    use super::fixture_cmd;
    use serde_json::json;
    use std::process::Command;
    use wiremock::matchers::{body_json, method, path, query_param};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    fn live_cmd(server: &MockServer) -> Command {
        let mut cmd = fixture_cmd();
        cmd.env("OPENAPI_FIXTURE_BASE_URL", server.uri())
            .env("OPENAPI_FIXTURE_API_KEY", "test-token");
        cmd
    }

    // --- GET with path params ---

    #[tokio::test]
    async fn test_get_file_by_id_request_and_response() {
        let server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/files/abc123"))
            .respond_with(
                ResponseTemplate::new(200).set_body_json(json!({
                    "id": "abc123",
                    "type": "file",
                    "name": "quarterly-report.pdf"
                })),
            )
            .expect(1)
            .mount(&server)
            .await;

        let output = live_cmd(&server)
            .args(["files", "get", "--file-id", "abc123"])
            .output()
            .unwrap();

        assert!(
            output.status.success(),
            "stderr: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("abc123"), "response id should appear in output");
        assert!(stdout.contains("quarterly-report.pdf"), "response name should appear in output");
        // wiremock verifies expect(1) on drop
    }

    #[tokio::test]
    async fn test_get_current_user() {
        let server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/users/me"))
            .respond_with(
                ResponseTemplate::new(200).set_body_json(json!({
                    "id": "u-999",
                    "type": "user",
                    "name": "Dan Shipper",
                    "login": "dan@example.com"
                })),
            )
            .expect(1)
            .mount(&server)
            .await;

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
        assert!(stdout.contains("Dan Shipper"));
        assert!(stdout.contains("dan@example.com"));
    }

    // --- POST with body ---

    #[tokio::test]
    async fn test_create_folder_sends_body() {
        let server = MockServer::start().await;

        Mock::given(method("POST"))
            .and(path("/folders"))
            .and(body_json(json!({
                "name": "my-test-folder",
                "parent": { "id": "0" }
            })))
            .respond_with(
                ResponseTemplate::new(201).set_body_json(json!({
                    "id": "folder-456",
                    "type": "folder",
                    "name": "my-test-folder"
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
                r#"{"name":"my-test-folder","parent":{"id":"0"}}"#,
            ])
            .output()
            .unwrap();

        assert!(
            output.status.success(),
            "stderr: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("folder-456"));
        assert!(stdout.contains("my-test-folder"));
    }

    // --- Query params ---

    #[tokio::test]
    async fn test_list_users_query_param_forwarded() {
        let server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/users"))
            .and(query_param("filter_term", "alice"))
            .respond_with(
                ResponseTemplate::new(200).set_body_json(json!({
                    "total_count": 1,
                    "entries": [{ "id": "u1", "type": "user", "name": "Alice Smith" }]
                })),
            )
            .expect(1)
            .mount(&server)
            .await;

        // The fixture aliases `filter_term` to `searchQuery` via
        // `x-fern-parameter-name`, so the CLI flag is `--search-query`
        // even though the wire param is still `filter_term`.
        let output = live_cmd(&server)
            .args(["users", "list", "--search-query", "alice"])
            .output()
            .unwrap();

        assert!(
            output.status.success(),
            "stderr: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("Alice Smith"));
    }

    // --- Error responses ---

    #[tokio::test]
    async fn test_404_exits_nonzero_with_error_details() {
        let server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/files/does-not-exist"))
            .respond_with(ResponseTemplate::new(404).set_body_json(json!({
                "error": {
                    "code": 404,
                    "message": "Item not found",
                    "errors": [{ "reason": "notFound" }]
                }
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
            stdout.contains("notFound") || stdout.contains("not found") || stdout.contains("404"),
            "error reason should appear in output, got: {stdout}"
        );
    }

    #[tokio::test]
    async fn test_500_exits_nonzero() {
        let server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/users/me"))
            .respond_with(ResponseTemplate::new(500).set_body_json(json!({
                "error": {
                    "code": 500,
                    "message": "Internal Server Error",
                    "errors": [{ "reason": "internalError" }]
                }
            })))
            .mount(&server)
            .await;

        let output = live_cmd(&server)
            .args(["users", "getCurrent"])
            .output()
            .unwrap();

        assert!(!output.status.success(), "CLI should exit non-zero on 500");
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(
            stdout.contains("500") || stdout.contains("internalError"),
            "error code should appear in output, got: {stdout}"
        );
    }

    // --- Pagination ---

    #[tokio::test]
    async fn test_page_all_follows_next_page_token() {
        let server = MockServer::start().await;

        // Page 1: no marker in query → return entries + nextPageToken
        Mock::given(method("GET"))
            .and(path("/users"))
            .respond_with(
                ResponseTemplate::new(200).set_body_json(json!({
                    "total_count": 2,
                    "entries": [{ "id": "u1", "type": "user", "name": "Alice" }],
                    "nextPageToken": "cursor-page-2"
                })),
            )
            .up_to_n_times(1)
            .mount(&server)
            .await;

        // Page 2: cursor present → return final entries, no token
        Mock::given(method("GET"))
            .and(path("/users"))
            .and(query_param("pageToken", "cursor-page-2"))
            .respond_with(
                ResponseTemplate::new(200).set_body_json(json!({
                    "total_count": 2,
                    "entries": [{ "id": "u2", "type": "user", "name": "Bob" }]
                })),
            )
            .up_to_n_times(1)
            .mount(&server)
            .await;

        let output = live_cmd(&server)
            .args(["users", "list", "--page-all"])
            .output()
            .unwrap();

        assert!(
            output.status.success(),
            "stderr: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("Alice"), "first page results should appear");
        assert!(stdout.contains("Bob"), "second page results should appear");
    }
}

// ---------------------------------------------------------------------------
// Help / command-registration tests
// ---------------------------------------------------------------------------

#[test]
fn test_help_shows_all_groups() {
    let output = fixture_cmd().arg("--help").output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let combined = format!("{stdout}{stderr}");

    for group in ["files", "folders", "users"] {
        assert!(combined.contains(group), "Missing group: {group}");
    }
}

#[test]
fn test_files_help_shows_methods() {
    let output = fixture_cmd()
        .args(["files", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    let expected = ["get", "update", "delete", "copy", "getThumbnail"];
    for method in expected {
        assert!(combined.contains(method), "Missing method: {method}");
    }
}

#[test]
fn test_users_help_shows_methods() {
    let output = fixture_cmd()
        .args(["users", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(combined.contains("getCurrent"));
    assert!(combined.contains("list"));
    assert!(combined.contains("get"));
    assert!(combined.contains("create"));
}

// ---------------------------------------------------------------------------
// x-fern-groups (FER-9864 P3) — document-root metadata that re-labels
// group subcommands in `--help`. The fixture's `x-fern-groups` block
// annotates `users` and `files` (one with description, one without) and
// intentionally omits `events` so the missing-metadata fallback is also
// exercised end-to-end against the built binary.
// ---------------------------------------------------------------------------

#[test]
fn test_x_fern_groups_summary_appears_in_root_help() {
    // The root `--help` lists each top-level subcommand next to its
    // `about()` line. With `x-fern-groups.users.summary` set to
    // `Users Operations`, that label must replace the legacy
    // `Operations on 'users'` fallback.
    let output = fixture_cmd().arg("--help").output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("Users Operations"),
        "`x-fern-groups.users.summary` should surface in root --help, got:\n{combined}",
    );
    assert!(
        combined.contains("Files Operations"),
        "`x-fern-groups.files.summary` should surface in root --help, got:\n{combined}",
    );
    // The legacy fallback label for annotated groups must NOT appear —
    // the summary is supposed to replace it.
    assert!(
        !combined.contains("Operations on 'users'"),
        "legacy `Operations on 'users'` label should be replaced by the `x-fern-groups` summary, \
         got:\n{combined}",
    );
}

#[test]
fn test_x_fern_groups_summary_appears_in_short_group_help() {
    // `users -h` (short help) renders the `about()` line at the top.
    // clap's contract: `-h` prefers `about`, `--help` prefers
    // `long_about` whenever both are set. Picking `-h` here keeps the
    // assertion focused on the `summary` surface specifically.
    let output = fixture_cmd().args(["users", "-h"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("Users Operations"),
        "`users -h` should show the `x-fern-groups` summary, got:\n{combined}",
    );
}

#[test]
fn test_x_fern_groups_description_appears_in_long_help() {
    // `users --help` (long help) prefers the `long_about` line set
    // from `x-fern-groups.users.description`. The short `summary` is
    // suppressed by clap in long help when `long_about` is set; this
    // mirrors the contract `-h` ↔ `about`, `--help` ↔ `long_about`.
    let output = fixture_cmd().args(["users", "--help"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("Manage users"),
        "`users --help` should render the `x-fern-groups` description, got:\n{combined}",
    );
}

#[test]
fn test_x_fern_groups_summary_appears_when_description_absent() {
    // `files` has `summary` but no `description` in `x-fern-groups`.
    // Both `files -h` and `files --help` should fall back to the
    // `summary` (since clap falls back to `about` whenever
    // `long_about` is unset). Asserts the description-optional
    // pathway end-to-end.
    let output = fixture_cmd().args(["files", "--help"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("Files Operations"),
        "`files --help` should fall back to the `x-fern-groups` summary when no description is set, \
         got:\n{combined}",
    );
}

#[test]
fn test_x_fern_groups_missing_entry_falls_back_to_default_label() {
    // The fixture omits `events` from `x-fern-groups`. The group must
    // still appear in `--help` with the legacy `Operations on
    // 'events'` label — confirming the runtime survives a one-sided
    // `x-fern-sdk-group-name` ↔ `x-fern-groups` configuration without
    // crashing and without leaking placeholders.
    let output = fixture_cmd().args(["events", "--help"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        output.status.success(),
        "`events --help` must succeed even without a matching x-fern-groups entry: \
         status={:?}, output=\n{combined}",
        output.status,
    );
    assert!(
        combined.contains("Operations on 'events'"),
        "`events --help` should keep the legacy fallback label, got:\n{combined}",
    );
}

#[test]
fn test_users_help_does_not_list_x_fern_ignore_op() {
    // The fixture spec marks `DELETE /users/{user_id}` (method `hardDelete`)
    // with `x-fern-ignore: true`. It must not be listed under `users --help`.
    let output = fixture_cmd()
        .args(["users", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        !combined.contains("hardDelete"),
        "ignored op `hardDelete` should not appear in `users --help`: {combined}"
    );
}

#[test]
fn test_users_list_help_shows_x_fern_parameter_name_alias() {
    // The fixture spec aliases the `filter_term` query param to
    // `searchQuery` and the `X-Fern-Version` header to `version` via
    // `x-fern-parameter-name`. The CLI `--help` for `users list` must
    // surface the aliased (kebab-cased) flag names, and must NOT show
    // the original wire-name flags. The wire names are still mentioned
    // in the help description so users can correlate the flag with the
    // upstream API doc / `--params` JSON.
    let output = fixture_cmd()
        .args(["users", "list", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    // Aliased flag names appear on the CLI surface.
    assert!(
        combined.contains("--search-query"),
        "aliased flag `--search-query` (filter_term → searchQuery) should be listed: {combined}"
    );
    assert!(
        combined.contains("--api-version"),
        "aliased flag `--api-version` (X-Fern-Version → apiVersion) should be listed: {combined}"
    );

    // The original wire-name flags must NOT be present on the CLI: an
    // un-aliased fallback would have produced `--filter-term` or
    // `--x-fern-version` (kebab of the wire names).
    assert!(
        !combined.contains("--filter-term"),
        "original wire-name flag `--filter-term` should not appear once aliased: {combined}"
    );
    assert!(
        !combined.contains("--x-fern-version"),
        "original wire-name flag `--x-fern-version` should not appear once aliased: {combined}"
    );

    // The original wire name is surfaced in the help description so
    // operators can still find the underlying API parameter.
    assert!(
        combined.contains("filter_term"),
        "help description should mention wire name `filter_term`: {combined}"
    );
    assert!(
        combined.contains("X-Fern-Version"),
        "help description should mention wire name `X-Fern-Version`: {combined}"
    );
}

#[test]
fn test_users_get_help_does_not_list_x_fern_ignore_param() {
    // `users get` has a `legacy_flag` parameter marked `x-fern-ignore: true`.
    // It must not appear as a CLI flag in the operation's `--help` output.
    let output = fixture_cmd()
        .args(["users", "get", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        !combined.contains("legacy-flag") && !combined.contains("legacy_flag"),
        "ignored parameter should not appear in `users get --help`: {combined}"
    );
    // Sanity: the non-ignored required `--user-id` flag still appears.
    assert!(
        combined.contains("user-id"),
        "non-ignored `--user-id` flag should still be listed: {combined}"
    );
}

// ---------------------------------------------------------------------------
// x-fern-global-headers (FER-9864 P2) — `--api-stage` registered globally
// with an env-var fallback, surfaced in root help only.
// ---------------------------------------------------------------------------

#[test]
fn test_global_header_flag_appears_in_root_help_with_env_hint() {
    // `x-fern-global-headers` on the fixture spec declares:
    //   - X-API-Stage (name: apiStage, env: FIXTURE_API_STAGE, default: production)
    //   - X-Tenant-Id (name: tenantId, optional, no env, no default)
    // Root `--help` must surface both flags with the env / default hints.
    let output = fixture_cmd().arg("--help").output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        combined.contains("--api-stage"),
        "global header flag `--api-stage` (from name: apiStage) must appear in root help: {combined}"
    );
    assert!(
        combined.contains("FIXTURE_API_STAGE"),
        "env-var fallback must be surfaced in root help: {combined}"
    );
    assert!(
        combined.contains("--tenant-id"),
        "optional global header `--tenant-id` (from name: tenantId) must appear in root help: {combined}"
    );
    // Help section column alignment: the two flag prefixes must share
    // a common column for the help text. Pin the alignment so we don't
    // regress back to the ragged layout that prompted the fix.
    let api_stage_col = combined
        .lines()
        .find(|l| l.contains("--api-stage "))
        .and_then(|l| l.find("Global header"))
        .expect("--api-stage row must be in help");
    let tenant_id_col = combined
        .lines()
        .find(|l| l.contains("--tenant-id "))
        .and_then(|l| l.find("Global header"))
        .expect("--tenant-id row must be in help");
    assert_eq!(
        api_stage_col, tenant_id_col,
        "global-header help rows must be column-aligned (found api-stage@{api_stage_col}, tenant-id@{tenant_id_col})"
    );
}

#[test]
fn test_global_header_flag_is_not_listed_on_per_operation_help() {
    // Per the FER-9864 spec, global headers are root-level constructor
    // flags; surfacing them on every per-op `--help` is noise. The flag
    // is still parseable on operations (it's `.global(true)`), but the
    // help renderer must omit it from the per-op flag list.
    let output = fixture_cmd()
        .args(["users", "getCurrent", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        !combined.contains("--api-stage"),
        "global header `--api-stage` must NOT be listed on per-op help: {combined}"
    );
    assert!(
        !combined.contains("--tenant-id"),
        "global header `--tenant-id` must NOT be listed on per-op help: {combined}"
    );
}

#[test]
fn test_global_header_default_drives_dry_run_when_flag_and_env_absent() {
    // No `--api-stage`, no `$FIXTURE_API_STAGE` → the spec-baked
    // default ("production") satisfies the required-header check and
    // shows up nowhere visible to the user, but the command succeeds.
    // The dry-run output proves we got past validation.
    let output = fixture_cmd()
        .args(["users", "getCurrent", "--dry-run"])
        .env_remove("FIXTURE_API_STAGE")
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "default value should satisfy required global header. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("\"dry_run\": true"));
}

#[test]
fn test_folders_help_shows_methods() {
    let output = fixture_cmd()
        .args(["folders", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    let expected = ["get", "update", "delete", "listItems", "create", "copy"];
    for method in expected {
        assert!(combined.contains(method), "Missing method: {method}");
    }
}

// ---------------------------------------------------------------------------
// Dry-run tests
// ---------------------------------------------------------------------------

#[test]
fn test_dry_run_get_current_user() {
    let output = fixture_cmd()
        .args(["users", "getCurrent", "--dry-run"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("\"dry_run\": true"));
    assert!(stdout.contains("/users/me"));
    assert!(stdout.contains("\"method\": \"GET\""));
}

#[test]
fn test_dry_run_with_path_params() {
    let output = fixture_cmd()
        .args([
            "files",
            "get",
            "--params",
            r#"{"file_id":"test-file-123"}"#,
            "--dry-run",
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("\"dry_run\": true"));
    assert!(stdout.contains("test-file-123") || stdout.contains("test%2Dfile%2D123"));
    assert!(stdout.contains("\"method\": \"GET\""));
}

#[test]
fn test_dry_run_list_with_query_params() {
    let output = fixture_cmd()
        .args([
            "users",
            "list",
            "--params",
            r#"{"filter_term":"alice"}"#,
            "--dry-run",
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("\"dry_run\": true"));
    assert!(stdout.contains("/users"));
    assert!(stdout.contains("query_params"));
}

#[test]
fn test_dry_run_post_with_body() {
    let output = fixture_cmd()
        .args([
            "folders",
            "create",
            "--json",
            r#"{"name":"my-folder","parent":{"id":"0"}}"#,
            "--dry-run",
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("\"method\": \"POST\""));
    assert!(stdout.contains("\"dry_run\": true"));
}

// ---------------------------------------------------------------------------
// Typed flags tests
// ---------------------------------------------------------------------------

#[test]
fn test_dry_run_with_individual_flags() {
    let output = fixture_cmd()
        .args(["files", "get", "--file-id", "test-file-123", "--dry-run"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("\"dry_run\": true"));
    assert!(stdout.contains("\"method\": \"GET\""));
    assert!(
        stdout.contains("test-file-123") || stdout.contains("test%2Dfile%2D123"),
        "URL should contain the file_id"
    );
}

#[test]
fn test_dry_run_flags_with_enum_value() {
    let output = fixture_cmd()
        .args([
            "users",
            "list",
            "--user-type",
            "managed",
            "--dry-run",
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("managed"));
}

#[test]
fn test_params_override_wins_over_flags() {
    let output = fixture_cmd()
        .args([
            "files",
            "get",
            "--file-id",
            "from-flag",
            "--params",
            r#"{"file_id":"from-json"}"#,
            "--dry-run",
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("from-json") || stdout.contains("from%2Djson"),
        "--params should override individual flags"
    );
}

#[test]
fn test_help_shows_parameter_flags() {
    let output = fixture_cmd()
        .args(["files", "get", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(combined.contains("--file-id"), "Help should show --file-id flag");
}

#[test]
fn test_list_method_shows_query_flags() {
    let output = fixture_cmd()
        .args(["users", "list", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    // `filter_term` is exposed via the `x-fern-parameter-name` alias
    // `searchQuery`, so the kebab-cased CLI flag is `--search-query`.
    assert!(combined.contains("--search-query"), "Should show --search-query flag (alias of filter_term)");
    assert!(combined.contains("--user-type"), "Should show --user-type flag");
    assert!(combined.contains("--limit"), "Should show --limit flag");
}

/// `x-fern-enum` end-to-end: long `--help` on `users list` (whose
/// `user_type` parameter declares per-value `name`/`description`
/// overrides in the fixture spec) must surface those descriptions
/// next to each value. This is the user-visible side of FER-9864.
#[test]
fn test_users_list_help_shows_per_value_enum_descriptions() {
    let output = fixture_cmd()
        .args(["users", "list", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );

    for description in [
        "Every user, including external collaborators.",
        "Users your enterprise manages.",
        "External collaborators only.",
    ] {
        assert!(
            combined.contains(description),
            "expected per-value description {description:?} in `users list --help`, got:\n{combined}",
        );
    }

    for display in ["All", "Managed", "External"] {
        assert!(
            combined.contains(display),
            "expected display name {display:?} in `users list --help`, got:\n{combined}",
        );
    }
}

#[test]
fn test_help_renders_default_for_both_x_fern_default_and_schema_default() {
    // The fixture's `users list` defines two defaults:
    //   * `user_type` carries `x-fern-default: all` (client-side, sent
    //     on the wire when the flag is omitted). clap renders this as
    //     `[default: all]` because we wire it into `Arg::default_value`.
    //   * `limit` carries the OpenAPI standard `default: 25` (doc-only,
    //     server applies its own default). We append `[default: 25]` to
    //     the flag's help text so the user sees the same shape — the
    //     help surface intentionally does not distinguish where the
    //     default comes from.
    //
    // The client/server distinction is enforced by the wire tests, not
    // by the rendered help text. Here we only check that both defaults
    // are advertised to the user.
    let output = fixture_cmd()
        .args(["users", "list", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        combined.contains("[default: all]"),
        "x-fern-default value should appear as `[default: all]` in help: {combined}"
    );
    assert!(
        combined.contains("[default: 25]"),
        "schema `default:` should also appear as `[default: 25]` in help: {combined}"
    );
}


// ---------------------------------------------------------------------------
// Error / edge-case tests
// ---------------------------------------------------------------------------

#[test]
fn test_unknown_group_errors() {
    let output = fixture_cmd()
        .args(["nonexistent-group"])
        .output()
        .unwrap();
    assert!(!output.status.success());
}

#[test]
fn test_version_flag() {
    let output = fixture_cmd().args(["--version"]).output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("openapi-fixture"));
}

// ---------------------------------------------------------------------------
// --base-url / OPENAPI_FIXTURE_BASE_URL tests
// ---------------------------------------------------------------------------

#[test]
fn test_base_url_flag_overrides_spec_url() {
    let output = fixture_cmd()
        .args(["--base-url", "http://localhost:9999", "users", "getCurrent", "--dry-run"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("http://localhost:9999/"), "expected override URL in output, got: {stdout}");
    assert!(!stdout.contains("http://localhost:9999//"), "double slash must not appear: {stdout}");
    assert!(!stdout.contains("api.fixture.example"), "spec base URL should not appear when overridden");
}

#[test]
fn test_base_url_env_var_overrides_spec_url() {
    let output = fixture_cmd()
        .env("OPENAPI_FIXTURE_BASE_URL", "http://localhost:9998")
        .args(["users", "getCurrent", "--dry-run"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("http://localhost:9998"), "expected env var URL in output, got: {stdout}");
    assert!(!stdout.contains("api.fixture.example"), "spec base URL should not appear when env var is set");
}

#[test]
fn test_base_url_flag_takes_priority_over_env_var() {
    let output = fixture_cmd()
        .env("OPENAPI_FIXTURE_BASE_URL", "http://localhost:9998")
        .args(["--base-url", "http://localhost:9999", "users", "getCurrent", "--dry-run"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("http://localhost:9999"), "flag should win over env var");
    assert!(!stdout.contains("http://localhost:9998"), "env var URL should not appear when flag is set");
}

#[test]
fn test_base_url_flag_rejects_control_characters() {
    // Use \x01 (SOH) — a control char that is_control() catches but that the OS
    // will pass through as an argument (unlike \x00 which the OS rejects before exec).
    let output = fixture_cmd()
        .args(["--base-url", "http://localhost:9999\x01evil", "users", "getCurrent", "--dry-run"])
        .output()
        .unwrap();
    assert!(!output.status.success(), "control character in --base-url should be rejected");
}

#[test]
fn test_base_url_flag_rejects_crlf() {
    let output = fixture_cmd()
        .args(["--base-url", "http://localhost:9999\r\nevil", "users", "getCurrent", "--dry-run"])
        .output()
        .unwrap();
    assert!(!output.status.success(), "CRLF in --base-url should be rejected");
}

// ---------------------------------------------------------------------------
// JSON help output tests (--help --format json)
// ---------------------------------------------------------------------------

#[test]
fn test_json_help_root_returns_operation_list() {
    let output = fixture_cmd()
        .args(["--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    let root: serde_json::Value = serde_json::from_str(&stdout).expect("output should be valid JSON");
    // The root JSON help is a bare array for specs without any
    // `x-fern-sdk-variables`, and an object `{ sdkVariables, operations }`
    // when at least one variable is declared. Extract the operations list
    // from either shape so this test keeps validating the per-operation
    // schema regardless of whether the fixture grows variables later.
    let ops = root
        .as_array()
        .cloned()
        .or_else(|| {
            root.as_object()
                .and_then(|obj| obj.get("operations").and_then(|v| v.as_array()).cloned())
        })
        .expect("root JSON help should be an array or { sdkVariables, operations } object");
    assert!(!ops.is_empty(), "should return at least one operation");
    for op in &ops {
        assert!(op["operation"].is_string(), "each entry needs 'operation'");
        assert!(op["httpMethod"].is_string(), "each entry needs 'httpMethod'");
        assert!(op["path"].is_string(), "each entry needs 'path'");
    }
}

#[test]
fn test_json_help_resource_returns_filtered_list() {
    let output = fixture_cmd()
        .args(["users", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    let ops: serde_json::Value = serde_json::from_str(&stdout).expect("output should be valid JSON");
    let arr = ops.as_array().expect("resource JSON help should be an array");
    assert!(!arr.is_empty());
    for op in arr {
        let operation = op["operation"].as_str().unwrap();
        assert!(
            operation.starts_with("users."),
            "all operations should be under 'users': {operation}"
        );
    }
}

#[test]
fn test_json_help_method_returns_schema() {
    let output = fixture_cmd()
        .args(["users", "get", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    let schema: serde_json::Value =
        serde_json::from_str(&stdout).expect("output should be valid JSON");
    assert!(schema["operation"].is_string());
    assert!(schema["httpMethod"].is_string());
    assert!(schema["path"].is_string());
    assert_eq!(schema["parameters"]["type"], "object");
    assert!(schema["parameters"]["properties"].is_object());
    assert!(schema["parameters"]["required"].is_array());
}

#[test]
fn test_json_help_shows_required_params() {
    let output = fixture_cmd()
        .args(["users", "get", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    let schema: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    let required = schema["parameters"]["required"].as_array().unwrap();
    assert!(
        required.iter().any(|v| v == "user_id"),
        "user_id should be in required: {required:?}"
    );
}

#[test]
fn test_json_help_shows_param_location() {
    let output = fixture_cmd()
        .args(["users", "get", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    let schema: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    let props = &schema["parameters"]["properties"];
    assert_eq!(
        props["user_id"]["location"], "path",
        "user_id should be a path param"
    );
}

#[test]
fn test_json_help_short_flag_and_equals_form() {
    let output = fixture_cmd()
        .args(["users", "-h", "--format=json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str::<serde_json::Value>(&stdout)
        .expect("-h --format=json should also emit valid JSON");
}

#[test]
fn test_json_help_unknown_resource_errors() {
    let output = fixture_cmd()
        .args(["nonexistent", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(!output.status.success(), "unknown resource should fail");
}

#[test]
fn test_prose_help_still_works_after_change() {
    let output = fixture_cmd().args(["--help"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        combined.contains("users"),
        "prose --help should still list resource groups"
    );
    assert!(
        !combined.contains("\"httpMethod\""),
        "prose --help should not contain JSON fields"
    );
}

// ---------------------------------------------------------------------------
// x-fern-availability — badges in --help output and non-filtering of
// deprecated operations. Anchored to the `experiments` group in
// `cli/openapi-fixture/openapi.json`.
// ---------------------------------------------------------------------------

#[test]
fn test_help_shows_beta_badge() {
    let output = fixture_cmd().args(["experiments", "--help"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        combined.contains("[BETA]"),
        "experiments --help should show [BETA] badge:\n{combined}"
    );
}

#[test]
fn test_help_shows_pre_release_badge() {
    let output = fixture_cmd().args(["experiments", "--help"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        combined.contains("[PRE-RELEASE]"),
        "experiments --help should show [PRE-RELEASE] badge:\n{combined}"
    );
}

#[test]
fn test_help_shows_deprecated_badge_from_extension() {
    let output = fixture_cmd().args(["experiments", "--help"]).output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    // The deprecated-op carries `x-fern-availability: deprecated`.
    assert!(
        combined.contains("[DEPRECATED]"),
        "experiments --help should show [DEPRECATED] badge for x-fern-availability:deprecated:\n{combined}"
    );
}

#[test]
fn test_help_shows_deprecated_badge_from_openapi_deprecated_flag() {
    // openapi-deprecated-op uses the standard OpenAPI `deprecated: true`
    // flag instead of the extension; it should still surface as
    // [DEPRECATED] in help. We check the per-command page to avoid
    // collision with the extension-based badge in the prior test.
    let output = fixture_cmd()
        .args(["experiments", "openapi-deprecated-op", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        combined.contains("[DEPRECATED]"),
        "OpenAPI deprecated:true should also yield [DEPRECATED] badge:\n{combined}"
    );
}

#[test]
fn test_help_omits_badge_for_generally_available() {
    let output = fixture_cmd()
        .args(["experiments", "ga-op", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        !combined.contains("[BETA]")
            && !combined.contains("[PRE-RELEASE]")
            && !combined.contains("[DEPRECATED]"),
        "ga-op help should carry no availability badge:\n{combined}"
    );
    // Sanity: the GA summary itself is still rendered.
    assert!(
        combined.contains("Generally-available"),
        "ga-op summary should still render:\n{combined}"
    );
}

#[test]
fn test_help_shows_parameter_level_badge() {
    let output = fixture_cmd()
        .args(["experiments", "deprecated-op", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    // The --legacy-flag parameter is marked beta — its description should
    // pick up [BETA] even though the parent operation is [DEPRECATED].
    let legacy_line = combined
        .lines()
        .find(|l| l.contains("--legacy-flag"))
        .unwrap_or_else(|| panic!("--legacy-flag should appear in help:\n{combined}"));
    assert!(
        legacy_line.contains("[BETA]"),
        "--legacy-flag should carry [BETA] badge: {legacy_line}"
    );
}

#[test]
fn test_json_help_includes_availability_for_operation() {
    let output = fixture_cmd()
        .args(["experiments", "deprecated-op", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let v: serde_json::Value =
        serde_json::from_slice(&output.stdout).expect("JSON help should parse");
    assert_eq!(
        v.get("availability").and_then(|x| x.as_str()),
        Some("deprecated"),
        "operation JSON help should expose availability field: {v}",
    );
    // Parameter-level availability surfaces inside parameters.properties.
    let avail = v
        .pointer("/parameters/properties/legacy_flag/availability")
        .and_then(|x| x.as_str());
    assert_eq!(
        avail,
        Some("beta"),
        "parameter JSON help should expose availability field: {v}",
    );
}

#[test]
fn test_json_help_omits_availability_for_generally_available() {
    let output = fixture_cmd()
        .args(["experiments", "ga-op", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let v: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    // generally-available IS surfaced as a value in JSON help (useful for
    // tooling) — what we do NOT do is render a badge in prose help.
    assert_eq!(
        v.get("availability").and_then(|x| x.as_str()),
        Some("generally-available"),
        "ga-op JSON help should still carry availability=generally-available: {v}",
    );
}

#[test]
fn test_deprecated_operation_remains_callable() {
    // Default behavior is badge-only; deprecated ops MUST still be invokable.
    // --dry-run exercises the full clap parse + executor path without sending
    // an HTTP request.
    let output = fixture_cmd()
        .args(["experiments", "deprecated-op", "--dry-run"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "deprecated op should still be callable; stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("/experiments/deprecated"),
        "dry-run should print the operation path:\n{stdout}"
    );
}

// ---------------------------------------------------------------------------
// x-fern-sdk-variables — global flag surface
//
// These tests exercise the spec-level `x-fern-sdk-variables` extension and the
// per-parameter `x-fern-sdk-variable` reference. The openapi-fixture spec
// declares:
//
//     x-fern-sdk-variables:
//       gardenId:
//         type: string
//         description: The garden tenant identifier used to scope all zone operations.
//
//     /gardens/{gardenId}/zones:
//       get:
//         parameters:
//           - name: gardenId
//             in: path
//             required: true
//             x-fern-sdk-variable: gardenId
//
// The CLI must (a) expose `--garden-id` as a global root flag with `$GARDEN_ID`
// fallback, (b) hide the variable-bound path param from per-operation flags,
// and (c) error with a message naming both forms if neither is set when an
// operation that needs the variable runs.
// ---------------------------------------------------------------------------

#[test]
fn test_sdk_variable_appears_in_root_help_with_description_and_env() {
    let output = fixture_cmd().arg("--help").output().unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("--garden-id"),
        "global --garden-id flag should appear in root --help: {combined}"
    );
    assert!(
        combined.contains("GARDEN_ID"),
        "env-var fallback GARDEN_ID should appear in root --help: {combined}"
    );
    assert!(
        combined.contains("garden tenant identifier"),
        "variable description should surface in root --help: {combined}"
    );
}

#[test]
fn test_sdk_variable_is_not_per_operation_positional_in_help() {
    // The `gardenId` path parameter is variable-bound and must not surface as
    // a per-operation `--garden-id` flag on `zones list`. (The same flag still
    // appears via the global propagation, but it must NOT be re-registered at
    // the leaf — that would be a per-op duplicate.)
    let output = fixture_cmd()
        .args(["zones", "list", "--help"])
        .output()
        .unwrap();
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    // The Usage line must NOT prompt for a per-op `--garden-id <STRING>`.
    let usage_line = combined
        .lines()
        .find(|l| l.trim_start().starts_with("Usage:"))
        .unwrap_or("");
    assert!(
        !usage_line.contains("--garden-id <STRING>"),
        "variable-bound param should not appear as a per-op positional in Usage: {usage_line}"
    );
}

#[test]
fn test_sdk_variable_missing_emits_validation_error_naming_both_forms() {
    // No --garden-id flag, no $GARDEN_ID env var. --dry-run forces the
    // executor path so we get a validation error rather than a real HTTP
    // call. The error message must mention both the CLI flag and the env
    // var so users know either form is acceptable.
    let output = fixture_cmd()
        .env_remove("GARDEN_ID")
        .args(["zones", "list", "--dry-run"])
        .output()
        .unwrap();
    assert!(
        !output.status.success(),
        "missing variable should fail: stdout: {} stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("--garden-id"),
        "error should name the --garden-id CLI flag: {combined}"
    );
    assert!(
        combined.contains("GARDEN_ID"),
        "error should name the GARDEN_ID env var: {combined}"
    );
}

#[test]
fn test_sdk_variable_cli_flag_substitutes_path() {
    // --garden-id at the root flows through the global flag layer and is
    // substituted into the path template at request time. --dry-run prints
    // the URL the CLI would call.
    let output = fixture_cmd()
        .env_remove("GARDEN_ID")
        .args(["--garden-id", "my-garden", "zones", "list", "--dry-run"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("/gardens/my-garden/zones"),
        "variable should be substituted into URL path: {stdout}"
    );
    assert!(
        !stdout.contains("{gardenId}"),
        "literal placeholder should not remain in URL: {stdout}"
    );
}

#[test]
fn test_sdk_variable_env_var_substitutes_path_when_flag_absent() {
    // No --garden-id flag, but $GARDEN_ID is set. clap's .env() binding
    // surfaces the env value as the flag's resolved value, which then
    // substitutes into the path template.
    let output = fixture_cmd()
        .env("GARDEN_ID", "fromenv")
        .args(["zones", "list", "--dry-run"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("/gardens/fromenv/zones"),
        "env var should substitute when flag is absent: {stdout}"
    );
}

#[test]
fn test_sdk_variable_cli_flag_wins_over_env_var() {
    // Both --garden-id and $GARDEN_ID are set. Resolution order says the
    // CLI flag wins.
    let output = fixture_cmd()
        .env("GARDEN_ID", "fromenv")
        .args(["--garden-id", "fromflag", "zones", "list", "--dry-run"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("/gardens/fromflag/zones"),
        "CLI flag value should win over env var: {stdout}"
    );
    assert!(
        !stdout.contains("fromenv"),
        "env var value should not leak when flag is present: {stdout}"
    );
}

#[test]
fn test_sdk_variable_params_json_can_supply_variable_bound_value() {
    // `--params` is documented as "overrides individual flags" and must
    // also be allowed to supply variable-bound path parameters when the
    // global flag and env var are both unset — otherwise it's a regression
    // of the contract for plain path params.
    let output = fixture_cmd()
        .env_remove("GARDEN_ID")
        .args([
            "zones",
            "list",
            "--params",
            r#"{"gardenId":"fromparams"}"#,
            "--dry-run",
        ])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("/gardens/fromparams/zones"),
        "--params value should substitute into URL: {stdout}"
    );
}

#[test]
fn test_sdk_variable_params_json_value_wins_over_global_flag() {
    // Resolution within the params map: `--params` overrides individual
    // flags. Variable-bound globals fill in first, then `--params` JSON
    // applies on top, so a `--params` value for the same key wins.
    let output = fixture_cmd()
        .env_remove("GARDEN_ID")
        .args([
            "--garden-id",
            "fromflag",
            "zones",
            "list",
            "--params",
            r#"{"gardenId":"fromparams"}"#,
            "--dry-run",
        ])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("/gardens/fromparams/zones"),
        "--params value should win over global flag for the same key: {stdout}"
    );
}

#[test]
fn test_sdk_variable_json_help_annotates_variable_bound_param_for_agents() {
    // The JSON help (`--help --format json`) is the machine-readable
    // contract LLM agents introspect. For a variable-bound path
    // parameter, the per-op schema must:
    //   1. NOT include the param in `required` (no per-op flag exists)
    //   2. Annotate it with `binding: "sdk-variable"` plus the resolved
    //      global flag and env var so the agent knows how to supply it.
    let output = fixture_cmd()
        .args(["zones", "list", "--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    let schema: serde_json::Value = serde_json::from_str(&stdout)
        .unwrap_or_else(|e| panic!("expected valid JSON: {e}; got: {stdout}"));

    let required = schema["parameters"]["required"].as_array().unwrap();
    assert!(
        !required.iter().any(|v| v == "gardenId"),
        "variable-bound param must not appear in `required`, got: {required:?}"
    );
    let garden = &schema["parameters"]["properties"]["gardenId"];
    assert_eq!(garden["binding"], "sdk-variable");
    assert_eq!(garden["variable"], "gardenId");
    assert_eq!(garden["globalFlag"], "--garden-id");
    assert_eq!(garden["envVar"], "GARDEN_ID");
}

#[test]
fn test_sdk_variable_root_json_help_exposes_sdk_variables_section() {
    // At the spec root, the JSON help must list the declared SDK
    // variables so an agent can discover the root-level globals without
    // scanning every operation. Wrapped format only kicks in when at
    // least one variable is declared.
    let output = fixture_cmd()
        .args(["--help", "--format", "json"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    let root: serde_json::Value = serde_json::from_str(&stdout)
        .unwrap_or_else(|e| panic!("expected valid JSON: {e}; got: {stdout}"));

    let vars = root["sdkVariables"]
        .as_array()
        .expect("root JSON help should expose sdkVariables when declared");
    let garden = vars
        .iter()
        .find(|v| v["name"] == "gardenId")
        .expect("gardenId variable should be listed in sdkVariables");
    assert_eq!(garden["type"], "string");
    assert_eq!(garden["globalFlag"], "--garden-id");
    assert_eq!(garden["envVar"], "GARDEN_ID");
    assert!(
        root["operations"].is_array(),
        "operations array should still be present alongside sdkVariables"
    );
}

// ---------------------------------------------------------------------------
// Shell completion tests
// ---------------------------------------------------------------------------

#[test]
fn test_completion_bash_exits_zero_and_contains_known_subcommand() {
    let output = fixture_cmd()
        .args(["completion", "bash"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture completion bash` failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("_openapi-fixture"),
        "bash completion should reference the binary name"
    );
    assert!(
        stdout.contains("files"),
        "bash completion should include 'files' subcommand from fixture spec"
    );
}

#[test]
fn test_completion_zsh_exits_zero_and_contains_known_subcommand() {
    let output = fixture_cmd()
        .args(["completion", "zsh"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture completion zsh` failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("#compdef openapi-fixture"),
        "zsh completion should contain compdef header"
    );
    assert!(
        stdout.contains("files"),
        "zsh completion should include 'files' subcommand from fixture spec"
    );
}

#[test]
fn test_completion_fish_exits_zero() {
    let output = fixture_cmd()
        .args(["completion", "fish"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture completion fish` failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("complete"),
        "fish completion should contain fish completion directives"
    );
}

#[test]
fn test_completion_powershell_exits_zero() {
    let output = fixture_cmd()
        .args(["completion", "powershell"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture completion powershell` failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        !stdout.is_empty(),
        "powershell completion output should not be empty"
    );
}

#[test]
fn test_completion_invalid_shell_exits_nonzero() {
    let output = fixture_cmd()
        .args(["completion", "invalid"])
        .output()
        .unwrap();
    assert!(
        !output.status.success(),
        "`openapi-fixture completion invalid` should exit non-zero"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("invalid shell") && stderr.contains("Expected one of"),
        "`openapi-fixture completion invalid` should print a diagnostic on stderr, got:\n{stderr}"
    );
}

#[test]
fn test_completion_no_shell_shows_help_exits_zero() {
    let output = fixture_cmd()
        .args(["completion"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture completion` (no shell) should exit 0"
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("completion") || stdout.contains("Usage"),
        "`openapi-fixture completion` should show help on stdout, got:\n{stdout}"
    );
}

#[test]
fn test_completion_appears_in_help() {
    let output = fixture_cmd().arg("--help").output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("completion"),
        "`--help` should list the completion subcommand"
    );
}

#[test]
fn test_completion_bash_includes_global_flags() {
    let output = fixture_cmd()
        .args(["completion", "bash"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "completion bash failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("garden-id"),
        "bash completion should include --garden-id from x-fern-sdk-variables"
    );
    assert!(
        stdout.contains("api-stage"),
        "bash completion should include --api-stage from x-fern-global-headers"
    );
    assert!(
        stdout.contains("base-url"),
        "bash completion should include --base-url built-in flag"
    );
}

#[test]
fn test_completion_zsh_includes_global_flags() {
    let output = fixture_cmd()
        .args(["completion", "zsh"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "completion zsh failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("garden-id"),
        "zsh completion should include --garden-id from x-fern-sdk-variables"
    );
    assert!(
        stdout.contains("api-stage"),
        "zsh completion should include --api-stage from x-fern-global-headers"
    );
}

#[test]
fn test_completion_fish_includes_global_flags() {
    let output = fixture_cmd()
        .args(["completion", "fish"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "completion fish failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("garden-id"),
        "fish completion should include --garden-id from x-fern-sdk-variables"
    );
    assert!(
        stdout.contains("api-stage"),
        "fish completion should include --api-stage from x-fern-global-headers"
    );
}

#[test]
fn test_completion_with_boolean_flag_prefix() {
    // --dry-run is a boolean flag and must NOT swallow "completion" as
    // its value. Regression test for the wants_completion heuristic.
    let output = fixture_cmd()
        .args(["--dry-run", "completion", "bash"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture --dry-run completion bash` should succeed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("_openapi-fixture"),
        "bash completion with --dry-run prefix should still produce a completion script"
    );
}

// ---------------------------------------------------------------------------
// Man page tests
// ---------------------------------------------------------------------------

#[test]
fn test_man_outputs_roff_exits_zero() {
    let output = fixture_cmd().args(["man"]).output().unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture man` failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains(".TH"),
        "man page should contain a .TH title-header macro"
    );
    assert!(
        stdout.contains("OPENAPI-FIXTURE") || stdout.contains("openapi-fixture"),
        "man page should contain the binary name (upper or lower case)"
    );
    assert!(
        stdout.contains(".SH NAME"),
        "man page should contain a .SH NAME section"
    );
}

#[test]
fn test_man_help_shows_install_snippet() {
    let output = fixture_cmd().args(["man", "--help"]).output().unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture man --help` failed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
    assert!(
        combined.contains("EXAMPLES"),
        "man --help should show EXAMPLES section"
    );
    assert!(
        combined.contains("groff"),
        "man --help should mention groff in the install snippet"
    );
}

#[test]
fn test_man_with_dry_run_flag_does_not_dispatch() {
    // --dry-run is a boolean flag and must NOT swallow "man" as its
    // value. Regression test mirroring the completion boolean-flag test.
    let output = fixture_cmd()
        .args(["--dry-run", "man"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "`openapi-fixture --dry-run man` should succeed:\n{}",
        String::from_utf8_lossy(&output.stderr),
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains(".TH"),
        "man page with --dry-run prefix should still produce roff output"
    );
}

#[test]
fn test_man_appears_in_help() {
    let output = fixture_cmd().arg("--help").output().unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("man"),
        "`--help` should list the man subcommand"
    );
}
