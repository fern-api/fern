//! Typed auth-scheme builders for root-level `CliApp` registration.
//!
//! These builders provide a type-safe, discoverable API for declaring auth
//! at the CLI level. Each builder produces the underlying `(String, SchemeBinding)`
//! pair consumed by the existing auth infrastructure.
//!
//! # Example
//!
//! ```rust,no_run
//! use fern_cli_sdk::app::CliApp;
//! use fern_cli_sdk::auth::{BearerAuth, ApiKeyAuth, BasicAuth, OAuth2Auth};
//! use fern_cli_sdk::openapi::OpenApiBinding;
//!
//! CliApp::new("platform")
//!     .auth(BearerAuth::new("bearerAuth").env("PLATFORM_TOKEN"))
//!     .auth(ApiKeyAuth::new("apiKey").env("API_KEY"))
//!     .auth(BasicAuth::new("basicAuth").username_env("USER").password_env("PASS"))
//!     .auth(OAuth2Auth::new("OAuth2Security").client_id_env("ID").client_secret_env("SECRET").token_url("https://auth.example.com/token"))
//!     .binding(OpenApiBinding::new().spec("openapi: '3.0.0'\ninfo:\n  title: x\n  version: '1'\npaths: {}"))
//!     .run();
//! ```

use super::builder::SchemeBinding;
use super::credential::AuthCredentialSource;

/// Trait implemented by all typed auth builders. Converts the builder
/// into the `(scheme_name, SchemeBinding)` pair used by the auth
/// infrastructure.
pub trait AuthSchemeBuilder {
    /// Consume the builder and produce a `(scheme_name, SchemeBinding)` pair.
    fn into_binding(self) -> (String, SchemeBinding);
}

// ---------------------------------------------------------------------------
// BearerAuth — Authorization: Bearer <token>
// ---------------------------------------------------------------------------

/// Builder for bearer token authentication (`Authorization: Bearer <token>`).
///
/// The scheme name must match the `securitySchemes` key in the binding's spec.
#[derive(Debug, Clone)]
pub struct BearerAuth {
    name: String,
    source: AuthCredentialSource,
}

impl BearerAuth {
    /// Create a new bearer auth builder. `name` must match the scheme name
    /// declared in the spec's `components.securitySchemes`.
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            source: AuthCredentialSource::Missing,
        }
    }

    /// Read the bearer token from an environment variable.
    pub fn env(mut self, var_name: impl Into<String>) -> Self {
        self.source = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Read the bearer token from a CLI flag (`--<arg_name>`).
    pub fn cli(mut self, arg_name: impl Into<String>) -> Self {
        self.source = AuthCredentialSource::cli(arg_name);
        self
    }

    /// Read the bearer token from a file.
    pub fn file(mut self, path: impl Into<std::path::PathBuf>) -> Self {
        self.source = AuthCredentialSource::file(path.into());
        self
    }

    /// Use a fallback chain: try env, then CLI, then file, etc.
    pub fn source(mut self, source: AuthCredentialSource) -> Self {
        self.source = source;
        self
    }
}

impl AuthSchemeBuilder for BearerAuth {
    fn into_binding(self) -> (String, SchemeBinding) {
        (self.name, SchemeBinding::Token(self.source))
    }
}

// ---------------------------------------------------------------------------
// ApiKeyAuth — header or query-parameter API key
// ---------------------------------------------------------------------------

/// Builder for API key authentication (header-based or query-parameter).
///
/// The scheme name must match the `securitySchemes` key in the binding's spec.
/// The header name is read from the spec's `in: header` / `name: X-API-Key`
/// declaration; it does NOT need to be set here unless overriding.
#[derive(Debug, Clone)]
pub struct ApiKeyAuth {
    name: String,
    source: AuthCredentialSource,
}

impl ApiKeyAuth {
    /// Create a new API key auth builder. `name` must match the scheme name
    /// declared in the spec's `components.securitySchemes`.
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            source: AuthCredentialSource::Missing,
        }
    }

    /// Read the API key from an environment variable.
    pub fn env(mut self, var_name: impl Into<String>) -> Self {
        self.source = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Read the API key from a CLI flag (`--<arg_name>`).
    pub fn cli(mut self, arg_name: impl Into<String>) -> Self {
        self.source = AuthCredentialSource::cli(arg_name);
        self
    }

    /// Read the API key from a file.
    pub fn file(mut self, path: impl Into<std::path::PathBuf>) -> Self {
        self.source = AuthCredentialSource::file(path.into());
        self
    }

    /// Use a custom credential source.
    pub fn source(mut self, source: AuthCredentialSource) -> Self {
        self.source = source;
        self
    }
}

