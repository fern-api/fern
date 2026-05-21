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
    let json = err.to_json();
    println!(
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
}
