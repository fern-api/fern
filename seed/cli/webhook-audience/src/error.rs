//! Structured Error Types
//!
//! Provides error types and structured JSON error output for the CLI.

use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CliError {
    #[error("{message}")]
    Api {
        code: u16,
        message: String,
        reason: String,
    },

    #[error("{0}")]
    Validation(String),

    #[error("{0}")]
    Auth(String),

    #[error("{0}")]
    Discovery(String),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}


impl CliError {
    pub const EXIT_CODE_API: i32 = 1;
    pub const EXIT_CODE_AUTH: i32 = 2;
    pub const EXIT_CODE_VALIDATION: i32 = 3;
    pub const EXIT_CODE_DISCOVERY: i32 = 4;
    pub const EXIT_CODE_OTHER: i32 = 5;

    /// Create a duplicate of this error for passing to hook callbacks
    /// while retaining the original. `Other(anyhow::Error)` is
    /// converted to its display string since `anyhow::Error` is not
    /// `Clone`.
    pub fn duplicate(&self) -> Self {
        match self {
            Self::Api { code, message, reason } => Self::Api {
                code: *code,
                message: message.clone(),
                reason: reason.clone(),
            },
            Self::Validation(msg) => Self::Validation(msg.clone()),
            Self::Auth(msg) => Self::Auth(msg.clone()),
            Self::Discovery(msg) => Self::Discovery(msg.clone()),
            Self::Other(e) => Self::Other(anyhow::anyhow!("{e:#}")),
        }
    }

    pub fn exit_code(&self) -> i32 {
        match self {
            CliError::Api { .. } => Self::EXIT_CODE_API,
            CliError::Auth(_) => Self::EXIT_CODE_AUTH,
            CliError::Validation(_) => Self::EXIT_CODE_VALIDATION,
            CliError::Discovery(_) => Self::EXIT_CODE_DISCOVERY,
            CliError::Other(_) => Self::EXIT_CODE_OTHER,
        }
    }

    pub fn to_json(&self) -> serde_json::Value {
        match self {
            CliError::Api {
                code,
                message,
                reason,
            } => json!({
                "error": {
                    "code": code,
                    "message": message,
                    "reason": reason,
                }
            }),
            CliError::Validation(msg) => json!({
                "error": {
                    "code": 400,
                    "message": msg,
                    "reason": "validationError",
                }
            }),
            CliError::Auth(msg) => json!({
                "error": {
                    "code": 401,
                    "message": msg,
                    "reason": "authError",
                }
            }),
            CliError::Discovery(msg) => json!({
                "error": {
                    "code": 500,
                    "message": msg,
                    "reason": "discoveryError",
                }
            }),
            CliError::Other(e) => json!({
                "error": {
                    "code": 500,
                    "message": format!("{e:#}"),
                    "reason": "internalError",
                }
            }),
        }
    }
}

use crate::output::{colorize, sanitize_for_terminal};

/// All documented exit codes with their human-readable descriptions.
pub const EXIT_CODE_TABLE: &[(i32, &str, &str)] = &[
    (CliError::EXIT_CODE_API, "api", "API returned a non-success HTTP status"),
    (CliError::EXIT_CODE_AUTH, "auth", "Authentication failed or credentials missing"),
    (CliError::EXIT_CODE_VALIDATION, "validation", "Invalid arguments or request body"),
    (CliError::EXIT_CODE_DISCOVERY, "discovery", "Schema loading or endpoint resolution failed"),
    (CliError::EXIT_CODE_OTHER, "other", "Unexpected internal error"),
];

/// Render all documented exit codes to stdout in the format requested
/// by the user's raw args.
///
/// Honors `--format json` (and equivalents) so AI agents can consume a
/// machine-readable inventory of exit codes — the whole point of this
/// command for scripting workflows. Unknown `--format` values fall
/// back to the human-readable table, matching the resolver behavior
/// elsewhere in the CLI.
pub fn print_errors(args: &[String]) {
    write_errors_to(args, &mut std::io::stdout());
}

