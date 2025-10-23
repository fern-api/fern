use crate::{ApiError, ClientConfig};

pub mod a;
pub mod ast;
pub struct ApiClient {
    pub config: ClientConfig,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
        })
    }
}

pub use a::AClient;
pub use ast::AstClient;
