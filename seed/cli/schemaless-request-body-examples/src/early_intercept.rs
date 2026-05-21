//! Shared infrastructure for early-intercept subcommands (`completion`, `man`).
//!
//! These subcommands are intercepted *before* normal API dispatch so that
//! an API resource that happens to share the same name doesn't collide.
//! This module houses the constants and helpers shared by both intercept
//! paths.

/// Long flag names (without the `--` prefix) that are boolean
/// (`action(SetTrue)`) and therefore do NOT consume the next token.
/// Kept in sync with the flags registered in `commands::build_cli`.
pub(crate) const BOOLEAN_FLAGS: &[&str] = &[
    "dry-run",
    "page-all",
    "no-extract",
    "no-retry",
    "no-stream",
    "help",
];

/// Returns `true` when `args` contains `target` as the first positional
/// token (i.e. the subcommand position). Skips `--flag value` pairs so
/// `myapi --base-url <target> files` is not mistaken for the subcommand.
/// Boolean flags like `--dry-run` are recognised and do NOT consume the
/// next token.
pub(crate) fn first_positional_is(args: &[String], target: &str) -> bool {
    let mut skip_next = false;
    for arg in args.iter().skip(1) {
        if skip_next {
            skip_next = false;
            continue;
        }
        if arg.starts_with('-') {
            if arg.contains('=') {
                // --flag=value — value is consumed inline, no skip.
                continue;
            }
            // Strip leading dashes to get the bare name.
            let bare = arg.trim_start_matches('-');
            if !BOOLEAN_FLAGS.contains(&bare) {
                // Value-taking flag — next token is its argument.
                skip_next = true;
            }
            continue;
        }
        return arg == target;
    }
    false
}

/// Returns the n-th positional argument (0-indexed, ignoring argv[0]),
/// correctly skipping value-taking flags' arguments per [`BOOLEAN_FLAGS`].
///
/// This is the multi-positional generalization of [`first_positional_is`]:
/// `first_positional_is(args, target)` is equivalent to
/// `nth_positional(args, 0) == Some(target)`.
///
/// Used by the completion early-intercept path to extract the shell name
/// (positional #1, since `completion` is positional #0) while correctly
/// skipping value-taking flag arguments like `--base-url <URL>`.
pub(crate) fn nth_positional(args: &[String], n: usize) -> Option<&str> {
    let mut skip_next = false;
    let mut count = 0;
    for arg in args.iter().skip(1) {
        if skip_next {
            skip_next = false;
            continue;
        }
        if arg.starts_with('-') {
            if arg.contains('=') {
                // --flag=value — value is consumed inline, no skip.
                continue;
            }
            // Strip leading dashes to get the bare name.
            let bare = arg.trim_start_matches('-');
            if !BOOLEAN_FLAGS.contains(&bare) {
                // Value-taking flag — next token is its argument.
                skip_next = true;
            }
            continue;
        }
        if count == n {
            return Some(arg.as_str());
        }
        count += 1;
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn args(slice: &[&str]) -> Vec<String> {
        slice.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn first_positional_basic() {
        assert!(first_positional_is(&args(&["myapi", "completion", "bash"]), "completion"));
        assert!(first_positional_is(&args(&["myapi", "man"]), "man"));
    }

    #[test]
    fn first_positional_false_for_other_subcommand() {
        assert!(!first_positional_is(&args(&["myapi", "files", "get"]), "completion"));
    }

    #[test]
    fn first_positional_false_when_flag_value() {
        assert!(!first_positional_is(
            &args(&["myapi", "--base-url", "man", "files"]),
            "man",
        ));
    }

    #[test]
    fn first_positional_true_after_eq_flag() {
        assert!(first_positional_is(
            &args(&["myapi", "--base-url=http://localhost", "man"]),
            "man",
        ));
    }

    #[test]
    fn first_positional_true_after_boolean_flag() {
        assert!(first_positional_is(
            &args(&["myapi", "--dry-run", "completion", "bash"]),
            "completion",
        ));
    }

    #[test]
    fn first_positional_true_after_multiple_boolean_flags() {
        assert!(first_positional_is(
            &args(&["myapi", "--dry-run", "--no-retry", "man"]),
            "man",
        ));
    }

    // --- nth_positional ---

    #[test]
    fn nth_positional_skips_value_flag() {
        // `--base-url` is value-taking, so "X" is its argument, not a
        // positional. "completion" is positional #0, "bash" is positional #1.
        assert_eq!(
            nth_positional(&args(&["myapi", "--base-url", "X", "completion", "bash"]), 1),
            Some("bash"),
        );
    }

    #[test]
    fn nth_positional_with_boolean_flag() {
        // `--dry-run` is boolean, so "completion" is positional #0 and
        // "bash" is positional #1.
        assert_eq!(
            nth_positional(&args(&["myapi", "--dry-run", "completion", "bash"]), 1),
            Some("bash"),
        );
    }

    #[test]
    fn nth_positional_out_of_range() {
        assert_eq!(
            nth_positional(&args(&["myapi", "completion", "bash"]), 5),
            None,
        );
    }

    #[test]
    fn nth_positional_zeroth() {
        assert_eq!(
            nth_positional(&args(&["myapi", "completion", "bash"]), 0),
            Some("completion"),
        );
    }

    #[test]
    fn nth_positional_eq_flag() {
        assert_eq!(
            nth_positional(&args(&["myapi", "--base-url=http://localhost", "completion", "bash"]), 1),
            Some("bash"),
        );
    }
}