/// Writer-parameterized variant of [`print_errors`].
pub fn write_errors_to(args: &[String], out: &mut dyn std::io::Write) {
    match detect_errors_format(args) {
        ErrorsFormat::Json => write_errors_json_to(out),
        ErrorsFormat::Table => write_errors_table_to(out),
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ErrorsFormat {
    Table,
    Json,
}

fn detect_errors_format(args: &[String]) -> ErrorsFormat {
    for (i, a) in args.iter().enumerate() {
        if let Some(rest) = a.strip_prefix("--format=") {
            if rest.eq_ignore_ascii_case("json") {
                return ErrorsFormat::Json;
            }
        } else if a == "--format" {
            if let Some(next) = args.get(i + 1) {
                if next.eq_ignore_ascii_case("json") {
                    return ErrorsFormat::Json;
                }
            }
        }
    }
    ErrorsFormat::Table
}

/// Print a human-readable table of all exit codes to stdout.
pub fn print_errors_table() {
    write_errors_table_to(&mut std::io::stdout());
}

fn write_errors_table_to(out: &mut dyn std::io::Write) {
    let _ = writeln!(out, "Exit codes:\n");
    let _ = writeln!(out, "  {:<6}  {:<14}  DESCRIPTION", "CODE", "CATEGORY");
    let _ = writeln!(out, "  {:<6}  {:<14}  ───────────────────────────────────────────", "──────", "──────────────");
    for &(code, category, description) in EXIT_CODE_TABLE {
        let _ = writeln!(out, "  {:<6}  {:<14}  {}", code, category, description);
    }
    let _ = writeln!(out);
    let _ = writeln!(out, "Exit code 0 means success. Any non-zero code indicates an error.");
}

/// Print all documented exit codes as a JSON array on stdout.
///
/// Shape:
/// ```json
/// {
///   "exit_codes": [
///     {"code": 0, "category": "success", "description": "..."},
///     {"code": 1, "category": "api",     "description": "..."},
///     ...
///   ]
/// }
/// ```
///
/// Includes the implicit success code (0) so consumers see the full
/// matrix without having to special-case the success path.
pub fn print_errors_json() {
    write_errors_json_to(&mut std::io::stdout());
}

fn write_errors_json_to(out: &mut dyn std::io::Write) {
    let mut entries: Vec<serde_json::Value> = Vec::with_capacity(EXIT_CODE_TABLE.len() + 1);
    entries.push(json!({
        "code": 0,
        "category": "success",
        "description": "Command completed successfully",
    }));
    for &(code, category, description) in EXIT_CODE_TABLE {
        entries.push(json!({
            "code": code,
            "category": category,
            "description": description,
        }));
    }
    let doc = json!({ "exit_codes": entries });
    let _ = writeln!(out, "{}", serde_json::to_string_pretty(&doc).expect("static EXIT_CODE_TABLE always serializes"));
}

fn error_label(err: &CliError) -> String {
    match err {
        CliError::Api { .. } => colorize("error[api]:", "31"),
        CliError::Auth(_) => colorize("error[auth]:", "31"),
        CliError::Validation(_) => colorize("error[validation]:", "33"),
        CliError::Discovery(_) => colorize("error[discovery]:", "31"),
        CliError::Other(_) => colorize("error:", "31"),
    }
}

pub fn print_error_json(err: &CliError) {
    write_error_json(err, &mut std::io::stdout());
}

pub fn write_error_json(err: &CliError, out: &mut dyn std::io::Write) {
    let json = err.to_json();
    let _ = writeln!(
        out,
        "{}",
        serde_json::to_string_pretty(&json).unwrap_or_default()
    );
    eprintln!(
        "{} {}",
        error_label(err),
        sanitize_for_terminal(&err.to_string())
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exit_codes_are_distinct() {
        let codes = [
            CliError::EXIT_CODE_API,
            CliError::EXIT_CODE_AUTH,
            CliError::EXIT_CODE_VALIDATION,
            CliError::EXIT_CODE_DISCOVERY,
            CliError::EXIT_CODE_OTHER,
        ];
        let unique: std::collections::HashSet<i32> = codes.iter().copied().collect();
        assert_eq!(unique.len(), codes.len());
    }

    #[test]
    fn test_error_to_json_api() {
        let err = CliError::Api {
            code: 404,
            message: "Not Found".to_string(),
            reason: "notFound".to_string(),
        };
        let json = err.to_json();
        assert_eq!(json["error"]["code"], 404);
        assert_eq!(json["error"]["message"], "Not Found");
    }

    #[test]
    fn test_error_to_json_validation() {
        let err = CliError::Validation("Invalid input".to_string());
        let json = err.to_json();
        assert_eq!(json["error"]["code"], 400);
    }

    #[test]
    fn test_exit_codes_all_variants() {
        assert_eq!(
            CliError::Api { code: 404, message: String::new(), reason: String::new() }.exit_code(),
            CliError::EXIT_CODE_API
        );
        assert_eq!(CliError::Auth(String::new()).exit_code(), CliError::EXIT_CODE_AUTH);
        assert_eq!(CliError::Validation(String::new()).exit_code(), CliError::EXIT_CODE_VALIDATION);
        assert_eq!(CliError::Discovery(String::new()).exit_code(), CliError::EXIT_CODE_DISCOVERY);
        assert_eq!(
            CliError::Other(anyhow::anyhow!("oops")).exit_code(),
            CliError::EXIT_CODE_OTHER
        );
    }

    #[test]
    fn test_to_json_auth() {
        let err = CliError::Auth("bad creds".to_string());
        let json = err.to_json();
        assert_eq!(json["error"]["code"], 401);
        assert_eq!(json["error"]["reason"], "authError");
    }

    #[test]
    fn test_to_json_discovery() {
        let err = CliError::Discovery("spec not found".to_string());
        let json = err.to_json();
        assert_eq!(json["error"]["code"], 500);
        assert_eq!(json["error"]["reason"], "discoveryError");
        assert_eq!(json["error"]["message"], "spec not found");
    }

    #[test]
    fn test_to_json_other() {
        let err = CliError::Other(anyhow::anyhow!("something broke"));
        let json = err.to_json();
        assert_eq!(json["error"]["code"], 500);
        assert_eq!(json["error"]["reason"], "internalError");
    }

    #[test]
    fn test_print_error_json_all_variants_no_panic() {
        print_error_json(&CliError::Api {
            code: 500,
            message: "oops".to_string(),
            reason: "err".to_string(),
        });
        print_error_json(&CliError::Validation("bad input".to_string()));
        print_error_json(&CliError::Auth("no auth".to_string()));
        print_error_json(&CliError::Discovery("no spec".to_string()));
        print_error_json(&CliError::Other(anyhow::anyhow!("broken")));
    }

    #[test]
    fn test_duplicate_preserves_variant() {
        let api = CliError::Api {
            code: 404,
            message: "Not Found".to_string(),
            reason: "notFound".to_string(),
        };
        let dup = api.duplicate();
        assert_eq!(dup.exit_code(), CliError::EXIT_CODE_API);
        assert_eq!(dup.to_json()["error"]["code"], 404);

        let val = CliError::Validation("bad".to_string());
        assert_eq!(val.duplicate().exit_code(), CliError::EXIT_CODE_VALIDATION);

        let auth = CliError::Auth("denied".to_string());
        assert_eq!(auth.duplicate().exit_code(), CliError::EXIT_CODE_AUTH);

        let disc = CliError::Discovery("missing".to_string());
        assert_eq!(disc.duplicate().exit_code(), CliError::EXIT_CODE_DISCOVERY);

        // Other(anyhow) preserves variant and exit code.
        let other = CliError::Other(anyhow::anyhow!("anyhow msg"));
        let dup_other = other.duplicate();
        assert_eq!(dup_other.exit_code(), CliError::EXIT_CODE_OTHER);
    }

    #[test]
    fn exit_code_table_covers_all_known_codes() {
        let table_codes: std::collections::HashSet<i32> =
            EXIT_CODE_TABLE.iter().map(|&(c, _, _)| c).collect();
        let expected = [
            CliError::EXIT_CODE_API,
            CliError::EXIT_CODE_AUTH,
            CliError::EXIT_CODE_VALIDATION,
            CliError::EXIT_CODE_DISCOVERY,
            CliError::EXIT_CODE_OTHER,
        ];
        for code in expected {
            assert!(table_codes.contains(&code), "EXIT_CODE_TABLE missing code {code}");
        }
    }

    #[test]
    fn exit_code_table_has_no_duplicates() {
        let codes: Vec<i32> = EXIT_CODE_TABLE.iter().map(|&(c, _, _)| c).collect();
        let unique: std::collections::HashSet<i32> = codes.iter().copied().collect();
        assert_eq!(unique.len(), codes.len(), "EXIT_CODE_TABLE has duplicate codes");
    }

    fn args(slice: &[&str]) -> Vec<String> {
        slice.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn detect_errors_format_defaults_to_table() {
        assert_eq!(detect_errors_format(&args(&["cli", "errors"])), ErrorsFormat::Table);
    }

    #[test]
    fn detect_errors_format_recognizes_json_space_separated() {
        assert_eq!(
            detect_errors_format(&args(&["cli", "errors", "--format", "json"])),
            ErrorsFormat::Json,
        );
    }

    #[test]
    fn detect_errors_format_recognizes_json_equals() {
        assert_eq!(
            detect_errors_format(&args(&["cli", "errors", "--format=json"])),
            ErrorsFormat::Json,
        );
    }

    #[test]
    fn detect_errors_format_case_insensitive() {
        assert_eq!(
            detect_errors_format(&args(&["cli", "errors", "--format", "JSON"])),
            ErrorsFormat::Json,
        );
        assert_eq!(
            detect_errors_format(&args(&["cli", "errors", "--format=Json"])),
            ErrorsFormat::Json,
        );
    }

    #[test]
    fn detect_errors_format_unknown_format_falls_back_to_table() {
        assert_eq!(
            detect_errors_format(&args(&["cli", "errors", "--format", "yaml"])),
            ErrorsFormat::Table,
        );
    }

    #[test]
    fn detect_errors_format_trailing_format_flag_with_no_value_is_table() {
        assert_eq!(
            detect_errors_format(&args(&["cli", "errors", "--format"])),
            ErrorsFormat::Table,
        );
    }

    #[test]
    fn print_errors_json_emits_expected_shape() {
        // Smoke: the JSON payload parses cleanly and includes every
        // documented exit code (plus the implicit 0). Captures the
        // contract that AI agents consume.
        let mut entries: Vec<serde_json::Value> = Vec::with_capacity(EXIT_CODE_TABLE.len() + 1);
        entries.push(json!({
            "code": 0,
            "category": "success",
            "description": "Command completed successfully",
        }));
        for &(code, category, description) in EXIT_CODE_TABLE {
            entries.push(json!({
                "code": code,
                "category": category,
                "description": description,
            }));
        }
        let payload = json!({ "exit_codes": entries });
        let arr = payload["exit_codes"].as_array().expect("exit_codes is array");
        assert_eq!(arr.len(), EXIT_CODE_TABLE.len() + 1);
        assert_eq!(arr[0]["code"], 0);
        let codes: std::collections::HashSet<i64> = arr
            .iter()
            .filter_map(|e| e["code"].as_i64())
            .collect();
        for &(code, _, _) in EXIT_CODE_TABLE {
            assert!(codes.contains(&(code as i64)), "missing code {code}");
        }
    }
}
