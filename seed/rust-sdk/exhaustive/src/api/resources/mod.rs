//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Endpoints**
//! - **GeneralErrors**
//! - **InlinedRequests**
//! - **NoAuth**
//! - **NoReqBody**
//! - **ReqWithHeaders**
//! - **Types**

use crate::{ApiError, ClientConfig};

pub mod endpoints;
pub mod general_errors;
pub mod inlined_requests;
pub mod no_auth;
pub mod no_req_body;
pub mod req_with_headers;
pub mod types;
pub struct ExhaustiveClient {
    pub config: ClientConfig,
    pub endpoints: EndpointsClient,
    pub inlined_requests: InlinedRequestsClient,
    pub no_auth: NoAuthClient,
    pub no_req_body: NoReqBodyClient,
    pub req_with_headers: ReqWithHeadersClient,
}

impl ExhaustiveClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            endpoints: EndpointsClient::new(config.clone())?,
            inlined_requests: InlinedRequestsClient::new(config.clone())?,
            no_auth: NoAuthClient::new(config.clone())?,
            no_req_body: NoReqBodyClient::new(config.clone())?,
            req_with_headers: ReqWithHeadersClient::new(config.clone())?,
        })
    }
}

pub use endpoints::EndpointsClient;
pub use general_errors::GeneralErrorsClient;
pub use inlined_requests::InlinedRequestsClient;
pub use no_auth::NoAuthClient;
pub use no_req_body::NoReqBodyClient;
pub use req_with_headers::ReqWithHeadersClient;
pub use types::TypesClient;
