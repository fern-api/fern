//! Shell completion generation.
//!
//! Shared infrastructure for emitting shell completion scripts. Sits above
//! both protocol paths (`openapi/` and `graphql/`) and has no
//! protocol-specific dependencies.

use std::ffi::OsString;

use clap::Command;
use clap_complete::env::{Bash, Elvish, EnvCompleter, Fish, Powershell, Zsh};
use clap_complete::{generate, Shell};

/// Env var the registration script from `<CLI> completion <shell>` sets when
/// it asks the binary for candidates (e.g. `MY_CLI_COMPLETE=zsh`).
pub fn complete_env_var(bin_name: &str) -> String {
    format!("{}_COMPLETE", bin_name.to_uppercase().replace('-', "_"))
}

fn env_completer(shell: &str) -> Option<&'static dyn EnvCompleter> {
    match shell {
        "bash" => Some(&Bash),
        "zsh" => Some(&Zsh),
        "fish" => Some(&Fish),
        "powershell" => Some(&Powershell),
        "elvish" => Some(&Elvish),
        _ => None,
    }
}

/// Shell named by [`complete_env_var`] when this process was launched by a
/// registered completion script to produce candidates, `None` otherwise.
pub fn dynamic_completion_shell(bin_name: &str) -> Option<String> {
    let shell = std::env::var(complete_env_var(bin_name)).ok()?;
    if shell.is_empty() || shell == "0" || env_completer(&shell).is_none() {
        return None;
    }
    Some(shell)
}

/// Write the shell registration script for dynamic completion.
///
/// The script stays a few lines regardless of how many commands the CLI
/// has: on every TAB the shell re-invokes the binary, which answers with the
/// candidates for the current word only (see [`write_dynamic_completions`]).
/// Static scripts embed the whole command tree, which zsh can take minutes
/// to parse on large CLIs.
pub fn write_registration(
    shell: &str,
    bin_name: &str,
    writer: &mut dyn std::io::Write,
) -> std::io::Result<()> {
    let completer = env_completer(shell).ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("invalid shell: '{shell}'"),
        )
    })?;
    let mut buf = Vec::new();
    completer.write_registration(
        &complete_env_var(bin_name),
        bin_name,
        bin_name,
        bin_name,
        &mut buf,
    )?;
    if shell == "zsh" {
        // Also complete on the first TAB when autoloaded from a file in
        // `$fpath` (any `_*` name) rather than sourced from `.zshrc`.
        // `compstate` only exists inside a completion widget.
        let fn_name = format!("_clap_dynamic_completer_{}", bin_name.replace('-', "_"));
        buf.extend_from_slice(
            format!(
                "\nif [[ ${{funcstack[1]-}} == _* ]] && (( ${{+compstate}} )); then\n    {fn_name} \"$@\"\nfi\n"
            )
            .as_bytes(),
        );
    }
    writer.write_all(&buf)
}

/// Answer a completion request from a registered script. `args` is the raw
/// argv: `<CLI> -- <words on the command line...>`. With no words (e.g.
/// `<CLI>_COMPLETE=zsh <CLI>`), prints the registration script instead,
/// matching clap_complete's `CompleteEnv` protocol.
pub fn write_dynamic_completions(
    shell: &str,
    cmd: &mut Command,
    args: Vec<OsString>,
    writer: &mut dyn std::io::Write,
) -> std::io::Result<()> {
    let completer = env_completer(shell).ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("invalid shell: '{shell}'"),
        )
    })?;
    let words: Vec<OsString> = match args.iter().position(|a| a == "--") {
        Some(i) => args[i + 1..].to_vec(),
        None => Vec::new(),
    };
    if words.is_empty() {
        let bin_name = cmd.get_name().to_string();
        return write_registration(shell, &bin_name, writer);
    }
    let current_dir = std::env::current_dir().ok();
    let mut buf = Vec::new();
    completer.write_complete(cmd, words, current_dir.as_deref(), &mut buf)?;
    writer.write_all(&buf)
}

/// Returns `true` when `args` contains `"completion"` as the first
/// positional token (i.e. the subcommand position). This allows early
/// interception before normal API dispatch — avoiding collision with an
/// API resource that might also be named `completion`.
///
/// Skips `--flag value` pairs so `box --base-url completion files` is
/// not mistaken for a completion request (`completion` there is the
/// value of `--base-url`, not a subcommand). Boolean flags like
/// `--dry-run` are recognised and do NOT consume the next token.
pub fn wants_completion(args: &[String]) -> bool {
    crate::early_intercept::first_positional_is(args, "completion")
}

