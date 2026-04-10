//! API client and types for the Trace
//!
//! This module contains all the API definitions including request/response types
//! and client implementations for interacting with the API.
//!
//! ## Modules
//!
//! - [`resources`] - Service clients and endpoints
//! - [`types`] - Request, response, and model types

pub mod resources;
pub mod types;

pub use resources::{
    AdminClient, CommonsClient, HomepageClient, LangServerClient, MigrationClient, PlaylistClient,
    ProblemClient, SubmissionClient, SyspropClient, TraceClient, V2Client,
};
pub use types::*;
