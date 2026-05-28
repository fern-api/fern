//! Auth-aware HTTP error mapping.
//!
//! On a 401/403 response, we want to surface a friendly "no credentials"
//! message when the request actually went out without working auth (the
//! user just needs to set their env var / file / flag), but pass the raw
//! server error through when the request *did* carry credentials (the
//! server is rejecting them — a real backend problem).
//!
//! Per-endpoint awareness comes from
//! [`AuthProvider::has_credentials_for`][hcf]: a routing wrapper can have
//! credentials for *some* schemes but not the one this specific endpoint
//! demanded, and the friendly path should still fire.
//!
//! [hcf]: crate::auth::AuthProvider::has_credentials_for

use serde_json::Value;

use crate::auth::provider::{AuthProvider, EndpointAuthMetadata};
use crate::error::CliError;

/// Map an HTTP error response to a [`CliError`], honoring whether the
/// provider could have authenticated *this specific endpoint*.
///
/// When `status` is 401/403 and the provider reports it couldn't satisfy
/// the endpoint's auth requirements, returns a friendly
/// [`CliError::Auth`] hinting the user to check their configured auth
/// source. Otherwise, parses the response body as a structured
/// `{ "error": { code, message, errors[].reason | reason } }` envelope
/// and returns [`CliError::Api`]; falls back to wrapping the raw body if
/// the response isn't JSON.
pub fn handle_error_response<T>(
    status: reqwest::StatusCode,
    error_body: &str,
    provider: &dyn AuthProvider,
    endpoint: &EndpointAuthMetadata,
) -> Result<T, CliError> {
    if (status.as_u16() == 401 || status.as_u16() == 403)
        && !provider.has_credentials_for(endpoint)
    {
        return Err(CliError::Auth(
            "Access denied. This request was sent without authentication \
             credentials. Check that the configured auth source for this CLI \
             (environment variable, --flag, or credential file) has a value set."
                .to_string(),
        ));
    }
    Err(parse_api_error(status, error_body))
}

/// Shared parsing for the auth-aware error handler. Returns a structured
/// [`CliError::Api`] whether or not the body was JSON.
fn parse_api_error(status: reqwest::StatusCode, error_body: &str) -> CliError {
    if let Ok(error_json) = serde_json::from_str::<Value>(error_body) {
        if let Some(err_obj) = error_json.get("error") {
            let code = err_obj
                .get("code")
                .and_then(|c| c.as_u64())
                .unwrap_or(status.as_u16() as u64) as u16;
            let message = err_obj
                .get("message")
                .and_then(|m| m.as_str())
                .unwrap_or("Unknown error")
                .to_string();
            let reason = err_obj
                .get("errors")
                .and_then(|e| e.as_array())
                .and_then(|arr| arr.first())
                .and_then(|e| e.get("reason"))
                .and_then(|r| r.as_str())
                .or_else(|| err_obj.get("reason").and_then(|r| r.as_str()))
                .unwrap_or("unknown")
                .to_string();
            return CliError::Api {
                code,
                message,
                reason,
            };
        }
    }
    CliError::Api {
        code: status.as_u16(),
        message: error_body.to_string(),
        reason: "httpError".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::credential::AuthCredentialSource;
    use crate::auth::schemes::BearerAuthProvider;
    use serde_json::json;

    #[test]
    fn friendly_when_provider_has_no_credentials_for_endpoint() {
        let p = BearerAuthProvider::new("bearer", AuthCredentialSource::Missing);
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => assert!(msg.contains("Access denied")),
            _ => panic!("Expected Auth"),
        }
    }

    #[test]
    fn passes_through_when_credentials_present() {
        let p = BearerAuthProvider::new("bearer", AuthCredentialSource::literal("t"));
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            r#"{"error":{"code":401,"message":"bad","reason":"x"}}"#,
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        assert!(matches!(err, CliError::Api { .. }));
    }

    #[test]
    fn parses_structured_error_envelope() {
        let json_err = json!({
            "error": {
                "code": 401,
                "message": "Request had invalid authentication credentials.",
                "errors": [{ "reason": "authError" }]
            }
        })
        .to_string();
        let p = BearerAuthProvider::new("bearer", AuthCredentialSource::literal("t"));
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            &json_err,
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Api { code, message, reason } => {
                assert_eq!(code, 401);
                assert!(message.contains("invalid authentication credentials"));
                assert_eq!(reason, "authError");
            }
            other => panic!("Expected Api, got: {other:?}"),
        }
    }

    #[test]
    fn handles_top_level_reason_field() {
        let json_err = json!({
            "error": { "code": 403, "message": "Forbidden", "reason": "accessDenied" }
        })
        .to_string();
        let p = BearerAuthProvider::new("bearer", AuthCredentialSource::literal("t"));
        let err = handle_error_response::<()>(
            reqwest::StatusCode::FORBIDDEN,
            &json_err,
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Api { reason, .. } => assert_eq!(reason, "accessDenied"),
            _ => panic!("Expected Api"),
        }
    }

    #[test]
    fn falls_back_to_raw_body_when_non_json() {
        let p = BearerAuthProvider::new("bearer", AuthCredentialSource::literal("t"));
        let err = handle_error_response::<()>(
            reqwest::StatusCode::INTERNAL_SERVER_ERROR,
            "Internal Server Error Text",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Api { code, message, reason } => {
                assert_eq!(code, 500);
                assert_eq!(message, "Internal Server Error Text");
                assert_eq!(reason, "httpError");
            }
            _ => panic!("Expected Api"),
        }
    }
}
