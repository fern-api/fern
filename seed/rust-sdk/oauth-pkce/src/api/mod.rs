//! API client and types for the OauthPkce
//!
//! Reproduces the OAuth authorization-code + PKCE wire-test bugs: a required literal
//! query parameter (response_type=code) that is hardcoded in the generated method, and
//! a direct optional literal query parameter (code_challenge_method=S256) that must be
//! materialized on the wire.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints
//! - [`types`] - Request, response, and model types

pub mod resources;
pub mod types;

pub use resources::{OauthClient, OauthPkceClient};
pub use types::*;
