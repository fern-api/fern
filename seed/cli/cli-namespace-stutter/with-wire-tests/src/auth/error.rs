//! Auth-aware HTTP error mapping.
//!
//! The server's own answer is always the most accurate one, so it is
//! parsed first and never replaced: a 403 stays a 403 with the API's
//! message, code, and reason intact, and we only *append* what the CLI
//! knows about which credential it sent. Laundering a 403 into a
//! synthetic `401 authError` told users to re-authenticate when
//! re-authenticating could not possibly help — a 403 means the server
//! knows who you are and you still can't do this (RFC 7235).
//!
//! The one case that stays a local [`CliError::Auth`] is a 401 on a
//! request that carried no credential at all: there the CLI genuinely
//! knows more than the server does, and "set `X` or run `auth login`" is
//! the actionable answer.
//!
//! Per-endpoint awareness comes from
//! [`AuthProvider::has_credentials_for`][hcf]: a routing wrapper can have
//! credentials for *some* schemes but not the one this specific endpoint
//! demanded.
//!
//! [hcf]: crate::auth::AuthProvider::has_credentials_for

use serde_json::Value;

use crate::auth::provider::{AuthProvider, EndpointAuthMetadata};
use crate::error::CliError;

/// What the request that produced an error response actually carried.
///
/// The provider tree alone can't answer this: a credential can reach the
/// wire as a resolved global header, outside the tree entirely, and
/// inferring "nothing was sent" from the tree is exactly what made a
/// permissions 403 look like a missing-credential error.
#[derive(Debug, Clone, Default)]
pub struct CredentialDisclosure {
    sources: Vec<String>,
}

impl CredentialDisclosure {
    /// No credential reached the wire.
    pub fn none() -> Self {
        Self::default()
    }

    /// Record a credential that was sent, described by where it came from
    /// (e.g. `"ELEVENLABS_API_KEY environment variable"`).
    pub fn with_source(mut self, source: impl Into<String>) -> Self {
        self.sources.push(source.into());
        self
    }

    /// Whether any credential reached the wire.
    pub fn was_sent(&self) -> bool {
        !self.sources.is_empty()
    }

    /// Where the sent credentials came from, de-duplicated.
    pub fn sources(&self) -> Vec<String> {
        dedup_preserve_order(self.sources.clone())
    }
}

/// Map an HTTP error response to a [`CliError`], inferring what was sent
/// from the provider tree.
///
/// Prefer [`handle_error_response_with_disclosure`] from call sites that
/// know the resolved request headers — a credential injected as a global
/// header is invisible to `provider`.
pub fn handle_error_response<T>(
    status: reqwest::StatusCode,
    error_body: &str,
    provider: &dyn AuthProvider,
    endpoint: &EndpointAuthMetadata,
) -> Result<T, CliError> {
    let mut disclosure = CredentialDisclosure::none();
    if provider.has_credentials_for(endpoint) {
        for hint in provider.credential_hints() {
            disclosure = disclosure.with_source(hint);
        }
        // A provider can report credentials without exposing a hint;
        // keep it in the "sent something" bucket regardless.
        if !disclosure.was_sent() {
            disclosure = disclosure.with_source(format!("the {} scheme", provider.name()));
        }
    }
    handle_error_response_with_disclosure(status, error_body, provider, endpoint, &disclosure)
}

/// Map an HTTP error response to a [`CliError`], given what the request
/// actually carried.
///
/// - **401, nothing sent** — local [`CliError::Auth`] naming every source
///   the user could set (or why the stored one is unusable).
/// - **401/403, credential sent** — the server's parsed error plus the
///   source that supplied the rejected credential, so shadowing (a stale
///   env var beating a fresh `auth login`) is diagnosable.
/// - **403, nothing sent** — the server's parsed error plus a note that no
///   credential was attached. A 403 is never rewritten as an auth error.
/// - **Anything else** — the server's parsed error, untouched.
///
/// The body is parsed as a structured
/// `{ "error": { code, message, errors[].reason | reason } }` envelope,
/// falling back to the raw body when it isn't JSON.
pub fn handle_error_response_with_disclosure<T>(
    status: reqwest::StatusCode,
    error_body: &str,
    provider: &dyn AuthProvider,
    endpoint: &EndpointAuthMetadata,
    disclosure: &CredentialDisclosure,
) -> Result<T, CliError> {
    let is_auth_status = status.as_u16() == 401 || status.as_u16() == 403;
    if !is_auth_status {
        return Err(parse_api_error(status, error_body));
    }

    if disclosure.was_sent() {
        let base = parse_api_error(status, error_body);
        return Err(decorate_with_source_hint(base, &disclosure.sources()));
    }

    // Nothing was sent, but the operation declared `security: []` — it
    // asked to be called anonymously, so a missing credential is not the
    // explanation and the server's error stands alone.
    if endpoint.is_explicit_anonymous() {
        return Err(parse_api_error(status, error_body));
    }

    // Nothing was sent. On a 401 the CLI can answer better than the
    // server did; on a 403 the server's answer is the real one and we
    // only note the missing credential.
    if status.as_u16() == 401 {
        return Err(CliError::Auth(missing_credential_message(provider)));
    }
    Err(append_note(
        parse_api_error(status, error_body),
        &missing_credential_message(provider),
    ))
}

