use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient};

pub mod v1;
pub use v1::V1Client2;
pub struct V1Client {
    pub http_client: HttpClient,
    pub v1: V1Client2,
}

impl V1Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            v1: V1Client2::new(config.clone())?,
        })
    }
}
