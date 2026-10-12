//! Man page generation.
//!
//! Shared infrastructure for emitting roff-formatted man pages. Sits above
//! both protocol paths (`openapi/` and `graphql/`) and has no
//! protocol-specific dependencies. Mirrors the shape of `completions.rs`.

use clap::Command;

/// Returns `true` when `args` contains `"man"` as the first positional
/// token (i.e. the subcommand position). This allows early interception
/// before normal API dispatch — avoiding collision with an API resource
/// that might also be named `man`.
///
/// Delegates to the shared [`crate::early_intercept::first_positional_is`]
/// helper which handles `--flag value` skip logic and boolean-flag awareness.
pub fn wants_man(args: &[String]) -> bool {
    crate::early_intercept::first_positional_is(args, "man")
}

/// Generate a roff-formatted man page for `cmd` and write it to `writer`.
///
/// `bin_name` is the name the user types to invoke the CLI (e.g. `"box"`).
/// The caller is responsible for building a `Command` that mirrors the full
/// CLI surface (subcommands, flags, etc.) so the generated page is complete.
///
/// Returns an IO error if writing fails.
pub fn generate_man_to(cmd: Command, bin_name: &str, writer: &mut dyn std::io::Write) -> std::io::Result<()> {
    let cmd = cmd.name(bin_name.to_owned());
    let man = clap_mangen::Man::new(cmd);
    let mut buf = Vec::new();
    man.render(&mut buf)?;
    writer.write_all(&buf)
}

/// Generate a roff-formatted man page for `cmd` and write it to stdout.
///
/// Thin wrapper around [`generate_man_to`] that targets `stdout`.
pub fn generate_man(cmd: Command, bin_name: &str) -> std::io::Result<()> {
    generate_man_to(cmd, bin_name, &mut std::io::stdout())
}

/// What `<cli> man ...` asked for: a page path (`man messages send` →
/// `["messages", "send"]`, empty for the root page) and, with
/// `--output-dir`, a directory to write every page into instead.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct ManRequest {
    pub command_path: Vec<String>,
    pub output_dir: Option<String>,
}

/// Parse `man`'s own arguments out of argv: the page path and
/// `--output-dir`. Runs before clap parses argv (like the rest of the `man`
/// interception), so it uses `cmd` only to know which flags consume the next
/// token: a global flag's value (`--profile man`, `--format json`) is neither
/// the `man` subcommand nor a page path segment.
pub fn parse_man_request(
    cmd: &Command,
    args: &[String],
) -> Result<ManRequest, crate::error::CliError> {
    let mut cmd = cmd.clone();
    cmd.build();
    let Some(man) = cmd.find_subcommand("man") else {
        return Ok(ManRequest::default());
    };
    let mut request = ManRequest::default();
    let mut tokens = args.iter().skip(1);
    let mut in_man = false;
    while let Some(token) = tokens.next() {
        let scope = if in_man { man } else { &cmd };
        if in_man && token == "--output-dir" {
            request.output_dir = Some(output_dir_value(tokens.next().map(String::as_str))?);
        } else if let Some(dir) = token.strip_prefix("--output-dir=").filter(|_| in_man) {
            request.output_dir = Some(output_dir_value(Some(dir))?);
        } else if token.starts_with('-') {
            if flag_takes_separate_value(scope, token) {
                tokens.next();
            }
        } else if !in_man {
            in_man = token == "man";
        } else {
            request.command_path.push(token.clone());
        }
    }
    Ok(request)
}

fn output_dir_value(value: Option<&str>) -> Result<String, crate::error::CliError> {
    match value {
        Some(dir) if !dir.is_empty() && !dir.starts_with('-') => Ok(dir.to_string()),
        _ => Err(crate::error::CliError::Validation(
            "`--output-dir` needs a directory, e.g. `man --output-dir ./man`".to_string(),
        )),
    }
}

/// True when `token` is a flag of `cmd` written without an inline value
/// (`--format`, not `--format=json`) whose action reads the next token.
fn flag_takes_separate_value(cmd: &Command, token: &str) -> bool {
    let arg = if let Some(long) = token.strip_prefix("--") {
        if long.contains('=') {
            return false;
        }
        cmd.get_arguments().find(|a| a.get_long() == Some(long))
    } else {
        let mut chars = token.chars().skip(1);
        match (chars.next(), chars.next()) {
            (Some(short), None) => cmd.get_arguments().find(|a| a.get_short() == Some(short)),
            _ => None,
        }
    };
    arg.is_some_and(|a| a.get_action().takes_values())
}

