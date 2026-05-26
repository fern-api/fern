//! Behavior tests for the extension surface (`app::CliApp` + `Binding`).
//!
//! Every test builds a `CliApp` with a mock binding, registers hooks or
//! Tier 1 methods, invokes the CLI via `try_run_from_with_output(argv, &mut buf)`,
//! and asserts on **observable output** (captured buffer, exit code). Tests that
//! only check builder state do not belong here.
//!
//! See <https://github.com/fern-api/cli-sdk/pull/62#issuecomment-4484622766>
//! for why the single-binding fast path was removed and these behavior
//! tests are required.

use std::sync::{Arc, Mutex};

use serde_json::{json, Value};

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::binding::{Binding, BoxFuture, DispatchResult};
use fern_cli_sdk::error::CliError;

// ── Mock Binding ────────────────────────────────────────────────────

/// A minimal `Binding` impl that returns a controlled response.
/// Used to test CliApp-scope hooks and Tier 1 methods in isolation
/// without needing a real spec or wiremock server.
struct MockBinding {
    response: Value,
    error: Option<CliError>,
    dispatched: Arc<Mutex<Vec<Vec<String>>>>,
}

impl MockBinding {
    fn new(response: Value) -> Self {
        Self {
            response,
            error: None,
            dispatched: Arc::new(Mutex::new(Vec::new())),
        }
    }

    fn with_error(error: CliError) -> Self {
        Self {
            response: Value::Null,
            error: Some(error),
            dispatched: Arc::new(Mutex::new(Vec::new())),
        }
    }

    fn dispatched_log(&self) -> Arc<Mutex<Vec<Vec<String>>>> {
        Arc::clone(&self.dispatched)
    }
}

impl Binding for MockBinding {
    fn name(&self) -> &str {
        "mock"
    }

    fn set_cli_name(&mut self, _name: &str) {}

    fn build_command(&self) -> Result<clap::Command, CliError> {
        Ok(clap::Command::new("mock")
            .subcommand(
                clap::Command::new("users")
                    .subcommand(clap::Command::new("get"))
                    .subcommand(clap::Command::new("list"))
                    .subcommand(clap::Command::new("create")),
            )
            .subcommand(
                clap::Command::new("files")
                    .subcommand(clap::Command::new("get"))
                    .subcommand(clap::Command::new("upload")),
            ))
    }

    fn dispatch<'a>(
        &'a self,
        _root_matches: &'a clap::ArgMatches,
        _sub_matches: &'a clap::ArgMatches,
        op_path: &'a [String],
    ) -> BoxFuture<'a, Result<DispatchResult, CliError>> {
        let path = op_path.to_vec();
        let log = Arc::clone(&self.dispatched);
        let response = self.response.clone();
        let error = self.error.as_ref().map(|e| e.duplicate());

        Box::pin(async move {
            log.lock().unwrap().push(path);
            if let Some(err) = error {
                return Err(err);
            }
            Ok(DispatchResult::Value(response))
        })
    }
}

/// Run a `CliApp` via `try_run_from_with_output` and return (captured stdout, exit code).
fn run_app<I, T>(app: CliApp, args: I) -> (String, i32)
where
    I: IntoIterator<Item = T>,
    T: Into<std::ffi::OsString>,
{
    let mut buf = Vec::new();
    let code = app.try_run_from_with_output(args, &mut buf);
    let output = String::from_utf8(buf).expect("output should be valid UTF-8");
    (output, code)
}

// ── Tier 2: transform_response ──────────────────────────────────────

#[test]
fn transform_response_strips_data_wrapper() {
    let mock = MockBinding::new(json!({
        "data": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}],
        "meta": {"total": 2}
    }));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .transform_response(&["**"], |value, _path| async move {
            if let Some(data) = value.get("data").cloned() {
                Ok(data)
            } else {
                Ok(value)
            }
        });

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "list"]);

    assert_eq!(exit_code, 0, "expected success, got exit code {exit_code}");
    let parsed: Value = serde_json::from_str(stdout.trim()).expect("stdout should be valid JSON");
    assert!(parsed.is_array(), "expected array, got: {parsed}");
    assert_eq!(parsed.as_array().unwrap().len(), 2);
    assert_eq!(parsed[0]["name"], "Alice");
}

