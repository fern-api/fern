//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Headers**
//! - **Inlined**
//! - **Path**
//! - **Query**
//! - **Reference**

use crate::{ApiError, ClientConfig};

pub mod headers;
pub mod inlined;
pub mod path;
pub mod query;
pub mod reference;
pub struct LiteralClient {
    pub config: ClientConfig,
    pub headers: HeadersClient,
    pub inlined: InlinedClient,
    pub path: PathClient,
    pub query: QueryClient,
    pub reference: ReferenceClient,
}

impl LiteralClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            headers: HeadersClient::new(config.clone())?,
            inlined: InlinedClient::new(config.clone())?,
            path: PathClient::new(config.clone())?,
            query: QueryClient::new(config.clone())?,
            reference: ReferenceClient::new(config.clone())?,
        })
    }
}

pub use headers::HeadersClient;
pub use inlined::InlinedClient;
pub use path::PathClient;
pub use query::QueryClient;
pub use reference::ReferenceClient;
