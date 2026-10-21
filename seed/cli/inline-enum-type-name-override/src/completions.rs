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

/// Escape `name` for use as a literal inside a single-quoted zsh pattern.
fn zsh_pattern_literal(name: &str) -> String {
    let mut out = String::with_capacity(name.len());
    for c in name.chars() {
        match c {
            '\'' => out.push_str("'\\''"),
            // zstyle does not treat `\:` as a literal colon; a bracket class does.
            ':' => out.push_str("[:]"),
            c if c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.' | '+') => out.push(c),
            c => {
                out.push('\\');
                out.push(c);
            }
        }
    }
    out
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
        // Reprint the prompt below the TAB list instead of jumping back above
        // it. With the default, resizing a terminal that re-wraps lines (macOS
        // Terminal.app, iTerm2, tmux) while a list is open leaves a stacked
        // copy of the prompt and list per resize. Scoped to this command, so
        // other commands' completion is unchanged.
        buf.extend_from_slice(
            format!(
                "\nzstyle ':completion:*:*:{}:*' last-prompt false\n",
                zsh_pattern_literal(bin_name)
            )
            .as_bytes(),
        );
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
    let index = completion_index(shell, &words);
    let words = mask_option_values(cmd, words, index);
    *cmd = tidy_for_completion(std::mem::take(cmd), &words, index);
    let current_dir = std::env::current_dir().ok();
    let mut buf = Vec::new();
    completer.write_complete(cmd, words, current_dir.as_deref(), &mut buf)?;
    writer.write_all(&buf)
}

/// What a TAB completion request is about, so the tree can be built for that
/// alone instead of from every spec.
pub(crate) struct CompletionFocus {
    /// First word after the binary name once it has been typed, e.g. `core` in
    /// `twilio core msg<TAB>`. `None` while that word itself is being
    /// completed (`twilio <TAB>`), when only the top-level names matter.
    pub(crate) word: Option<String>,
    /// The word names a custom or built-in command rather than a spec prefix,
    /// so specs mounted under other prefixes cannot contribute.
    pub(crate) outside_specs: bool,
}

thread_local! {
    static COMPLETION_FOCUS: std::cell::RefCell<Option<std::rc::Rc<CompletionFocus>>> =
        const { std::cell::RefCell::new(None) };
}

/// Clears the focus when dropped.
pub(crate) struct CompletionFocusGuard(());

impl Drop for CompletionFocusGuard {
    fn drop(&mut self) {
        COMPLETION_FOCUS.with(|f| f.borrow_mut().take());
    }
}

/// Set the focus for the rest of this (synchronous) tree build.
pub(crate) fn set_completion_focus(focus: CompletionFocus) -> CompletionFocusGuard {
    COMPLETION_FOCUS.with(|f| *f.borrow_mut() = Some(std::rc::Rc::new(focus)));
    CompletionFocusGuard(())
}

pub(crate) fn completion_focus() -> Option<std::rc::Rc<CompletionFocus>> {
    COMPLETION_FOCUS.with(|f| f.borrow().clone())
}

/// The top-level word of a line being TAB-completed: `Some(Some(word))` once
/// the cursor has moved past it, `Some(None)` while it is the word being
/// completed. `None` (build everything) when it is a flag, since a flag's
/// value could look like a command, or when there is no completion request.
pub(crate) fn completion_focus_word(shell: &str, args: &[OsString]) -> Option<Option<String>> {
    let words = &args[args.iter().position(|a| a == "--")? + 1..];
    let word = words.get(1).map(|w| w.to_str())?.unwrap_or("-");
    if word.starts_with('-') {
        return None;
    }
    match completion_index(shell, words) {
        0 => None,
        1 => Some(None),
        _ if word.is_empty() => None,
        _ => Some(Some(word.to_string())),
    }
}

/// Position of the word being completed, using the same convention as the
/// `clap_complete` shell adapters (bash/zsh pass it, the others complete the
/// last word). May equal `words.len()` when the cursor sits on a new word.
fn completion_index(shell: &str, words: &[OsString]) -> usize {
    let last = words.len().saturating_sub(1);
    match shell {
        "bash" | "zsh" => std::env::var("_CLAP_COMPLETE_INDEX")
            .ok()
            .and_then(|i| i.parse().ok())
            .unwrap_or(last),
        _ => last,
    }
}