/// The actionable "you have no usable credential" message: a provider's
/// own diagnosis when it has one (a stored login that expired and can't
/// refresh), otherwise the list of sources the user can set.
fn missing_credential_message(provider: &dyn AuthProvider) -> String {
    if let Some(reason) = provider.unavailable_reason() {
        return reason;
    }
    let hints = dedup_preserve_order(provider.credential_hints());
    if hints.is_empty() {
        "Access denied. Authentication credentials are missing. \
         Check that the configured auth source for this CLI \
         (environment variable, --flag, or credential file) has a value set."
            .to_string()
    } else {
        format!(
            "Access denied. Authentication credentials are missing. Set {}.",
            hints.join(", "),
        )
    }
}

/// Append a line to an existing [`CliError::Api`] message, preserving its
/// structured fields.
fn append_note(err: CliError, note: &str) -> CliError {
    match err {
        CliError::Api { code, message, reason } => CliError::Api {
            code,
            message: format!("{message}\n{note}"),
            reason,
        },
        other => other,
    }
}

/// Append a "Credentials were supplied via: …" line to an existing
/// `CliError::Api` message, preserving the structured fields. For
/// non-`Api` variants (defensive — shouldn't happen here), pass through.
fn decorate_with_source_hint(err: CliError, hints: &[String]) -> CliError {
    if hints.is_empty() {
        return err;
    }
    let joined = hints.join(", ");
    append_note(
        err,
        &format!(
            "Credentials were supplied via: {joined}. \
             Run `auth status` to see all visible sources and check for shadowing."
        ),
    )
}