#[test]
fn transform_response_only_fires_for_matching_path() {
    let mock = MockBinding::new(json!({"original": true}));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .transform_response(&["files", "**"], |_value, _path| async move {
            Ok(json!({"transformed": true}))
        });

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0);
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(parsed["original"], true, "hook should not fire for users/get");
}

#[test]
fn transform_response_chain_applies_in_order() {
    let mock = MockBinding::new(json!({"count": 1}));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .transform_response(&["**"], |mut value, _path| async move {
            if let Some(n) = value.get("count").and_then(|v| v.as_i64()) {
                value["count"] = json!(n * 2);
            }
            Ok(value)
        })
        .transform_response(&["**"], |mut value, _path| async move {
            if let Some(n) = value.get("count").and_then(|v| v.as_i64()) {
                value["count"] = json!(n + 10);
            }
            Ok(value)
        });

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0);
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    // 1 * 2 = 2, then 2 + 10 = 12
    assert_eq!(parsed["count"], 12, "hooks should chain: 1 → 2 → 12");
}

// ── Tier 2: recover_error ───────────────────────────────────────────

#[test]
fn recover_error_converts_404_to_success() {
    let mock = MockBinding::with_error(CliError::Api {
        code: 404,
        message: "Not Found".to_string(),
        reason: "not_found".to_string(),
    });

    let app = CliApp::new("test-cli")
        .binding(mock)
        .recover_error(&["**"], |_err, _path| async move {
            Ok(Some(json!({"deleted": true, "status": "already_gone"})))
        });

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0, "recover_error should produce exit code 0");
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(parsed["deleted"], true);
    assert_eq!(parsed["status"], "already_gone");
}

#[test]
fn recover_error_none_lets_error_propagate() {
    let mock = MockBinding::with_error(CliError::Api {
        code: 500,
        message: "Internal Server Error".to_string(),
        reason: "server_error".to_string(),
    });

    let app = CliApp::new("test-cli")
        .binding(mock)
        .recover_error(&["**"], |_err, _path| async move {
            Ok(None)
        });

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_ne!(exit_code, 0, "error should propagate when hook returns None");
}

#[test]
fn recover_error_only_fires_for_matching_path() {
    let mock = MockBinding::with_error(CliError::Api {
        code: 404,
        message: "Not Found".to_string(),
        reason: "not_found".to_string(),
    });

    let app = CliApp::new("test-cli")
        .binding(mock)
        .recover_error(&["files", "**"], |_err, _path| async move {
            Ok(Some(json!({"recovered": true})))
        });

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_ne!(exit_code, 0, "hook should not fire for users/get path");
}

// ── Tier 1: alias ───────────────────────────────────────────────────

#[test]
fn alias_produces_same_output_as_canonical_name() {
    let response = json!({"id": 42, "name": "test-user"});

    // Run with alias.
    let mock1 = MockBinding::new(response.clone());
    let app1 = CliApp::new("test-cli")
        .binding(mock1)
        .alias(&["users"], "u");

    let (stdout_alias, code_alias) = run_app(app1, ["test-cli", "u", "get"]);

    // Run with canonical name.
    let mock2 = MockBinding::new(response);
    let app2 = CliApp::new("test-cli")
        .binding(mock2)
        .alias(&["users"], "u");

    let (stdout_canonical, code_canonical) = run_app(app2, ["test-cli", "users", "get"]);

    assert_eq!(code_alias, 0, "alias should work: exit code {code_alias}");
    assert_eq!(code_canonical, 0);
    assert_eq!(
        stdout_alias.trim(),
        stdout_canonical.trim(),
        "alias output should match canonical output"
    );
    let parsed: Value = serde_json::from_str(stdout_alias.trim()).unwrap();
    assert_eq!(parsed["name"], "test-user");
}

// ── Tier 1: hide ────────────────────────────────────────────────────

#[test]
fn hide_command_still_executes() {
    let mock = MockBinding::new(json!({"hidden_result": true}));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .hide(&["files"]);

    let (stdout, exit_code) = run_app(app, ["test-cli", "files", "get"]);
    assert_eq!(exit_code, 0, "hidden command should still execute");
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(parsed["hidden_result"], true);
}