/// Shape the command tree for the TAB list. The completion process never runs
/// a command, so this only changes what is suggested:
/// - each subcommand is listed once, under its real name (`start`, not its
///   alphabetically-first alias `dev`); aliases still complete when typed.
/// - while choosing a subcommand, flags and the `help` subcommand stay out of
///   the list until the user types `-`, so the list is just the next commands.
fn tidy_for_completion(cmd: Command, words: &[OsString], index: usize) -> Command {
    let index = index.min(words.len());
    let current = words
        .get(index)
        .and_then(|w| w.to_str())
        .unwrap_or_default();
    let typed = words.get(1..index.max(1)).unwrap_or_default();
    match resolve_subcommand_path(&cmd, typed) {
        Some((path, target_has_subcommands)) => {
            let hide_flags = target_has_subcommands && !current.starts_with('-');
            tidy_path(cmd, &path, hide_flags, current)
        }
        // `<cli> ... help <TAB>`: leave clap's `help` subcommand path as is.
        None => cmd,
    }
}

/// Rewrite the values of flags typed before the word being completed so none
/// can be read as a subcommand. `clap_complete` checks for a subcommand name
/// before an expected flag value, so `serverless --profile list <TAB>` would
/// otherwise complete under `serverless list` even though the command parses
/// `list` as the profile. Values never affect the candidates, only the count
/// of words, so they are kept in place with a `=` prefix.
fn mask_option_values(cmd: &Command, mut words: Vec<OsString>, index: usize) -> Vec<OsString> {
    let end = index.min(words.len());
    let mut path: Vec<&Command> = vec![cmd];
    let mut expects_value = false;
    for word in words.iter_mut().take(end).skip(1) {
        let Some(text) = word.to_str().map(str::to_owned) else {
            expects_value = false;
            continue;
        };
        if text == "--" {
            break;
        }
        let current = *path.last().expect("path starts at the root");
        if expects_value && !text.starts_with('-') {
            *word = OsString::from(format!("={text}"));
            expects_value = false;
            continue;
        }
        expects_value = false;
        let find = |matches: &dyn Fn(&clap::Arg) -> bool| {
            current.get_arguments().find(|a| matches(a)).or_else(|| {
                path.iter()
                    .rev()
                    .skip(1)
                    .flat_map(|c| c.get_arguments())
                    .find(|a| a.is_global_set() && matches(a))
            })
        };
        if let Some(long) = text.strip_prefix("--") {
            if !long.contains('=') {
                expects_value = find(&|a: &clap::Arg| {
                    a.get_long_and_visible_aliases()
                        .is_some_and(|names| names.contains(&long))
                })
                .is_some_and(|a| a.get_action().takes_values());
            }
        } else if let Some(shorts) = text.strip_prefix('-') {
            let mut chars = shorts.chars();
            while let Some(c) = chars.next() {
                let takes_value = find(&|a: &clap::Arg| {
                    a.get_short_and_visible_aliases()
                        .is_some_and(|names| names.contains(&c))
                })
                .is_some_and(|a| a.get_action().takes_values());
                if takes_value {
                    expects_value = chars.as_str().is_empty();
                    break;
                }
            }
        } else if let Some(sub) = current.find_subcommand(&text) {
            path.push(sub);
        }
    }
    words
}

/// Canonical names of the subcommands already typed (matching names or
/// aliases, skipping flags), and whether the deepest one has visible
/// subcommands of its own. `None` when the `help` subcommand was typed.
///
/// Mirrors `clap_complete`'s own walk. Flag values are already masked by
/// [`mask_option_values`], so the node tidied here is always the one being
/// completed.
fn resolve_subcommand_path(cmd: &Command, typed: &[OsString]) -> Option<(Vec<String>, bool)> {
    let mut path = Vec::new();
    let mut current = cmd;
    for word in typed {
        if word == "--" {
            break;
        }
        if word.to_string_lossy().starts_with('-') {
            continue;
        }
        if word == "help" && current.has_subcommands() && !current.is_disable_help_subcommand_set()
        {
            return None;
        }
        if let Some(sub) = current.find_subcommand(word) {
            path.push(sub.get_name().to_string());
            current = sub;
        }
    }
    let has_subcommands = current.get_subcommands().any(|s| !s.is_hide_set());
    Some((path, has_subcommands))
}

