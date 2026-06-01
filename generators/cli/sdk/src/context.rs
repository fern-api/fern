// SPDX-License-Identifier: Apache-2.0

//! Forward-compatible context types for custom command handlers.
//!
//! [`ResolvedClientConfig`] captures the resolved credential values and
//! base URL that the embedded SDK `Client` needs. The [`ApiClient`] trait
//! provides the stable call-site shape (`ctx.client::<T>()`) whose
//! backing implementation can switch from Model A (direct HTTP stack) to
//! Model B (executor-routed façade) without rewriting customer commands.

use secrecy::{ExposeSecret, SecretString};

/// Resolved credential values and base URL ready for an SDK `Client`.
///
/// Produced by [`openapi::AppContext::client_config()`](crate::openapi::AppContext::client_config).
/// All secret values are wrapped in [`SecretString`] to prevent
/// accidental logging; call `.expose_secret()` when building headers.
#[derive(Clone, Debug, Default)]
pub struct ResolvedClientConfig {
    /// Override base URL from `--base-url` or the binding's server URL.
    pub base_url: Option<String>,
    /// Bearer token resolved from the registered credential source.
    pub bearer_token: Option<SecretString>,
    /// API key (header auth) resolved from the registered credential source.
    pub api_key: Option<SecretString>,
    /// Basic-auth username.
    pub basic_username: Option<SecretString>,
    /// Basic-auth password.
    pub basic_password: Option<SecretString>,
    /// Extra headers resolved from global header bindings.
    pub headers: Vec<(String, String)>,
}

impl ResolvedClientConfig {
    /// Convenience: expose the bearer token as a plain `&str`.
    pub fn bearer_token_str(&self) -> Option<&str> {
        self.bearer_token.as_ref().map(|s| s.expose_secret().as_ref())
    }

    /// Convenience: expose the API key as a plain `&str`.
    pub fn api_key_str(&self) -> Option<&str> {
        self.api_key.as_ref().map(|s| s.expose_secret().as_ref())
    }
}

/// Trait for constructing a typed SDK client from resolved credentials.
///
/// Implement this on the generated SDK's `Client` type so that
/// [`AppContext::client::<T>()`](crate::openapi::AppContext::client)
/// returns a ready-to-use, authenticated client.
///
/// # Model A (current)
///
/// The generated SDK's `Client` owns its own `reqwest::Client` and
/// HTTP stack. `from_resolved_config` wires the credentials into the
/// SDK's `ClientConfig` builder.
///
/// # Model B (future)
///
/// The SDK's `Client` wraps an executor-routed façade — same trait,
/// different backing implementation, zero call-site changes.
pub trait ApiClient: Sized {
    /// Build the client from the resolved credential config.
    fn from_resolved_config(config: ResolvedClientConfig) -> Self;
}
