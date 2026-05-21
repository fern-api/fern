//! Authentication provider architecture.
//!
//! Modeled on the Fern TypeScript SDK generator's `core.AuthProvider` contract:
//! every auth scheme implements [`AuthProvider`], which mutates an outgoing
//! [`reqwest::RequestBuilder`] with the appropriate headers. Composition
//! wrappers let multiple schemes coexist:
//!
//! - [`AnyAuthProvider`] — OR semantics. Tries each child provider; the first
//!   that contributes headers wins. Used when a CLI is configured with several
//!   schemes but no per-endpoint security map (the default fallback).
//! - [`RoutingAuthProvider`] — per-endpoint dispatch. Reads the operation's
//!   `security_requirements` (`security: [...]` in OpenAPI), finds the first
//!   requirement that all registered providers can satisfy, and merges their
//!   headers (AND inside a requirement, OR across requirements).
//!
//! Each scheme provider is parameterized by an [`AuthCredentialSource`] — a
//! lazy supplier that resolves a value from an env var, a literal, or a
//! closure. This mirrors the TS generator's `Supplier<T>`.
//!
//! # Module layout
//!
//! - [`credential`] — `AuthCredentialSource` (lazy-supplier model with
//!   env, CLI flag, file, literal, chain, and closure variants).
//! - [`provider`] — the [`AuthProvider`] trait, [`EndpointAuthMetadata`],
//!   [`DynAuthProvider`] alias, and the [`NoAuthProvider`] sentinel.
//! - [`schemes`] — concrete [`BearerAuthProvider`], [`BasicAuthProvider`],
//!   and [`HeaderAuthProvider`] implementations.
//! - [`compose`] — composition wrappers: [`AnyAuthProvider`],
//!   [`AllAuthProvider`], [`RoutingAuthProvider`].
//! - [`builder`] — [`SchemeBinding`], [`AuthStrategy`], and the
//!   `build_provider_*` factories that `CliApp` calls.
//! - [`error`] — auth-aware HTTP error mapping (`handle_error_response`).
//!
//! All public types and functions are re-exported at the module root.

pub mod builder;
pub mod compose;
pub mod credential;
pub mod error;
pub mod oauth2;
pub mod provider;
pub mod schemes;

#[cfg(test)]
pub(crate) mod test_helpers;

pub use builder::{
    build_provider_from_bindings, build_provider_from_doc, build_provider_with_strategy,
    collect_binding_cli_args, finalize_bindings, render_auth_help_section, AuthStrategy,
    SchemeBinding,
};
pub use error::handle_error_response;
pub use compose::{AllAuthProvider, AnyAuthProvider, RoutingAuthProvider};
pub use credential::AuthCredentialSource;
pub use provider::{
    no_auth_provider, AuthProvider, DynAuthProvider, EndpointAuthMetadata, NoAuthProvider,
};
pub use oauth2::{OAuth2Grant, OAuth2TokenProvider, TokenCache};
pub use schemes::{BasicAuthProvider, BearerAuthProvider, HeaderAuthProvider};