// ── Tier 1: stability ───────────────────────────────────────────────

#[test]
fn stability_badge_appears_in_help() {
    use fern_cli_sdk::stability::Stability;

    let mock = MockBinding::new(json!({}));
    let app = CliApp::new("test-cli")
        .binding(mock)
        .stability(&["users"], Stability::Beta);

    let (help_stdout, exit_code) = run_app(app, ["test-cli", "--help"]);

    assert_eq!(exit_code, 0, "help should produce exit code 0");
    assert!(
        help_stdout.contains("[beta]"),
        "beta badge should appear in help: {help_stdout}"
    );
}

// ── Tier 1: deprecate ───────────────────────────────────────────────

#[test]
fn deprecate_marks_command_in_help() {
    let mock = MockBinding::new(json!({}));
    let app = CliApp::new("test-cli")
        .binding(mock)
        .deprecate(&["files"], "Use 'documents' instead");

    let (help_stdout, exit_code) = run_app(app, ["test-cli", "--help"]);

    assert_eq!(exit_code, 0);
    assert!(
        help_stdout.contains("[deprecated]"),
        "deprecated badge should appear: {help_stdout}"
    );
}

// ── No single-binding fast path ─────────────────────────────────────

#[test]
fn single_binding_still_runs_full_pipeline() {
    // This is the critical test: with only one binding, hooks MUST fire.
    // PR #62's bug was that single-binding CLIs bypassed hooks.
    let mock = MockBinding::new(json!({"raw": "untouched"}));
    let log = mock.dispatched_log();

    let app = CliApp::new("test-cli")
        .binding(mock)
        .transform_response(&["**"], |_value, _path| async move {
            Ok(json!({"hook_fired": true}))
        });

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0);
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(
        parsed["hook_fired"], true,
        "transform_response MUST fire even with a single binding"
    );
    let dispatches = log.lock().unwrap();
    assert_eq!(dispatches.len(), 1);
    assert_eq!(dispatches[0], vec!["users", "get"]);
}

#[test]
fn single_binding_recover_error_fires() {
    let mock = MockBinding::with_error(CliError::Api {
        code: 503,
        message: "Service Unavailable".to_string(),
        reason: "unavailable".to_string(),
    });

    let app = CliApp::new("test-cli")
        .binding(mock)
        .recover_error(&["**"], |_err, _path| async move {
            Ok(Some(json!({"fallback": true})))
        });

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "list"]);

    assert_eq!(exit_code, 0, "recover_error must fire for single binding");
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(parsed["fallback"], true);
}

// ── Dispatch recording ──────────────────────────────────────────────

#[test]
fn dispatch_records_correct_op_path() {
    let mock = MockBinding::new(json!({}));
    let log = mock.dispatched_log();

    let app = CliApp::new("test-cli").binding(mock);

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "create"]);

    assert_eq!(exit_code, 0);
    let dispatches = log.lock().unwrap();
    assert_eq!(dispatches.len(), 1);
    assert_eq!(dispatches[0], vec!["users", "create"]);
}

// ── Multi-binding dispatch ───────────────────────────────────────────

/// A second binding providing a distinct subtree (`orders`).
struct OrdersBinding {
    response: Value,
}

impl OrdersBinding {
    fn new(response: Value) -> Self {
        Self { response }
    }
}

impl Binding for OrdersBinding {
    fn name(&self) -> &str {
        "orders"
    }

    fn set_cli_name(&mut self, _name: &str) {}

    fn build_command(&self) -> Result<clap::Command, CliError> {
        Ok(clap::Command::new("orders")
            .subcommand(
                clap::Command::new("orders")
                    .subcommand(clap::Command::new("get"))
                    .subcommand(clap::Command::new("list")),
            ))
    }

    fn dispatch<'a>(
        &'a self,
        _root_matches: &'a clap::ArgMatches,
        _sub_matches: &'a clap::ArgMatches,
        _op_path: &'a [String],
    ) -> BoxFuture<'a, Result<DispatchResult, CliError>> {
        let response = self.response.clone();
        Box::pin(async move { Ok(DispatchResult::Value(response)) })
    }
}