/// Render the page(s) a [`ManRequest`] names. A single page is written to
/// `writer`; with `output_dir`, one `<bin>[-<sub>...].1` file is written there
/// for the selected command and every visible command below it (the whole
/// CLI when no path is given), and their paths are listed on `writer`. Pages
/// only cross-reference their own subcommands, so a subtree is complete.
pub fn run_man_request(
    mut cmd: Command,
    bin_name: &str,
    request: &ManRequest,
    writer: &mut dyn std::io::Write,
) -> Result<(), crate::error::CliError> {
    cmd = cmd.name(bin_name.to_owned());
    cmd.build();
    let version = cmd.get_version().map(str::to_owned);
    let io_err = |e: std::io::Error| crate::error::CliError::Other(e.into());

    let mut target = cmd;
    let mut path: Vec<String> = Vec::new();
    for segment in &request.command_path {
        let next = target
            .get_subcommands()
            .find(|sub| sub.get_name() == segment || sub.get_all_aliases().any(|a| a == segment))
            .cloned();
        match next {
            Some(sub) => {
                path.push(sub.get_name().to_owned());
                target = sub;
            }
            None => {
                let shown = std::iter::once(bin_name)
                    .chain(path.iter().map(String::as_str))
                    .collect::<Vec<_>>()
                    .join(" ");
                return Err(crate::error::CliError::Validation(format!(
                    "unknown command '{segment}' for `{shown}`. Run `{bin_name} man --help` for usage."
                )));
            }
        }
    }
    let target = name_page(target, bin_name, &path, version.as_deref());

    match &request.output_dir {
        Some(dir) => {
            let dir = std::path::Path::new(dir);
            std::fs::create_dir_all(dir).map_err(io_err)?;
            let mut written = Vec::new();
            write_pages(
                target,
                bin_name,
                &path,
                version.as_deref(),
                dir,
                &mut written,
            )
            .map_err(io_err)?;
            for file in written {
                writeln!(writer, "{}", file.display()).map_err(io_err)?;
            }
            Ok(())
        }
        None => {
            let mut buf = Vec::new();
            man_page(target, bin_name, version.as_deref())
                .render(&mut buf)
                .map_err(io_err)?;
            writer.write_all(&buf).map_err(io_err)
        }
    }
}

/// Give a (sub)command the identity its man page should carry: the page
/// name `<bin>-<sub>` (which is also how the parent page cross-references
/// it), the full invocation `<bin> <sub>` in the synopsis, and the root
/// version so every page's footer says which CLI build it documents.
fn name_page(cmd: Command, bin_name: &str, path: &[String], version: Option<&str>) -> Command {
    let display = std::iter::once(bin_name)
        .chain(path.iter().map(String::as_str))
        .collect::<Vec<_>>();
    let mut cmd = cmd
        .display_name(display.join("-"))
        .bin_name(display.join(" "));
    if let Some(v) = version {
        cmd = cmd.version(v.to_owned());
    }
    cmd
}

/// The page footer names the CLI build (`twilio-cli 1.2.0`), not the
/// subcommand clap_mangen would otherwise use.
fn man_page(cmd: Command, bin_name: &str, version: Option<&str>) -> clap_mangen::Man {
    let source = match version {
        Some(v) => format!("{bin_name} {v}"),
        None => bin_name.to_owned(),
    };
    clap_mangen::Man::new(cmd).source(source)
}

fn write_pages(
    cmd: Command,
    bin_name: &str,
    path: &[String],
    version: Option<&str>,
    dir: &std::path::Path,
    written: &mut Vec<std::path::PathBuf>,
) -> std::io::Result<()> {
    for sub in cmd
        .get_subcommands()
        .filter(|s| !s.is_hide_set())
    {
        let mut child_path = path.to_vec();
        child_path.push(sub.get_name().to_owned());
        let child = name_page(sub.clone(), bin_name, &child_path, version);
        write_pages(child, bin_name, &child_path, version, dir, written)?;
    }
    written.push(man_page(cmd, bin_name, version).generate_to(dir)?);
    Ok(())
}

