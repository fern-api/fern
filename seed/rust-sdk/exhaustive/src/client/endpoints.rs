use crate::types::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct EndpointsClient {
    pub http_client: HttpClient,
}

impl EndpointsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }
}