/// Generate a shell completion script for `cmd` and write it to `writer`.
///
/// `bin_name` is the name the user types to invoke the CLI (e.g. `"box"`).
/// The caller is responsible for building a `Command` that mirrors the full
/// CLI surface (subcommands, flags, etc.) so the generated script is complete.
///
/// Returns an IO error if writing fails.
pub fn generate_completion_to(
    shell: Shell,
    cmd: &mut Command,
    bin_name: &str,
    writer: &mut dyn std::io::Write,
) -> std::io::Result<()> {
    let mut buf = Vec::new();
    generate(shell, cmd, bin_name, &mut buf);
    writer.write_all(&buf)
}

/// Generate a shell completion script for `cmd` and write it to stdout.
///
/// Thin wrapper around [`generate_completion_to`] that targets `stdout`.
pub fn generate_completion(shell: Shell, cmd: &mut Command, bin_name: &str) -> std::io::Result<()> {
    generate_completion_to(shell, cmd, bin_name, &mut std::io::stdout())
}

/// Parse a shell name string into a [`Shell`] enum variant.
///
/// Matching is case-sensitive, consistent with `clap_complete::Shell`'s
/// `FromStr` implementation and the `value_parser` on
/// [`completion_command`]. Returns `None` for unrecognized values
/// (including case mismatches like `"BASH"`).
pub fn parse_shell(s: &str) -> Option<Shell> {
    match s {
        "bash" => Some(Shell::Bash),
        "zsh" => Some(Shell::Zsh),
        "fish" => Some(Shell::Fish),
        "powershell" => Some(Shell::PowerShell),
        "elvish" => Some(Shell::Elvish),
        _ => None,
    }
}