impl AuthSchemeBuilder for ApiKeyAuth {
    fn into_binding(self) -> (String, SchemeBinding) {
        (self.name, SchemeBinding::Token(self.source))
    }
}

// ---------------------------------------------------------------------------
// BasicAuth — HTTP Basic authentication
// ---------------------------------------------------------------------------

/// Builder for HTTP Basic authentication (`Authorization: Basic base64(user:pass)`).
///
/// The scheme name must match the `securitySchemes` key in the binding's spec.
#[derive(Debug, Clone)]
pub struct BasicAuth {
    name: String,
    username: AuthCredentialSource,
    password: AuthCredentialSource,
}

impl BasicAuth {
    /// Create a new basic auth builder. `name` must match the scheme name
    /// declared in the spec's `components.securitySchemes`.
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            username: AuthCredentialSource::Missing,
            password: AuthCredentialSource::Missing,
        }
    }

    /// Read the username from an environment variable.
    pub fn username_env(mut self, var_name: impl Into<String>) -> Self {
        self.username = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Read the password from an environment variable.
    pub fn password_env(mut self, var_name: impl Into<String>) -> Self {
        self.password = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Read the username from a CLI flag.
    pub fn username_cli(mut self, arg_name: impl Into<String>) -> Self {
        self.username = AuthCredentialSource::cli(arg_name);
        self
    }

    /// Read the password from a CLI flag.
    pub fn password_cli(mut self, arg_name: impl Into<String>) -> Self {
        self.password = AuthCredentialSource::cli(arg_name);
        self
    }

    /// Set a custom credential source for the username.
    pub fn username_source(mut self, source: AuthCredentialSource) -> Self {
        self.username = source;
        self
    }

    /// Set a custom credential source for the password.
    pub fn password_source(mut self, source: AuthCredentialSource) -> Self {
        self.password = source;
        self
    }
}

impl AuthSchemeBuilder for BasicAuth {
    fn into_binding(self) -> (String, SchemeBinding) {
        (
            self.name,
            SchemeBinding::Basic {
                username: self.username,
                password: self.password,
            },
        )
    }
}

// ---------------------------------------------------------------------------
// OAuth2Auth — OAuth2 flows (client-credentials, refresh-token, PKCE)
// ---------------------------------------------------------------------------

/// Builder for OAuth2 authentication.
///
/// The scheme name must match the `securitySchemes` key in the binding's spec.
/// The token URL is embedded by the generator (from the spec's
/// `securitySchemes.*.flows.clientCredentials.tokenUrl` or Fern IR).
///
/// At runtime, this resolves to a bearer token — the OAuth2 flow is
/// handled by the binding's executor using the token URL and credentials
/// declared here.
#[derive(Debug, Clone)]
pub struct OAuth2Auth {
    name: String,
    client_id: AuthCredentialSource,
    client_secret: AuthCredentialSource,
    access_token: AuthCredentialSource,
    refresh_token: AuthCredentialSource,
    token_url: Option<String>,
}

impl OAuth2Auth {
    /// Create a new OAuth2 auth builder. `name` must match the scheme name
    /// declared in the spec's `components.securitySchemes`.
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            client_id: AuthCredentialSource::Missing,
            client_secret: AuthCredentialSource::Missing,
            access_token: AuthCredentialSource::Missing,
            refresh_token: AuthCredentialSource::Missing,
            token_url: None,
        }
    }

    /// Set the OAuth2 token endpoint URL (from spec or Fern IR).
    pub fn token_url(mut self, url: impl Into<String>) -> Self {
        self.token_url = Some(url.into());
        self
    }

    /// Read the client ID from an environment variable.
    pub fn client_id_env(mut self, var_name: impl Into<String>) -> Self {
        self.client_id = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Read the client secret from an environment variable.
    pub fn client_secret_env(mut self, var_name: impl Into<String>) -> Self {
        self.client_secret = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Read a static access token from an environment variable.
    /// If set and resolvable, this bypasses the client-credentials flow.
    pub fn access_token_env(mut self, var_name: impl Into<String>) -> Self {
        self.access_token = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Read a refresh token from an environment variable.
    pub fn refresh_token_env(mut self, var_name: impl Into<String>) -> Self {
        self.refresh_token = AuthCredentialSource::from_env(var_name);
        self
    }

    /// Set a custom credential source for the client ID.
    pub fn client_id_source(mut self, source: AuthCredentialSource) -> Self {
        self.client_id = source;
        self
    }

    /// Set a custom credential source for the client secret.
    pub fn client_secret_source(mut self, source: AuthCredentialSource) -> Self {
        self.client_secret = source;
        self
    }

    /// Set a custom credential source for the access token.
    pub fn access_token_source(mut self, source: AuthCredentialSource) -> Self {
        self.access_token = source;
        self
    }

    /// Set a custom credential source for the refresh token.
    pub fn refresh_token_source(mut self, source: AuthCredentialSource) -> Self {
        self.refresh_token = source;
        self
    }

    /// Get the token URL, if set.
    pub fn get_token_url(&self) -> Option<&str> {
        self.token_url.as_deref()
    }

    /// Get the client ID source.
    pub fn get_client_id(&self) -> &AuthCredentialSource {
        &self.client_id
    }

    /// Get the client secret source.
    pub fn get_client_secret(&self) -> &AuthCredentialSource {
        &self.client_secret
    }

    /// Get the access token source.
    pub fn get_access_token(&self) -> &AuthCredentialSource {
        &self.access_token
    }

    /// Get the refresh token source.
    pub fn get_refresh_token(&self) -> &AuthCredentialSource {
        &self.refresh_token
    }
}

impl AuthSchemeBuilder for OAuth2Auth {
    fn into_binding(self) -> (String, SchemeBinding) {
        // For OAuth2, the primary credential used for request auth is the
        // access token (either static or obtained via client-credentials).
        // The SchemeBinding::Token holds the access token source. The
        // client_id/secret/refresh_token/token_url are consumed by the
        // OAuth2TokenProvider at a higher level — this binding just declares
        // "this scheme's credential is a bearer token sourced from X".
        //
        // If an access_token_env is set, use it directly (static token).
        // Otherwise, fall through to Missing — the binding's build_auth_provider
        // will detect the OAuth2 scheme type and construct an OAuth2TokenProvider
        // using client_id, client_secret, and token_url.
        let source = if matches!(self.access_token, AuthCredentialSource::Missing) {
            // No static access token — token must be obtained via OAuth flow.
            // Use a chain: access_token first (in case set at runtime), then Missing.
            AuthCredentialSource::Missing
        } else {
            self.access_token
        };
        (self.name, SchemeBinding::Token(source))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bearer_auth_builds_token_binding() {
        let (name, binding) = BearerAuth::new("bearerAuth")
            .env("MY_TOKEN")
            .into_binding();
        assert_eq!(name, "bearerAuth");
        assert!(matches!(binding, SchemeBinding::Token(AuthCredentialSource::Env(ref e)) if e == "MY_TOKEN"));
    }

    #[test]
    fn api_key_auth_builds_token_binding() {
        let (name, binding) = ApiKeyAuth::new("apiKey")
            .env("API_KEY")
            .into_binding();
        assert_eq!(name, "apiKey");
        assert!(matches!(binding, SchemeBinding::Token(AuthCredentialSource::Env(ref e)) if e == "API_KEY"));
    }

    #[test]
    fn basic_auth_builds_basic_binding() {
        let (name, binding) = BasicAuth::new("httpBasic")
            .username_env("USER")
            .password_env("PASS")
            .into_binding();
        assert_eq!(name, "httpBasic");
        match binding {
            SchemeBinding::Basic { username, password } => {
                assert!(matches!(username, AuthCredentialSource::Env(ref e) if e == "USER"));
                assert!(matches!(password, AuthCredentialSource::Env(ref e) if e == "PASS"));
            }
            _ => panic!("expected Basic binding"),
        }
    }

    #[test]
    fn oauth2_auth_with_static_token() {
        let (name, binding) = OAuth2Auth::new("OAuth2Security")
            .access_token_env("MY_ACCESS_TOKEN")
            .token_url("https://auth.example.com/token")
            .into_binding();
        assert_eq!(name, "OAuth2Security");
        assert!(matches!(binding, SchemeBinding::Token(AuthCredentialSource::Env(ref e)) if e == "MY_ACCESS_TOKEN"));
    }

    #[test]
    fn oauth2_auth_without_static_token_is_missing() {
        let (name, binding) = OAuth2Auth::new("OAuth2Security")
            .client_id_env("CLIENT_ID")
            .client_secret_env("CLIENT_SECRET")
            .token_url("https://auth.example.com/token")
            .into_binding();
        assert_eq!(name, "OAuth2Security");
        assert!(matches!(binding, SchemeBinding::Token(AuthCredentialSource::Missing)));
    }

}
