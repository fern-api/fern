//! API client and types for the exhaustive
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
    ApiClient, EndpointsContainerClient, EndpointsContentTypeClient, EndpointsEnumClient,
    EndpointsHttpMethodsClient, EndpointsObjectClient, EndpointsPaginationClient,
    EndpointsParamsClient, EndpointsPrimitiveClient, EndpointsPutClient, EndpointsUnionClient,
    EndpointsUrLsClient, InlinedrequestsClient, NoauthClient, NoreqbodyClient,
    ReqwithheadersClient,
};
pub use types::*;