/// Build the `completion` subcommand definition. Registered at the root
/// of the command tree so `<cli> completion <shell>` works.
pub fn completion_command() -> Command {
    Command::new("completion")
        .about("Generate shell completion scripts")
        .long_about(
            "Generate a shell completion script. The script is small and asks \
             <CLI> for candidates on each TAB, so it stays fast for large CLIs \
             and never needs regenerating after an upgrade.",
        )
        .arg_required_else_help(true)
        .after_help(
            "EXAMPLES:\n    \
             # bash\n    \
             echo 'source <(<CLI> completion bash)' >> ~/.bashrc\n    \
             # zsh (after compinit)\n    \
             echo 'source <(<CLI> completion zsh)' >> ~/.zshrc\n    \
             # fish\n    \
             <CLI> completion fish > ~/.config/fish/completions/<CLI>.fish\n    \
             # powershell\n    \
             <CLI> completion powershell >> $PROFILE",
        )
        .arg(
            clap::Arg::new("shell")
                .required(true)
                .value_parser(["bash", "zsh", "fish", "powershell", "elvish"])
                .help("Target shell (bash, zsh, fish, powershell, elvish)"),
        )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn args(slice: &[&str]) -> Vec<String> {
        slice.iter().map(|s| s.to_string()).collect()
    }

    fn sample_cli() -> Command {
        Command::new("my-cli")
            .arg(
                clap::Arg::new("verbose")
                    .long("verbose")
                    .global(true)
                    .action(clap::ArgAction::SetTrue),
            )
            .subcommand(
                Command::new("messages")
                    .about("Manage messages")
                    .subcommand(Command::new("list").about("List messages"))
                    .subcommand(Command::new("create").about("Create a message")),
            )
            .subcommand(Command::new("calls").about("Manage calls"))
            .subcommand(Command::new("secret").hide(true))
    }

    fn os(slice: &[&str]) -> Vec<OsString> {
        slice.iter().map(OsString::from).collect()
    }

    fn complete_fish(words: &[&str]) -> String {
        let mut argv = os(&["my-cli", "--"]);
        argv.extend(os(words));
        let mut out = Vec::new();
        write_dynamic_completions("fish", &mut sample_cli(), argv, &mut out).unwrap();
        String::from_utf8(out).unwrap()
    }

    #[test]
    fn complete_env_var_is_namespaced_by_binary() {
        assert_eq!(complete_env_var("my-cli"), "MY_CLI_COMPLETE");
        assert_eq!(complete_env_var("twilio"), "TWILIO_COMPLETE");
    }

    #[test]
    fn dynamic_completion_lists_top_level_subcommands() {
        let out = complete_fish(&["my-cli", ""]);
        assert!(out.contains("messages\tManage messages"), "{out}");
        assert!(out.contains("calls\tManage calls"), "{out}");
        assert!(
            !out.contains("secret"),
            "hidden commands must not be offered: {out}"
        );
        assert!(
            !out.contains("list"),
            "nested commands must not leak to the root: {out}"
        );
    }

    #[test]
    fn dynamic_completion_lists_nested_subcommands_by_prefix() {
        let out = complete_fish(&["my-cli", "messages", "cr"]);
        assert_eq!(
            out.lines().collect::<Vec<_>>(),
            vec!["create\tCreate a message"]
        );
    }

    #[test]
    fn dynamic_completion_offers_global_flags() {
        let out = complete_fish(&["my-cli", "messages", "list", "--ver"]);
        assert!(out.contains("--verbose"), "{out}");
    }

    #[test]
    fn dynamic_completion_without_words_emits_registration() {
        let mut out = Vec::new();
        write_dynamic_completions("bash", &mut sample_cli(), os(&["my-cli"]), &mut out).unwrap();
        assert!(String::from_utf8(out).unwrap().contains("MY_CLI_COMPLETE"));
    }

    #[test]
    fn registration_is_small_and_calls_back_into_binary() {
        for shell in ["bash", "zsh", "fish", "powershell", "elvish"] {
            let mut out = Vec::new();
            write_registration(shell, "my-cli", &mut out).unwrap();
            let script = String::from_utf8(out).unwrap();
            assert!(script.contains("MY_CLI_COMPLETE"), "{shell}: {script}");
            assert!(script.contains("my-cli"), "{shell}: {script}");
            assert!(
                script.len() < 8 * 1024,
                "{shell} script should not embed the command tree"
            );
        }
    }

    #[test]
    fn zsh_registration_supports_fpath_autoload() {
        let mut out = Vec::new();
        write_registration("zsh", "my-cli", &mut out).unwrap();
        let script = String::from_utf8(out).unwrap();
        assert!(script.starts_with("#compdef my-cli"), "{script}");
        assert!(
            script.contains("compdef _clap_dynamic_completer_my_cli my-cli"),
            "{script}"
        );
        assert!(
            script.contains(
                "if [[ ${funcstack[1]-} == _* ]] && (( ${+compstate} )); then\n    _clap_dynamic_completer_my_cli \"$@\"\nfi"
            ),
            "{script}"
        );
    }

    #[test]
    fn registration_rejects_unknown_shell() {
        let mut out = Vec::new();
        assert!(write_registration("tcsh", "my-cli", &mut out).is_err());
    }

    #[test]
    fn wants_completion_detects_subcommand() {
        assert!(wants_completion(&args(&["box", "completion", "bash"])));
        assert!(wants_completion(&args(&["box", "completion", "zsh"])));
    }

    #[test]
    fn wants_completion_false_for_normal_commands() {
        assert!(!wants_completion(&args(&["box", "files", "get"])));
        assert!(!wants_completion(&args(&["box", "--help"])));
    }

    #[test]
    fn wants_completion_false_when_nested() {
        assert!(!wants_completion(&args(&[
            "box",
            "files",
            "completion",
            "bash"
        ])));
    }

    #[test]
    fn wants_completion_false_when_flag_value() {
        assert!(!wants_completion(&args(&[
            "box",
            "--base-url",
            "completion",
            "files",
        ])));
    }

    #[test]
    fn wants_completion_true_after_eq_flag() {
        assert!(wants_completion(&args(&[
            "box",
            "--base-url=http://localhost",
            "completion",
            "bash",
        ])));
    }

    #[test]
    fn wants_completion_with_boolean_flag() {
        // --dry-run is a boolean flag (SetTrue) and must NOT consume the
        // next token; "completion" is the subcommand, not the flag's value.
        assert!(wants_completion(&args(&[
            "box",
            "--dry-run",
            "completion",
            "bash",
        ])));
    }

    #[test]
    fn wants_completion_with_multiple_boolean_flags() {
        assert!(wants_completion(&args(&[
            "box",
            "--dry-run",
            "--no-retry",
            "completion",
            "zsh",
        ])));
    }

    #[test]
    fn parse_shell_valid() {
        assert_eq!(parse_shell("bash"), Some(Shell::Bash));
        assert_eq!(parse_shell("zsh"), Some(Shell::Zsh));
        assert_eq!(parse_shell("fish"), Some(Shell::Fish));
        assert_eq!(parse_shell("powershell"), Some(Shell::PowerShell));
        assert_eq!(parse_shell("elvish"), Some(Shell::Elvish));
    }

    #[test]
    fn parse_shell_rejects_uppercase() {
        // parse_shell must be case-sensitive, matching clap's value_parser.
        assert_eq!(parse_shell("BASH"), None);
        assert_eq!(parse_shell("Zsh"), None);
        assert_eq!(parse_shell("FISH"), None);
    }

    #[test]
    fn parse_shell_invalid() {
        assert_eq!(parse_shell("nushell"), None);
        assert_eq!(parse_shell(""), None);
    }
}
