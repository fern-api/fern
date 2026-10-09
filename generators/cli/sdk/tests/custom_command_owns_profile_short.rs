//! A custom command may declare its own `-p` even though profiles reserve
//! `-p` for `--profile` globally.
//!
//! Twilio's serverless plugin uses `start -p <port>`; with profiles enabled
//! that used to make clap refuse to build the tree ("short option names
//! must be unique"), and the pre-clap scanner would have read `-p 9000` as
//! profile `9000` regardless. Now the short belongs to the custom command
//! once argv has named it, and to `--profile` before that.
//!
//! Its own file because `CliApp::profiles(...)` sets a process-global
//! reservation (see `profiles_flag_reservation.rs`).

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::error::CliError;
use fern_cli_sdk::openapi::{AppContext, OpenApiBinding};
use fern_cli_sdk::profiles::ProfilesConfig;
use serial_test::serial;

const SPEC: &str = r#"
openapi: 3.0.0
info: { title: Probe, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      responses: { "200": { description: ok } }
"#;

fn start_cmd() -> clap::Command {
    clap::Command::new("start")
        .about("Start the local dev server")
        .visible_alias("dev")
        .arg(
            clap::Arg::new("port")
                .long("port")
                .short('p')
                .default_value("3000"),
        )
}

static LAST_PORT: std::sync::Mutex<String> = std::sync::Mutex::new(String::new());

fn start_handler(m: &clap::ArgMatches, _ctx: &AppContext) -> Result<(), CliError> {
    *LAST_PORT.lock().unwrap() = m.get_one::<String>("port").unwrap().clone();
    Ok(())
}

fn last_port() -> String {
    LAST_PORT.lock().unwrap().clone()
}

fn app() -> CliApp {
    CliApp::new("probe")
        .profiles(ProfilesConfig::new())
        .binding(OpenApiBinding::new().spec(SPEC))
        .command_under(
            &["serverless"],
            start_cmd(),
            OpenApiBinding::handler(start_handler),
        )
        .command_under(
            &["serverless", "env"],
            clap::Command::new("get").about("Get a variable"),
            OpenApiBinding::handler(|_, _| Ok(())),
        )
        .describe(&["serverless"], "Serverless toolkit")
        .describe(&["serverless", "env"], "Environment variables")
        .hide_global_flags(&["serverless"], &["dry-run", "query", "spec", "spec-raw"])
}

fn run(args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = app().try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

/// True when `help` lists subcommand `name` with description `about`.
fn help_row(help: &str, name: &str, about: &str) -> bool {
    help.lines().any(|line| {
        let mut words = line.split_whitespace();
        words.next() == Some(name) && line.contains(about)
    })
}

fn with_temp_home<R>(f: impl FnOnce() -> R) -> R {
    let home = tempfile::tempdir().expect("tempdir");
    let previous = std::env::var_os("HOME");
    std::env::set_var("HOME", home.path());
    let result = f();
    match previous {
        Some(v) => std::env::set_var("HOME", v),
        None => std::env::remove_var("HOME"),
    }
    result
}

#[test]
#[serial]
fn the_custom_command_keeps_its_own_short_p() {
    with_temp_home(|| {
        let (code, out) = run(&["probe", "serverless", "start", "-p", "9000"]);
        assert_eq!(code, 0, "{out}");
        assert_eq!(last_port(), "9000");

        // Via the alias too: `dev` is another spelling of the same path.
        let (code, out) = run(&["probe", "serverless", "dev", "-p9001"]);
        assert_eq!(code, 0, "{out}");
        assert_eq!(last_port(), "9001");
    });
}

#[test]
#[serial]
fn short_p_before_the_command_path_is_still_the_profile() {
    with_temp_home(|| {
        let (code, out) = run(&["probe", "-p", "acme", "serverless", "start"]);
        assert_ne!(code, 0, "{out}");
        assert!(out.contains("unknown profile `acme`"), "{out}");
    });
}

#[test]
#[serial]
fn a_profile_named_like_the_command_does_not_hand_over_the_short() {
    with_temp_home(|| {
        // `-p serverless` is a profile value, not the `serverless` command.
        let (code, out) = run(&[
            "probe",
            "-p",
            "serverless",
            "serverless",
            "start",
            "-p",
            "9",
        ]);
        assert_ne!(code, 0, "{out}");
        assert!(out.contains("unknown profile `serverless`"), "{out}");
    });
}

#[test]
#[serial]
fn long_profile_after_the_command_path_is_still_the_profile() {
    with_temp_home(|| {
        let (code, out) = run(&["probe", "serverless", "start", "--profile", "acme"]);
        assert_ne!(code, 0, "{out}");
        assert!(out.contains("unknown profile `acme`"), "{out}");
    });
}

#[test]
#[serial]
fn help_shows_long_profile_and_the_commands_own_port() {
    with_temp_home(|| {
        let (code, out) = run(&["probe", "serverless", "start", "--help"]);
        assert_eq!(code, 0, "{out}");
        assert!(out.contains("-p, --port"), "{out}");
        assert!(out.contains("--profile <NAME>"), "{out}");
        assert!(!out.contains("-p, --profile"), "{out}");
    });
}

#[test]
#[serial]
fn describe_names_the_grafted_groups() {
    with_temp_home(|| {
        let (code, out) = run(&["probe", "--help"]);
        assert_eq!(code, 0, "{out}");
        assert!(help_row(&out, "serverless", "Serverless toolkit"), "{out}");

        let (code, out) = run(&["probe", "serverless", "--help"]);
        assert_eq!(code, 0, "{out}");
        assert!(help_row(&out, "env", "Environment variables"), "{out}");
        assert!(
            help_row(&out, "start", "Start the local dev server"),
            "{out}"
        );
    });
}

#[test]
#[serial]
fn hidden_globals_leave_help_but_are_still_accepted() {
    with_temp_home(|| {
        for path in [
            vec!["serverless"],
            vec!["serverless", "start"],
            vec!["serverless", "env", "get"],
        ] {
            let mut args = vec!["probe"];
            args.extend(path.iter());
            args.push("--help");
            let (code, out) = run(&args);
            assert_eq!(code, 0, "{out}");
            for hidden in ["--dry-run", "--query <EXPR>", "--spec ", "--spec-raw"] {
                assert!(
                    !out.contains(hidden),
                    "{path:?} still shows {hidden}: {out}"
                );
            }
            // Globals that were not named stay visible.
            assert!(out.contains("--quiet"), "{path:?}: {out}");
        }
        let (code, out) = run(&["probe", "serverless", "start", "--dry-run", "-p", "1"]);
        assert_eq!(code, 0, "{out}");
        assert_eq!(last_port(), "1");
    });
}
