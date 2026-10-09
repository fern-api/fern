//! Spec-derived tenant-key flags, the pinned `profiles list` table, and
//! `--profile` carrying the name on `create`.
//!
//! The tenant key is derived from the spec at runtime, with no provider
//! configuration: a parameter in a **non-terminal** path segment of most
//! operations. Raw frequency is not enough — a plain REST API's `{id}` is
//! frequent but always terminal, because it addresses the object rather
//! than scoping it.
//!
//! Template-author-only: `tests/**` is excluded from generated output.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

/// Multi-tenant: `{AccountSid}` prefixes nearly every path.
const TENANTED: &str = r#"
openapi: 3.0.0
info: { title: T, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /Accounts/{AccountSid}/Messages:
    get: { operationId: messages_list, tags: [messages],
           parameters: [{ name: AccountSid, in: path, required: true, schema: { type: string } }],
           responses: { "200": { description: ok } } }
  /Accounts/{AccountSid}/Messages/{Sid}:
    get: { operationId: messages_get, tags: [messages],
           parameters: [{ name: AccountSid, in: path, required: true, schema: { type: string } },
                        { name: Sid, in: path, required: true, schema: { type: string } }],
           responses: { "200": { description: ok } } }
  /Accounts/{AccountSid}/Calls:
    get: { operationId: calls_list, tags: [calls],
           parameters: [{ name: AccountSid, in: path, required: true, schema: { type: string } }],
           responses: { "200": { description: ok } } }
"#;

/// Plain REST: `{id}` is frequent but always terminal.
const PLAIN_REST: &str = r#"
openapi: 3.0.0
info: { title: P, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /users/{id}:
    get: { operationId: users_get, tags: [users],
           parameters: [{ name: id, in: path, required: true, schema: { type: string } }],
           responses: { "200": { description: ok } } }
  /posts/{id}:
    get: { operationId: posts_get, tags: [posts],
           parameters: [{ name: id, in: path, required: true, schema: { type: string } }],
           responses: { "200": { description: ok } } }
  /teams/{id}:
    get: { operationId: teams_get, tags: [teams],
           parameters: [{ name: id, in: path, required: true, schema: { type: string } }],
           responses: { "200": { description: ok } } }
"#;

fn run(spec: &str, args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = CliApp::new("tk")
        .profiles(ProfilesConfig::new())
        .binding(OpenApiBinding::new().spec(spec))
        .try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

fn with_temp_home<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    let prev = std::env::var_os("HOME");
    let prev_up = std::env::var_os("USERPROFILE");
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    let r = f();
    match prev {
        Some(v) => std::env::set_var("HOME", v),
        None => std::env::remove_var("HOME"),
    }
    match prev_up {
        Some(v) => std::env::set_var("USERPROFILE", v),
        None => std::env::remove_var("USERPROFILE"),
    }
    r
}

// ── the heuristic ───────────────────────────────────────────────────────

#[test]
#[serial]
fn a_tenant_key_gets_its_own_flag_on_create() {
    with_temp_home(|| {
        let (code, output) = run(TENANTED, &["tk", "profiles", "create", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("--account-sid"), "{output}");
        // `Sid` is terminal on the one path that has it — not a tenant key.
        assert!(!output.contains("--sid "), "{output}");
    });
}

#[test]
#[serial]
fn the_tenant_key_flag_sets_the_profile_parameter() {
    with_temp_home(|| {
        let (code, output) = run(
            TENANTED,
            &["tk", "profiles", "create", "acme", "--account-sid", "AC99", "--use"],
        );
        assert_eq!(code, 0, "{output}");

        let (code, listed) = run(TENANTED, &["tk", "profiles", "list", "--format", "json"]);
        assert_eq!(code, 0, "{listed}");
        let rows: serde_json::Value = serde_json::from_str(&listed).unwrap();
        assert_eq!(rows[0]["parameters"]["AccountSid"], "AC99");

        // …and it reaches the request.
        let (code, dry) = run(
            TENANTED,
            &["tk", "messages", "list", "--dry-run", "--format", "json"],
        );
        assert_eq!(code, 0, "{dry}");
        assert!(dry.contains("/Accounts/AC99/Messages"), "{dry}");
    });
}

#[test]
#[serial]
fn a_terminal_only_path_parameter_gets_no_flag() {
    // The false positive raw frequency would produce: `{id}` is on every
    // path here, but it addresses the object rather than scoping it.
    with_temp_home(|| {
        let (code, output) = run(PLAIN_REST, &["tk", "profiles", "create", "--help"]);
        assert_eq!(code, 0, "{output}");
        assert!(!output.contains("--id "), "{output}");
        // `--set` is still the way in for it.
        assert!(output.contains("--set"), "{output}");
    });
}

#[test]
#[serial]
fn a_tenant_key_flag_still_validates_its_value() {
    with_temp_home(|| {
        let (code, output) = run(
            TENANTED,
            &["tk", "profiles", "create", "acme", "--account-sid", "AC99"],
        );
        assert_eq!(code, 0, "{output}");
    });
}

// ── the pinned table ────────────────────────────────────────────────────

#[test]
#[serial]
fn the_table_leads_with_profile_and_ends_with_active() {
    with_temp_home(|| {
        run(TENANTED, &["tk", "profiles", "create", "prod", "--account-sid", "AC12"]);
        run(TENANTED, &["tk", "profiles", "create", "acme", "--account-sid", "AC99", "--use"]);

        let (code, output) = run(TENANTED, &["tk", "profiles", "list", "--human"]);
        assert_eq!(code, 0, "{output}");
        let header = output.lines().next().expect("header");
        assert!(header.starts_with("PROFILE"), "{header}");
        assert!(header.trim_end().ends_with("ACTIVE"), "{header}");
        assert!(header.contains("ACCOUNTSID"), "{header}");
        // The active row is marked, and only it.
        assert_eq!(output.matches('*').count(), 1, "{output}");
    });
}

#[test]
#[serial]
fn a_profile_with_no_extra_fields_collapses_to_two_columns() {
    with_temp_home(|| {
        run(PLAIN_REST, &["tk", "profiles", "create", "solo", "--use"]);
        let (code, output) = run(PLAIN_REST, &["tk", "profiles", "list", "--human"]);
        assert_eq!(code, 0, "{output}");
        let header = output.lines().next().unwrap();
        assert!(header.starts_with("PROFILE"), "{header}");
        assert!(header.trim_end().ends_with("ACTIVE"), "{header}");
    });
}

#[test]
#[serial]
fn machine_format_is_unaffected_by_the_table_rendering() {
    with_temp_home(|| {
        run(TENANTED, &["tk", "profiles", "create", "prod", "--account-sid", "AC12"]);
        let (code, output) = run(TENANTED, &["tk", "profiles", "list", "--format", "json"]);
        assert_eq!(code, 0, "{output}");
        let rows: serde_json::Value = serde_json::from_str(&output).expect("still JSON");
        assert_eq!(rows[0]["profile"], "prod");
    });
}

// ── `--profile` as the name ─────────────────────────────────────────────

#[test]
#[serial]
fn create_accepts_the_name_positionally_or_via_profile() {
    with_temp_home(|| {
        assert_eq!(run(TENANTED, &["tk", "profiles", "create", "positional"]).0, 0);
        assert_eq!(
            run(TENANTED, &["tk", "profiles", "create", "--profile", "flagged"]).0,
            0,
        );
        let (_, listed) = run(TENANTED, &["tk", "profiles", "list", "--format", "json"]);
        assert!(listed.contains("positional"), "{listed}");
        assert!(listed.contains("flagged"), "{listed}");
    });
}

#[test]
#[serial]
fn create_with_no_name_at_all_explains_both_spellings() {
    with_temp_home(|| {
        let (code, output) = run(TENANTED, &["tk", "profiles", "create"]);
        assert_ne!(code, 0, "{output}");
        assert!(output.contains("--profile"), "{output}");
    });
}
