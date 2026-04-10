//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Headers**
//! - **Inlinedrequest**
//! - **Multipartform**
//! - **Pathparam**
//! - **Queryparam**

use crate::{ClientConfig, ApiError};

pub mod headers;
pub mod inlinedrequest;
pub mod multipartform;
pub mod pathparam;
pub mod queryparam;
pub struct ApiClient {
    pub config: ClientConfig,
    pub headers: HeadersClient,
    pub inlinedrequest: InlinedrequestClient,
    pub multipartform: MultipartformClient,
    pub pathparam: PathparamClient,
    pub queryparam: QueryparamClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            headers: HeadersClient::new(config.clone())?,
            inlinedrequest: InlinedrequestClient::new(config.clone())?,
            multipartform: MultipartformClient::new(config.clone())?,
            pathparam: PathparamClient::new(config.clone())?,
            queryparam: QueryparamClient::new(config.clone())?
        })
    }

}

pub use headers::HeadersClient;
pub use inlinedrequest::InlinedrequestClient;
pub use multipartform::MultipartformClient;
pub use pathparam::PathparamClient;
pub use queryparam::QueryparamClient;