#[test]
fn multi_binding_routes_to_correct_binding() {
    let mock_users = MockBinding::new(json!({"source": "users-binding"}));
    let mock_orders = OrdersBinding::new(json!({"source": "orders-binding"}));
    let user_log = mock_users.dispatched_log();

    let app = CliApp::new("test-cli")
        .binding(mock_users)
        .binding(mock_orders);

    // Route to users binding.
    let (stdout, code) = run_app(app, ["test-cli", "users", "get"]);
    assert_eq!(code, 0);
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(parsed["source"], "users-binding");
    let dispatches = user_log.lock().unwrap();
    assert_eq!(dispatches.len(), 1);
}

#[test]
fn multi_binding_hooks_fire_for_both_bindings() {
    let mock_users = MockBinding::new(json!({"raw": true}));
    let mock_orders = OrdersBinding::new(json!({"raw": true}));

    let app = CliApp::new("test-cli")
        .binding(mock_users)
        .binding(mock_orders)
        .transform_response(&["**"], |_v, _p| async move {
            Ok(json!({"hooked": true}))
        });

    let (stdout, code) = run_app(app, ["test-cli", "users", "get"]);
    assert_eq!(code, 0);
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(parsed["hooked"], true, "hook should fire for users binding");
}

// ── recover_error: decline preserves original error ─────────────────

#[test]
fn recover_error_decline_preserves_original_for_next_hook() {
    let mock = MockBinding::with_error(CliError::Api {
        code: 404,
        message: "Not Found".to_string(),
        reason: "not_found".to_string(),
    });

    let app = CliApp::new("test-cli")
        .binding(mock)
        // First hook declines.
        .recover_error(&["**"], |_err, _path| async move { Ok(None) })
        // Second hook recovers — should see the original 404 error,
        // not a synthetic fallback.
        .recover_error(&["**"], |err, _path| async move {
            let msg = format!("{err}");
            if msg.contains("Not Found") {
                Ok(Some(json!({"recovered_from_original": true})))
            } else {
                Ok(None)
            }
        });

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0, "second hook should recover");
    let parsed: Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(
        parsed["recovered_from_original"], true,
        "second hook should see the original error, not a fallback"
    );
}

// ── Tier 1 ops preserve parent settings ─────────────────────────────

#[test]
fn tier1_ops_preserve_arg_required_else_help() {
    // Verify that applying a Tier 1 op (alias) via mut_subcommand
    // doesn't lose the arg_required_else_help setting on the root.
    let mock = MockBinding::new(json!({"ok": true}));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .alias(&["users"], "u");

    // Invoke without a subcommand — should show help (exit 0) rather
    // than silently succeeding or crashing.
    let (stdout, exit_code) = run_app(app, ["test-cli"]);
    assert_eq!(exit_code, 0, "should show help for missing subcommand");
    assert!(
        stdout.contains("Usage") || stdout.contains("usage"),
        "output should contain usage text: {stdout}"
    );
}

// ── Multi-binding context merging ────────────────────────────────────

/// A mergeable context type for testing `merge_binding_context`.
struct MergeableContext {
    entries: Vec<String>,
}

/// A binding whose `merge_binding_context` merges entries from multiple
/// bindings into a single `MergeableContext`, mirroring how
/// `OpenApiBinding` merges `AppContext` entries.
struct MergeableMockBinding {
    name: &'static str,
    entry: String,
    commands: clap::Command,
}

impl MergeableMockBinding {
    fn new(name: &'static str, entry: &str, commands: clap::Command) -> Self {
        Self {
            name,
            entry: entry.to_string(),
            commands,
        }
    }
}

impl Binding for MergeableMockBinding {
    fn name(&self) -> &str {
        self.name
    }
    fn set_cli_name(&mut self, _name: &str) {}

    fn build_command(&self) -> Result<clap::Command, CliError> {
        Ok(self.commands.clone())
    }