fn tidy_path(cmd: Command, path: &[String], hide_flags: bool, current: &str) -> Command {
    // Global flags are copied down from the commands on the path when the
    // tree is built, so hiding them there hides them at the target too.
    let cmd = if hide_flags {
        cmd.mut_args(|a| if a.is_positional() { a } else { a.hide(true) })
            .disable_help_flag(true)
            .disable_version_flag(true)
    } else {
        cmd
    };
    match path.split_first() {
        Some((head, rest)) => {
            cmd.mut_subcommand(head, |sub| tidy_path(sub, rest, hide_flags, current))
        }
        None => {
            // Built trees (the runtime builds before completing) already
            // carry clap's `help` subcommand; unbuilt ones get none.
            let mut cmd = cmd
                .mut_subcommands(|s| shorten_about(hide_aliases_if_name_matches(s, current)))
                .mut_args(shorten_help)
                .disable_help_subcommand(true);
            if cmd.get_subcommands().any(|s| s.get_name() == "help") {
                cmd = cmd.mut_subcommand("help", |h| h.hide(true));
            }
            cmd
        }
    }
}

/// Longest description shown next to a TAB candidate. zsh and fish print
/// `name -- description` on one line, so long descriptions are cut off or wrap
/// in narrow windows; the full text stays in `--help`.
const MAX_COMPLETION_DESCRIPTION: usize = 50;

fn shorten_about(cmd: Command) -> Command {
    match cmd.get_about().map(|a| short_description(&a.to_string())) {
        Some(short) => cmd.about(short),
        None => cmd,
    }
}

fn shorten_help(arg: clap::Arg) -> clap::Arg {
    match arg.get_help().map(|h| short_description(&h.to_string())) {
        Some(short) => arg.help(short),
        None => arg,
    }
}

/// First sentence of `text`, cut at a word boundary to fit
/// [`MAX_COMPLETION_DESCRIPTION`].
fn short_description(text: &str) -> String {
    let line = text.lines().next().unwrap_or_default().trim();
    let sentence = match line.find(". ") {
        Some(i) => &line[..i],
        None => line.strip_suffix('.').unwrap_or(line),
    };
    if sentence.chars().count() <= MAX_COMPLETION_DESCRIPTION {
        return sentence.to_string();
    }
    let limit = sentence
        .char_indices()
        .nth(MAX_COMPLETION_DESCRIPTION - 1)
        .map_or(sentence.len(), |(i, _)| i);
    let cut = sentence[..limit]
        .rfind(' ')
        .filter(|&i| i > 0)
        .unwrap_or(limit);
    format!(
        "{}…",
        sentence[..cut].trim_end_matches([',', ';', ':', ' '])
    )
}

