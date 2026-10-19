//! A renamed `profiles` group, and a spec that owns the noun itself.
//!
//! `ProfilesConfig::command_name` exists because an API may already have a
//! `profiles` resource. Two things then have to keep working: the renamed
//! group has to be reachable under its new name, and a spec-owned group of
//! the *same* name has to be folded into rather than clobbered — the rule
//! `graft_builtin_command` already applies to `auth`.
//!
//! Template-author-only: `tests/**` is excluded from generated output via
//! `.sdk-ignore.json`.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

/// A spec whose own resource group is literally called `profiles`, so the
/// built-ins have to coexist with `profiles list`-the-API-operation.
const SPEC_OWNING_PROFILES: &str = r#"
openapi: 3.0.0
info: { title: Collision API, version: "1.0" }
servers:
  - url: https://api.example.com
paths:
  /profiles/{id}:
    get:
      operationId: profiles_get
      tags: [profiles]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200": { description: ok }
"#;

const PLAIN_SPEC: &str = r#"
openapi: 3.0.0
info: { title: Plain API, version: "1.0" }
servers:
  - url: https://api.example.com
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      responses:
        "200": { description: ok }
"#;

fn run(spec: &str, config: ProfilesConfig, args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = CliApp::new("collide")
        .profiles(config)
        .binding(OpenApiBinding::new().spec(spec))
        .try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

/// Run `f` with `$HOME` pointed at a fresh directory. `#[serial]` is
/// mandatory: `$HOME` and the resolved-profile slot are both process-global.
fn with_temp_home<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    let previous = std::env::var_os("HOME");
    let previous_userprofile = std::env::var_os("USERPROFILE");
    std::env::set_var("HOME", home.path());
    std::env::set_var("USERPROFILE", home.path());
    let result = f();
    match previous {
        Some(value) => std::env::set_var("HOME", value),
        None => std::env::remove_var("HOME"),
    }
    match previous_userprofile {
        Some(value) => std::env::set_var("USERPROFILE", value),
        None => std::env::remove_var("USERPROFILE"),
    }
    result
}

#[test]
#[serial]
fn a_renamed_group_is_reachable_under_its_new_name() {
    with_temp_home(|| {
        let config = || ProfilesConfig::new().command_name("tenants");

        let (code, output) = run(PLAIN_SPEC, config(), &["collide", "tenants", "--help"]);
        assert_eq!(code, 0, "{output}");

        let (code, output) = run(
            PLAIN_SPEC,
            config(),
            &["collide", "tenants", "create", "prod", "--use"],
        );
        assert_eq!(code, 0, "{output}");

        let (code, output) = run(
            PLAIN_SPEC,
            config(),
            &["collide", "tenants", "current", "--format", "json"],
        );
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("\"profile\": \"prod\""), "{output}");
    });
}

#[test]
#[serial]
fn a_renamed_groups_hints_name_the_renamed_group() {
    // Otherwise `create` tells the user to run `collide profiles use prod`,
    // which does not resolve on this binary.
    with_temp_home(|| {
        // `create`'s own hint goes to stderr, which
        // `try_run_from_with_output` does not capture. The equivalent
        // assertion on a surface we *can* see: `--profile`'s help text points
        // at the group, and must point at the renamed one.
        let (code, output) = run(
            PLAIN_SPEC,
            ProfilesConfig::new().command_name("tenants"),
            &["collide", "things", "list", "--help"],
        );
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("collide tenants"), "{output}");
        assert!(!output.contains("collide profiles"), "{output}");
    });
}

#[test]
#[serial]
fn a_spec_owned_group_of_the_same_name_is_folded_into_not_clobbered() {
    // The `graft_builtin_command` rule, same as `auth me` beside `auth login`:
    // both surfaces stay reachable.
    with_temp_home(|| {
        let (code, output) = run(
            SPEC_OWNING_PROFILES,
            ProfilesConfig::new(),
            &["collide", "profiles", "--help"],
        );
        assert_eq!(code, 0, "{output}");
        // The spec's own operation…
        assert!(output.contains("get"), "spec operation missing: {output}");
        // …beside the built-ins.
        for builtin in ["create", "list", "use", "remove", "current"] {
            assert!(output.contains(builtin), "`{builtin}` missing: {output}");
        }
    });
}

#[test]
#[serial]
fn the_spec_owned_operation_still_dispatches_to_its_binding() {
    // The built-ins are intercepted by name; everything else under the group
    // must fall through to the spec.
    with_temp_home(|| {
        let (code, output) = run(
            SPEC_OWNING_PROFILES,
            ProfilesConfig::new(),
            &[
                "collide", "profiles", "get", "--id", "abc", "--dry-run", "--format", "json",
            ],
        );
        assert_eq!(code, 0, "{output}");
        assert!(
            output.contains("https://api.example.com/profiles/abc"),
            "the spec operation should have run: {output}",
        );
    });
}

#[test]
#[serial]
fn the_builtin_leaves_still_win_under_a_spec_owned_group() {
    with_temp_home(|| {
        let (code, output) = run(
            SPEC_OWNING_PROFILES,
            ProfilesConfig::new(),
            &["collide", "profiles", "current", "--format", "json"],
        );
        assert_eq!(code, 0, "{output}");
        assert!(output.contains("\"source\""), "{output}");
    });
}