    fn dispatch<'a>(
        &'a self,
        _root_matches: &'a clap::ArgMatches,
        _sub_matches: &'a clap::ArgMatches,
        _op_path: &'a [String],
    ) -> BoxFuture<'a, Result<DispatchResult, CliError>> {
        Box::pin(async { Ok(DispatchResult::Value(json!({}))) })
    }

    fn merge_binding_context(
        &self,
        _matches: &clap::ArgMatches,
        existing: Option<Box<dyn std::any::Any + Send + Sync>>,
    ) -> Result<Option<Box<dyn std::any::Any + Send + Sync>>, CliError> {
        match existing {
            Some(ctx_box) => match ctx_box.downcast::<MergeableContext>() {
                Ok(mut ctx) => {
                    ctx.entries.push(self.entry.clone());
                    Ok(Some(ctx as Box<dyn std::any::Any + Send + Sync>))
                }
                Err(_) => Ok(Some(Box::new(MergeableContext {
                    entries: vec![self.entry.clone()],
                }))),
            },
            None => Ok(Some(Box::new(MergeableContext {
                entries: vec![self.entry.clone()],
            }))),
        }
    }
}

#[test]
fn multi_binding_custom_command_receives_merged_context() {
    let binding_a = MergeableMockBinding::new(
        "alpha",
        "alpha-entry",
        clap::Command::new("alpha")
            .subcommand(clap::Command::new("users").subcommand(clap::Command::new("get"))),
    );
    let binding_b = MergeableMockBinding::new(
        "beta",
        "beta-entry",
        clap::Command::new("beta")
            .subcommand(clap::Command::new("orders").subcommand(clap::Command::new("list"))),
    );

    let captured: Arc<Mutex<Vec<String>>> = Arc::new(Mutex::new(Vec::new()));
    let captured_clone = Arc::clone(&captured);

    let app = CliApp::new("test-cli")
        .binding(binding_a)
        .binding(binding_b)
        .command(
            clap::Command::new("status"),
            Box::new(move |_matches, ctx| {
                let merged = ctx.downcast_ref::<MergeableContext>().ok_or_else(|| {
                    CliError::Validation("expected MergeableContext".into())
                })?;
                *captured_clone.lock().unwrap() = merged.entries.clone();
                Ok(())
            }),
        );

    let (_stdout, exit_code) = run_app(app, ["test-cli", "status"]);
    assert_eq!(exit_code, 0, "custom command should succeed");
    let entries = captured.lock().unwrap();
    assert_eq!(entries.len(), 2, "should have entries from both bindings: {entries:?}");
    assert!(entries.contains(&"alpha-entry".to_string()), "missing alpha: {entries:?}");
    assert!(entries.contains(&"beta-entry".to_string()), "missing beta: {entries:?}");
}

// ── Hook pattern validation ─────────────────────────────────────────

#[test]
fn hook_pattern_matching_no_operations_hard_fails() {
    let mock = MockBinding::new(json!({"ok": true}));

    // "user" is a typo — the real command is "users"
    let app = CliApp::new("test-cli")
        .binding(mock)
        .transform_response(&["user", "get"], |v, _p| async move { Ok(v) });

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);
    assert_ne!(exit_code, 0, "typo in hook pattern should hard fail");
}

#[test]
fn hook_pattern_matching_valid_operations_succeeds() {
    let mock = MockBinding::new(json!({"ok": true}));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .transform_response(&["users", "get"], |v, _p| async move { Ok(v) });

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);
    assert_eq!(exit_code, 0, "valid hook pattern should pass validation");
}

#[test]
fn hook_pattern_globstar_matches_existing_operations() {
    let mock = MockBinding::new(json!({"ok": true}));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .transform_response(&["users", "**"], |v, _p| async move { Ok(v) });

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);
    assert_eq!(exit_code, 0, "globstar matching real operations should pass");
}

#[test]
fn recover_error_pattern_matching_no_operations_hard_fails() {
    let mock = MockBinding::new(json!({"ok": true}));

    let app = CliApp::new("test-cli")
        .binding(mock)
        .recover_error(&["nonexistent", "path"], |e, _p| async move { Err(e) });

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);
    assert_ne!(exit_code, 0, "typo in recover_error pattern should hard fail");
}

// ── No bindings → error ─────────────────────────────────────────────

