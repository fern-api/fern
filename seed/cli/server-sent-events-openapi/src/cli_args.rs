//! CLI argument helpers shared across protocol modules.
//!
//! Pure functions that operate on raw `&[String]` args or `clap::ArgMatches`
//! and have no protocol-specific dependencies.

use crate::error::CliError;

/// True for `--version`, `-V`, or the bare `version` subcommand.
pub fn is_version_flag(arg: &str) -> bool {
    matches!(arg, "--version" | "-V" | "version")
}

/// Resolve the API base URL override from the `--base-url` flag and the
/// `{NAME}_BASE_URL` env var (flag wins). Validates the flag value for
/// dangerous characters; the env var is treated as trusted.
pub fn resolve_base_url_override(
    matches: &clap::ArgMatches,
    app_name: &str,
) -> Result<Option<String>, CliError> {
    let base_url_flag = matches.get_one::<String>("base-url").cloned();
    if let Some(ref url) = base_url_flag {
        crate::output::reject_dangerous_chars(url, "--base-url")?;
    }
    let env_var_name = format!("{}_BASE_URL", app_name.to_uppercase().replace('-', "_"));
    let base_url_env_var = std::env::var(env_var_name).ok();
    Ok(base_url_flag.or(base_url_env_var))
}

/// Returns true when raw args contain both a help flag and `--format json`.
///
/// Triggered before clap parses so agents can request machine-readable help via
/// `--help --format json` without clap intercepting.
pub fn wants_json_help(args: &[String]) -> bool {
    let has_help = args.iter().any(|a| a == "--help" || a == "-h");
    let has_json_format = args.iter().enumerate().any(|(i, a)| {
        a.eq_ignore_ascii_case("--format=json")
            || (a == "--format"
                && args.get(i + 1).map(|s| s.to_lowercase() == "json") == Some(true))
    });
    has_help && has_json_format
}

/// Extracts the subcommand path from raw args (non-flag tokens after the binary
/// name). Skips global flags (and their values) that may appear before the
/// subcommand, so they don't terminate the `take_while(!starts_with('-'))`
/// scan that follows.
///
/// Currently elided global flags: `--format <VALUE>` (and its `--format=VALUE`
/// equals form).
///
/// `["myapi", "users", "get", "--help", "--format", "json"]` → `["users", "get"]`
pub fn extract_subcommand_path(args: &[String]) -> Vec<String> {
    let mut skip_next = false;
    args.iter()
        .skip(1) // skip binary name
        .filter(|a| {
            if skip_next {
                skip_next = false;
                return false;
            }
            if a.as_str() == "--format" {
                skip_next = true;
                return false;
            }
            if a.starts_with("--format=") {
                return false;
            }
            true
        })
        .take_while(|a| !a.starts_with('-'))
        .cloned()
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn args(slice: &[&str]) -> Vec<String> {
        slice.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn test_is_version_flag() {
        assert!(is_version_flag("--version"));
        assert!(is_version_flag("-V"));
        assert!(is_version_flag("version"));
        assert!(!is_version_flag("--ver"));
    }

    #[test]
    fn test_wants_json_help_space_separated() {
        assert!(wants_json_help(&args(&[
            "myapi", "issues", "--help", "--format", "json",
        ])));
    }

    #[test]
    fn test_wants_json_help_equals() {
        assert!(wants_json_help(&args(&["myapi", "--help", "--format=json"])));
    }

    #[test]
    fn test_wants_json_help_short_flag() {
        assert!(wants_json_help(&args(&["myapi", "-h", "--format", "json"])));
    }

    #[test]
    fn test_wants_json_help_case_insensitive() {
        assert!(wants_json_help(&args(&[
            "myapi", "--help", "--format", "JSON",
        ])));
        assert!(wants_json_help(&args(&["myapi", "--help", "--format=JSON"])));
    }

    #[test]
    fn test_no_json_help_without_format() {
        assert!(!wants_json_help(&args(&["myapi", "--help"])));
    }

    #[test]
    fn test_no_json_help_without_help_flag() {
        assert!(!wants_json_help(&args(&[
            "myapi", "issues", "get", "--format", "json",
        ])));
    }

    #[test]
    fn test_extract_subcommand_path() {
        assert_eq!(
            extract_subcommand_path(&args(&[
                "myapi", "issues", "get", "--help", "--format", "json",
            ])),
            vec!["issues", "get"],
        );
    }

    #[test]
    fn test_extract_subcommand_path_root() {
        assert_eq!(
            extract_subcommand_path(&args(&["myapi", "--help", "--format", "json"])),
            Vec::<String>::new(),
        );
    }

    #[test]
    fn test_extract_subcommand_path_format_before_subcommand() {
        assert_eq!(
            extract_subcommand_path(&args(&[
                "myapi", "--format", "json", "issues", "--help",
            ])),
            vec!["issues"],
        );
    }

    #[test]
    fn test_extract_subcommand_path_format_equals_before_subcommand() {
        assert_eq!(
            extract_subcommand_path(&args(&[
                "myapi", "--format=json", "issues", "get", "--help",
            ])),
            vec!["issues", "get"],
        );
    }
}