/// Deduplicate strings while preserving first-seen order.
fn dedup_preserve_order(items: Vec<String>) -> Vec<String> {
    let mut seen = std::collections::HashSet::new();
    items
        .into_iter()
        .filter(|s| seen.insert(s.clone()))
        .collect()
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

    #[test]
    fn friendly_error_names_env_var_bearer() {
        let p = BearerAuthProvider::new(
            "bearerAuth",
            AuthCredentialSource::from_env("__FERN_TEST_BEARER_KEY"),
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => {
                assert!(
                    msg.contains("__FERN_TEST_BEARER_KEY"),
                    "expected env var name in message, got: {msg}",
                );
            }
            other => panic!("Expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn friendly_error_names_env_var_header() {
        use crate::auth::schemes::HeaderAuthProvider;
        let p = HeaderAuthProvider::new(
            "X-Auth-Token",
            "X-Auth-Token",
            AuthCredentialSource::from_env("__FERN_TEST_HEADER_KEY"),
            false,
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => {
                assert!(
                    msg.contains("__FERN_TEST_HEADER_KEY"),
                    "expected env var name in message, got: {msg}",
                );
            }
            other => panic!("Expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn friendly_error_names_env_var_basic() {
        use crate::auth::schemes::BasicAuthProvider;
        let p = BasicAuthProvider::username_only(
            "ApiKeyAuth",
            AuthCredentialSource::from_env("__FERN_TEST_BASIC_KEY"),
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => {
                assert!(
                    msg.contains("__FERN_TEST_BASIC_KEY"),
                    "expected env var name in message, got: {msg}",
                );
            }
            other => panic!("Expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn friendly_error_names_cli_flag_in_chain() {
        // Use a non-finalized source to verify pre-finalize hints.
        let p = BearerAuthProvider::new(
            "bearer",
            AuthCredentialSource::any([
                AuthCredentialSource::cli("api-token"),
                AuthCredentialSource::from_env("__FERN_TEST_CHAIN_TOKEN"),
            ]),
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => {
                assert!(msg.contains("--api-token"), "expected flag hint, got: {msg}");
                assert!(msg.contains("__FERN_TEST_CHAIN_TOKEN"), "expected env var hint, got: {msg}");
            }
            other => panic!("Expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn friendly_error_names_cli_flag_after_finalize() {
        // Simulate the production path: finalize() converts Cli to Closure,
        // but the hint must survive so the error message still names the flag.
        let cmd = clap::Command::new("test").arg(
            clap::Arg::new("api-token").long("api-token").num_args(1),
        );
        let matches = std::sync::Arc::new(
            cmd.try_get_matches_from(vec!["test"]).unwrap(),
        );
        let source = AuthCredentialSource::any([
            AuthCredentialSource::cli("api-token"),
            AuthCredentialSource::from_env("__FERN_TEST_FINALIZE_TOKEN"),
        ])
        .finalize(&matches);

        let p = BearerAuthProvider::new("bearer", source);
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => {
                assert!(msg.contains("--api-token"), "expected flag hint after finalize, got: {msg}");
                assert!(msg.contains("__FERN_TEST_FINALIZE_TOKEN"), "expected env var hint after finalize, got: {msg}");
            }
            other => panic!("Expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn friendly_error_fallback_when_no_hints() {
        let p = BearerAuthProvider::new("bearer", AuthCredentialSource::Missing);
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => {
                assert!(msg.contains("Access denied"), "expected fallback msg, got: {msg}");
                assert!(
                    msg.contains("environment variable, --flag, or credential file"),
                    "expected generic hint in fallback, got: {msg}",
                );
            }
            other => panic!("Expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn friendly_error_json_envelope_contains_env_var() {
        let p = BearerAuthProvider::new(
            "bearerAuth",
            AuthCredentialSource::from_env("__FERN_TEST_JSON_KEY"),
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        let json = err.to_json();
        let json_msg = json["error"]["message"].as_str().unwrap();
        assert!(
            json_msg.contains("__FERN_TEST_JSON_KEY"),
            "expected env var in JSON message, got: {json_msg}",
        );
    }

    #[test]
    fn unauthorized_with_credentials_discloses_source() {
        // 401 fired with valid creds → server rejecting → disclose source.
        std::env::set_var("__FERN_TEST_SHADOW_TOKEN", "stale-token");
        let p = BearerAuthProvider::new(
            "bearer",
            AuthCredentialSource::from_env("__FERN_TEST_SHADOW_TOKEN"),
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            r#"{"error":{"code":401,"message":"bad token"}}"#,
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Api { message, .. } => {
                assert!(message.contains("__FERN_TEST_SHADOW_TOKEN"));
                assert!(message.contains("auth status"));
            }
            other => panic!("expected Api with source-hint suffix, got: {other:?}"),
        }
        std::env::remove_var("__FERN_TEST_SHADOW_TOKEN");
    }

    #[test]
    fn forbidden_with_credentials_discloses_source() {
        std::env::set_var("__FERN_TEST_FORBIDDEN_TOKEN", "x");
        let p = BearerAuthProvider::new(
            "bearer",
            AuthCredentialSource::from_env("__FERN_TEST_FORBIDDEN_TOKEN"),
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::FORBIDDEN,
            r#"{"error":{"code":403,"message":"forbidden"}}"#,
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Api { message, .. } => {
                assert!(message.contains("__FERN_TEST_FORBIDDEN_TOKEN"));
            }
            other => panic!("expected Api with source-hint suffix, got: {other:?}"),
        }
        std::env::remove_var("__FERN_TEST_FORBIDDEN_TOKEN");
    }

    #[test]
    fn non_auth_status_codes_skip_source_disclosure() {
        std::env::set_var("__FERN_TEST_NONAUTH_TOKEN", "x");
        let p = BearerAuthProvider::new(
            "bearer",
            AuthCredentialSource::from_env("__FERN_TEST_NONAUTH_TOKEN"),
        );
        let err = handle_error_response::<()>(
            reqwest::StatusCode::INTERNAL_SERVER_ERROR,
            r#"{"error":{"code":500,"message":"server down"}}"#,
            &p,
            &EndpointAuthMetadata::unspecified(),
        )
        .unwrap_err();
        match err {
            CliError::Api { message, .. } => {
                assert!(!message.contains("__FERN_TEST_NONAUTH_TOKEN"));
            }
            _ => panic!("expected Api"),
        }
        std::env::remove_var("__FERN_TEST_NONAUTH_TOKEN");
    }

    #[test]
    fn forbidden_with_no_provider_credential_preserves_server_error() {
        // The motivating case: the credential reached the wire as a global
        // header, so the provider tree reports nothing, but the server's 403
        // is the real answer and must survive intact.
        let p = BearerAuthProvider::new("bearer", AuthCredentialSource::Missing);
        let disclosure =
            CredentialDisclosure::none().with_source("the `xi-api-key` header".to_string());
        let err = handle_error_response_with_disclosure::<()>(
            reqwest::StatusCode::FORBIDDEN,
            r#"{"error":{"code":403,"message":"This feature requires an active subscription.","reason":"invalid_subscription"}}"#,
            &p,
            &EndpointAuthMetadata::unspecified(),
            &disclosure,
        )
        .unwrap_err();
        match err {
            CliError::Api {
                code,
                message,
                reason,
            } => {
                assert_eq!(code, 403);
                assert_eq!(reason, "invalid_subscription");
                assert!(message.contains("active subscription"));
                assert!(message.contains("xi-api-key"));
            }
            other => panic!("expected Api, got: {other:?}"),
        }
    }

    #[test]
    fn forbidden_with_nothing_sent_is_never_laundered_into_auth_error() {
        let p = BearerAuthProvider::new(
            "bearer",
            AuthCredentialSource::from_env("__FERN_TEST_403_UNSET_TOKEN"),
        );
        let err = handle_error_response_with_disclosure::<()>(
            reqwest::StatusCode::FORBIDDEN,
            r#"{"error":{"code":403,"message":"Missing permission scope models_read","reason":"missing_scope"}}"#,
            &p,
            &EndpointAuthMetadata::unspecified(),
            &CredentialDisclosure::none(),
        )
        .unwrap_err();
        match err {
            CliError::Api {
                code,
                message,
                reason,
            } => {
                assert_eq!(code, 403);
                assert_eq!(reason, "missing_scope");
                assert!(message.contains("models_read"));
                // The missing-credential note is appended, not substituted.
                assert!(message.contains("__FERN_TEST_403_UNSET_TOKEN"));
            }
            other => panic!("expected Api, got: {other:?}"),
        }
    }

    #[test]
    fn unauthorized_with_nothing_sent_stays_local_auth_error() {
        let p = BearerAuthProvider::new(
            "bearer",
            AuthCredentialSource::from_env("__FERN_TEST_401_UNSET_TOKEN"),
        );
        let err = handle_error_response_with_disclosure::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            r#"{"error":{"code":401,"message":"unauthorized"}}"#,
            &p,
            &EndpointAuthMetadata::unspecified(),
            &CredentialDisclosure::none(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => assert!(msg.contains("__FERN_TEST_401_UNSET_TOKEN")),
            other => panic!("expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn unavailable_reason_survives_for_stale_stored_login() {
        #[derive(Debug)]
        struct StaleProvider;
        impl AuthProvider for StaleProvider {
            fn name(&self) -> &str {
                "oauth"
            }
            fn apply(
                &self,
                req: reqwest::RequestBuilder,
                _endpoint: &EndpointAuthMetadata,
            ) -> Result<reqwest::RequestBuilder, CliError> {
                Ok(req)
            }
            fn has_credentials(&self) -> bool {
                false
            }
            fn unavailable_reason(&self) -> Option<String> {
                Some(
                    "Your session has expired and no refresh token is cached. \
                     Run `acme auth login` again."
                        .to_string(),
                )
            }
        }
        let err = handle_error_response_with_disclosure::<()>(
            reqwest::StatusCode::UNAUTHORIZED,
            "Unauthorized",
            &StaleProvider,
            &EndpointAuthMetadata::unspecified(),
            &CredentialDisclosure::none(),
        )
        .unwrap_err();
        match err {
            CliError::Auth(msg) => assert!(msg.contains("session has expired"), "got: {msg}"),
            other => panic!("expected Auth, got: {other:?}"),
        }
    }

    #[test]
    fn dedup_removes_duplicates_preserving_order() {
        let input = vec!["a".into(), "b".into(), "a".into(), "c".into(), "b".into()];
        let result = dedup_preserve_order(input);
        assert_eq!(result, vec!["a", "b", "c"]);
    }
}