/// List a command under its real name when that matches the typed prefix;
/// otherwise keep its visible aliases so `de<TAB>` still offers `dev` (an
/// alias of `start`) next to `deploy`.
fn hide_aliases_if_name_matches(cmd: Command, current: &str) -> Command {
    if cmd.get_visible_aliases().next().is_none() || !cmd.get_name().starts_with(current) {
        return cmd;
    }
    let aliases: Vec<String> = cmd.get_all_aliases().map(str::to_owned).collect();
    cmd.alias(None).aliases(aliases)
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
                    .subcommand(
                        Command::new("list")
                            .about("List messages")
                            .visible_aliases(["ls", "all"]),
                    )
                    .subcommand(Command::new("create").about("Create a message")),
            )
            .subcommand(Command::new("calls").about("Manage calls"))
            .subcommand(Command::new("secret").hide(true))
    }

    fn os(slice: &[&str]) -> Vec<OsString> {
        slice.iter().map(OsString::from).collect()
    }

    fn complete_fish(words: &[&str]) -> String {
        complete_fish_with(sample_cli(), words)
    }

    fn complete_fish_with(mut cmd: Command, words: &[&str]) -> String {
        let mut argv = os(&["my-cli", "--"]);
        argv.extend(os(words));
        let mut out = Vec::new();
        write_dynamic_completions("fish", &mut cmd, argv, &mut out).unwrap();
        String::from_utf8(out).unwrap()
    }

    #[test]
    fn complete_env_var_is_namespaced_by_binary() {
        assert_eq!(complete_env_var("my-cli"), "MY_CLI_COMPLETE");
        assert_eq!(complete_env_var("twilio"), "TWILIO_COMPLETE");
    }

    #[test]
    fn flag_value_naming_a_subcommand_is_read_as_the_value() {
        let cli = || {
            sample_cli().arg(
                clap::Arg::new("profile")
                    .long("profile")
                    .short('p')
                    .global(true)
                    .action(clap::ArgAction::Set),
            )
        };
        let group = complete_fish_with(cli(), &["my-cli", "messages", ""]);
        for words in [
            &["my-cli", "messages", "--profile", "list", ""][..],
            &["my-cli", "messages", "-p", "list", ""],
            &["my-cli", "--profile", "messages", "messages", ""],
            &["my-cli", "messages", "--profile=list", ""],
        ] {
            assert_eq!(complete_fish_with(cli(), words), group, "{words:?}");
        }
        let leaf = complete_fish_with(cli(), &["my-cli", "messages", "list", ""]);
        assert_ne!(leaf, group);
        assert_eq!(
            complete_fish_with(cli(), &["my-cli", "messages", "--verbose", "list", ""]),
            leaf,
            "flags without a value must not swallow the next word"
        );
        assert_eq!(
            complete_fish_with(cli(), &["my-cli", "--profile", "x", "messages", "list", ""]),
            leaf
        );
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

    fn values(out: &str) -> Vec<&str> {
        out.lines().map(|l| l.split('\t').next().unwrap()).collect()
    }

    #[test]
    fn dynamic_completion_lists_only_subcommands_while_choosing_one() {
        assert_eq!(
            values(&complete_fish(&["my-cli", ""])),
            vec!["messages", "calls"]
        );
        assert_eq!(
            values(&complete_fish(&["my-cli", "--verbose", "messages", ""])),
            vec!["list", "create"]
        );
    }

    #[test]
    fn dynamic_completion_lists_subcommands_under_their_real_name() {
        let out = complete_fish(&["my-cli", "messages", ""]);
        assert!(out.contains("list\tList messages"), "{out}");
        assert!(!out.contains("ls") && !out.contains("all"), "{out}");
    }

    #[test]
    fn dynamic_completion_still_completes_typed_aliases() {
        assert_eq!(
            values(&complete_fish(&["my-cli", "messages", "a"])),
            vec!["all"]
        );
        assert_eq!(
            values(&complete_fish(&["my-cli", "ls"])),
            Vec::<&str>::new()
        );
        assert_eq!(
            values(&complete_fish(&["my-cli", "messages", "ls", "--ver"])),
            vec!["--verbose"]
        );
    }

    #[test]
    fn dynamic_completion_offers_aliases_whose_command_name_does_not_match() {
        let cli = || {
            Command::new("my-cli").subcommand(
                Command::new("serverless")
                    .subcommand(Command::new("deploy"))
                    .subcommand(Command::new("delete"))
                    .subcommand(Command::new("start").visible_aliases(["dev", "run"])),
            )
        };
        let complete = |w: &str| {
            complete_fish_with(cli(), &["my-cli", "serverless", w])
                .lines()
                .map(|l| l.split('\t').next().unwrap().to_string())
                .collect::<Vec<_>>()
        };
        assert_eq!(complete(""), vec!["deploy", "delete", "start"]);
        assert_eq!(complete("de"), vec!["deploy", "delete", "dev"]);
        assert_eq!(complete("dev"), vec!["dev"]);
        assert_eq!(complete("r"), vec!["run"]);
        assert_eq!(complete("st"), vec!["start"]);
    }

    #[test]
    fn dynamic_completion_offers_flags_once_dash_is_typed() {
        let out = complete_fish(&["my-cli", "messages", "--"]);
        assert!(out.contains("--verbose"), "{out}");
        assert!(out.contains("--help"), "{out}");
    }

    #[test]
    fn short_description_keeps_the_first_sentence_within_the_limit() {
        assert_eq!(short_description("Print help"), "Print help");
        assert_eq!(
            short_description("Create a project. Runs the wizard.\nMore text"),
            "Create a project"
        );
        assert_eq!(
            short_description(
                "List Services, environments, builds, Functions, Assets or variables"
            ),
            "List Services, environments, builds, Functions…"
        );
        assert!(short_description(&"é".repeat(80)).chars().count() <= MAX_COMPLETION_DESCRIPTION);
    }

    #[test]
    fn dynamic_completion_shortens_descriptions() {
        let cli =
            Command::new("my-cli").subcommand(Command::new("list").about(
                "List Services, environments, builds, Functions, Assets or variables. Extra.",
            ));
        let out = complete_fish_with(cli, &["my-cli", ""]);
        assert!(
            out.contains("list\tList Services, environments, builds, Functions…"),
            "{out}"
        );
    }

    #[test]
    fn completion_focus_word_follows_the_first_word() {
        let focus = |w: &[&str]| {
            let mut argv = os(&["my-cli", "--", "my-cli"]);
            argv.extend(os(w));
            completion_focus_word("fish", &argv)
        };
        assert_eq!(focus(&["core", ""]), Some(Some("core".to_string())));
        assert_eq!(
            focus(&["core", "messages", "li"]),
            Some(Some("core".to_string()))
        );
        assert_eq!(focus(&["co"]), Some(None));
        assert_eq!(focus(&[""]), Some(None));
        assert_eq!(focus(&["-"]), None);
        assert_eq!(focus(&["--profile", "prod", ""]), None);
        assert_eq!(completion_focus_word("fish", &os(&["my-cli"])), None);
    }

    #[test]
    fn tidy_tolerates_out_of_range_index() {
        let words = os(&["my-cli", "messages", ""]);
        for index in [0, 99] {
            let cmd = tidy_for_completion(sample_cli(), &words, index);
            assert!(cmd.find_subcommand("messages").is_some());
        }
    }

    #[test]
    fn dynamic_completion_leaves_the_caller_with_the_full_tree() {
        let mut cmd = sample_cli();
        let mut out = Vec::new();
        write_dynamic_completions(
            "fish",
            &mut cmd,
            os(&["my-cli", "--", "my-cli", ""]),
            &mut out,
        )
        .unwrap();
        assert_eq!(cmd.get_name(), "my-cli");
        assert!(cmd.find_subcommand("messages").is_some());
    }

    #[test]
    fn dynamic_completion_tidies_an_already_built_tree() {
        let mut cmd = sample_cli();
        cmd.build();
        assert_eq!(
            values(&complete_fish_with(
                cmd.clone(),
                &["my-cli", "messages", ""]
            )),
            vec!["list", "create"]
        );
        let out = complete_fish_with(cmd, &["my-cli", "messages", "--"]);
        assert!(out.contains("--verbose") && out.contains("--help"), "{out}");
    }

    #[test]
    fn dynamic_completion_offers_flags_on_leaf_commands() {
        let out = complete_fish(&["my-cli", "messages", "list", ""]);
        assert!(out.contains("--verbose"), "{out}");
    }

    #[test]
    fn dynamic_completion_keeps_help_subcommand_working() {
        assert_eq!(
            values(&complete_fish(&["my-cli", "he"])),
            Vec::<&str>::new()
        );
        assert_eq!(
            values(&complete_fish(&["my-cli", "help", "m"])),
            vec!["messages"]
        );
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
            script.contains("zstyle ':completion:*:*:my-cli:*' last-prompt false"),
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
    fn zsh_last_prompt_style_matches_bin_name_literally() {
        assert_eq!(zsh_pattern_literal("my-cli_2.0+x"), "my-cli_2.0+x");
        assert_eq!(zsh_pattern_literal("a*b:c"), "a\\*b[:]c");
        assert_eq!(zsh_pattern_literal("it's"), "it'\\''s");
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
