use crate::{ApiError, ClientConfig};

pub mod nullable;
pub struct NullableClient {
    pub config: ClientConfig,
    pub nullable: NullableClient,
}

impl NullableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            nullable: NullableClient::new(config.clone())?,
        })
    }
}

pub use nullable::*;
