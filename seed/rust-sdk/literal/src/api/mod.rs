//! API client and types for the Literal
//!
//! Test definition for literal schemas.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints
//! - [`types`] - Request, response, and model types

pub mod resources;
pub mod types;

pub use resources::{HeadersClient, InlinedClient, PathClient, QueryClient, ReferenceClient, LiteralClient};
pub use types::{*};