/// Build the `man` subcommand definition. Registered at the root of the
/// command tree so `<cli> man` works.
pub fn man_command() -> Command {
    Command::new("man")
        .about("Generate man pages (roff format)")
        .arg(
            clap::Arg::new("command")
                .value_name("COMMAND")
                .num_args(0..)
                .help("Command to render the page for (e.g. `messages` for <CLI>-messages(1)). Omit for the top-level page"),
        )
        .arg(
            clap::Arg::new("output-dir")
                .long("output-dir")
                .value_name("DIR")
                .help("Write a page for every command into DIR instead of printing one page"),
        )
        .after_help(
            "EXAMPLES:\n    \
             # macOS / Linux (user-local), every page\n    \
             <CLI> man --output-dir ~/.local/share/man/man1\n    \
             # Top-level page only, system-wide (Linux)\n    \
             <CLI> man | sudo tee /usr/local/share/man/man1/<CLI>.1\n    \
             # View a command's page directly without installing\n    \
             <CLI> man <COMMAND> | groff -Tutf8 -man | less",
        )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn args(slice: &[&str]) -> Vec<String> {
        slice.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn wants_man_basic() {
        assert!(wants_man(&args(&["box", "man"])));
    }

    #[test]
    fn wants_man_false_when_flag_value() {
        assert!(!wants_man(&args(&["box", "--base-url", "man"])));
    }

    #[test]
    fn wants_man_with_boolean_flag() {
        assert!(wants_man(&args(&["box", "--dry-run", "man"])));
    }

    fn man_test_cli() -> Command {
        Command::new("box")
            .arg(clap::Arg::new("profile").long("profile").global(true))
            .arg(
                clap::Arg::new("debug")
                    .long("debug")
                    .action(clap::ArgAction::SetTrue)
                    .global(true),
            )
            .subcommand(man_command())
            .subcommand(Command::new("items").subcommand(Command::new("list")))
    }

    fn parse(cli: &Command, argv: &[String]) -> ManRequest {
        parse_man_request(cli, argv).expect("man args parse")
    }

    #[test]
    fn parse_man_request_rejects_a_missing_output_dir() {
        let cli = man_test_cli();
        for argv in [
            &["box", "man", "--output-dir"][..],
            &["box", "man", "--output-dir="][..],
            &["box", "man", "--output-dir", "--debug"][..],
        ] {
            assert!(parse_man_request(&cli, &args(argv)).is_err(), "{argv:?}");
        }
    }

    #[test]
    fn parse_man_request_reads_the_command_path_and_output_dir() {
        let cli = man_test_cli();
        assert_eq!(parse(&cli, &args(&["box", "man"])), ManRequest::default());
        assert_eq!(
            parse(&cli, &args(&["box", "--debug", "man", "items", "list"])),
            ManRequest {
                command_path: vec!["items".into(), "list".into()],
                output_dir: None,
            }
        );
        assert_eq!(
            parse(&cli, &args(&["box", "man", "--output-dir", "out", "items"])),
            ManRequest {
                command_path: vec!["items".into()],
                output_dir: Some("out".into()),
            }
        );
        assert_eq!(
            parse(&cli, &args(&["box", "man", "--output-dir=out"])).output_dir,
            Some("out".into())
        );
    }

    #[test]
    fn parse_man_request_skips_flag_values() {
        let cli = man_test_cli();
        assert_eq!(
            parse(&cli, &args(&["box", "--profile", "man", "man", "items"])).command_path,
            vec!["items".to_string()]
        );
        assert_eq!(
            parse(&cli, &args(&["box", "man", "--profile", "prod", "items"])).command_path,
            vec!["items".to_string()]
        );
        assert_eq!(
            parse(&cli, &args(&["box", "man", "--profile=prod", "items"])).command_path,
            vec!["items".to_string()]
        );
    }

    #[test]
    fn run_man_request_renders_the_selected_page() {
        let cmd = Command::new("box")
            .version("1.2.3")
            .subcommand(Command::new("items").about("Manage items"));
        let request = ManRequest {
            command_path: vec!["items".into()],
            output_dir: None,
        };
        let mut buf = Vec::new();
        run_man_request(cmd, "box", &request, &mut buf).expect("page renders");
        let output = String::from_utf8(buf).unwrap();
        assert!(
            output.contains(".TH box-items 1  \"box 1.2.3\""),
            "{output}"
        );
        assert!(output.contains("Manage items"), "{output}");
    }

    #[test]
    fn generate_man_produces_roff() {
        let cmd = Command::new("box").about("test");
        let mut buf = Vec::new();
        generate_man_to(cmd, "box", &mut buf).expect("generate_man_to should succeed");
        let output = String::from_utf8(buf).expect("man page should be valid UTF-8");
        assert!(
            output.contains(".TH"),
            "man page should contain a .TH title-header macro, got:\n{}",
            &output[..output.len().min(200)]
        );
        assert!(
            output.contains("box"),
            "man page should contain the binary name"
        );
        assert!(
            output.contains("test"),
            "man page should contain the about text"
        );
    }
}