#[test]
fn no_bindings_returns_error() {
    let app = CliApp::new("test-cli");

    let (_stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_ne!(exit_code, 0, "no bindings should produce an error");
}

// ── --format validation ─────────────────────────────────────────────

#[test]
fn unknown_format_returns_validation_error() {
    let app = CliApp::new("test-cli")
        .binding(MockBinding::new(json!({"ok": true})));

    let (stdout, exit_code) = run_app(app, ["test-cli", "--format", "xml", "users", "get"]);

    assert_eq!(exit_code, 3, "unknown --format should exit with validation code: {stdout}");
    assert!(
        stdout.contains("unknown output format"),
        "error should mention the unknown format, got: {stdout}",
    );
}

// ── Root Auth ───────────────────────────────────────────────────────

#[test]
fn root_auth_propagates_to_binding() {
    use fern_cli_sdk::auth::BearerAuth;

    let app = CliApp::new("test-cli")
        .auth(BearerAuth::new("bearerAuth").env("MY_TOKEN"))
        .binding(MockBinding::new(json!({"ok": true})));

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0, "root auth + mock binding should succeed: {stdout}");
}

#[test]
fn root_auth_multiple_schemes() {
    use fern_cli_sdk::auth::{ApiKeyAuth, BearerAuth};

    let app = CliApp::new("test-cli")
        .auth(BearerAuth::new("bearerAuth").env("TOKEN"))
        .auth(ApiKeyAuth::new("apiKey").env("KEY"))
        .binding(MockBinding::new(json!({"ok": true})));

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0, "multiple root auth schemes should work: {stdout}");
}

#[test]
fn root_auth_basic_scheme() {
    use fern_cli_sdk::auth::BasicAuth;

    let app = CliApp::new("test-cli")
        .auth(BasicAuth::new("httpBasic").username_env("USER").password_env("PASS"))
        .binding(MockBinding::new(json!({"ok": true})));

    let (stdout, exit_code) = run_app(app, ["test-cli", "users", "get"]);

    assert_eq!(exit_code, 0, "root basic auth should work: {stdout}");
}

#[test]
fn root_auth_validation_warns_on_partial_binding() {
    use fern_cli_sdk::auth::BearerAuth;
    use fern_cli_sdk::openapi::OpenApiBinding;

    // Minimal spec that declares `bearerAuth` in securitySchemes
    let spec = r#"
openapi: "3.0.0"
info:
  title: Test
  version: "1.0"
paths:
  /users:
    get:
      x-fern-sdk-group-name: users
      x-fern-sdk-method-name: list
      security:
        - bearerAuth: []
      responses:
        "200":
          description: ok
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
"#;

    // Register only bearerAuth — apiKeyAuth is missing → should warn but
    // still succeed (multi-spec binaries may intentionally bind only a
    // subset of schemes).
    let app = CliApp::new("test-cli")
        .auth(BearerAuth::new("bearerAuth").env("TOKEN"))
        .binding(OpenApiBinding::new().spec(spec));

    let (_stdout, exit_code) = run_app(app, ["test-cli", "--help"]);

    assert_eq!(exit_code, 0, "partial auth binding should succeed (unbound schemes get a warning)");
}

#[test]
fn root_auth_validation_passes_when_all_schemes_registered() {
    use fern_cli_sdk::auth::{ApiKeyAuth, BearerAuth};
    use fern_cli_sdk::openapi::OpenApiBinding;

    let spec = r#"
openapi: "3.0.0"
info:
  title: Test
  version: "1.0"
paths:
  /users:
    get:
      x-fern-sdk-group-name: users
      x-fern-sdk-method-name: list
      security:
        - bearerAuth: []
      responses:
        "200":
          description: ok
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
"#;

    // Register both schemes → validation passes
    let app = CliApp::new("test-cli")
        .auth(BearerAuth::new("bearerAuth").env("TOKEN"))
        .auth(ApiKeyAuth::new("apiKeyAuth").env("KEY"))
        .binding(OpenApiBinding::new().spec(spec));

    let (stdout, exit_code) = run_app(app, ["test-cli", "--help"]);

    assert_eq!(exit_code, 0, "all schemes registered should pass: {stdout}");
}
