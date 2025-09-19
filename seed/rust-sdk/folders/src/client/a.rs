use crate::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct AClient {
    pub http_client: HttpClient,
}

impl AClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }
}
